from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from typing import Any

import httpx
from pydantic import BaseModel, Field

from app.ingestion.models import IngestionRequest, IngestionResult
from app.storage.object_store import LocalObjectStore, ObjectStore


class ECMWFForecastAsset(BaseModel):
    forecast_id: str
    run_date: str
    run_time: int = Field(ge=0, le=18)
    step_hours: int = Field(ge=0)
    stream: str
    product_type: str
    model: str = "ifs"
    resolution: str = "0p25"
    parameters: list[str] = Field(default_factory=list)
    object_uri: str
    checksum_sha256: str
    byte_size: int
    content_type: str


class ECMWFAdapter:
    source_id = "ecmwf"

    def __init__(self, base_url: str, storage_dir: str = "data/object-store", database_engine=None, client: httpx.AsyncClient | None = None, object_store: ObjectStore | None = None) -> None:
        self.base_url = base_url.rstrip("/")
        self.object_store = object_store or LocalObjectStore(storage_dir)
        self.database_engine = database_engine
        self.client = client

    @staticmethod
    def validate_grib2(content: bytes) -> None:
        if len(content) < 16 or content[:4] != b"GRIB" or content[7] != 2:
            raise ValueError("Downloaded ECMWF asset is not a GRIB2 file")
        if content[-4:] != b"7777":
            raise ValueError("Downloaded ECMWF GRIB2 asset has no end marker")

    @staticmethod
    def _request_values(request: IngestionRequest) -> dict[str, Any]:
        values = dict(request.params)
        run_date = values.get("date") or (request.start.date().isoformat() if request.start else datetime.now(UTC).date().isoformat())
        run_time = int(values.get("time", 0))
        step = int(values.get("step", 0))
        stream = str(values.get("stream", "oper"))
        product_type = str(values.get("type", "fc"))
        model = str(values.get("model", "ifs"))
        resolution = str(values.get("resol", values.get("resolution", "0p25")))
        params = values.get("param", values.get("params", ["2t"]))
        if isinstance(params, str):
            params = [params]
        return {"date": run_date.replace("-", ""), "time": run_time, "step": step, "stream": stream, "type": product_type, "model": model, "resolution": resolution, "params": list(params)}

    def build_url(self, request: IngestionRequest) -> tuple[str, dict[str, Any]]:
        values = self._request_values(request)
        stamp = f"{values['date']}{values['time']:02d}0000"
        filename = f"{stamp}-{values['step']}h-{values['stream']}-{values['type']}.grib2"
        url = f"{self.base_url}/forecasts/{values['date']}/{values['time']:02d}z/{values['model']}/{values['resolution']}/{values['stream']}/{filename}"
        return url, values

    async def fetch(self, request: IngestionRequest) -> IngestionResult:
        url, values = self.build_url(request)
        owned_client = self.client is None
        client = self.client or httpx.AsyncClient(timeout=120, follow_redirects=True)
        try:
            response = await client.get(url)
            response.raise_for_status()
            content = response.content
        finally:
            if owned_client:
                await client.aclose()
        self.validate_grib2(content)
        checksum = hashlib.sha256(content).hexdigest()
        forecast_id = f"{values['date']}{values['time']:02d}-{values['step']}h-{values['stream']}-{values['type']}"
        object_uri = await self.object_store.put(f"ecmwf/{forecast_id}.grib2", content)
        asset = ECMWFForecastAsset(
            forecast_id=forecast_id, run_date=values["date"], run_time=values["time"], step_hours=values["step"],
            stream=values["stream"], product_type=values["type"], model=values["model"], resolution=values["resolution"],
            parameters=values["params"], object_uri=object_uri, checksum_sha256=checksum,
            byte_size=len(content), content_type="application/octet-stream",
        )
        stored_count = await self.store(asset)
        return IngestionResult(source=self.source_id, fetched_at=datetime.now(UTC), stored_count=stored_count, payload={"url": url, "asset": asset.model_dump(mode="json")})

    async def store(self, asset: ECMWFForecastAsset) -> int:
        if self.database_engine is None:
            return 0
        from sqlalchemy import text

        async with self.database_engine.begin() as connection:
            await connection.execute(text("""INSERT INTO sources (source_id, name, publisher, endpoint)
                VALUES (:source_id, 'ECMWF Open Data', 'ECMWF', :endpoint)
                ON CONFLICT (source_id) DO NOTHING"""), {"source_id": self.source_id, "endpoint": self.base_url})
            values = asset.model_dump(mode="python")
            values.update({"source_id": self.source_id})
            await connection.execute(text("""INSERT INTO weather_forecast_assets
                (source_id, forecast_id, run_date, run_time, step_hours, stream, product_type,
                 model, resolution, parameters, object_uri, checksum_sha256, byte_size, content_type)
                VALUES (:source_id, :forecast_id, :run_date, :run_time, :step_hours, :stream, :product_type,
                        :model, :resolution, CAST(:parameters AS JSONB), :object_uri, :checksum_sha256,
                        :byte_size, :content_type)
                ON CONFLICT (source_id, forecast_id) DO UPDATE SET
                    object_uri=EXCLUDED.object_uri, checksum_sha256=EXCLUDED.checksum_sha256,
                    byte_size=EXCLUDED.byte_size, parameters=EXCLUDED.parameters"""), {
                **values, "parameters": json.dumps(asset.parameters),
            })
        return 1
