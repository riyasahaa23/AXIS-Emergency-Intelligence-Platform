/**
 * AXIS Planetary Emergency Intelligence — Canonical Mock Data Index
 * 
 * Centralized, high-fidelity mock datasets preserved as permanent autonomous
 * fallback for offline development, hackathon demos, and real backend downtime.
 */

// 1. Incidents
export { MOCK_INCIDENTS, INCIDENTS } from './incidents';

// 2. Telemetry & Base Scenarios
export { MOCK_SCENARIOS, MOCK_TELEMETRY, MOCK_UPDATES } from './scenarios';

// 3. Analysis Geospatial & Scenarios
export {
  getAnalysisData,
  generateAnalysisData,
  generateImpactProjection,
  generateRainfallForecast,
  generateInfrastructureImpact,
  generateKeyFindings
} from './analysis';

export {
  ANALYSIS_SCENARIOS,
  HAZARD_INCIDENT_MAP,
  type AnalysisScenario
} from './analysisScenarios';

// 4. Counterfactual Simulation Database
export {
  HAZARD_SCENARIO_CONFIGS,
  calculateScenarioResults,
  DEFAULT_SAVED_SCENARIOS,
  type HazardScenarioDefinition
} from './scenarios/scenarioDatabase';

// 5. Tactical Resources & Fleet Inventory
export {
  resourceDatabase,
  floodResourceData,
  type HazardResourcePackage
} from './resources/resourceDatabase';

// 6. Emergency Response Operations & Directives
export {
  responseDatabase,
  floodResponseData,
  type HazardResponsePackage
} from './response/responseDatabase';
