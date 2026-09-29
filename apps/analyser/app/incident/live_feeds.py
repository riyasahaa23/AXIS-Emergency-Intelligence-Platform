"""Non-blocking live incident ingestion for reliable public feeds."""
from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any, ClassVar

import httpx

from app.ingestion.models import IngestionRequest
from app.ingestion.providers.gdacs import GDACSAdapter, GDACSEvent
from app.ingestion.providers.usgs import EarthquakeObservation, USGSAdapter
from app.models.incident import IncidentCreate

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class LiveIncidentCandidate:
    source_id: str
    external_id: str
    incident: IncidentCreate


class LiveIncidentIngestor:
    """Poll public feeds without allowing provider failures to break startup."""

    sources = ("usgs_earthquakes", "gdacs", "nasa_eonet", "noaa_alerts", "emsc", "copernicus_ems")
    direct_feed_urls: ClassVar[dict[str, str]] = {
        "nasa_eonet": "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=20",
        "noaa_alerts": "https://api.weather.gov/alerts/active?status=actual&severity=Severe,Extreme",
        "emsc": "https://www.seismicportal.eu/fdsnws/event/1/query?format=json&limit=20",
        "copernicus_ems": "https://rapidmapping.emergency.copernicus.eu/backend/dashboard-api/public-activations-info/?limit=20&offset=0",
    }

    def __init__(self, manager, source_client, database_engine, http_client: httpx.AsyncClient, poll_seconds: int = 900, max_items: int = 20) -> None:
        self.manager = manager
        self.source_client = source_client
        self.database_engine = database_engine
        self.http_client = http_client
        self.poll_seconds = max(30, poll_seconds)
        self.max_items = max(1, max_items)
        self._seen_without_database: set[tuple[str, str]] = set()
        self._status: dict[str, Any] = {
            "enabled": True,
            "poll_seconds": self.poll_seconds,
            "last_poll_started_at": None,
            "last_poll_finished_at": None,
            "last_created_count": 0,
            "providers": {source: {"status": "pending", "last_error": None} for source in self.sources},
        }

    @property
    def status(self) -> dict[str, Any]:
        return {**self._status, "providers": {key: dict(value) for key, value in self._status["providers"].items()}}

    async def run_forever(self) -> None:
        while True:
            try:
                await self.run_once()
            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception("Live incident polling failed")
            await asyncio.sleep(self.poll_seconds)

    async def run_once(self) -> int:
        created = 0
        self._status["last_poll_started_at"] = datetime.now(UTC).isoformat()
        for source_id in self.sources:
            provider_status = self._status["providers"][source_id]
            provider_status.update({"status": "running", "last_attempt_at": datetime.now(UTC).isoformat(), "last_error": None})
            try:
                payload = await asyncio.wait_for(self._fetch_payload(source_id), timeout=30)
                candidates = self._candidates(source_id, payload)[: self.max_items]
                provider_created = 0
                for candidate in candidates:
                    if await self._already_seen(candidate.source_id, candidate.external_id):
                        continue
                    now = datetime.now(UTC)
                    incident = await self.manager.create(candidate.incident.model_copy(update={
                        "source_id": candidate.source_id,
                        "external_id": candidate.external_id,
                        "data_status": "live",
                        "observed_at": now,
                        "last_seen_at": now,
                    }))
                    await self._remember(candidate.source_id, candidate.external_id, incident.id)
                    created += 1
                    provider_created += 1
                provider_status.update({
                    "status": "ok",
                    "last_success_at": datetime.now(UTC).isoformat(),
                    "candidate_count": len(candidates),
                    "created_count": provider_created,
                })
            except asyncio.CancelledError:
                raise
            except Exception as exc:  # noqa: BLE001 - isolate each provider
                logger.warning("Live feed %s failed: %s (%s)", source_id, exc, type(exc).__name__)
                provider_status.update({"status": "error", "last_error": f"{type(exc).__name__}: {exc}"})
        self._status["last_created_count"] = created
        self._status["last_poll_finished_at"] = datetime.now(UTC).isoformat()
        if created:
            logger.info("Created %d new live incidents", created)
        return created

    async def _fetch_payload(self, source_id: str) -> Any:
        if source_id in {"usgs_earthquakes", "gdacs"}:
            result = await self.source_client.fetch(source_id, IngestionRequest(limit=self.max_items))
            return result.payload
        response = await self.http_client.get(
            self.direct_feed_urls[source_id],
            headers={"User-Agent": "AXIS-Emergency-Intelligence/1.0"},
        )
        response.raise_for_status()
        return response.json()

    @classmethod
    def _candidates(cls, source_id: str, payload: Any) -> list[LiveIncidentCandidate]:
        if not isinstance(payload, dict):
            return []
        if source_id == "usgs_earthquakes":
            return [cls._from_earthquake(item) for item in USGSAdapter.normalize(payload)]
        if source_id == "gdacs":
            return [cls._from_gdacs(item) for item in GDACSAdapter.normalize(payload)]
        if source_id == "nasa_eonet":
            return [cls._from_eonet(item) for item in payload.get("events", []) if isinstance(item, dict)]
        if source_id == "noaa_alerts":
            return [cls._from_noaa(item) for item in payload.get("features", []) if isinstance(item, dict)]
        if source_id == "emsc":
            events = payload.get("features", payload.get("earthquakes", []))
            return [cls._from_emsc(item) for item in events if isinstance(item, dict)]
        if source_id == "copernicus_ems":
            events = payload.get("results", payload.get("activations", payload.get("data", []))) if isinstance(payload, dict) else []
            return [cls._from_copernicus(item) for item in events if isinstance(item, dict)]
        return []

    @staticmethod
    def _from_eonet(event: dict[str, Any]) -> LiveIncidentCandidate:
        categories = event.get("categories") or []
        category = str(categories[0].get("id", "extreme_weather")).lower() if categories else "extreme_weather"
        geometry = event.get("geometry") or []
        coords = (geometry[0].get("coordinates") if geometry and isinstance(geometry[0], dict) else []) or []
        location = f"Global sector ({coords[1]:.2f}, {coords[0]:.2f})" if len(coords) >= 2 else "Global sector"
        return LiveIncidentCandidate(
            source_id="nasa_eonet",
            external_id=str(event.get("id") or event.get("title") or "unknown"),
            incident=IncidentCreate(title=f"NASA EONET: {event.get('title', 'Earth event')}"[:200], hazard_type=category[:100], location=location, severity=70.0, exposure=60.0, population=0, vulnerability=60.0, latitude=float(coords[1]) if len(coords) >= 2 else None, longitude=float(coords[0]) if len(coords) >= 2 else None),
        )

    @staticmethod
    def _from_noaa(feature: dict[str, Any]) -> LiveIncidentCandidate:
        props = feature.get("properties") or {}
        event_name = str(props.get("event") or "Severe weather alert")
        area = str(props.get("areaDesc") or "United States").split(";")[0]
        coordinates = ((feature.get("geometry") or {}).get("coordinates") or []) if isinstance(feature.get("geometry"), dict) else []
        point = coordinates if len(coordinates) >= 2 and all(isinstance(value, (int, float)) for value in coordinates[:2]) else []
        severity = 90.0 if str(props.get("severity", "")).lower() == "extreme" else 75.0
        return LiveIncidentCandidate(
            source_id="noaa_alerts",
            external_id=str(feature.get("id") or props.get("id") or f"{event_name}:{area}"),
            incident=IncidentCreate(title=f"NOAA: {event_name} — {area}"[:200], hazard_type="extreme_weather", location=area[:200], severity=severity, exposure=70.0, population=0, vulnerability=58.0, latitude=float(point[1]) if point else None, longitude=float(point[0]) if point else None),
        )

    @staticmethod
    def _from_emsc(event: dict[str, Any]) -> LiveIncidentCandidate:
        props = event.get("properties") if isinstance(event.get("properties"), dict) else event
        external_id = str(props.get("eventid") or props.get("id") or event.get("id") or props.get("publicID") or "unknown")
        magnitude = float(props.get("mag") or props.get("magnitude") or 0)
        coordinates = ((event.get("geometry") or {}).get("coordinates") or []) if isinstance(event.get("geometry"), dict) else []
        place = props.get("place")
        if not place and len(coordinates) >= 2:
            place = f"{float(coordinates[1]):.2f}, {float(coordinates[0]):.2f}"
        if not place:
            place = f"Event {external_id}"
        return LiveIncidentCandidate(
            source_id="emsc",
            external_id=external_id,
            incident=IncidentCreate(title=f"EMSC earthquake: {place}"[:200], hazard_type="earthquake", location=str(place)[:200], severity=max(20.0, min(100.0, 35.0 + magnitude * 12.0)), exposure=60.0, population=0, vulnerability=55.0, latitude=float(coordinates[1]) if len(coordinates) >= 2 else None, longitude=float(coordinates[0]) if len(coordinates) >= 2 else None),
        )

    @staticmethod
    def _from_copernicus(event: dict[str, Any]) -> LiveIncidentCandidate:
        external_id = str(event.get("code") or event.get("id") or event.get("name") or "unknown")
        countries = event.get("countries") or []
        location = countries[0] if countries else event.get("location") or "Global region"
        return LiveIncidentCandidate(
            source_id="copernicus_ems",
            external_id=external_id,
            incident=IncidentCreate(title=f"Copernicus EMS: {event.get('name', external_id)}"[:200], hazard_type=str(event.get("category") or "emergency_mapping").lower()[:100], location=str(location)[:200], severity=75.0, exposure=65.0, population=0, vulnerability=60.0),
        )

    @staticmethod
    def _from_earthquake(observation: EarthquakeObservation) -> LiveIncidentCandidate:
        magnitude = float(observation.magnitude or 0)
        severity = max(20.0, min(100.0, 35.0 + magnitude * 12.0))
        return LiveIncidentCandidate(
            source_id="usgs_earthquakes",
            external_id=observation.external_id,
            incident=IncidentCreate(
                title=f"USGS earthquake: {observation.place or observation.external_id}"[:200],
                hazard_type="earthquake",
                location=(observation.place or "Unknown location")[:200],
                severity=severity,
                exposure=min(100.0, severity * 0.85),
                population=0,
                vulnerability=55.0,
                latitude=observation.latitude,
                longitude=observation.longitude,
            ),
        )

    @staticmethod
    def _from_gdacs(event: GDACSEvent) -> LiveIncidentCandidate:
        alert = (event.alert_level or "").lower()
        severity = {"red": 88.0, "orange": 65.0, "green": 42.0}.get(alert, 50.0)
        location = event.country or event.name or "Global region"
        return LiveIncidentCandidate(
            source_id="gdacs",
            external_id=f"{event.event_type}:{event.event_id}:{event.episode_id}",
            incident=IncidentCreate(
                title=f"GDACS {event.event_type}: {event.name or event.event_id}"[:200],
                hazard_type=event.event_type.lower()[:100],
                location=location[:200],
                severity=severity,
                exposure=min(100.0, severity * 0.9),
                population=0,
                vulnerability=60.0,
                latitude=LiveIncidentIngestor._geometry_coordinate(event.geometry, 1),
                longitude=LiveIncidentIngestor._geometry_coordinate(event.geometry, 0),
            ),
        )

    @staticmethod
    def _geometry_coordinate(geometry: dict[str, Any] | None, index: int) -> float | None:
        coordinates = (geometry or {}).get("coordinates") if isinstance(geometry, dict) else None
        if isinstance(coordinates, list) and len(coordinates) > index and isinstance(coordinates[index], (int, float)):
            return float(coordinates[index])
        return None

    async def _already_seen(self, source_id: str, external_id: str) -> bool:
        key = (source_id, external_id)
        if self.database_engine is None:
            return key in self._seen_without_database
        from sqlalchemy import text

        async with self.database_engine.connect() as connection:
            result = await connection.execute(
                text("SELECT 1 FROM live_incident_keys WHERE source_id=:source_id AND external_id=:external_id"),
                {"source_id": source_id, "external_id": external_id},
            )
            return result.first() is not None

    async def _remember(self, source_id: str, external_id: str, incident_id: str) -> None:
        key = (source_id, external_id)
        if self.database_engine is None:
            self._seen_without_database.add(key)
            return
        from sqlalchemy import text

        now = datetime.now(UTC)
        async with self.database_engine.begin() as connection:
            await connection.execute(
                text("""INSERT INTO live_incident_keys
                    (source_id, external_id, incident_id, first_seen_at, last_seen_at)
                    VALUES (:source_id, :external_id, :incident_id, :now, :now)
                    ON CONFLICT (source_id, external_id) DO UPDATE SET last_seen_at=:now"""),
                {"source_id": source_id, "external_id": external_id, "incident_id": incident_id, "now": now},
            )
