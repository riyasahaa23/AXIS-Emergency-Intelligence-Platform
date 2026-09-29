import asyncio
from contextlib import asynccontextmanager
from inspect import isawaitable

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import websocket
from app.api.routes import (
    analysis,
    auth,
    data,
    health,
    incidents,
    jobs,
    responses,
    satellite,
    scenarios,
    telemetry,
    notifications,
)
from app.auth.gateway import install_gateway
from app.auth.service import AuthService
from app.core.config import get_cors_origins, get_settings, validate_runtime_settings
from app.core.events import InMemoryEventPublisher
from app.core.logging import configure_logging
from app.core.metrics import Metrics, instrument_request
from app.core.rate_limit import SlidingWindowRateLimiter
from app.db.database import create_async_engine, dispose_engine
from app.db.repositories import PostgresIncidentRepository
from app.db.schema import initialize_schema
from app.incident.live_feeds import LiveIncidentIngestor
from app.incident.manager import IncidentManager
from app.incident.state import InMemoryIncidentStore
from app.ingestion.client import SourceClient
from app.ingestion.scheduler import IngestionScheduler
from app.ingestion.service import IngestionService
from app.ingestion.worker import IngestionWorker
from app.intelligence.impact.engine import ImpactEngine
from app.intelligence.risk.engine import RiskEngine
from app.jobs.manager import AnalysisJobManager
from app.response.planner import ResponsePlanner
from app.scenarios.engine import ScenarioEngine
from app.storage.object_store import LocalObjectStore, S3ObjectStore
from app.tools.satellite.service import SatelliteService
from app.verification.validator import validate_score


@asynccontextmanager
async def lifespan(application: FastAPI):
    settings = get_settings()
    validate_runtime_settings(settings)
    configure_logging(settings.log_level)
    application.state.settings = settings
    application.state.websocket_limiter = SlidingWindowRateLimiter(settings.websocket_rate_limit_per_minute)
    http_client = httpx.AsyncClient(
        timeout=httpx.Timeout(60.0, connect=10.0),
        follow_redirects=True,
        limits=httpx.Limits(max_connections=50, max_keepalive_connections=20),
    )
    application.state.http_client = http_client
    database_engine = create_async_engine(settings.database_url)
    if database_engine is not None:
        try:
            if settings.auto_migrate:
                await initialize_schema(database_engine)
            else:
                from sqlalchemy import text

                async with database_engine.connect() as connection:
                    await connection.execute(text("SELECT 1"))
        except Exception:
            # Local development and tests can run without PostgreSQL. The
            # repository falls back to the in-memory incident store below.
            if settings.environment == "production" or not settings.allow_in_memory_fallback:
                await dispose_engine(database_engine)
                raise
            await dispose_engine(database_engine)
            database_engine = None
    application.state.database_engine = database_engine
    application.state.auth_service = AuthService(database_engine)
    events = InMemoryEventPublisher()
    if settings.redis_url:
        try:
            from app.core.events import RedisStreamPublisher

            events = RedisStreamPublisher(settings.redis_url)
            await events.client.ping()
        except Exception:
            if settings.environment == "production" or not settings.allow_in_memory_fallback:
                raise
            events = InMemoryEventPublisher()
    application.state.events = events
    application.state.audit_events = []
    application.state.approvals = []
    application.state.incident_actions = []
    application.state.notifications = []
    incident_store = PostgresIncidentRepository(database_engine) if database_engine is not None else InMemoryIncidentStore()
    application.state.incident_manager = IncidentManager(incident_store, events)
    application.state.risk_engine = RiskEngine()
    application.state.impact_engine = ImpactEngine()
    application.state.scenario_engine = ScenarioEngine(application.state.risk_engine)
    application.state.response_planner = ResponsePlanner()
    application.state.response_plans = []
    application.state.validator = validate_score
    application.state.satellite_service = SatelliteService()
    application.state.source_client = SourceClient(database_engine, http_client=http_client)
    if settings.object_storage_backend == "s3":
        application.state.source_client.object_store = S3ObjectStore(
            settings.object_storage_bucket, settings.object_storage_endpoint,
            settings.object_storage_region, settings.object_storage_access_key,
            settings.object_storage_secret_key,
        )
    else:
        application.state.source_client.object_store = LocalObjectStore(settings.object_storage_dir)
    application.state.source_client.firms_map_key = settings.firms_map_key
    application.state.source_client.firms_source = settings.firms_source
    application.state.source_client.firms_days = settings.firms_days
    application.state.source_client.ecmwf_base_url = settings.ecmwf_data_url
    application.state.source_client.object_storage_dir = settings.object_storage_dir
    application.state.source_client.bhuvan_api_url = settings.bhuvan_api_url
    application.state.source_client.bhuvan_api_token = settings.bhuvan_api_token
    application.state.source_client.bhuvan_wms_url = settings.bhuvan_wms_url
    application.state.source_client.bhuvan_wmts_url = settings.bhuvan_wmts_url
    application.state.source_client.india_hospitals_api_url = settings.india_hospitals_api_url
    application.state.source_client.india_hospitals_api_key = settings.india_hospitals_api_key
    application.state.source_client.india_hospitals_resource_id = settings.india_hospitals_resource_id
    application.state.source_client.imerg_archive_url = settings.imerg_archive_url
    application.state.source_client.imerg_access_token = settings.imerg_access_token
    application.state.source_client.imerg_storage_dir = settings.object_storage_dir
    application.state.source_client.ibtracs_base_url = settings.ibtracs_base_url
    application.state.source_client.ghcnh_base_url = settings.ghcnh_base_url
    application.state.source_client.copernicus_ems_url = settings.copernicus_ems_url
    application.state.source_client.copernicus_land_cover_stac_url = settings.copernicus_land_cover_stac_url
    application.state.ingestion_service = IngestionService(application.state.source_client, database_engine, events)
    application.state.ingestion_service.settings = settings
    application.state.ingestion_worker = IngestionWorker(application.state.ingestion_service, settings.redis_url)
    await application.state.ingestion_worker.start()
    application.state.ingestion_scheduler = IngestionScheduler(application.state.ingestion_worker, database_engine, settings.scheduler_poll_seconds)
    await application.state.ingestion_scheduler.start()
    application.state.jobs = AnalysisJobManager(application, database_engine, settings.redis_url)
    await application.state.jobs.start()
    live_data_task = None
    if settings.live_data_enabled:
        live_ingestor = LiveIncidentIngestor(
            application.state.incident_manager,
            application.state.source_client,
            database_engine,
            http_client,
            settings.live_data_poll_seconds,
            settings.live_data_max_items,
        )
        application.state.live_ingestor = live_ingestor
        live_data_task = asyncio.create_task(live_ingestor.run_forever(), name="axis-live-data")
    yield
    if live_data_task is not None:
        live_data_task.cancel()
        await asyncio.gather(live_data_task, return_exceptions=True)
    await application.state.ingestion_scheduler.stop()
    await application.state.ingestion_worker.stop()
    await application.state.jobs.stop()
    close_events = getattr(events, "close", None)
    if close_events is not None:
        result = close_events()
        if isawaitable(result):
            await result
    await http_client.aclose()
    await dispose_engine(database_engine)


app = FastAPI(
    title="AXIS Analyser",
    version="0.1.0",
    lifespan=lifespan,
)

app.state.metrics = Metrics()

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(settings),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Accept", "Content-Type", "Authorization", "X-API-Key", "X-Request-ID", "X-CSRF-Token"],
)


@app.middleware("http")
async def request_metrics(request, call_next):
    response = await instrument_request(request, call_next, request.app.state.metrics)
    response.headers.setdefault("x-content-type-options", "nosniff")
    response.headers.setdefault("x-frame-options", "DENY")
    response.headers.setdefault("referrer-policy", "no-referrer")
    response.headers.setdefault("permissions-policy", "camera=(), microphone=(), geolocation=()")
    return response

install_gateway(app, settings)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(incidents.router)
app.include_router(analysis.router)
app.include_router(scenarios.router)
app.include_router(responses.router)
app.include_router(websocket.router)
app.include_router(satellite.router)
app.include_router(data.router)
app.include_router(telemetry.router)
app.include_router(notifications.router)
app.include_router(jobs.router)
