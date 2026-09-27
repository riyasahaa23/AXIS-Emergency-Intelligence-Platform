from __future__ import annotations

import asyncio
from datetime import UTC, datetime, timedelta
from uuid import uuid4

from pydantic import BaseModel, Field

from .models import IngestionRequest
from .registry import SOURCE_REGISTRY


class IngestionScheduleCreate(BaseModel):
    source_id: str
    interval_seconds: int = Field(ge=60, le=31_536_000)
    params: dict = Field(default_factory=dict)
    limit: int = Field(default=25, ge=1, le=100)
    enabled: bool = True


class IngestionSchedule(BaseModel):
    id: str = Field(default_factory=lambda: f"sch_{uuid4().hex}")
    source_id: str
    interval_seconds: int
    params: dict = Field(default_factory=dict)
    limit: int = 25
    enabled: bool = True
    next_run_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    last_run_id: str | None = None
    last_error: str | None = None


class IngestionScheduler:
    def __init__(self, worker, database_engine=None, poll_seconds: int = 5) -> None:
        self.worker = worker
        self.database_engine = database_engine
        self.poll_seconds = max(1, poll_seconds)
        self.schedules: dict[str, IngestionSchedule] = {}
        self.task: asyncio.Task[None] | None = None
        self.stopping = False

    async def start(self) -> None:
        self.task = asyncio.create_task(self._loop())

    async def stop(self) -> None:
        self.stopping = True
        if self.task is not None:
            self.task.cancel()
            await asyncio.gather(self.task, return_exceptions=True)

    async def create(self, payload: IngestionScheduleCreate) -> IngestionSchedule:
        if payload.source_id not in SOURCE_REGISTRY:
            raise KeyError(payload.source_id)
        schedule = IngestionSchedule(**payload.model_dump())
        self.schedules[schedule.id] = schedule
        await self._persist(schedule)
        return schedule

    async def list(self) -> list[IngestionSchedule]:
        if self.database_engine is None:
            return list(self.schedules.values())
        from sqlalchemy import text

        async with self.database_engine.connect() as connection:
            rows = (await connection.execute(text("SELECT * FROM ingestion_schedules ORDER BY created_at"))).mappings().all()
        return [self._from_row(row) for row in rows]

    async def run_once(self, now: datetime | None = None) -> list[str]:
        current = now or datetime.now(UTC)
        schedules = await self.list()
        queued: list[str] = []
        for schedule in schedules:
            if not schedule.enabled or schedule.next_run_at > current:
                continue
            run_id = await self.worker.enqueue(schedule.source_id, IngestionRequest(params=schedule.params, limit=schedule.limit))
            schedule.last_run_id = run_id
            schedule.last_error = None
            schedule.next_run_at = current + timedelta(seconds=schedule.interval_seconds)
            self.schedules[schedule.id] = schedule
            await self._persist(schedule)
            queued.append(run_id)
        return queued

    async def _loop(self) -> None:
        while not self.stopping:
            await self.run_once()
            await asyncio.sleep(self.poll_seconds)

    async def _persist(self, schedule: IngestionSchedule) -> None:
        if self.database_engine is None:
            return
        import json

        from sqlalchemy import text

        async with self.database_engine.begin() as connection:
            await connection.execute(text("""INSERT INTO ingestion_schedules
                (id, source_id, interval_seconds, params, "limit", enabled, next_run_at, last_run_id, last_error)
                VALUES (:id, :source_id, :interval_seconds, CAST(:params AS JSONB), :limit, :enabled,
                 :next_run_at, :last_run_id, :last_error)
                ON CONFLICT (id) DO UPDATE SET interval_seconds=EXCLUDED.interval_seconds,
                 params=EXCLUDED.params, "limit"=EXCLUDED."limit", enabled=EXCLUDED.enabled,
                 next_run_at=EXCLUDED.next_run_at, last_run_id=EXCLUDED.last_run_id, last_error=EXCLUDED.last_error"""), {
                **schedule.model_dump(mode="python"), "params": json.dumps(schedule.params),
            })

    @staticmethod
    def _from_row(row) -> IngestionSchedule:
        values = dict(row)
        values["params"] = values.get("params") or {}
        return IngestionSchedule.model_validate(values)
