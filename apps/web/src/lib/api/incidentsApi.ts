/**
 * AXIS Incidents API Service
 * 
 * Fetches real incidents from backend when online, falls back to canonical mock dataset.
 * Normalizes backend Incident model to UI HazardIncident contract.
 */

import { apiFetch } from './client';
import type { HazardIncident, SeverityLevel, HazardType } from '../types';
import { MOCK_INCIDENTS } from '../mock/incidents';

/**
 * Normalizes raw backend Incident payload into the shared HazardIncident contract.
 */
export function normalizeIncident(raw: any): HazardIncident {
  if (!raw) return MOCK_INCIDENTS[0];
  if (raw.coords && raw.overview && raw.details) {
    // Already in HazardIncident format
    return raw as HazardIncident;
  }

  const numericSev = typeof raw.severity === 'number' ? raw.severity : 50;
  let severityLevel: SeverityLevel = 'moderate';
  if (numericSev >= 80) severityLevel = 'critical';
  else if (numericSev >= 60) severityLevel = 'high';
  else if (numericSev >= 30) severityLevel = 'moderate';
  else severityLevel = 'low';

  const pop = raw.population || 0;
  const popStr = pop >= 1_000_000 ? `${(pop / 1_000_000).toFixed(1)}M` : `${Math.round(pop / 1_000)}K`;

  return {
    id: raw.id || `inc-${Date.now()}`,
    name: raw.title || raw.name || 'Emergency Event',
    type: (raw.hazard_type || raw.type || 'flood').toLowerCase() as HazardType,
    region: raw.location || raw.region || 'Regional Sector',
    country: raw.country || 'Global Response Zone',
    coords: raw.coords || { lat: 20.0, lng: 78.0 },
    severity: severityLevel,
    affectedPopulation: `${popStr} affected`,
    affectedPopulationNum: pop,
    displacedPopulation: `${Math.round(pop * 0.4)} displaced`,
    displacedPopulationNum: Math.round(pop * 0.4),
    roadsAffected: raw.roadsAffected || 12,
    districtsAffected: raw.districtsAffected || 4,
    relativeTime: raw.relativeTime || 'Just now',
    timestamp: raw.created_at || raw.timestamp || new Date().toISOString(),
    riskScore: Math.round(numericSev),
    confidence: raw.confidence || 0.92,
    thumbnailUrl: raw.thumbnailUrl || '/assets/flood_thumb.jpg',
    status: raw.status === 'active' ? 'escalating' : (raw.status || 'monitoring'),
    details: raw.details || {
      rainfallRate: 'Live Feed Monitored',
      riverLevelMeters: 3.5,
      shelterDemand: 'Active Staging',
      roadAccessibility: 'Corridors Monitored',
      description: raw.description || `Active incident reporting for ${raw.title || 'the region'}.`
    },
    overview: raw.overview || {
      summary: raw.description || `Active telemetry registered in ${raw.location || 'the sector'}.`,
      riskLevel: severityLevel.toUpperCase(),
      projectedConditions: 'Continuous real-time monitoring via AXIS Analyser array.',
      keyMetrics: [
        { label: 'Exposed Population', value: popStr, sub: 'Direct impact envelope' },
        { label: 'Severity Index', value: `${Math.round(numericSev)}/100`, sub: 'Automated fusion score' }
      ]
    }
  };
}

export async function fetchIncidents(): Promise<HazardIncident[]> {
  const rawList = await apiFetch<any[]>('/api/incidents', MOCK_INCIDENTS);
  if (Array.isArray(rawList)) {
    return rawList.map(normalizeIncident);
  }
  return MOCK_INCIDENTS;
}

export async function fetchIncidentById(id: string): Promise<HazardIncident | null> {
  const raw = await apiFetch<any | null>(
    `/api/incidents/${id}`,
    () => MOCK_INCIDENTS.find((inc) => inc.id === id) || null
  );
  return raw ? normalizeIncident(raw) : null;
}
