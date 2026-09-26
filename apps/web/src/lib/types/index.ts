export type HazardType = 'flood' | 'cyclone' | 'wildfire' | 'earthquake' | 'infrastructure_failure' | 'storm' | 'heatwave' | 'multi_hazard';
export type SeverityLevel = 'critical' | 'high' | 'moderate' | 'low';

export interface Coordinates {
  lat: number;
  lng: number;
  altitude?: number;
}

export interface HazardIncident {
  id: string;
  name: string;
  type: HazardType;
  region: string;
  country: string;
  coords: Coordinates;
  severity: SeverityLevel;
  affectedPopulation: string;
  affectedPopulationNum: number;
  displacedPopulation?: string;
  displacedPopulationNum?: number;
  roadsAffected?: number;
  districtsAffected?: number;
  relativeTime: string;
  timestamp: string;
  riskScore: number; // 0-100
  confidence: number; // 0.0 - 1.0
  thumbnailUrl?: string;
  status: 'active' | 'escalating' | 'contained' | 'monitoring';
  details: {
    rainfallRate?: string;
    windSpeed?: string;
    temperature?: string;
    shelterDemand?: string;
    roadAccessibility?: string;
    description: string;
  };
  overview?: {
    summary: string;
    riskLevel: string;
    projectedConditions: string;
    keyMetrics: Array<{ label: string; value: string; sub?: string }>;
  };
  impact?: {
    population: Array<{ label: string; value: string; pct: number; color?: string }>;
    infrastructure: Array<{ label: string; value: string; status: 'critical' | 'warning' | 'nominal' }>;
    healthcare: string;
    shelterOccupancy: string;
    roadAccessibility: string;
  };
  forecast?: {
    timeline: Array<{ time: string; areaKm2: number; popAtRisk: string; rainfallDelta: string; severityScore: number }>;
    trendSummary: string;
    crestTime?: string;
  };
  response?: {
    teamsDeployed: number;
    activeShelters: number;
    bedsAvailable: number;
    reliefSuppliesDays: number;
    units: Array<{ name: string; type: string; status: string; location: string }>;
  };
  geometry?: {
    center: [number, number]; // [lng, lat]
    bounds: [[number, number], [number, number]]; // [[minLng, minLat], [maxLng, maxLat]]
    floodExtent?: Array<[number, number]>; // polygon vertices in [lng, lat]
    secondaryExtent?: Array<[number, number]>;
    highRiskZones?: Array<{ name: string; coords: [number, number]; radiusKm: number; severity: string }>;
    affectedDistricts?: Array<{ name: string; coords: [number, number]; population: string; risk: string }>;
    rivers?: Array<{ name: string; path: Array<[number, number]> }>;
    cities?: Array<{ name: string; coords: [number, number]; population: string; isCapital?: boolean }>;
  };
}

export interface ScenarioItem {
  id: string;
  title: string;
  subtitle: string;
  location?: string;
  category?: string;
  icon: string;
  tag: string;
  baselineMetric: string;
  projectedMetric: string;
  delta: string;
  details: string;
  impactStats?: string;
}

export interface TelemetrySummary {
  satellitesOnline: number;
  weatherFeedsStatus: 'Live' | 'Degraded' | 'Offline';
  groundSensors: number;
  dataSources: number;
  activeIncidents: number;
  highRisk: number;
  countriesAffected: number;
  peopleAffected: string;
  responseTeams: number;
  activeShelters: number;
  criticalResourcesPct: number;
}

export interface IncidentUpdate {
  id: string;
  type: 'shelter' | 'hazard' | 'route' | 'weather';
  text: string;
  timeAgo: string;
  severity: 'alert' | 'warning' | 'info';
}

// ==========================================
// ANALYSIS WORKSTATION DATA CONTRACTS
// ==========================================

export type AnalysisMode = 'current' | 'short_term' | 'long_term' | 'comparative';
export type HazardSelectorType = 'flood' | 'cyclone' | 'wildfire' | 'earthquake' | 'multi_hazard';

export interface RiskDriver {
  name: string;
  score: number; // 0 - 100
  weight: number; // 0.0 - 1.0
  description: string;
}

export interface ProjectionPoint {
  label: string; // 'Now', '+7 days', '+14 days', '+30 days'
  affected: number; // in Millions or relevant unit
  displaced: number; // in Millions or relevant unit
}

export interface RainfallForecastPoint {
  day: string; // 'Now', '1d', '3d', '5d', '7d'
  amountMm: number;
  anomalyPct: number;
}

export interface InfrastructureBreakdownItem {
  label: string;
  count: number;
  icon?: string;
}

export interface HistoricalComparisonItem {
  metric: string;
  current: string;
  historical: string;
  diffPct: string;
  higherIsWorse: boolean;
}

export interface IncidentAnalysisData {
  incidentId: string;
  hazardType: HazardSelectorType;
  mode: AnalysisMode;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  confidencePct: number;
  metrics: {
    peopleAffected: string;
    peopleAffectedSub?: string;
    displaced: string;
    displacedSub?: string;
    districts: number | string;
    districtsSub?: string;
    roadsAffected: number | string;
    roadsSub?: string;
    healthFacilities: number | string;
    healthSub?: string;
    majorBridges: number | string;
    bridgesSub?: string;
  };
  projection: {
    title?: string;
    estimatedAffected: string;
    estimatedAffectedLabel?: string;
    increasePct: string;
    increaseLabel?: string;
    riskTrend: 'HIGH' | 'MODERATE' | 'LOW';
    timeline: ProjectionPoint[];
    legendSeries1?: string;
    legendSeries2?: string;
  };
  rainfall: {
    title?: string;
    cumulativeMm: number | string;
    cumulativeUnit?: string;
    timeframe: string;
    aboveAveragePct: number;
    anomalyLabel?: string;
    floodRiskLevel: 'HIGH' | 'CRITICAL' | 'MODERATE' | 'LOW' | string;
    riskBadgeLabel?: string;
    bars: RainfallForecastPoint[];
    yAxisMax?: number;
  };
  infrastructure: {
    title?: string;
    networkAffectedPct: number;
    networkLabel: string;
    items: InfrastructureBreakdownItem[];
  };
  riskDrivers: RiskDriver[];
  historicalBenchmark?: {
    eventName: string;
    eventYear: number;
    comparisons: HistoricalComparisonItem[];
  };
}

export * from './scenario';

