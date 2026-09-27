from datetime import UTC, datetime
import json
from typing import Protocol

from app.models.incident import Incident, IncidentCreate
from app.models.incident import IncidentStatus, IncidentUpdate


class AnalysisJobRepository:
    """Durable analysis-job persistence used by the worker manager."""

    def __init__(self, engine) -> None:
        self.engine = engine

    async def create(self, job) -> None:
        from sqlalchemy import text

        values = job.model_dump(mode="python")
        async with self.engine.begin() as connection:
            await connection.execute(
                text("""INSERT INTO analysis_jobs
                    (id, incident_id, status, progress, current_stage, attempts,
                     idempotency_key, request, created_at, updated_at)
                    VALUES (:id, :incident_id, :status, :progress, :current_stage, :attempts,
                            :idempotency_key, CAST(:request AS JSONB), :created_at, :updated_at)
                    ON CONFLICT (id) DO NOTHING"""),
                {**values, "request": json.dumps(values["request"])},
            )

    async def update(self, job) -> None:
        from sqlalchemy import text

        values = job.model_dump(mode="python")
        async with self.engine.begin() as connection:
            await connection.execute(
                text("""UPDATE analysis_jobs
                    SET status=:status, progress=:progress, current_stage=:current_stage,
                        attempts=:attempts, error=:error, updated_at=:updated_at
                    WHERE id=:id"""),
                values,
            )
            if job.result is not None:
                await connection.execute(
                    text("""INSERT INTO analysis_results (job_id, result, created_at)
                        VALUES (:job_id, CAST(:result AS JSONB), :created_at)
                        ON CONFLICT (job_id) DO UPDATE SET result=EXCLUDED.result"""),
                    {"job_id": job.id, "result": json.dumps(job.result), "created_at": job.updated_at},
                )

    @staticmethod
    def _job(row, result=None):
        from app.jobs.manager import AnalysisJob

        values = dict(row)
        values["request"] = values.get("request") or {}
        values["result"] = result
        return AnalysisJob.model_validate(values)

    async def get(self, job_id: str):
        from sqlalchemy import text

        async with self.engine.connect() as connection:
            result = await connection.execute(
                text("""SELECT j.*, r.result
                    FROM analysis_jobs j LEFT JOIN analysis_results r ON r.job_id = j.id
                    WHERE j.id = :id"""),
                {"id": job_id},
            )
            row = result.mappings().first()
        return None if row is None else self._job(row, row.get("result"))

    async def get_by_idempotency_key(self, key: str):
        from sqlalchemy import text

        async with self.engine.connect() as connection:
            result = await connection.execute(
                text("""SELECT j.*, r.result
                    FROM analysis_jobs j LEFT JOIN analysis_results r ON r.job_id = j.id
                    WHERE j.idempotency_key = :key"""),
                {"key": key},
            )
            row = result.mappings().first()
        return None if row is None else self._job(row, row.get("result"))


class IncidentRepository(Protocol):
    def create(self, data: IncidentCreate) -> Incident:
        ...

    def get(self, incident_id: str) -> Incident:
        ...

    def list(self) -> list[Incident]:
        ...


class PostgresIncidentRepository:
    """Async PostgreSQL repository used when AXIS_DATABASE_URL is configured."""

    def __init__(self, engine) -> None:
        self.engine = engine

    @staticmethod
    def _incident(row) -> Incident:
        values = dict(row)
        return Incident(
            id=values["id"], title=values["title"], hazard_type=values["hazard_type"],
            location=values["location"], severity=values["severity"], exposure=values["exposure"],
            population=values["population"], vulnerability=values["vulnerability"],
            status=IncidentStatus(values["status"]), created_at=values["created_at"], updated_at=values["updated_at"],
        )

    async def create(self, data: IncidentCreate) -> Incident:
        from sqlalchemy import text

        incident = Incident(**data.model_dump())
        async with self.engine.begin() as connection:
            result = await connection.execute(
                text("""INSERT INTO incidents
                    (id, title, hazard_type, location, severity, exposure, population, vulnerability, status, created_at, updated_at)
                    VALUES (:id, :title, :hazard_type, :location, :severity, :exposure, :population, :vulnerability, :status, :created_at, :updated_at)
                    RETURNING *"""),
                incident.model_dump(mode="python"),
            )
            return self._incident(result.mappings().one())

    async def get(self, incident_id: str) -> Incident:
        from sqlalchemy import text

        async with self.engine.connect() as connection:
            result = await connection.execute(text("SELECT * FROM incidents WHERE id = :id"), {"id": incident_id})
            row = result.mappings().first()
        if row is None:
            from app.incident.state import IncidentNotFoundError

            raise IncidentNotFoundError(incident_id)
        return self._incident(row)

    async def list(self) -> list[Incident]:
        from sqlalchemy import text

        async with self.engine.connect() as connection:
            result = await connection.execute(text("SELECT * FROM incidents ORDER BY created_at"))
            return [self._incident(row) for row in result.mappings().all()]

    async def update(self, incident_id: str, data: IncidentUpdate) -> Incident:
        from sqlalchemy import text

        current = await self.get(incident_id)
        values = {**data.model_dump(exclude_unset=True), "id": incident_id, "updated_at": datetime.now(UTC)}
        if not values.get("status"):
            values["status"] = current.status
        assignments = ", ".join(f"{field} = :{field}" for field in values if field not in {"id"})
        async with self.engine.begin() as connection:
            result = await connection.execute(
                text(f"UPDATE incidents SET {assignments} WHERE id = :id RETURNING *"), values
            )
            return self._incident(result.mappings().one())
