from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api import websocket
from app.api.routes import analysis, health, incidents, responses, scenarios
from app.core.events import InMemoryEventPublisher
from app.incident.manager import IncidentManager
from app.incident.state import InMemoryIncidentStore
from app.intelligence.impact.engine import ImpactEngine
from app.intelligence.risk.engine import RiskEngine
from app.response.planner import ResponsePlanner
from app.scenarios.engine import ScenarioEngine
from app.verification.validator import validate_score


@asynccontextmanager
async def lifespan(application: FastAPI):
    events = InMemoryEventPublisher()
    application.state.events = events
    application.state.incident_manager = IncidentManager(InMemoryIncidentStore(), events)
    application.state.risk_engine = RiskEngine()
    application.state.impact_engine = ImpactEngine()
    application.state.scenario_engine = ScenarioEngine(application.state.risk_engine)
    application.state.response_planner = ResponsePlanner()
    application.state.validator = validate_score
    yield


app = FastAPI(
    title="AXIS Analyser",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(health.router)
app.include_router(incidents.router)
app.include_router(analysis.router)
app.include_router(scenarios.router)
app.include_router(responses.router)
app.include_router(websocket.router)
