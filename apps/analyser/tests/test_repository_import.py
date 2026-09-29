def test_repository_module_imports_when_list_method_shadows_builtin():
    from app.db.repositories import PostgresIncidentRepository

    assert PostgresIncidentRepository.evidence.__annotations__["return"] == "list[dict]"
