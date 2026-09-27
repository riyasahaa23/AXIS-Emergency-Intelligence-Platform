from typing import ClassVar

import pytest

from app.core.events import InMemoryEventPublisher
from app.safety.approvals import ApprovalCreate, record_approval


class Request:
    class state:
        auth = type("Auth", (), {"subject": "operator"})()

    class app:
        class state:
            approvals: ClassVar[list] = []
            database_engine = None
            events = InMemoryEventPublisher()


@pytest.mark.asyncio
async def test_approval_publishes_realtime_decision_event():
    request = Request()
    subscriber = request.app.state.events.subscribe()
    await record_approval(request, "INC-1", ApprovalCreate(plan_id="plan-1", status="rejected", rationale="Capacity constraint is unresolved."))
    event = await subscriber.get()
    assert event.event_type == "APPROVAL_RECORDED"
    assert event.payload["status"] == "rejected"
