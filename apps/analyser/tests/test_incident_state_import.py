def test_incident_state_imports_when_list_method_shadows_builtin():
    from app.incident.state import InMemoryIncidentStore

    assert InMemoryIncidentStore.evidence.__annotations__["return"] == "list[dict]"
