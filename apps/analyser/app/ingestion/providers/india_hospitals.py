from __future__ import annotations

import json
import re
from datetime import UTC, datetime
from typing import Any

import httpx
from pydantic import BaseModel, Field

from app.ingestion.client import SourceNotConfigured
from app.ingestion.models import IngestionRequest, IngestionResult


class HospitalRecord(BaseModel):
    external_id: str
    name: str = Field(min_length=1)
    state: str | None = None
    district: str | None = None
    address: str | None = None
    category: str | None = None
    systems_of_medicine: str | None = None
    pin_code: str | None = None
    phone: str | None = None
    email: str | None = None
    website: str | None = None
    specializations: str | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    raw_payload: dict[str, Any] = Field(default_factory=dict)


class IndiaHospitalAdapter:
    source_id = "india_hospitals"
    default_api_url = "https://api.data.gov.in/resource"

    def __init__(self, api_key: str = "", resource_id: str = "", api_url: str = default_api_url, database_engine=None, client: httpx.AsyncClient | None = None) -> None:
        self.api_key = api_key
        self.resource_id = resource_id
        self.api_url = api_url.rstrip("/")
        self.database_engine = database_engine
        self.client = client

    @staticmethod
    def _value(row: dict[str, Any], *names: str) -> Any:
        normalized = {re.sub(r"[^a-z0-9]", "", str(key).lower()): value for key, value in row.items()}
        for name in names:
            value = normalized.get(re.sub(r"[^a-z0-9]", "", name.lower()))
            if value not in (None, ""):
                return value
        return None

    @classmethod
    def normalize(cls, rows: list[dict[str, Any]]) -> list[HospitalRecord]:
        records: list[HospitalRecord] = []
        for index, row in enumerate(rows):
            name = cls._value(row, "hospital_name", "hospital name", "name")
            if not name:
                continue
            coordinates = str(cls._value(row, "location_coordinates", "location coordinates", "coordinates") or "")
            latitude, longitude = cls._coordinates(coordinates)
            external_id = str(cls._value(row, "sr_no", "sr no", "id") or f"row-{index + 1}")
            records.append(HospitalRecord(
                external_id=external_id,
                name=str(name).strip(),
                state=cls._string(row, "state", "state_name"),
                district=cls._string(row, "district", "district_name"),
                address=cls._string(row, "location", "address"),
                category=cls._string(row, "hospital_category", "hospital category", "category"),
                systems_of_medicine=cls._string(row, "systems_of_medicine", "systems of medicine", "medicine"),
                pin_code=cls._string(row, "pin_code", "pin code", "pincode"),
                phone=cls._string(row, "contact_number", "contact number", "phone", "mobile"),
                email=cls._string(row, "email", "email_address"),
                website=cls._string(row, "website", "website_link"),
                specializations=cls._string(row, "specializations", "specialization"),
                latitude=latitude,
                longitude=longitude,
                raw_payload=row,
            ))
        return records

    @classmethod
    def _string(cls, row: dict[str, Any], *names: str) -> str | None:
        value = cls._value(row, *names)
        return str(value).strip() if value not in (None, "") else None

    @staticmethod
    def _coordinates(value: str) -> tuple[float | None, float | None]:
        numbers = re.findall(r"[-+]?\d+(?:\.\d+)?", value)
        if len(numbers) < 2:
            return None, None
        first, second = float(numbers[0]), float(numbers[1])
        if -90 <= first <= 90 and -180 <= second <= 180:
            return first, second
        return None, None

    async def fetch(self, request: IngestionRequest) -> IngestionResult:
        if not self.api_key:
            raise SourceNotConfigured("India Hospital Directory requires AXIS_INDIA_HOSPITALS_API_KEY")
        if not self.resource_id:
            raise SourceNotConfigured("India Hospital Directory requires AXIS_INDIA_HOSPITALS_RESOURCE_ID")
        params = {"api-key": self.api_key, "format": "json", "limit": request.limit, **request.params}
        if request.query:
            params.setdefault("filters[state]", request.query)
        url = f"{self.api_url}/{self.resource_id}"
        owned_client = self.client is None
        client = self.client or httpx.AsyncClient(timeout=60, follow_redirects=True)
        try:
            response = await client.get(url, params=params)
            response.raise_for_status()
            payload = response.json()
        finally:
            if owned_client:
                await client.aclose()
        rows = payload.get("records", []) if isinstance(payload, dict) else []
        hospitals = self.normalize(rows)
        stored_count = await self.store(hospitals)
        return IngestionResult(source=self.source_id, fetched_at=datetime.now(UTC), stored_count=stored_count, payload={"count": len(hospitals), "resource_id": self.resource_id})

    async def store(self, hospitals: list[HospitalRecord]) -> int:
        if self.database_engine is None:
            return 0
        from sqlalchemy import text

        async with self.database_engine.begin() as connection:
            await connection.execute(text("""INSERT INTO sources (source_id, name, publisher, endpoint)
                VALUES (:source_id, 'India Hospital Directory', 'Government of India', :endpoint)
                ON CONFLICT (source_id) DO NOTHING"""), {"source_id": self.source_id, "endpoint": self.api_url})
            for hospital in hospitals:
                values = hospital.model_dump(mode="python")
                values.update({"source_id": self.source_id, "raw_payload": json.dumps(hospital.raw_payload, default=str)})
                await connection.execute(text("""INSERT INTO hospitals
                    (source_id, external_id, name, state, district, address, category, systems_of_medicine,
                     pin_code, phone, email, website, specializations, latitude, longitude, geom, raw_payload)
                    VALUES (:source_id, :external_id, :name, :state, :district, :address, :category,
                     :systems_of_medicine, :pin_code, :phone, :email, :website, :specializations,
                     :latitude, :longitude,
                     CASE WHEN CAST(:latitude AS DOUBLE PRECISION) IS NULL OR CAST(:longitude AS DOUBLE PRECISION) IS NULL THEN NULL
                          ELSE ST_SetSRID(ST_MakePoint(CAST(:longitude AS DOUBLE PRECISION), CAST(:latitude AS DOUBLE PRECISION)), 4326)::geography END,
                     CAST(:raw_payload AS JSONB))
                    ON CONFLICT (source_id, external_id) DO UPDATE SET name=EXCLUDED.name,
                     state=EXCLUDED.state, district=EXCLUDED.district, address=EXCLUDED.address,
                     category=EXCLUDED.category, systems_of_medicine=EXCLUDED.systems_of_medicine,
                     pin_code=EXCLUDED.pin_code, phone=EXCLUDED.phone, email=EXCLUDED.email,
                     website=EXCLUDED.website, specializations=EXCLUDED.specializations,
                     latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude, geom=EXCLUDED.geom,
                     raw_payload=EXCLUDED.raw_payload, updated_at=now()"""), values)
        return len(hospitals)
