import { writable, derived } from 'svelte/store';
import type { HazardSelectorType, AnalysisMode, IncidentAnalysisData } from '../types';
import { selectedIncident, selectedIncidentId, globeFocusTarget } from './incidentStore';
import { getAnalysisData } from '../mock/analysis';
import { ANALYSIS_SCENARIOS, HAZARD_INCIDENT_MAP, type AnalysisScenario } from '../mock/analysisScenarios';

export const activeHazardType = writable<HazardSelectorType>('flood');
export const activeAnalysisMode = writable<AnalysisMode>('current');
export const isRiskDriversOpen = writable<boolean>(false);
export const isAnalyzing = writable<boolean>(false);
export const analysisStage = writable<string>('VERIFYING RESULT');

// Fast intelligence transition on hazard switch
export const isTransitioningHazard = writable<boolean>(false);
export const hazardTransitionStage = writable<string>('ANALYSIS READY');

export const ANALYSIS_STAGES = [
  'UNDERSTANDING INCIDENT',
  'LOADING GEOSPATIAL DATA',
  'ANALYSING EXPOSURE',
  'MODELLING IMPACT',
  'CALCULATING RISK',
  'VERIFYING RESULT'
];

export const activeScenario = derived(
  activeHazardType,
  ($hazard): AnalysisScenario => {
    return ANALYSIS_SCENARIOS[$hazard] || ANALYSIS_SCENARIOS.flood;
  }
);

export const activeAnalysisData = derived(
  [selectedIncident, activeHazardType, activeAnalysisMode],
  ([$inc, $hazard, $mode]): IncidentAnalysisData => {
    const incId = $inc?.id || HAZARD_INCIDENT_MAP[$hazard] || 'inc-01';
    return getAnalysisData(incId, $hazard, $mode);
  }
);

let transitionTimer: ReturnType<typeof setTimeout> | null = null;

export function selectHazard(hazard: HazardSelectorType) {
  activeHazardType.set(hazard);

  // 1. Synchronize Incident Store
  const incId = HAZARD_INCIDENT_MAP[hazard] || 'inc-01';
  selectedIncidentId.set(incId);

  // 2. Synchronize Scenario Camera
  const scenario = ANALYSIS_SCENARIOS[hazard];
  if (scenario) {
    globeFocusTarget.set({
      lat: scenario.camera.centerLat,
      lng: scenario.camera.centerLng,
      zoom: scenario.camera.defaultZoom,
      duration: 1.0
    });
  }

  // 3. Fast Tactical Intelligence Transition
  if (transitionTimer) clearTimeout(transitionTimer);
  isTransitioningHazard.set(true);
  hazardTransitionStage.set(`LOADING ${hazard.replace('_', '-').toUpperCase()} MODEL`);

  transitionTimer = setTimeout(() => {
    hazardTransitionStage.set('LOADING GEOSPATIAL DATA');
    transitionTimer = setTimeout(() => {
      hazardTransitionStage.set('ANALYSIS READY');
      transitionTimer = setTimeout(() => {
        isTransitioningHazard.set(false);
      }, 150);
    }, 150);
  }, 120);
}

export async function runAnalysisPipeline(customStageCallback?: (stage: string) => void) {
  isAnalyzing.set(true);
  for (let i = 0; i < ANALYSIS_STAGES.length; i++) {
    const stage = ANALYSIS_STAGES[i];
    analysisStage.set(stage);
    if (customStageCallback) customStageCallback(stage);
    await new Promise((r) => setTimeout(r, 450));
  }
  isAnalyzing.set(false);
}

export function openRiskDrivers() {
  isRiskDriversOpen.set(true);
}

export function closeRiskDrivers() {
  isRiskDriversOpen.set(false);
}

export function toggleRiskDrivers() {
  isRiskDriversOpen.update((v) => !v);
}
