from typing import ClassVar

import pytest

from app.auth.gateway import AuthContext
from app.safety.approvals import ApprovalCreate, record_approval


class State:
    auth = AuthContext("operator", frozenset({"approve"}), "api_key")


class App:
    class state:
        approvals: ClassVar[list] = []
        database_engine = None


class Request:
    state = State()
    app = App()


@pytest.mark.asyncio
async def test_approval_is_recorded_with_actor_and_rationale():
    result = await record_approval(Request(), "INC-1", ApprovalCreate(plan_id="plan-1", status="approved", rationale="Verified route and capacity."))
    assert result.actor == "operator"
    assert result.status == "approved"
    assert App.state.approvals[-1].plan_id == "plan-1"
