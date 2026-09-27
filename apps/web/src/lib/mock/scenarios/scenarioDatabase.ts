import type {
  ScenarioParameterConfig,
  ScenarioFactorConfig,
  ScenarioMetricSet,
  ScenarioComparisonDiff,
  ScenarioInsightKPIs,
  ScenarioRiskAnalysis,
  ScenarioResponseNeedItem,
  SavedScenario,
  ScenarioTimelineDay,
  ScenarioPreset
} from '$lib/types/scenario';

export interface HazardScenarioDefinition {
  hazardType: string;
  name: string;
  incidentId: string;
  incidentName: string;
  country: string;
  location: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  parameters: ScenarioParameterConfig[];
  factors: ScenarioFactorConfig[];
  availableExtraFactors: ScenarioParameterConfig[];
  baseMetrics: ScenarioMetricSet;
  presets: ScenarioPreset[];
}

export const HAZARD_SCENARIO_CONFIGS: Record<string, HazardScenarioDefinition> = {
  flood: {
    hazardType: 'flood',
    name: 'Monsoon Escalation & Flood Propagation',
    incidentId: 'inc-01',
    incidentName: 'Severe Flooding',
    country: 'Bangladesh',
    location: 'Bengal Delta Basin',
    severity: 'critical',
    parameters: [
      {
        id: 'rainfallIncrease',
        label: 'RAINFALL INCREASE',
        unit: '%',
        min: 10,
        max: 100,
        step: 5,
        defaultValue: 50,
        icon: 'cloud-rain',
        description: 'Precipitation volume above 30-year seasonal baseline'
      },
      {
        id: 'riverDischarge',
        label: 'RIVER DISCHARGE',
        unit: '%',
        min: 10,
        max: 80,
        step: 5,
        defaultValue: 40,
        icon: 'droplets',
        description: 'Upstream volumetric inflow from Brahmaputra-Jamuna & Meghna'
      },
      {
        id: 'durationDays',
        label: 'DURATION',
        unit: 'days',
        min: 3,
        max: 30,
        step: 1,
        defaultValue: 14,
        icon: 'calendar',
        description: 'Sustained peak inundation crest duration'
      },
      {
        id: 'seaLevelRise',
        label: 'SEA LEVEL RISE',
        unit: 'm',
        min: 0.0,
        max: 2.0,
        step: 0.1,
        defaultValue: 0.5,
        icon: 'waves',
        description: 'Bay of Bengal tidal backwater surge head'
      }
    ],
    factors: [
      {
        id: 'upstreamDamRelease',
        label: 'Upstream Dam Release',
        description: 'Unplanned spillway gate opening from upstream reservoir basin',
        defaultActive: true,
        impactMultiplier: 0.16
      },
      {
        id: 'drainageFailure',
        label: 'Urban Drainage Failure',
        description: 'Siltation and pump blackout across Greater Dhaka canal gates',
        defaultActive: true,
        impactMultiplier: 0.14
      },
      {
        id: 'populationMovement',
        label: 'High Population Movement',
        description: 'Spontaneous citizen displacement towards elevated embankments',
        defaultActive: false,
        impactMultiplier: 0.10
      }
    ],
    availableExtraFactors: [
      {
        id: 'windSpeed',
        label: 'Monsoon Wind Gusts',
        unit: 'km/h',
        min: 20,
        max: 90,
        step: 5,
        defaultValue: 45,
        icon: 'wind',
        description: 'Surface wind stress pushing floodwaters inland'
      },
      {
        id: 'roadClosure',
        label: 'Highway Submersion Index',
        unit: '%',
        min: 10,
        max: 90,
        step: 5,
        defaultValue: 35,
        icon: 'truck',
        description: 'Percentage of arterial logistics corridors severed'
      },
      {
        id: 'infrastructureFailure',
        label: 'Substation Inundation Risk',
        unit: '%',
        min: 10,
        max: 80,
        step: 5,
        defaultValue: 30,
        icon: 'zap',
        description: 'Grid substation flooding probability'
      }
    ],
    baseMetrics: {
      affectedPopulation: '2.4M',
      affectedPopulationRaw: 2400000,
      displacedPopulation: '1.2M',
      displacedPopulationRaw: 1200000,
      affectedDistricts: 12,
      roadsAffected: 37,
      healthFacilities: 18,
      bridgesAffected: 6,
      riskLevel: 'CRITICAL',
      riskScore: 84
    },
    presets: [
      {
        id: 'fl-normal',
        label: 'NORMAL',
        description: 'Baseline monsoon precipitation with standard river discharge',
        hazardType: 'flood',
        parameters: { rainfallIncrease: 20, riverDischarge: 20, durationDays: 7, seaLevelRise: 0.2 },
        factors: { upstreamDamRelease: false, drainageFailure: false, populationMovement: false }
      },
      {
        id: 'fl-heavy',
        label: 'HEAVY RAIN',
        description: 'Sustained monsoon rain (+35%) and elevated river swelling',
        hazardType: 'flood',
        parameters: { rainfallIncrease: 35, riverDischarge: 35, durationDays: 14, seaLevelRise: 0.5 },
        factors: { upstreamDamRelease: false, drainageFailure: true, populationMovement: false }
      },
      {
        id: 'fl-extreme',
        label: 'EXTREME RAINFALL',
        description: 'Heavy precipitation (+65%) with upstream dam release and drainage failure',
        hazardType: 'flood',
        parameters: { rainfallIncrease: 65, riverDischarge: 55, durationDays: 21, seaLevelRise: 0.9 },
        factors: { upstreamDamRelease: true, drainageFailure: true, populationMovement: true }
      },
      {
        id: 'fl-catastrophic',
        label: 'CATASTROPHIC FLOOD',
        description: 'Worst-case 100-year monsoon inundation crest with total polder breach',
        hazardType: 'flood',
        parameters: { rainfallIncrease: 100, riverDischarge: 80, durationDays: 30, seaLevelRise: 1.8 },
        factors: { upstreamDamRelease: true, drainageFailure: true, populationMovement: true }
      }
    ]
  },

  cyclone: {
    hazardType: 'cyclone',
    name: 'Cyclone Marex Track Shift & Landfall Surge',
    incidentId: 'inc-03',
    incidentName: 'Cyclone Marex',
    country: 'Indian Ocean',
    location: 'Bay of Bengal Coastal Arc',
    severity: 'high',
    parameters: [
      {
        id: 'windSpeed',
        label: 'WIND SPEED',
        unit: '%',
        min: 5,
        max: 50,
        step: 5,
        defaultValue: 20,
        icon: 'wind',
        description: 'Peak sustained 1-minute eyewall rotational velocity'
      },
      {
        id: 'trackShift',
        label: 'TRACK SHIFT',
        unit: 'km',
        min: -200,
        max: 200,
        step: 25,
        defaultValue: 100,
        icon: 'compass',
        description: 'Deflection of projected landfall coordinates eastward/westward'
      },
      {
        id: 'intensityCat',
        label: 'INTENSITY',
        unit: 'Cat',
        min: 1,
        max: 5,
        step: 1,
        defaultValue: 4,
        icon: 'activity',
        description: 'Saffir-Simpson equivalent tropical cyclone category'
      },
      {
        id: 'durationHours',
        label: 'DURATION',
        unit: 'h',
        min: 12,
        max: 72,
        step: 6,
        defaultValue: 24,
        icon: 'clock',
        description: 'Gale-force onshore wind duration before dissipation'
      }
    ],
    factors: [
      {
        id: 'highTideAlignment',
        label: 'Astronomical Spring Tide Alignment',
        description: 'Landfall coincident with monthly maximum lunar tide crest',
        defaultActive: true,
        impactMultiplier: 0.20
      },
      {
        id: 'slowForwardSpeed',
        label: 'Stalling Eyewall Motion',
        description: 'Translation velocity drops below 8 km/h, extending gale duration',
        defaultActive: false,
        impactMultiplier: 0.16
      },
      {
        id: 'rapidIntensification',
        label: 'Rapid Intensification Over Warm Eddy',
        description: 'Central barometric pressure drops over 35 hPa within 24h',
        defaultActive: true,
        impactMultiplier: 0.18
      }
    ],
    availableExtraFactors: [
      {
        id: 'seaLevelRise',
        label: 'Storm Surge Elevation',
        unit: 'm',
        min: 0.5,
        max: 5.0,
        step: 0.2,
        defaultValue: 2.4,
        icon: 'waves',
        description: 'Coastal surge barrier overtopping depth'
      },
      {
        id: 'infrastructureFailure',
        label: 'Polder Sea-Dike Breach',
        unit: '%',
        min: 10,
        max: 80,
        step: 5,
        defaultValue: 40,
        icon: 'shield-alert',
        description: 'Probability of primary sea-wall compromise'
      }
    ],
    baseMetrics: {
      affectedPopulation: '850K',
      affectedPopulationRaw: 850000,
      displacedPopulation: '320K',
      displacedPopulationRaw: 320000,
      affectedDistricts: 6,
      roadsAffected: 24,
      healthFacilities: 9,
      bridgesAffected: 4,
      riskLevel: 'HIGH',
      riskScore: 78
    },
    presets: [
      {
        id: 'cy-baseline',
        label: 'BASELINE',
        description: 'Category 2 tropical storm maintaining current offshore trajectory',
        hazardType: 'cyclone',
        parameters: { windSpeed: 10, trackShift: 0, intensityCat: 2, durationHours: 18 },
        factors: { highTideAlignment: false, slowForwardSpeed: false, rapidIntensification: false }
      },
      {
        id: 'cy-intensify',
        label: 'INTENSIFY',
        description: 'Rapid intensification over warm eddy to Category 4 gale force',
        hazardType: 'cyclone',
        parameters: { windSpeed: 25, trackShift: 50, intensityCat: 4, durationHours: 24 },
        factors: { highTideAlignment: false, slowForwardSpeed: false, rapidIntensification: true }
      },
      {
        id: 'cy-shift',
        label: 'TRACK SHIFT',
        description: 'Deflection of landfall corridor towards densely populated industrial estuary',
        hazardType: 'cyclone',
        parameters: { windSpeed: 20, trackShift: 125, intensityCat: 3, durationHours: 36 },
        factors: { highTideAlignment: true, slowForwardSpeed: false, rapidIntensification: false }
      },
      {
        id: 'cy-extreme',
        label: 'EXTREME LANDFALL',
        description: 'Category 5 monster surge coinciding with spring astronomical high tide',
        hazardType: 'cyclone',
        parameters: { windSpeed: 45, trackShift: 100, intensityCat: 5, durationHours: 48 },
        factors: { highTideAlignment: true, slowForwardSpeed: true, rapidIntensification: true }
      }
    ]
  },

  wildfire: {
    hazardType: 'wildfire',
    name: 'Wildfire Complex Outbreak Extreme Spread',
    incidentId: 'inc-04',
    incidentName: 'Wildfire Outbreak',
    country: 'Canada',
    location: 'British Columbia Forest Corridor',
    severity: 'high',
    parameters: [
      {
        id: 'windSpeed',
        label: 'WIND SPEED',
        unit: 'km/h',
        min: 5,
        max: 60,
        step: 5,
        defaultValue: 20,
        icon: 'wind',
        description: 'Gust velocity driving the active flaming perimeter forward'
      },
      {
        id: 'fuelHumidity',
        label: 'HUMIDITY',
        unit: '%',
        min: -35,
        max: -5,
        step: 5,
        defaultValue: -15,
        icon: 'droplets',
        description: 'Relative humidity deficit drying out fine pine needle bed'
      },
      {
        id: 'durationDays',
        label: 'DURATION',
        unit: 'days',
        min: 1,
        max: 14,
        step: 1,
        defaultValue: 3,
        icon: 'calendar',
        description: 'Additional uncontrolled red flag warning progression days'
      },
      {
        id: 'containmentLoss',
        label: 'CONTAINMENT',
        unit: '%',
        min: -50,
        max: -5,
        step: 5,
        defaultValue: -20,
        icon: 'shield',
        description: 'Deficit in physical bulldozer / retardant containment lines'
      }
    ],
    factors: [
      {
        id: 'crownFireTransition',
        label: 'Crown Fire Transition',
        description: 'Flames jump into mature boreal tree crowns creating torching storms',
        defaultActive: true,
        impactMultiplier: 0.22
      },
      {
        id: 'spotFireGeneration',
        label: 'Long-Range Ember Spotting',
        description: 'High-altitude pyroconvective plume throwing embers 3km ahead',
        defaultActive: true,
        impactMultiplier: 0.18
      },
      {
        id: 'structuralDefenseFailure',
        label: 'Urban-Interface Incursion',
        description: 'Direct ignition of residential wooden structures and utilities',
        defaultActive: false,
        impactMultiplier: 0.15
      }
    ],
    availableExtraFactors: [
      {
        id: 'temperatureAnomaly',
        label: 'Heat Dome Anomaly',
        unit: '°C',
        min: 1.0,
        max: 8.0,
        step: 0.5,
        defaultValue: 4.0,
        icon: 'thermometer',
        description: 'Atmospheric heat trapping inhibiting nighttime recovery'
      },
      {
        id: 'roadClosure',
        label: 'Evacuation Route Closure',
        unit: '%',
        min: 10,
        max: 80,
        step: 5,
        defaultValue: 40,
        icon: 'alert-triangle',
        description: 'Single-lane highway cut off by heavy smoke & flame'
      }
    ],
    baseMetrics: {
      affectedPopulation: '120K',
      affectedPopulationRaw: 120000,
      displacedPopulation: '45K',
      displacedPopulationRaw: 45000,
      affectedDistricts: 4,
      roadsAffected: 18,
      healthFacilities: 5,
      bridgesAffected: 2,
      riskLevel: 'HIGH',
      riskScore: 74
    },
    presets: [
      {
        id: 'wf-baseline',
        label: 'BASELINE',
        description: 'Moderate ground fire advancing along natural containment ridges',
        hazardType: 'wildfire',
        parameters: { windSpeed: 15, fuelHumidity: -10, durationDays: 3, containmentLoss: -10 },
        factors: { crownFireTransition: false, spotFireGeneration: false, structuralDefenseFailure: false }
      },
      {
        id: 'wf-wind',
        label: 'HIGH WIND',
        description: 'Gusting winds pushing flames into dense unburned pine stands',
        hazardType: 'wildfire',
        parameters: { windSpeed: 45, fuelHumidity: -20, durationDays: 5, containmentLoss: -25 },
        factors: { crownFireTransition: true, spotFireGeneration: false, structuralDefenseFailure: false }
      },
      {
        id: 'wf-humidity',
        label: 'LOW HUMIDITY',
        description: 'Critically dry atmospheric condition driving extreme fuel flammability',
        hazardType: 'wildfire',
        parameters: { windSpeed: 30, fuelHumidity: -40, durationDays: 7, containmentLoss: -30 },
        factors: { crownFireTransition: true, spotFireGeneration: true, structuralDefenseFailure: false }
      },
      {
        id: 'wf-spread',
        label: 'RAPID SPREAD',
        description: 'Pyroconvective column collapse sparking multiple fires across urban interface',
        hazardType: 'wildfire',
        parameters: { windSpeed: 60, fuelHumidity: -45, durationDays: 10, containmentLoss: -50 },
        factors: { crownFireTransition: true, spotFireGeneration: true, structuralDefenseFailure: true }
      }
    ]
  },

  earthquake: {
    hazardType: 'earthquake',
    name: 'Noto Peninsula Seismic Rupture Escalation',
    incidentId: 'inc-04',
    incidentName: 'Noto Peninsula Seismic Swarm',
    country: 'Japan',
    location: 'Ishikawa Prefecture',
    severity: 'moderate',
    parameters: [
      {
        id: 'magnitude',
        label: 'MAGNITUDE',
        unit: 'M',
        min: 5.0,
        max: 8.5,
        step: 0.1,
        defaultValue: 6.8,
        icon: 'activity',
        description: 'Moment magnitude scale of primary crustal rupture'
      },
      {
        id: 'aftershockRate',
        label: 'AFTERSHOCK PROBABILITY',
        unit: '%',
        min: 10,
        max: 90,
        step: 5,
        defaultValue: 20,
        icon: 'zap',
        description: 'Probability of significant secondary seismic ruptures (>M5.0)'
      },
      {
        id: 'infraVulnerability',
        label: 'INFRASTRUCTURE DEGRADATION',
        unit: '%',
        min: 5,
        max: 60,
        step: 5,
        defaultValue: 15,
        icon: 'home',
        description: 'Structural failure percentage across older residential and masonry assets'
      },
      {
        id: 'roadAccessibility',
        label: 'ROAD ACCESSIBILITY',
        unit: '%',
        min: 10,
        max: 90,
        step: 5,
        defaultValue: 70,
        icon: 'truck',
        description: 'Percentage of arterial mountain and coastal road network passable'
      }
    ],
    factors: [
      {
        id: 'tsunamiAdvisory',
        label: 'Coastal Tsunami Ingress',
        description: 'Secondary seabed thrust generating a 2.5m localized tsunami wave',
        defaultActive: false,
        impactMultiplier: 0.25
      },
      {
        id: 'bridgeRupture',
        label: 'Major Bridge Pier Dislocation',
        description: 'Shearing of main coastal transport viaduct expansion joint',
        defaultActive: true,
        impactMultiplier: 0.18
      },
      {
        id: 'pipelineRupture',
        label: 'Subsurface Water Main Rupture',
        description: 'Loss of emergency firefighting pressure across 3 townships',
        defaultActive: true,
        impactMultiplier: 0.16
      }
    ],
    availableExtraFactors: [
      {
        id: 'soilLiquefaction',
        label: 'Soil Liquefaction Index',
        unit: '%',
        min: 10,
        max: 70,
        step: 5,
        defaultValue: 35,
        icon: 'layers',
        description: 'Reclaimed port land bearing capacity loss'
      }
    ],
    baseMetrics: {
      affectedPopulation: '45K',
      affectedPopulationRaw: 45000,
      displacedPopulation: '22K',
      displacedPopulationRaw: 22000,
      affectedDistricts: 3,
      roadsAffected: 14,
      healthFacilities: 7,
      bridgesAffected: 3,
      riskLevel: 'MODERATE',
      riskScore: 64
    },
    presets: [
      {
        id: 'eq-baseline',
        label: 'BASELINE',
        description: 'Current M6.2 seismic swarm status with moderate shaking',
        hazardType: 'earthquake',
        parameters: { magnitude: 6.2, aftershockRate: 15, infraVulnerability: 10, roadAccessibility: 80 },
        factors: { tsunamiAdvisory: false, bridgeRupture: false, pipelineRupture: false }
      },
      {
        id: 'eq-aftershock',
        label: 'STRONG AFTERSHOCK',
        description: 'Escalation to M6.8 rupture with elevated secondary shocks',
        hazardType: 'earthquake',
        parameters: { magnitude: 6.8, aftershockRate: 35, infraVulnerability: 20, roadAccessibility: 65 },
        factors: { tsunamiAdvisory: false, bridgeRupture: true, pipelineRupture: false }
      },
      {
        id: 'eq-cascade',
        label: 'INFRASTRUCTURE CASCADE',
        description: 'Major M7.3 quake with bridge pier dislocation and gas leaks',
        hazardType: 'earthquake',
        parameters: { magnitude: 7.3, aftershockRate: 55, infraVulnerability: 35, roadAccessibility: 45 },
        factors: { tsunamiAdvisory: false, bridgeRupture: true, pipelineRupture: true }
      },
      {
        id: 'eq-access',
        label: 'MAJOR ACCESS FAILURE',
        description: 'Severe M7.8 rupture triggering coastal landslides and localized tsunami',
        hazardType: 'earthquake',
        parameters: { magnitude: 7.8, aftershockRate: 75, infraVulnerability: 50, roadAccessibility: 25 },
        factors: { tsunamiAdvisory: true, bridgeRupture: true, pipelineRupture: true }
      }
    ]
  },

  multi_hazard: {
    hazardType: 'multi_hazard',
    name: 'Compound Cyclone-Flood Cascade Disaster',
    incidentId: 'inc-08',
    incidentName: 'Cyclone-Flood Compound Disaster',
    country: 'Bangladesh',
    location: 'Coastal Meghna Estuary',
    severity: 'critical',
    parameters: [
      {
        id: 'cascadeCoupling',
        label: 'CASCADE COUPLING',
        unit: 'x',
        min: 1.0,
        max: 3.0,
        step: 0.1,
        defaultValue: 1.8,
        icon: 'share-2',
        description: 'Non-linear feedback factor linking surge, river crest & logistics'
      },
      {
        id: 'compoundDuration',
        label: 'COMPOUND DURATION',
        unit: 'days',
        min: 5,
        max: 30,
        step: 1,
        defaultValue: 21,
        icon: 'clock',
        description: 'Duration where coastal surge locks inland river drainage'
      },
      {
        id: 'gridFailure',
        label: 'POWER GRID LOSS',
        unit: '%',
        min: 10,
        max: 70,
        step: 5,
        defaultValue: 40,
        icon: 'zap-off',
        description: 'Percentage of high-voltage transmission interconnects down'
      },
      {
        id: 'landslideRisk',
        label: 'SECONDARY LANDSLIDES',
        unit: '%',
        min: 10,
        max: 85,
        step: 5,
        defaultValue: 45,
        icon: 'trending-up',
        description: 'Hilly slope failure probability in eastern districts'
      }
    ],
    factors: [
      {
        id: 'evacuationCorridorBlocked',
        label: 'Primary Evacuation Corridor Blocked',
        description: 'Dhaka-Chittagong Highway submerged under 1.2m rushing floodwater',
        defaultActive: true,
        impactMultiplier: 0.22
      },
      {
        id: 'communicationBlackout',
        label: 'Cellular Base Station Blackout',
        description: 'Backup diesel depletion severing telecom across 5 districts',
        defaultActive: true,
        impactMultiplier: 0.18
      },
      {
        id: 'hospitalOvercapacity',
        label: 'Trauma Healthcare Overcapacity',
        description: 'Field hospitals overwhelmed exceeding 175% admission capacity',
        defaultActive: false,
        impactMultiplier: 0.16
      }
    ],
    availableExtraFactors: [
      {
        id: 'waterContamination',
        label: 'Saline Intrusion in Aquifer',
        unit: '%',
        min: 20,
        max: 90,
        step: 5,
        defaultValue: 55,
        icon: 'droplet',
        description: 'Saltwater contaminating municipal drinking water reservoirs'
      }
    ],
    baseMetrics: {
      affectedPopulation: '3.2M',
      affectedPopulationRaw: 3200000,
      displacedPopulation: '1.6M',
      displacedPopulationRaw: 1600000,
      affectedDistricts: 15,
      roadsAffected: 52,
      healthFacilities: 26,
      bridgesAffected: 9,
      riskLevel: 'CRITICAL',
      riskScore: 92
    },
    presets: [
      {
        id: 'mh-baseline',
        label: 'BASELINE',
        description: 'Normal concurrent flood and storm weather patterns',
        hazardType: 'multi_hazard',
        parameters: { cascadeCoupling: 1.0, compoundDuration: 14, gridFailure: 20, landslideRisk: 25 },
        factors: { evacuationCorridorBlocked: false, communicationBlackout: false, hospitalOvercapacity: false }
      },
      {
        id: 'mh-surge',
        label: 'COMPOUND SURGE',
        description: 'Tidal surge locking drainage channels while rain continues inland',
        hazardType: 'multi_hazard',
        parameters: { cascadeCoupling: 1.8, compoundDuration: 21, gridFailure: 35, landslideRisk: 45 },
        factors: { evacuationCorridorBlocked: true, communicationBlackout: false, hospitalOvercapacity: false }
      },
      {
        id: 'mh-cascade',
        label: 'CASCADING FAILURE',
        description: 'Grid collapse disabling water pumping stations and communications',
        hazardType: 'multi_hazard',
        parameters: { cascadeCoupling: 2.2, compoundDuration: 28, gridFailure: 55, landslideRisk: 60 },
        factors: { evacuationCorridorBlocked: true, communicationBlackout: true, hospitalOvercapacity: false }
      },
      {
        id: 'mh-max',
        label: 'MAXIMUM STRESS',
        description: 'Simultaneous catastrophic storm, flood surge, and regional blackout',
        hazardType: 'multi_hazard',
        parameters: { cascadeCoupling: 3.0, compoundDuration: 35, gridFailure: 80, landslideRisk: 80 },
        factors: { evacuationCorridorBlocked: true, communicationBlackout: true, hospitalOvercapacity: true }
      }
    ]
  }
};

/**
 * Format large numbers to readable shorthand (e.g. 2,400,000 -> "2.4M", 45,000 -> "45K")
 */
export function formatPopulation(num: number): string {
  if (num >= 1000000) {
    const val = (num / 1000000).toFixed(1);
    return val.endsWith('.0') ? `${val.slice(0, -2)}M` : `${val}M`;
  }
  if (num >= 1000) {
    const val = (num / 1000).toFixed(0);
    return `${val}K`;
  }
  return num.toLocaleString();
}

/**
 * Deterministic physics-informed scenario calculation model
 */
export function calculateScenarioResults(
  hazardType: string,
  parameters: Record<string, number>,
  factors: Record<string, boolean>,
  timelineDay: ScenarioTimelineDay
): {
  expansionMultiplier: number;
  simulatedMetrics: ScenarioMetricSet;
  diff: ScenarioComparisonDiff;
  insights: ScenarioInsightKPIs;
  riskAnalysis: ScenarioRiskAnalysis;
  responseNeeds: ScenarioResponseNeedItem[];
} {
  const config = HAZARD_SCENARIO_CONFIGS[hazardType] || HAZARD_SCENARIO_CONFIGS.flood;
  const base = config.baseMetrics;

  // 1. Parameter weight computation
  let paramScore = 0;
  let paramCount = 0;
  for (const p of config.parameters) {
    const val = parameters[p.id] !== undefined ? parameters[p.id] : p.defaultValue;
    const normalized = (val - p.min) / (p.max - p.min || 1);
    paramScore += normalized;
    paramCount++;
  }
  const avgParamNorm = paramCount > 0 ? paramScore / paramCount : 0.5;

  // 2. Factor multiplier computation
  let factorBoost = 0;
  for (const f of config.factors) {
    const isActive = factors[f.id] !== undefined ? factors[f.id] : f.defaultActive;
    if (isActive) {
      factorBoost += f.impactMultiplier;
    }
  }

  // 3. Timeline temporal progression curve
  // Day 1: 1.08x, Day 3: 1.25x, Day 7: 1.58x, Day 14: 1.82x, Day 30: 2.10x
  const timelineMultipliers: Record<ScenarioTimelineDay, number> = {
    1: 1.08,
    3: 1.24,
    7: 1.58,
    14: 1.84,
    30: 2.12
  };
  const temporalScale = timelineMultipliers[timelineDay] || 1.58;

  // Composite expansion factor (e.g. 1.58 for +50% rainfall at day 7)
  const baseGrowth = 0.95 + avgParamNorm * 0.75 + factorBoost;
  const expansionMultiplier = +(baseGrowth * (temporalScale / 1.58)).toFixed(2);

  // Scaled numbers
  const simulatedAffectedRaw = Math.round(base.affectedPopulationRaw * expansionMultiplier);
  const displacementRatio = 0.55 + factorBoost * 0.2;
  const simulatedDisplacedRaw = Math.round(simulatedAffectedRaw * displacementRatio);

  const districtMultiplier = Math.min(1 + (expansionMultiplier - 1) * 0.85, 2.2);
  const simulatedDistricts = Math.round(base.affectedDistricts * districtMultiplier);

  const roadMultiplier = 1 + (expansionMultiplier - 1) * 1.15;
  const simulatedRoads = Math.round(base.roadsAffected * roadMultiplier);

  const healthMultiplier = 1 + (expansionMultiplier - 1) * 1.25;
  const simulatedHealth = Math.round(base.healthFacilities * healthMultiplier);

  const bridgeMultiplier = 1 + (expansionMultiplier - 1) * 0.95;
  const simulatedBridges = Math.round(base.bridgesAffected * bridgeMultiplier);

  const simulatedRiskScore = Math.min(Math.round(base.riskScore + (expansionMultiplier - 1) * 22), 99);
  const riskLevel = simulatedRiskScore >= 85 ? 'CRITICAL' : simulatedRiskScore >= 70 ? 'HIGH' : 'MODERATE';

  const simulatedMetrics: ScenarioMetricSet = {
    affectedPopulation: formatPopulation(simulatedAffectedRaw),
    affectedPopulationRaw: simulatedAffectedRaw,
    displacedPopulation: formatPopulation(simulatedDisplacedRaw),
    displacedPopulationRaw: simulatedDisplacedRaw,
    affectedDistricts: simulatedDistricts,
    roadsAffected: simulatedRoads,
    healthFacilities: simulatedHealth,
    bridgesAffected: simulatedBridges,
    riskLevel,
    riskScore: simulatedRiskScore
  };

  // Diff calculation
  const diffAffectedRaw = simulatedAffectedRaw - base.affectedPopulationRaw;
  const diffDisplacedRaw = simulatedDisplacedRaw - base.displacedPopulationRaw;
  const diffDistricts = simulatedDistricts - base.affectedDistricts;
  const diffRoads = simulatedRoads - base.roadsAffected;
  const diffHealth = simulatedHealth - base.healthFacilities;
  const diffBridges = simulatedBridges - base.bridgesAffected;

  const affectedPctNum = Math.round(((simulatedAffectedRaw - base.affectedPopulationRaw) / base.affectedPopulationRaw) * 100);
  const displacedPctNum = Math.round(((simulatedDisplacedRaw - base.displacedPopulationRaw) / base.displacedPopulationRaw) * 100);
  const districtsPctNum = Math.round((diffDistricts / base.affectedDistricts) * 100);
  const roadsPctNum = Math.round((diffRoads / base.roadsAffected) * 100);
  const healthPctNum = Math.round((diffHealth / base.healthFacilities) * 100);

  const diff: ScenarioComparisonDiff = {
    affectedDiff: `+${formatPopulation(diffAffectedRaw)}`,
    displacedDiff: `+${formatPopulation(diffDisplacedRaw)}`,
    districtsDiff: `+${diffDistricts}`,
    roadsDiff: `+${diffRoads}`,
    healthDiff: `+${diffHealth}`,
    bridgesDiff: `+${diffBridges}`,
    affectedPct: `+${affectedPctNum}%`,
    displacedPct: `+${displacedPctNum}%`,
    districtsPct: `+${districtsPctNum}%`,
    roadsPct: `+${roadsPctNum}%`,
    healthPct: `+${healthPctNum}%`
  };

  const infraPct = Math.min(Math.round(35 + (expansionMultiplier - 1) * 60), 96);

  const insights: ScenarioInsightKPIs = {
    potentialIncrease: `+${affectedPctNum}%`,
    projectedAffected: formatPopulation(simulatedAffectedRaw),
    riskLevel,
    infrastructureImpact: `${infraPct}%`
  };

  // Explainable Risk Drivers
  const riskAnalysis: ScenarioRiskAnalysis = {
    riskScore: simulatedRiskScore,
    confidenceScore: 89,
    drivers: [
      {
        name: 'Hazard Intensity',
        value: Math.min(Math.round(82 + (expansionMultiplier - 1) * 20), 98),
        trend: '+24%',
        description: 'Physical hydraulic volume / meteorological energy surge'
      },
      {
        name: 'Population Exposure',
        value: Math.min(Math.round(76 + (expansionMultiplier - 1) * 25), 95),
        trend: `+${affectedPctNum}%`,
        description: 'Demographic density within expanding inundated floodplain'
      },
      {
        name: 'Infrastructure Impact',
        value: infraPct,
        trend: `+${roadsPctNum}%`,
        description: 'Transportation arterials, electrical substations, and bridges'
      },
      {
        name: 'Accessibility Disruption',
        value: Math.min(Math.round(62 + (expansionMultiplier - 1) * 35), 92),
        trend: '+42%',
        description: 'Loss of emergency routing corridors and air-drop zones'
      },
      {
        name: 'Vulnerability Index',
        value: Math.min(Math.round(74 + (expansionMultiplier - 1) * 15), 90),
        trend: '+18%',
        description: 'Socio-economic baseline resilience and housing durability'
      }
    ]
  };

  // Response Needs
  const additionalTeams = Math.max(Math.round(diffDistricts * 2.2 + factorBoost * 5), 4);
  const additionalShelters = Math.max(Math.round((diffDisplacedRaw / 42000)), 6);
  const additionalRoadClosures = diffRoads;
  const additionalMedical = diffHealth;
  const additionalFoodAid = formatPopulation(Math.round(diffAffectedRaw * 0.28));

  const responseNeeds: ScenarioResponseNeedItem[] = [
    {
      icon: 'users',
      value: `+${additionalTeams}`,
      label: 'Additional Response Teams',
      change: 'Urgent deployment to cut-off districts'
    },
    {
      icon: 'home',
      value: `+${additionalShelters}`,
      label: 'Shelter Capacity Required',
      change: 'High-elevation school and community centers'
    },
    {
      icon: 'truck',
      value: `+${additionalRoadClosures}`,
      label: 'Critical Road Closures',
      change: 'Rerouting heavy relief logistics'
    },
    {
      icon: 'crosshair',
      value: `+${additionalMedical}`,
      label: 'Medical Units Needed',
      change: 'Field triage and water purification teams'
    },
    {
      icon: 'package',
      value: `+${additionalFoodAid}`,
      label: 'Requiring Immediate Aid',
      change: 'Emergency rations & potable water sachets'
    }
  ];

  return {
    expansionMultiplier,
    simulatedMetrics,
    diff,
    insights,
    riskAnalysis,
    responseNeeds
  };
}

/**
 * Initial library of saved scenarios
 */
export const DEFAULT_SAVED_SCENARIOS: SavedScenario[] = [
  {
    id: 'scen-001',
    name: 'Monsoon Escalation (+50% Rainfall)',
    incidentId: 'inc-001',
    incidentName: 'Severe Flooding',
    hazardType: 'flood',
    parameters: {
      rainfallIncrease: 50,
      riverDischarge: 40,
      durationDays: 14,
      seaLevelRise: 0.5
    },
    factors: {
      upstreamDamRelease: true,
      drainageFailure: true,
      populationMovement: false
    },
    createdAt: 'Sep 26, 2026 • 18:30 UTC',
    status: 'Ready',
    summary: 'Standard counterfactual simulation evaluating 50% rainfall surge over Meghna basin.'
  },
  {
    id: 'scen-002',
    name: 'Monsoon Worst-Case (+80% Rainfall & Dam Release)',
    incidentId: 'inc-001',
    incidentName: 'Severe Flooding',
    hazardType: 'flood',
    parameters: {
      rainfallIncrease: 80,
      riverDischarge: 65,
      durationDays: 21,
      seaLevelRise: 0.8
    },
    factors: {
      upstreamDamRelease: true,
      drainageFailure: true,
      populationMovement: true
    },
    createdAt: 'Sep 26, 2026 • 16:15 UTC',
    status: 'Simulated',
    summary: 'Extreme hydraulic stress compound scenario triggering catastrophic delta inundation.'
  },
  {
    id: 'scen-003',
    name: 'Cyclone Marex Landfall Shift (+100 km East)',
    incidentId: 'inc-002',
    incidentName: 'Cyclone Marex',
    hazardType: 'cyclone',
    parameters: {
      windSpeed: 25,
      trackShift: 100,
      intensityCat: 4,
      durationHours: 36
    },
    factors: {
      highTideAlignment: true,
      slowForwardSpeed: true,
      rapidIntensification: true
    },
    createdAt: 'Sep 26, 2026 • 14:00 UTC',
    status: 'Ready',
    summary: 'Trajectory eastward shift directly impacting Chittagong port and industrial zone.'
  },
  {
    id: 'scen-004',
    name: 'Wildfire Extreme Perimeter Spread (+20 km/h Wind)',
    incidentId: 'inc-003',
    incidentName: 'Wildfire Outbreak',
    hazardType: 'wildfire',
    parameters: {
      windSpeed: 35,
      fuelHumidity: -25,
      durationDays: 5,
      containmentLoss: -30
    },
    factors: {
      crownFireTransition: true,
      spotFireGeneration: true,
      structuralDefenseFailure: true
    },
    createdAt: 'Sep 26, 2026 • 12:45 UTC',
    status: 'Ready',
    summary: 'Boreal forest high-convection torching breaching highway evacuation lifeline.'
  },
  {
    id: 'scen-005',
    name: 'Noto Peninsula M7.8 Aftershock & Liquefaction',
    incidentId: 'inc-005',
    incidentName: 'Noto Peninsula Seismic Swarm',
    hazardType: 'earthquake',
    parameters: {
      magnitudeDelta: 0.6,
      depthShift: -15,
      aftershockRate: 45,
      infraVulnerability: 25
    },
    factors: {
      tsunamiAdvisory: true,
      bridgeRupture: true,
      pipelineRupture: true
    },
    createdAt: 'Sep 26, 2026 • 11:20 UTC',
    status: 'Ready',
    summary: 'Shallow secondary coastal fault rupture generating localized tsunami and port liquefaction.'
  },
  {
    id: 'scen-006',
    name: 'Compound Cascade Multi-Hazard Total Blackout',
    incidentId: 'inc-007',
    incidentName: 'Cyclone-Flood Compound Disaster',
    hazardType: 'multi_hazard',
    parameters: {
      cascadeCoupling: 2.2,
      compoundDuration: 28,
      gridFailure: 55,
      landslideRisk: 60
    },
    factors: {
      evacuationCorridorBlocked: true,
      communicationBlackout: true,
      hospitalOvercapacity: true
    },
    createdAt: 'Sep 26, 2026 • 09:10 UTC',
    status: 'Simulated',
    summary: 'Simultaneous surge locking, power grid collapse, and severed transportation arteries.'
  }
];
