export type ScenarioViewTab = 'builder' | 'library' | 'comparison' | 'results';

export type ScenarioTimelineDay = 1 | 3 | 7 | 14 | 30;

export type ScenarioDetailTab = 
  | 'impact_projection'
  | 'affected_population'
  | 'infrastructure'
  | 'risk_analysis'
  | 'response_needs';

export interface ScenarioParameterConfig {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  icon: string;
  description: string;
}

export interface ScenarioFactorConfig {
  id: string;
  label: string;
  description: string;
  defaultActive: boolean;
  impactMultiplier: number;
}

export interface ScenarioMetricSet {
  affectedPopulation: string;
  affectedPopulationRaw: number;
  displacedPopulation: string;
  displacedPopulationRaw: number;
  affectedDistricts: number;
  roadsAffected: number;
  healthFacilities: number;
  bridgesAffected: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  riskScore: number;
}

export interface ScenarioComparisonDiff {
  affectedDiff: string;
  displacedDiff: string;
  districtsDiff: string;
  roadsDiff: string;
  healthDiff: string;
  bridgesDiff: string;
  affectedPct: string;
  displacedPct: string;
  districtsPct: string;
  roadsPct: string;
  healthPct: string;
}

export interface ScenarioInsightKPIs {
  potentialIncrease: string;
  projectedAffected: string;
  riskLevel: string;
  infrastructureImpact: string;
}

export interface RiskDriverScore {
  name: string;
  value: number;
  trend: string;
  description?: string;
}

export interface ScenarioRiskAnalysis {
  riskScore: number;
  confidenceScore: number;
  drivers: RiskDriverScore[];
}

export interface ScenarioResponseNeedItem {
  icon: string;
  value: string;
  label: string;
  change: string;
}

export interface SavedScenario {
  id: string;
  name: string;
  incidentId: string;
  incidentName: string;
  hazardType: string;
  parameters: Record<string, number>;
  factors: Record<string, boolean>;
  createdAt: string;
  status: 'Ready' | 'Simulated' | 'Draft';
  summary: string;
}
