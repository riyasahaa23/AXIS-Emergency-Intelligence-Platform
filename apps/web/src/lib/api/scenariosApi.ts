/**
 * AXIS Scenarios & Simulation API Service
 * 
 * Fetches counterfactual simulation definitions and evaluates 'what-if' models,
 * falling back seamlessly to the client-side simulation engine.
 */

import { apiFetch } from './client';
import {
  HAZARD_SCENARIO_CONFIGS,
  calculateScenarioResults,
  DEFAULT_SAVED_SCENARIOS,
  type HazardScenarioDefinition
} from '../mock/scenarios/scenarioDatabase';
import type { SavedScenario, ScenarioResultData } from '../types/scenario';

export async function fetchScenarioConfigs(): Promise<Record<string, HazardScenarioDefinition>> {
  return apiFetch<Record<string, HazardScenarioDefinition>>(
    '/api/scenarios/configs',
    HAZARD_SCENARIO_CONFIGS
  );
}

export async function fetchSavedScenarios(): Promise<SavedScenario[]> {
  return apiFetch<SavedScenario[]>('/api/scenarios/saved', DEFAULT_SAVED_SCENARIOS);
}

export async function runSimulation(
  scenarioDef: HazardScenarioDefinition,
  params: Record<string, number>,
  factors: Record<string, boolean>,
  extraFactorIds: string[]
): Promise<ScenarioResultData> {
  return apiFetch<ScenarioResultData>(
    '/api/scenarios/simulate',
    () => calculateScenarioResults(scenarioDef, params, factors, extraFactorIds),
    {
      method: 'POST',
      body: JSON.stringify({
        hazardType: scenarioDef.hazardType,
        parameters: params,
        factors,
        extraFactorIds
      })
    }
  );
}
