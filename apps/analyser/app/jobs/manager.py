from __future__ import annotations

import asyncio
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field


class AnalysisJob(BaseModel):
    id: str = Field(default_factory=lambda: f"job_{uuid4().hex[:16]}")
    incident_id: str
    status: str = "queued"
    progress: int = 0
    current_stage: str = "queued"
    request: dict[str, Any] = Field(default_factory=dict)
    result: dict[str, Any] | None = None
    error: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class AnalysisJobManager:
    """Small development queue with the production Redis/Celery seam kept explicit."""

    def __init__(self, application: Any, database_engine=None) -> None:
        self.application = application
        from app.db.repositories import AnalysisJobRepository

        self.repository = AnalysisJobRepository(database_engine) if database_engine is not None else None
        self.jobs: dict[str, AnalysisJob] = {}
        self.queue: asyncio.Queue[str] = asyncio.Queue()
        self.worker_task: asyncio.Task[None] | None = None

    async def start(self) -> None:
        self.worker_task = asyncio.create_task(self._worker())

    async def stop(self) -> None:
        if self.worker_task is not None:
            self.worker_task.cancel()
            await asyncio.gather(self.worker_task, return_exceptions=True)

    async def submit(self, incident_id: str, request: dict[str, Any]) -> AnalysisJob:
        job = AnalysisJob(incident_id=incident_id, request=request)
        self.jobs[job.id] = job
        await self._persist(job, "create")
        await self.queue.put(job.id)
        return job

    def get(self, job_id: str) -> AnalysisJob | None:
        return self.jobs.get(job_id)

    async def _worker(self) -> None:
        while True:
            job_id = await self.queue.get()
            job = self.jobs[job_id]
            try:
                await self._run(job)
            except Exception as exc:  # keep the worker alive for later jobs
                job.status = "failed"
                job.error = str(exc)
                job.current_stage = "failed"
                job.updated_at = datetime.now(UTC)
                await self._persist(job)
            finally:
                self.queue.task_done()

    async def _run(self, job: AnalysisJob) -> None:
        job.status = "running"
        job.current_stage = "loading_incident"
        job.progress = 10
        job.updated_at = datetime.now(UTC)
        await self._persist(job)

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
            "verification": verification,
        }
        job.status = "completed"
        job.progress = 100
        job.current_stage = "completed"
        job.updated_at = datetime.now(UTC)
        await self._persist(job)

    async def _persist(self, job: AnalysisJob, operation: str = "update") -> None:
        if self.repository is None:
            return
        if operation == "create":
            await self.repository.create(job)
        else:
            await self.repository.update(job)
