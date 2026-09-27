from typing import ClassVar

import pytest

from app.audit.service import record_audit
from app.auth.gateway import AuthContext


class State:
    auth = AuthContext("operator", frozenset({"ingest"}), "api_key")
    request_id = "req-test"


class App:
    class state:
        database_engine = None
        audit_events: ClassVar[list] = []


class Request:
    state = State()
    app = App()


@pytest.mark.asyncio
async def test_audit_service_records_actor_and_action_without_database():
    await record_audit(Request(), "INGESTION_FETCH", "success", "source", "usgs_earthquakes")
    assert App.state.audit_events[-1]["actor"] == "operator"
    assert App.state.audit_events[-1]["action"] == "INGESTION_FETCH"
