from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api import websocket
from app.api.routes import analysis, health, incidents, jobs, responses, scenarios, satellite
from app.core.events import InMemoryEventPublisher
from app.incident.manager import IncidentManager
from app.incident.state import InMemoryIncidentStore
from app.intelligence.impact.engine import ImpactEngine
from app.intelligence.risk.engine import RiskEngine
from app.response.planner import ResponsePlanner
from app.scenarios.engine import ScenarioEngine
from app.verification.validator import validate_score
from app.tools.satellite.service import SatelliteService
from app.core.config import get_settings
from app.db.database import create_async_engine, dispose_engine
from app.db.repositories import PostgresIncidentRepository
from app.db.schema import initialize_schema
from app.ingestion.client import SourceClient
from app.api.routes import data
from app.jobs.manager import AnalysisJobManager
from app.auth.gateway import install_gateway
from app.core.config import validate_runtime_settings


@asynccontextmanager
async def lifespan(application: FastAPI):
    settings = get_settings()
    validate_runtime_settings(settings)
    application.state.settings = settings
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
            await dispose_engine(database_engine)
            database_engine = None
    application.state.database_engine = database_engine
    events = InMemoryEventPublisher()
    application.state.events = events
    incident_store = PostgresIncidentRepository(database_engine) if database_engine is not None else InMemoryIncidentStore()
    application.state.incident_manager = IncidentManager(incident_store, events)
    application.state.risk_engine = RiskEngine()
    application.state.impact_engine = ImpactEngine()
    application.state.scenario_engine = ScenarioEngine(application.state.risk_engine)
    application.state.response_planner = ResponsePlanner()
    application.state.validator = validate_score
    application.state.satellite_service = SatelliteService()
    application.state.source_client = SourceClient(database_engine)
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
    application.state.jobs = AnalysisJobManager(application, database_engine, settings.redis_url)
    await application.state.jobs.start()
    yield
    await application.state.jobs.stop()
    await dispose_engine(database_engine)


app = FastAPI(
    title="AXIS Analyser",
    version="0.1.0",
    lifespan=lifespan,
)

install_gateway(app, get_settings())

app.include_router(health.router)
app.include_router(incidents.router)
app.include_router(analysis.router)
app.include_router(scenarios.router)
app.include_router(responses.router)
app.include_router(websocket.router)
app.include_router(satellite.router)
app.include_router(data.router)
app.include_router(jobs.router)
