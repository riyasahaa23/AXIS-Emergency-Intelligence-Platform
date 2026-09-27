from app.incident.state import IncidentVersionConflictError, InMemoryIncidentStore
from app.models.incident import IncidentCreate, IncidentUpdate


def test_incident_replay_matches_live_state():
    store = InMemoryIncidentStore()
    incident = store.create(IncidentCreate(title="Flood", hazard_type="flood", location="Zone 4"))
    store.record_event(
        type("Event", (), {"aggregate_id": incident.id, "event_type": "INCIDENT_CREATED", "version": 1, "payload": incident.model_dump(mode="json"), "occurred_at": incident.created_at})()
    )
    updated = store.update(incident.id, IncidentUpdate(expected_version=1, severity=80))
    store.record_event(
        type("Event", (), {"aggregate_id": incident.id, "event_type": "INCIDENT_UPDATED", "version": 2, "payload": {"changes": {"severity": 80}}, "occurred_at": updated.updated_at})()
    )

    assert store.replay(incident.id) == updated
    assert [event.version for event in store.timeline(incident.id)] == [1, 2]


def test_incident_update_rejects_stale_version():
    store = InMemoryIncidentStore()
    incident = store.create(IncidentCreate(title="Fire", hazard_type="wildfire", location="Zone 1"))

    try:
        store.update(incident.id, IncidentUpdate(expected_version=2, severity=90))
    except IncidentVersionConflictError as exc:
        assert exc.actual == 1
    else:
        raise AssertionError("stale incident update was accepted")
