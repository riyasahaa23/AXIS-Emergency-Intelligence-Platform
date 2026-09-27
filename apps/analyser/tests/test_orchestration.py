import pytest

from app.intelligence.risk.engine import RiskEngine
from app.memory.provenance import ProvenanceRecord, provenance
from app.memory.store import InMemoryMemoryStore
from app.models.incident import Incident
from app.nlp.intent import parse_command
from app.orchestrator.orchestrator import Orchestrator


def test_orchestrator_only_invokes_registered_tools():
    incident = Incident(title="Flood", hazard_type="flood", location="Zone")
    orchestrator = Orchestrator(RiskEngine())
    result = orchestrator.analyze(parse_command("Analyze Zone"), incident)
    assert result.incident_id == incident.id
    assert orchestrator.tools == ("assess_risk",)
    with pytest.raises(KeyError, match="Unregistered tool"):
        orchestrator.invoke("write_risk_score", incident=incident)


def test_memory_records_can_carry_validated_provenance():
    record = ProvenanceRecord(source="usgs", detail="event-1", freshness_status="fresh")
    store = InMemoryMemoryStore()
    store.add({"content": "earthquake evidence"}, record)
    assert store.records[0]["provenance"]["source"] == "usgs"
    assert provenance("usgs", "event-1")["source"] == "usgs"
