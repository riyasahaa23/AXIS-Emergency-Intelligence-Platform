import pytest

from app.core.events import DomainEvent, InMemoryEventPublisher
from app.intelligence.graph.dependencies import default_dependency_graph
from app.models.resource import Resource
from app.nlp.intent import parse_command
from app.optimization.ortools_adapter import optimize


def test_intent_parser_is_structured():
    intent = parse_command("Analyze Zone 4")
    assert intent.intent == "analyze"
    assert intent.command == "Analyze Zone 4"


def test_dependency_graph_propagates_impact():
    graph = default_dependency_graph()
    assert graph.downstream("flood") == {"road-network", "hospital-access", "shelter-access"}


def test_optimizer_has_safe_fallback():
    allocations = optimize([Resource(id="ambulance-1", kind="ambulance", available=2)], {"ambulance": 3})
    assert allocations[0].allocated == 2
    assert allocations[0].unmet == 1


@pytest.mark.asyncio
async def test_event_subscriber_receives_events():
    publisher = InMemoryEventPublisher()
    subscriber = publisher.subscribe()
    publisher.publish(DomainEvent(event_type="TEST", aggregate_id="one"))
    event = await subscriber.get()
    assert event.event_type == "TEST"
    publisher.unsubscribe(subscriber)
