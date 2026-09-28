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
  if (!raw) throw new Error('Incident payload is empty');
  if (raw.coords && raw.overview && raw.details) {
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
  const popStr = pop >= 1_000_000 ? `${(pop / 1_000_000).toFixed(1)}M` : `${Math.round(pop / 1_000)}K`;

  return {
    id: raw.id,
    name: raw.title || raw.name || 'Emergency Event',
    type: (raw.hazard_type || raw.type || 'multi_hazard').toLowerCase() as HazardType,
    region: raw.location || raw.region || 'Unknown location',
    country: raw.country || 'Unknown',
    coords: raw.coords || { lat: 0, lng: 0 },
    severity: severityLevel,
    affectedPopulation: `${popStr} affected`,
    affectedPopulationNum: pop,
    displacedPopulation: raw.displacedPopulation,
    displacedPopulationNum: raw.displacedPopulationNum ?? 0,
    roadsAffected: raw.roadsAffected ?? 0,
    districtsAffected: raw.districtsAffected ?? 0,
    relativeTime: raw.relativeTime || 'Unknown',
    timestamp: raw.created_at || raw.timestamp || '',
    riskScore: Math.round(numericSev),
    confidence: raw.confidence ?? 0,
    thumbnailUrl: raw.thumbnailUrl,
    status: raw.status === 'active' ? 'escalating' : (raw.status || 'monitoring'),
    details: raw.details || {
      description: raw.description || 'No incident description is available.'
    },
    overview: raw.overview || {
      summary: raw.description || 'No incident summary is available.',
      riskLevel: severityLevel.toUpperCase(),
      projectedConditions: 'No projection is available.',
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
  return [];
}

export async function fetchIncidentById(id: string): Promise<HazardIncident | null> {
  const raw = await apiFetch<any | null>(
    `/api/incidents/${id}`,
    () => MOCK_INCIDENTS.find((inc) => inc.id === id) || null
  );
  return raw ? normalizeIncident(raw) : null;
}
