from typing import Any

from app.memory.provenance import ProvenanceRecord


class InMemoryMemoryStore:
    def __init__(self) -> None:
        self.records: list[dict[str, Any]] = []

    def add(self, record: dict[str, Any], provenance: ProvenanceRecord | None = None) -> None:
        if provenance is not None:
            record = {**record, "provenance": provenance.model_dump(mode="json")}
        self.records.append(record)

    def search(self, query: str, limit: int = 10) -> list[dict[str, Any]]:
        terms = set(query.lower().split())
        ranked = sorted(
            self.records,
            key=lambda record: len(terms.intersection(str(record).lower().split())),
            reverse=True,
        )
        return ranked[:limit]
