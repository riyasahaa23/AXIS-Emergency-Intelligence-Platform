/**
 * AXIS Analysis API Service
 * 
 * Fetches real analytical and geospatial intelligence from backend when online,
 * falls back to high-fidelity scenario analysis models.
 */

import { apiFetch } from './client';
import type { HazardSelectorType, AnalysisMode, IncidentAnalysisData } from '../types';
import { getAnalysisData } from '../mock/analysis';
import { ANALYSIS_SCENARIOS, HAZARD_INCIDENT_MAP, type AnalysisScenario } from '../mock/analysisScenarios';

export async function fetchAnalysis(
  incidentId: string,
  hazard: HazardSelectorType,
  mode: AnalysisMode
): Promise<IncidentAnalysisData> {
  const query = `hazard=${encodeURIComponent(hazard)}&mode=${encodeURIComponent(mode)}`;
  return apiFetch<IncidentAnalysisData>(
    `/api/incidents/${incidentId}/analysis?${query}`,
    () => getAnalysisData(incidentId, hazard, mode),
    { method: 'POST' }
  );
}

export async function fetchAnalysisScenario(hazard: HazardSelectorType): Promise<AnalysisScenario> {
  return apiFetch<AnalysisScenario>(
    `/api/analysis/scenarios/${hazard}`,
    () => ANALYSIS_SCENARIOS[hazard] || ANALYSIS_SCENARIOS.flood
  );
}

export { HAZARD_INCIDENT_MAP };
