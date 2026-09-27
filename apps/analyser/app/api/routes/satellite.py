from fastapi import APIRouter, HTTPException, Request

from app.tools.satellite.models import FireSearchRequest, SatelliteLayerRequest, SatelliteSearchRequest

router = APIRouter(prefix="/api/satellite", tags=["satellite"])


def service(request: Request):
    return request.app.state.satellite_service


@router.post("/search")
async def search_satellite(payload: SatelliteSearchRequest, request: Request):
    try:
        return await service(request).search(payload)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Copernicus request failed: {exc}") from exc


@router.post("/fires")
async def search_fires(payload: FireSearchRequest, request: Request):
    try:
        return {"source": "NASA FIRMS", "detections": await service(request).fires(payload)}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"NASA FIRMS request failed: {exc}") from exc


@router.post("/bhuvan/layer")
async def bhuvan_layer(payload: SatelliteLayerRequest, request: Request):
    try:
        return {"source": "ISRO Bhuvan", "url": service(request).layer_url(payload)}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
