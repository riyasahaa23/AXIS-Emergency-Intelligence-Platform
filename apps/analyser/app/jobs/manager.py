from __future__ import annotations

import asyncio
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field

from app.core.events import DomainEvent, publish_event


class AnalysisJob(BaseModel):
    id: str = Field(default_factory=lambda: f"job_{uuid4().hex[:16]}")
    incident_id: str
    status: str = "queued"
    progress: int = 0
    current_stage: str = "queued"
    request: dict[str, Any] = Field(default_factory=dict)
    result: dict[str, Any] | None = None
    error: str | None = None
    attempts: int = 0
    idempotency_key: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class AnalysisJobManager:
    """Small development queue with the production Redis/Celery seam kept explicit."""

    def __init__(self, application: Any, database_engine=None, redis_url: str = "") -> None:
        self.application = application
        from app.db.repositories import AnalysisJobRepository

        self.repository = AnalysisJobRepository(database_engine) if database_engine is not None else None
        self.redis_url = redis_url
        self.redis_queue: Any = None
        self.jobs: dict[str, AnalysisJob] = {}
        self.queue: asyncio.Queue[str] = asyncio.Queue()
        self.worker_task: asyncio.Task[None] | None = None
        self.stopping = False

    async def start(self) -> None:
        if self.redis_url:
            try:
                from app.jobs.queue import RedisJobQueue

                candidate = RedisJobQueue(self.redis_url, consumer=f"axis-worker-{uuid4().hex[:8]}")
                await candidate.connect()
                self.redis_queue = candidate
            except Exception:  # noqa: BLE001 - local fallback is explicitly opt-in
                self.redis_queue = None
                settings = getattr(self.application.state, "settings", None)
                if settings is not None and (
                    settings.environment == "production" or not settings.allow_in_memory_fallback
                ):
                    raise RuntimeError("Redis is required for analysis jobs in this runtime") from None
        self.worker_task = asyncio.create_task(self._worker())

    async def stop(self) -> None:
        self.stopping = True
        if self.worker_task is not None:
            try:
                await asyncio.wait_for(self.worker_task, timeout=30)
            except TimeoutError:
                self.worker_task.cancel()
                await asyncio.gather(self.worker_task, return_exceptions=True)
        if self.redis_queue is not None:
            await self.redis_queue.close()

    async def submit(self, incident_id: str, request: dict[str, Any], idempotency_key: str | None = None) -> AnalysisJob:
        if idempotency_key and self.repository is not None:
            existing = await self.repository.get_by_idempotency_key(idempotency_key)
            if existing is not None:
                return existing
        job = AnalysisJob(incident_id=incident_id, request=request, idempotency_key=idempotency_key)
        self.jobs[job.id] = job
        await self._persist(job, "create")
        if self.redis_queue is not None:
            await self.redis_queue.publish(job.id)
        else:
            await self.queue.put(job.id)
        return job

    async def get(self, job_id: str) -> AnalysisJob | None:
        job = self.jobs.get(job_id)
        if job is not None:
            return job
        if self.repository is not None:
            job = await self.repository.get(job_id)
            if job is not None:
                self.jobs[job.id] = job
            return job
        return None

    async def _worker(self) -> None:
        self.stopping = False
        while not self.stopping:
            if self.redis_queue is not None:
                messages = await self.redis_queue.recover_pending()
                messages.extend(await self.redis_queue.consume())
                for message in messages:
                    job = self.jobs.get(message.job_id)
                    if job is None and self.repository is not None:
                        job = await self.repository.get(message.job_id)
                        if job is not None:
                            self.jobs[job.id] = job
                    if job is None:
                        await self.redis_queue.acknowledge(message.stream_id)
                        continue
                    try:
                        await self._run(job)
                    except Exception as exc:  # noqa: BLE001 - failed jobs are retried
                        await self._handle_failure(job, str(exc))
                    finally:
                        await self.redis_queue.acknowledge(message.stream_id)
                continue

            try:
                job_id = await asyncio.wait_for(self.queue.get(), timeout=1)
            except TimeoutError:
                continue
            job = self.jobs[job_id]
            try:
                await self._run(job)
            except Exception as exc:  # noqa: BLE001 - failed jobs are retried
                await self._handle_failure(job, str(exc))
            finally:
                self.queue.task_done()

    async def _handle_failure(self, job: AnalysisJob, error: str) -> None:
        job.attempts += 1
        if job.attempts < 3:
            job.status = "queued"
            job.error = error
            job.current_stage = "retry_scheduled"
            job.updated_at = datetime.now(UTC)
            await self._persist(job)
            await self._emit(job)
            await asyncio.sleep(min(2 ** job.attempts, 8))
            if self.redis_queue is not None:
                await self.redis_queue.publish(job.id)
            else:
                await self.queue.put(job.id)
            return
        job.status = "failed"
        job.error = error
        job.current_stage = "dead_lettered"
        job.updated_at = datetime.now(UTC)
        await self._persist(job)
        await self._emit(job)
        if self.redis_queue is not None:
            await self.redis_queue.dead_letter(job.id, error)

    async def _run(self, job: AnalysisJob) -> None:
        job.status = "running"
        job.current_stage = "loading_incident"
        job.progress = 10
        job.updated_at = datetime.now(UTC)
        await self._persist(job)
        await self._emit(job)

        store = self.application.state.incident_manager.store
        incident = store.get(job.incident_id)
        if hasattr(incident, "__await__"):
            incident = await incident

        job.current_stage = "risk_and_impact"
        job.progress = 55
        risk = self.application.state.risk_engine.assess(incident)
        impact = self.application.state.impact_engine.assess(incident)
        verification = self.application.state.validator(risk.score)

        job.result = {
            "incident": incident.model_dump(mode="json"),
            "risk": risk.model_dump(mode="json"),
            "impact": impact.model_dump(mode="json"),
            "verification": verification.model_dump(mode="json") if hasattr(verification, "model_dump") else verification,
        }
        job.status = "completed"
        job.progress = 100
        job.current_stage = "completed"
        job.updated_at = datetime.now(UTC)
        await self._persist(job)
        await self._emit(job)

    async def _persist(self, job: AnalysisJob, operation: str = "update") -> None:
        if self.repository is None:
            return
        if operation == "create":
            await self.repository.create(job)
        else:
            await self.repository.update(job)

    async def _emit(self, job: AnalysisJob) -> None:
        event = DomainEvent(
            event_type="ANALYSIS_JOB_UPDATED",
            aggregate_id=job.id,
            payload={"status": job.status, "progress": job.progress, "stage": job.current_stage},
        )
        await publish_event(self.application.state.events, event)
