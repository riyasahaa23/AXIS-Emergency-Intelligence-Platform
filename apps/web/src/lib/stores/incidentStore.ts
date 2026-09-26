import { writable, derived } from 'svelte/store';
import { MOCK_INCIDENTS } from '../mock/incidents';
import type { HazardIncident, HazardType, SeverityLevel } from '../types';

export const incidents = writable<HazardIncident[]>(MOCK_INCIDENTS);
// Initial default selected incident: inc-01 (Severe Flooding, Bangladesh)
export const selectedIncidentId = writable<string | null>('inc-01');

// Filtering & Search Stores
export const activeSeverityFilter = writable<SeverityLevel | 'all'>('all');
export const activeTypeFilter = writable<string>('all');
export const searchQuery = writable<string>('');
export const sortBy = writable<'latest' | 'oldest' | 'severity' | 'affected'>('latest');

// Detailed Workspace Inspection Stores
export const activeDetailTab = writable<'overview' | 'impact' | 'forecast' | 'response'>('overview');
export const timelineStep = writable<string>('NOW'); // '-24h' | '-12h' | 'NOW' | '+24h' | '+48h' | '+72h'

// Globe Focus for planetary transitions
export const globeFocusTarget = writable<{ lat: number; lng: number; zoom: number; duration?: number } | null>({
  lat: 23.685,
  lng: 90.356,
  zoom: 1.3,
  duration: 1.2
});

export const selectedIncident = derived(
  [incidents, selectedIncidentId],
  ([$incidents, $selectedId]) => {
    if (!$selectedId) return $incidents[0] || null;
    return $incidents.find((inc) => inc.id === $selectedId) || $incidents[0] || null;
  }
);

export const severityCounts = derived(incidents, ($incidents) => {
  const counts = { all: $incidents.length, critical: 0, high: 0, moderate: 0, low: 0 };
  $incidents.forEach((inc) => {
    if (counts[inc.severity] !== undefined) {
      counts[inc.severity]++;
    }
  });
  return counts;
});

export const filteredIncidents = derived(
  [incidents, activeSeverityFilter, activeTypeFilter, searchQuery, sortBy],
  ([$incidents, $severity, $type, $search, $sort]) => {
    let result = [...$incidents];

    // 1. Severity filter
    if ($severity !== 'all') {
      result = result.filter((inc) => inc.severity === $severity);
    }

    // 2. Type filter
    if ($type !== 'all') {
      result = result.filter((inc) => inc.type.toLowerCase() === $type.toLowerCase());
    }

    // 3. Search query
    if ($search.trim()) {
      const q = $search.toLowerCase().trim();
      result = result.filter(
        (inc) =>
          inc.name.toLowerCase().includes(q) ||
          inc.country.toLowerCase().includes(q) ||
          inc.region.toLowerCase().includes(q) ||
          inc.type.toLowerCase().includes(q)
      );
    }

    // 4. Sorting
    const severityRank: Record<SeverityLevel, number> = {
      critical: 4,
      high: 3,
      moderate: 2,
      low: 1
    };

    result.sort((a, b) => {
      if ($sort === 'latest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if ($sort === 'oldest') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if ($sort === 'severity') {
        return severityRank[b.severity] - severityRank[a.severity] || b.riskScore - a.riskScore;
      } else if ($sort === 'affected') {
        return b.affectedPopulationNum - a.affectedPopulationNum;
      }
      return 0;
    });

    return result;
  }
);

export function selectIncident(incident: HazardIncident) {
  selectedIncidentId.set(incident.id);
  globeFocusTarget.set({
    lat: incident.coords.lat,
    lng: incident.coords.lng,
    zoom: 1.3,
    duration: 1.2
  });
}

export function clearIncidentSelection() {
  selectedIncidentId.set(null);
  globeFocusTarget.set({
    lat: 20,
    lng: 60,
    zoom: 1.0,
    duration: 1.2
  });
}