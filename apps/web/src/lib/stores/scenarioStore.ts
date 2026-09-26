import { writable, derived, get } from 'svelte/store';
import {
  HAZARD_SCENARIO_CONFIGS,
  calculateScenarioResults,
  DEFAULT_SAVED_SCENARIOS,
  type HazardScenarioDefinition
} from '$lib/mock/scenarios/scenarioDatabase';
import type {
  ScenarioViewTab,
  ScenarioTimelineDay,
  ScenarioDetailTab,
  SavedScenario
} from '$lib/types/scenario';
import { incidents, selectIncident, selectedIncident } from '$lib/stores/incidentStore';

// 1. Navigation & View Stores
export const activeScenarioView = writable<ScenarioViewTab>('builder');
export const activeScenarioDetailTab = writable<ScenarioDetailTab>('impact_projection');
export const selectedScenarioHazard = writable<string>('flood');

// 2. Active Scenario Configuration Stores
export const scenarioParameters = writable<Record<string, number>>({
  rainfallIncrease: 50,
  riverDischarge: 40,
  durationDays: 14,
  seaLevelRise: 0.5
});

export const scenarioFactors = writable<Record<string, boolean>>({
  upstreamDamRelease: true,
  drainageFailure: true,
  populationMovement: false
});

export const scenarioActiveExtraFactorIds = writable<string[]>([]);

// 3. Simulation Timeline & Playback
export const simulationTimelineDay = writable<ScenarioTimelineDay>(7);
export const isSimulationPlaying = writable<boolean>(false);
let playbackInterval: any = null;

// 4. Execution State & Telemetry Pipeline
export const isSimulating = writable<boolean>(false);
export const simulationStage = writable<string>('SIMULATION ENGINE IDLE');
export const simulationProgressPct = writable<number>(0);

// 5. Library & Comparison Stores
export const savedScenarios = writable<SavedScenario[]>(DEFAULT_SAVED_SCENARIOS);
export const activeSavedScenarioId = writable<string | null>('scen-001');
export const comparisonScenarioA = writable<SavedScenario | null>(DEFAULT_SAVED_SCENARIOS[0]);
export const comparisonScenarioB = writable<SavedScenario | null>(DEFAULT_SAVED_SCENARIOS[1]);

// 6. Modals
export const isSaveModalOpen = writable<boolean>(false);
export const isExportModalOpen = writable<boolean>(false);

// 7. Derived Stores
export const currentHazardConfig = derived(
  selectedScenarioHazard,
  ($hazard) => HAZARD_SCENARIO_CONFIGS[$hazard] || HAZARD_SCENARIO_CONFIGS.flood
);

export const scenarioSimulationResult = derived(
  [selectedScenarioHazard, scenarioParameters, scenarioFactors, simulationTimelineDay],
  ([$hazard, $params, $factors, $day]) => {
    return calculateScenarioResults($hazard, $params, $factors, $day);
  }
);

// 8. Action Functions

/**
 * Switch active hazard and reinitialize parameters to defaults
 */
export function setScenarioHazard(hazardType: string) {
  const config = HAZARD_SCENARIO_CONFIGS[hazardType] || HAZARD_SCENARIO_CONFIGS.flood;
  selectedScenarioHazard.set(config.hazardType);

  // Reinitialize default parameters
  const newParams: Record<string, number> = {};
  config.parameters.forEach((p) => {
    newParams[p.id] = p.defaultValue;
  });
  scenarioParameters.set(newParams);

  // Reinitialize default factors
  const newFactors: Record<string, boolean> = {};
  config.factors.forEach((f) => {
    newFactors[f.id] = f.defaultActive;
  });
  scenarioFactors.set(newFactors);
  scenarioActiveExtraFactorIds.set([]);

  // Sync with global incident store if matching incident exists
  const allIncidents = get(incidents);
  const matched = allIncidents.find((inc) => inc.id === config.incidentId || inc.type === config.hazardType);
  if (matched) {
    selectIncident(matched);
  }
}

/**
 * Update a single parameter slider
 */
export function updateScenarioParameter(id: string, value: number) {
  scenarioParameters.update((prev) => ({
    ...prev,
    [id]: value
  }));
}

/**
 * Toggle an additional factor switch
 */
export function toggleScenarioFactor(id: string) {
  scenarioFactors.update((prev) => ({
    ...prev,
    [id]: !prev[id]
  }));
}

/**
 * Add an extra factor from the dropdown
 */
export function addScenarioExtraFactor(id: string) {
  const config = get(currentHazardConfig);
  const extra = config.availableExtraFactors.find((f) => f.id === id);
  if (extra) {
    scenarioActiveExtraFactorIds.update((ids) => (ids.includes(id) ? ids : [...ids, id]));
    scenarioParameters.update((prev) => ({
      ...prev,
      [id]: prev[id] !== undefined ? prev[id] : extra.defaultValue
    }));
  }
}

/**
 * Remove an extra factor
 */
export function removeScenarioExtraFactor(id: string) {
  scenarioActiveExtraFactorIds.update((ids) => ids.filter((i) => i !== id));
}

/**
 * Reset all parameters and factors to current hazard defaults
 */
export function resetScenarioConfiguration() {
  const config = get(currentHazardConfig);
  const newParams: Record<string, number> = {};
  config.parameters.forEach((p) => {
    newParams[p.id] = p.defaultValue;
  });
  scenarioParameters.set(newParams);

  const newFactors: Record<string, boolean> = {};
  config.factors.forEach((f) => {
    newFactors[f.id] = f.defaultActive;
  });
  scenarioFactors.set(newFactors);
  scenarioActiveExtraFactorIds.set([]);
  simulationTimelineDay.set(7);
  simulationStage.set('CONFIGURATION RESET TO DEFAULT');
}

/**
 * Set timeline progression day (1, 3, 7, 14, 30)
 */
export function setSimulationTimelineDay(day: ScenarioTimelineDay) {
  simulationTimelineDay.set(day);
}

/**
 * Toggle animated timeline playback loop
 */
export function toggleSimulationPlayback() {
  const playing = get(isSimulationPlaying);
  if (playing) {
    isSimulationPlaying.set(false);
    if (playbackInterval) {
      clearInterval(playbackInterval);
      playbackInterval = null;
    }
  } else {
    isSimulationPlaying.set(true);
    const steps: ScenarioTimelineDay[] = [1, 3, 7, 14, 30];
    playbackInterval = setInterval(() => {
      simulationTimelineDay.update((current) => {
        const idx = steps.indexOf(current);
        const nextIdx = (idx + 1) % steps.length;
        return steps[nextIdx];
      });
    }, 1800);
  }
}

/**
 * Run 9-stage simulation telemetry pipeline
 */
export async function runScenarioSimulation(): Promise<void> {
  if (get(isSimulating)) return;

  isSimulating.set(true);

  const stages = [
    { text: 'INITIALIZING SCENARIO', pct: 12, delay: 180 },
    { text: 'LOADING INCIDENT STATE', pct: 24, delay: 180 },
    { text: 'APPLYING PARAMETERS', pct: 38, delay: 200 },
    { text: 'RUNNING IMPACT MODEL', pct: 52, delay: 240 },
    { text: 'PROPAGATING GEOSPATIAL IMPACT', pct: 68, delay: 240 },
    { text: 'CALCULATING POPULATION EXPOSURE', pct: 80, delay: 200 },
    { text: 'ASSESSING INFRASTRUCTURE', pct: 90, delay: 180 },
    { text: 'VERIFYING RESULTS', pct: 96, delay: 160 },
    { text: 'SIMULATION COMPLETE', pct: 100, delay: 350 }
  ];

  for (const step of stages) {
    simulationStage.set(step.text);
    simulationProgressPct.set(step.pct);
    await new Promise((r) => setTimeout(r, step.delay));
  }

  isSimulating.set(false);
}

/**
 * Save current scenario configuration to library
 */
export function saveCurrentScenario(name: string, summary: string): SavedScenario {
  const config = get(currentHazardConfig);
  const params = get(scenarioParameters);
  const factors = get(scenarioFactors);

  const newScenario: SavedScenario = {
    id: `scen-${Date.now()}`,
    name: name.trim() || `${config.name} (Custom)`,
    incidentId: config.incidentId,
    incidentName: config.incidentName,
    hazardType: config.hazardType,
    parameters: { ...params },
    factors: { ...factors },
    createdAt: new Date().toUTCString().replace(/GMT.*/, 'UTC'),
    status: 'Ready',
    summary: summary.trim() || `Custom counterfactual scenario with ${Object.keys(params).length} modified parameters.`
  };

  savedScenarios.update((list) => [newScenario, ...list]);
  activeSavedScenarioId.set(newScenario.id);
  isSaveModalOpen.set(false);
  return newScenario;
}

/**
 * Load a saved scenario into active state
 */
export function loadSavedScenario(scen: SavedScenario) {
  selectedScenarioHazard.set(scen.hazardType);
  scenarioParameters.set({ ...scen.parameters });
  scenarioFactors.set({ ...scen.factors });
  scenarioActiveExtraFactorIds.set([]);
  activeSavedScenarioId.set(scen.id);
  activeScenarioView.set('builder');
  simulationStage.set(`LOADED SCENARIO: ${scen.name.toUpperCase()}`);
}

/**
 * Duplicate a saved scenario in library
 */
export function duplicateSavedScenario(id: string) {
  savedScenarios.update((list) => {
    const existing = list.find((s) => s.id === id);
    if (!existing) return list;
    const duplicated: SavedScenario = {
      ...existing,
      id: `scen-${Date.now()}`,
      name: `${existing.name} (Copy)`,
      createdAt: 'Just now'
    };
    return [duplicated, ...list];
  });
}

/**
 * Delete a saved scenario from library
 */
export function deleteSavedScenario(id: string) {
  savedScenarios.update((list) => list.filter((s) => s.id !== id));
}
