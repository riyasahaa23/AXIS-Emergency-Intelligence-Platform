from fastapi import APIRouter, HTTPException, Request

from app.ingestion.client import SourceClient
from app.ingestion.models import IngestionRequest
from app.ingestion.registry import SOURCE_REGISTRY

router = APIRouter(prefix="/api/data", tags=["data-ingestion"])


@router.get("/sources")
async def list_sources():
    return list(SOURCE_REGISTRY.values())


@router.post("/{source_id}/fetch")
async def fetch_source(source_id: str, payload: IngestionRequest, request: Request):
    if source_id not in SOURCE_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Unknown data source: {source_id}")
    try:
        return await request.app.state.source_client.fetch(source_id, payload)
    except (ValueError, KeyError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Source request failed: {exc}") from exc
