from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

from app.core.events import DomainEvent, publish_event

from .client import SourceClient
from .models import IngestionRequest, IngestionResult
from .registry import SOURCE_REGISTRY


class IngestionService:
    """Coordinates provider fetches with durable ingestion-run provenance."""

    def __init__(self, source_client: SourceClient, database_engine=None, events=None) -> None:
        self.source_client = source_client
        self.database_engine = database_engine
        self.pending_requests: dict[str, IngestionRequest] = {}
        self.pending_sources: dict[str, str] = {}
        self.statuses: dict[str, dict] = {}
        self.idempotency: dict[str, str] = {}
        self.events = events
        self.settings = None

    async def fetch(self, source_id: str, request: IngestionRequest) -> IngestionResult:
        existing = await self._existing_idempotent_run(source_id, request)
        if existing is not None:
            return await self._result_for_existing(existing)
        run_id = f"ing_{uuid4().hex}"
        await self._create_run(run_id, source_id, request)
        await self._emit(run_id, source_id, "queued")
        return await self.process_run(run_id, source_id=source_id, request=request)

    async def enqueue(self, source_id: str, request: IngestionRequest) -> str:
        existing = await self._existing_idempotent_run(source_id, request)
        if existing is not None:
            return existing
        run_id = f"ing_{uuid4().hex}"
        self.pending_requests[run_id] = request
        self.pending_sources[run_id] = source_id
        if request.idempotency_key:
            self.idempotency[f"{source_id}:{request.idempotency_key}"] = run_id
        await self._create_run(run_id, source_id, request)
        await self._emit(run_id, source_id, "queued")
        return run_id

    async def process_run(self, run_id: str, source_id: str | None = None, request: IngestionRequest | None = None) -> IngestionResult:
        if source_id is None or request is None:
            source_id, request = await self._load_run(run_id)
        await self._update_run(run_id, "running")
        await self._emit(run_id, source_id, "running")
        try:
            result = await self.source_client.fetch(source_id, request)
        except Exception as exc:
            await self._update_run(run_id, "failed", error=str(exc))
            await self._emit(run_id, source_id, "failed", error=str(exc))
            raise
        await self._update_run(run_id, "completed", stored_count=result.stored_count, fetched_count=result.stored_count)
        await self._emit(run_id, source_id, "completed", stored_count=result.stored_count)
        payload = result.payload if isinstance(result.payload, dict) else {"data": result.payload}
        payload = {**payload, "ingestion_run_id": run_id}
        return result.model_copy(update={"payload": payload})

    async def _create_run(self, run_id: str, source_id: str, request: IngestionRequest) -> None:
        self.pending_requests[run_id] = request
        self.pending_sources[run_id] = source_id
        if self.database_engine is None:
            return
        from sqlalchemy import text

        source = SOURCE_REGISTRY[source_id]
        async with self.database_engine.begin() as connection:
            await connection.execute(text("""INSERT INTO sources (source_id, name, publisher, endpoint)
                VALUES (:source_id, :name, :publisher, :endpoint)
                ON CONFLICT (source_id) DO UPDATE SET endpoint=EXCLUDED.endpoint"""), {
                "source_id": source_id, "name": source.name, "publisher": source.publisher, "endpoint": source.endpoint,
            })
            await connection.execute(text("""INSERT INTO ingestion_runs
                (id, source_id, status, requested_at, idempotency_key, metadata)
                VALUES (:id, :source_id, 'queued', :requested_at, :idempotency_key, CAST(:metadata AS JSONB))"""), {
                "id": run_id, "source_id": source_id, "requested_at": datetime.now(UTC),
                "idempotency_key": request.idempotency_key,
                "metadata": request.model_dump_json(),
            })

    async def _existing_idempotent_run(self, source_id: str, request: IngestionRequest) -> str | None:
        if not request.idempotency_key:
            return None
        key = f"{source_id}:{request.idempotency_key}"
        existing = self.idempotency.get(key)
        if existing:
            return existing
        if self.database_engine is None:
            return None
        from sqlalchemy import text

        async with self.database_engine.connect() as connection:
            row = (await connection.execute(text(
                "SELECT id FROM ingestion_runs WHERE source_id=:source_id AND idempotency_key=:key ORDER BY requested_at DESC LIMIT 1"
            ), {"source_id": source_id, "key": request.idempotency_key})).first()
        if row:
            self.idempotency[key] = row[0]
            return row[0]
        return None

    async def _result_for_existing(self, run_id: str) -> IngestionResult:
        status = await self.status(run_id)
        return IngestionResult(
            source=status.get("source_id", "unknown"),
            fetched_at=status.get("finished_at") or status.get("requested_at") or datetime.now(UTC),
            stored_count=status.get("stored_count", 0),
            payload={"ingestion_run_id": run_id, "status": status.get("status"), "deduplicated": True},
        )

    async def _load_run(self, run_id: str) -> tuple[str, IngestionRequest]:
        if self.database_engine is None:
            request = self.pending_requests[run_id]
            return self.pending_sources[run_id], request
        from sqlalchemy import text

        async with self.database_engine.connect() as connection:
            row = (await connection.execute(text("SELECT source_id, metadata FROM ingestion_runs WHERE id=:id"), {"id": run_id})).mappings().one()
        metadata = row["metadata"] or {}
        return row["source_id"], IngestionRequest.model_validate(metadata)

    async def _update_run(self, run_id: str, status: str, error: str | None = None, stored_count: int = 0, fetched_count: int = 0) -> None:
        self.statuses[run_id] = {"status": status, "error": error, "stored_count": stored_count, "fetched_count": fetched_count}
        if self.database_engine is None:
            return
        from sqlalchemy import text

        fields = {"id": run_id, "status": status, "error": error, "stored_count": stored_count, "fetched_count": fetched_count}
        async with self.database_engine.begin() as connection:
            await connection.execute(text("""UPDATE ingestion_runs SET status=:status,
                started_at=CASE WHEN :status='running' AND started_at IS NULL THEN now() ELSE started_at END,
                finished_at=CASE WHEN :status IN ('completed', 'partial', 'failed') THEN now() ELSE finished_at END,
                fetched_count=:fetched_count, stored_count=:stored_count, error=:error
                WHERE id=:id"""), fields)

    async def status(self, run_id: str) -> dict:
        if self.database_engine is None:
            status = self.statuses.get(run_id)
            if status is None:
                raise KeyError(run_id)
            return {"id": run_id, **status}
        from sqlalchemy import text

        async with self.database_engine.connect() as connection:
            row = (await connection.execute(text("""SELECT id, source_id, status, requested_at, started_at,
                finished_at, fetched_count, stored_count, error, metadata
                FROM ingestion_runs WHERE id=:id"""), {"id": run_id})).mappings().first()
        if row is None:
            raise KeyError(run_id)
        return dict(row)

    async def _emit(self, run_id: str, source_id: str, status: str, error: str | None = None, stored_count: int = 0) -> None:
        if self.events is None:
            return
        event = DomainEvent(
            event_type="INGESTION_RUN_UPDATED", aggregate_id=run_id,
            payload={"source": source_id, "status": status, "stored_count": stored_count, "error": error},
        )
        await publish_event(self.events, event)
