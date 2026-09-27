from typing import Any

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field


class AnalysisJobRequest(BaseModel):
    incident_id: str
    options: dict[str, Any] = Field(default_factory=dict)


router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.post("/analysis", status_code=202)
async def create_analysis_job(payload: AnalysisJobRequest, request: Request):
    incident = request.app.state.incident_manager.store.get(payload.incident_id)
    if hasattr(incident, "__await__"):
        try:
            await incident
        except Exception as exc:
            raise HTTPException(status_code=404, detail="Incident not found") from exc
    elif incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return await request.app.state.jobs.submit(payload.incident_id, payload.options)


@router.get("/{job_id}")
async def get_job(job_id: str, request: Request):
    job = request.app.state.jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/{job_id}/result")
async def get_job_result(job_id: str, request: Request):
    job = request.app.state.jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != "completed":
        return {"job_id": job.id, "status": job.status, "progress": job.progress}
    return job.result
