/**
 * AXIS Incidents API Service
 * 
 * Fetches real incidents from backend when online, falls back to canonical mock dataset.
 * Normalizes backend Incident model to UI HazardIncident contract.
 */

import { apiFetch, MOCK_FALLBACK_ENABLED } from './client';
import type { HazardIncident, SeverityLevel, HazardType } from '../types';
import { MOCK_INCIDENTS } from '../mock/incidents';

/**
 * Normalizes raw backend Incident payload into the shared HazardIncident contract.
 */
export function normalizeIncident(raw: any): HazardIncident {
  if (!raw) throw new Error('Incident payload is empty');
  if (raw.coords && raw.overview?.summary && raw.overview?.projectedConditions && raw.details?.description && raw.forecast?.timeline) {
    // Already in HazardIncident format
    return raw as HazardIncident;
  }

  const numericSev = typeof raw.severity === 'number' ? raw.severity : 0;
  let severityLevel: SeverityLevel = 'moderate';
  if (numericSev >= 80) severityLevel = 'critical';
  else if (numericSev >= 60) severityLevel = 'high';
  else if (numericSev >= 30) severityLevel = 'moderate';
  else severityLevel = 'low';

  const pop = raw.population || 0;
  const rawLocation = raw.location || raw.region || '';
  const titleLocation = String(raw.title || '').split(':').slice(1).join(':').trim();
  const location = rawLocation && !/^unknown( location)?$/i.test(rawLocation)
    ? rawLocation
    : (titleLocation || 'Global region');
  const timestamp = raw.created_at || raw.timestamp || '';
  const relativeTime = raw.relativeTime || formatRelativeTime(timestamp);
  const coords = raw.coords || (
    raw.latitude != null && raw.longitude != null
      ? { lat: Number(raw.latitude), lng: Number(raw.longitude) }
      : { lat: 0, lng: 0 }
  );
  const popStr = pop >= 1_000_000 ? `${(pop / 1_000_000).toFixed(1)}M` : `${Math.round(pop / 1_000)}K`;
  const hazardType = (raw.hazard_type || raw.type || 'multi_hazard').toLowerCase() as HazardType;
  const geometry = raw.geometry || buildIncidentGeometry(
    Number(coords.lat),
    Number(coords.lng),
    location,
    hazardType,
    severityLevel,
    popStr,
    String(raw.id || raw.title || `${coords.lat}:${coords.lng}`)
  );
  const forecast = raw.forecast || buildIncidentForecast(
    hazardType,
    numericSev,
    pop,
    String(raw.id || raw.title || `${coords.lat}:${coords.lng}`),
    timestamp
  );
  const incidentDescription = shortenSummary(
    raw.description
      || raw.details?.description
      || buildIncidentSummary(hazardType, location, severityLevel, Number(coords.lat), Number(coords.lng))
  );
  const overview = {
    summary: shortenSummary(raw.overview?.summary || incidentDescription),
    riskLevel: raw.overview?.riskLevel || severityLevel.toUpperCase(),
    projectedConditions: raw.overview?.projectedConditions || buildProjectionSummary(hazardType, location, severityLevel, forecast),
    keyMetrics: raw.overview?.keyMetrics || [
      { label: 'Exposed Population', value: popStr, sub: 'Current incident estimate' },
      { label: 'Severity Index', value: `${Math.round(numericSev)}/100`, sub: 'Current risk score' }
    ]
  };

  return {
    id: raw.id,
    name: raw.title || raw.name || 'Emergency Event',
    type: hazardType,
    region: location,
    // The current incident API stores the provider location as one field.
    // Use it in the operational card instead of displaying “Unknown”.
    country: raw.country || location,
    coords,
    severity: severityLevel,
    affectedPopulation: `${popStr} affected`,
    affectedPopulationNum: pop,
    displacedPopulation: raw.displacedPopulation,
    displacedPopulationNum: raw.displacedPopulationNum ?? 0,
    roadsAffected: raw.roadsAffected ?? 0,
    districtsAffected: raw.districtsAffected ?? 0,
    relativeTime,
    timestamp,
    riskScore: Math.round(numericSev),
    confidence: raw.confidence ?? 0,
    provenance: {
      sourceId: raw.source_id,
      externalId: raw.external_id,
      confidence: raw.confidence,
      dataStatus: raw.data_status || 'estimated',
      observedAt: raw.observed_at,
      lastSeenAt: raw.last_seen_at
    },
    thumbnailUrl: raw.thumbnailUrl,
    status: raw.status === 'active' ? 'escalating' : (raw.status || 'monitoring'),
    details: { ...(raw.details || {}), description: incidentDescription },
    overview,
    geometry,
    forecast
  };
}

function buildIncidentGeometry(
  lat: number,
  lng: number,
  location: string,
  type: HazardType,
  severity: SeverityLevel,
  population: string,
  identity: string
): NonNullable<HazardIncident['geometry']> {
  // Live providers currently guarantee a point for most incidents, not a
  // common polygon schema. Build a deterministic, incident-specific derived
  // footprint from that point. A provider-supplied geometry always wins above.
  const seed = hashIdentity(identity);
  const angle = (seed % 360) * Math.PI / 180;
  const riskScale = 0.72 + severityScale(severity) * 0.55;
  const typeScale: Record<string, [number, number]> = {
    flood: [1.35, 0.82],
    storm: [1.9, 1.05],
    cyclone: [2.1, 1.15],
    wildfire: [1.25, 0.58],
    earthquake: [0.9, 0.9],
    heatwave: [2.3, 1.7],
    infrastructure_failure: [0.65, 0.48],
    multi_hazard: [1.5, 1.0]
  };
  const [width, height] = typeScale[type] || typeScale.multi_hazard;
  const latFactor = Math.max(0.35, Math.cos((lat * Math.PI) / 180));
  const kmToLat = 1 / 111;
  const kmToLng = 1 / (111 * latFactor);
  const major = 32 * riskScale * width;
  const minor = 24 * riskScale * height;

  const offset = (eastKm: number, northKm: number): [number, number] => [
    lng + eastKm * kmToLng,
    lat + northKm * kmToLat
  ];

  const polygon = (count: number, eastRadius: number, northRadius: number, wobble: number) =>
    Array.from({ length: count }, (_, index) => {
      const theta = (index / count) * Math.PI * 2;
      const localSeed = ((seed + index * 9301) % 997) / 997;
      const radius = 1 + (localSeed - 0.5) * wobble;
      const east = Math.cos(theta) * eastRadius * radius;
      const north = Math.sin(theta) * northRadius * radius;
      const rotatedEast = east * Math.cos(angle) - north * Math.sin(angle);
      const rotatedNorth = east * Math.sin(angle) + north * Math.cos(angle);
      return offset(rotatedEast, rotatedNorth);
    });

  const floodExtent = polygon(type === 'wildfire' ? 9 : 12, major, minor, 0.42);
  const secondaryExtent = polygon(10, major * 1.34, minor * 1.25, 0.3);
  const zoneOffsets = [
    [0, 0],
    [major * 0.55, minor * 0.25],
    [-major * 0.42, minor * 0.48]
  ];
  const highRiskZones = zoneOffsets.map(([east, north], index) => ({
    name: index === 0 ? `${location} Epicenter` : `${location} Sector ${index + 1}`,
    coords: offset(east, north),
    radiusKm: Math.round((18 + severityScale(severity) * 22) * (index === 0 ? 1.2 : 0.85)),
    severity: index === 0 ? severity : index === 1 ? 'high' : 'moderate'
  }));
  const affectedDistricts = zoneOffsets.map(([east, north], index) => ({
    name: index === 0 ? `${location} Central` : `${location} Sector ${index + 1}`,
    coords: offset(east, north),
    population,
    risk: index === 0 ? severity.toUpperCase() : index === 1 ? 'HIGH' : 'MODERATE'
  }));

  const path = (direction: number, spread: number) => [
    offset(-major * 1.2 * Math.cos(direction) - spread * Math.sin(direction), -major * 1.2 * Math.sin(direction) + spread * Math.cos(direction)),
    offset(-major * 0.45 * Math.cos(direction), -major * 0.45 * Math.sin(direction)),
    offset(major * 0.2 * Math.cos(direction), major * 0.2 * Math.sin(direction)),
    offset(major * 0.95 * Math.cos(direction) + spread * Math.sin(direction), major * 0.95 * Math.sin(direction) - spread * Math.cos(direction))
  ];

  return {
    center: [lng, lat],
    bounds: [offset(-major * 1.5, -minor * 1.5), offset(major * 1.5, minor * 1.5)],
    floodExtent,
    secondaryExtent,
    highRiskZones,
    affectedDistricts,
    rivers: [{
      name: type === 'wildfire' ? `${location} Fire Front` : `${location} Surface Vector`,
      path: path(angle, minor * 0.42)
    }],
    cities: [
      { name: `${location} Origin`, coords: [lng, lat], population, isCapital: true },
      { name: 'Sector A', coords: offset(major * 0.72, minor * 0.4), population },
      { name: 'Sector B', coords: offset(-major * 0.68, -minor * 0.25), population }
    ]
  };
}

function hashIdentity(identity: string): number {
  return Array.from(identity).reduce((hash, char) => ((hash * 31) + char.charCodeAt(0)) >>> 0, 2166136261);
}

function severityScale(severity: SeverityLevel): number {
  return { low: 0.25, moderate: 0.5, high: 0.75, critical: 1 }[severity];
}

function buildIncidentForecast(
  type: HazardType,
  severity: number,
  population: number,
  identity: string,
  timestamp: string
): NonNullable<HazardIncident['forecast']> {
  const seed = hashIdentity(identity);
  const typeMultiplier: Record<string, number> = {
    flood: 1.15,
    storm: 1.3,
    cyclone: 1.45,
    wildfire: 0.9,
    earthquake: 0.55,
    heatwave: 1.1,
    multi_hazard: 1
  };
  const multiplier = typeMultiplier[type] || 1;
  const baseArea = Math.max(12, Math.round((severity * severity * 0.08 + (seed % 35)) * multiplier));
  const progression = [0.82, 0.93, 1, 1.12, 1.24, 1.18];
  const labels = ['-24h', '-12h', 'NOW', '+24h', '+48h', '+72h'];
  const timeline = labels.map((time, index) => {
    const areaKm2 = Math.max(1, Math.round(baseArea * progression[index]));
    const exposed = population > 0 ? Math.round((population / 1_000_000) * progression[index] * 10) / 10 : 0;
    return {
      time,
      areaKm2,
      popAtRisk: exposed > 0 ? `${exposed.toFixed(1)}M` : 'Unquantified',
      rainfallDelta: type === 'flood' || type === 'storm' || type === 'cyclone' ? `+${Math.round(20 + severity * progression[index])}mm` : 'N/A',
      severityScore: Math.min(99, Math.max(0, Math.round(severity * progression[index])))
    };
  });
  const observedAt = timestamp ? new Date(timestamp).toISOString() : 'unknown time';
  return {
    timeline,
    trendSummary: `Derived ${type.replace('_', ' ')} projection from incident severity and observed position at ${observedAt}. This is a model projection, not a provider forecast.`,
    crestTime: undefined
  };
}

function hazardLabel(type: HazardType): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildIncidentSummary(
  type: HazardType,
  location: string,
  severity: SeverityLevel,
  lat: number,
  lng: number
): string {
  return `${hazardLabel(type)} incident reported in ${location}. Current ${severity} severity is being tracked at ${lat.toFixed(2)}°, ${lng.toFixed(2)}°.`;
}

function shortenSummary(summary: string): string {
  const clean = summary.replace(/\s+/g, ' ').trim();
  return clean.length > 220 ? `${clean.slice(0, 217).trimEnd()}…` : clean;
}

function buildProjectionSummary(
  type: HazardType,
  location: string,
  severity: SeverityLevel,
  forecast: NonNullable<HazardIncident['forecast']>
): string {
  const now = forecast.timeline.find((point) => point.time === 'NOW');
  const peak = forecast.timeline.reduce((largest, point) => point.areaKm2 > largest.areaKm2 ? point : largest, now || forecast.timeline[0]);
  return `${hazardLabel(type)} risk in ${location} is ${severity} now (${now?.areaKm2 ?? 0} km² modeled footprint) and projects toward ${peak?.areaKm2 ?? 0} km² by ${peak?.time ?? '+48h'}. ${forecast.trendSummary}`;
}

function formatRelativeTime(timestamp: string): string {
  if (!timestamp) return 'Unknown';
  const ageSeconds = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000));
  if (ageSeconds < 60) return 'Just now';
  if (ageSeconds < 3600) return `${Math.floor(ageSeconds / 60)}m ago`;
  if (ageSeconds < 86400) return `${Math.floor(ageSeconds / 3600)}h ago`;
  return `${Math.floor(ageSeconds / 86400)}d ago`;
}

export async function fetchIncidents(): Promise<HazardIncident[]> {
  // Load every backend page so the globe receives every incident, not only
  // the first 200 records allowed by the API route.
  const allRecords: any[] = [];
  const pageSize = 200;
  for (let offset = 0; offset < 10 * pageSize; offset += pageSize) {
    const page = await apiFetch<any[]>(
      `/api/incidents?limit=${pageSize}&offset=${offset}`,
      offset === 0 ? MOCK_INCIDENTS : []
    );
    if (!Array.isArray(page) || page.length === 0) break;
    allRecords.push(...page);
    if (page.length < pageSize) break;
  }
  if (allRecords.length > 0) {
    return allRecords.map(normalizeIncident);
  }
  return MOCK_FALLBACK_ENABLED ? MOCK_INCIDENTS.map(normalizeIncident) : [];
}

export async function fetchIncidentById(id: string): Promise<HazardIncident | null> {
  const raw = await apiFetch<any | null>(
    `/api/incidents/${id}`,
    () => MOCK_INCIDENTS.find((inc) => inc.id === id) || null
  );
  return raw ? normalizeIncident(raw) : null;
}
