import type { IncidentAnalysisData, HazardSelectorType, AnalysisMode } from '../types';
import { HAZARD_INCIDENT_MAP } from './analysisScenarios';

export const MOCK_ANALYSIS_DATABASE: Record<string, Record<AnalysisMode, IncidentAnalysisData>> = {
  // =========================================================================
  // 1. Bangladesh Flood (inc-01) - PRIMARY REFERENCE TARGET
  // =========================================================================
  'inc-01': {
    current: {
      incidentId: 'inc-01',
      hazardType: 'flood',
      mode: 'current',
      riskLevel: 'CRITICAL',
      confidencePct: 87,
      metrics: {
        peopleAffected: '2.4M',
        peopleAffectedSub: 'People Affected',
        displaced: '1.2M',
        displacedSub: 'Displaced',
        districts: 12,
        districtsSub: 'Districts',
        roadsAffected: 37,
        roadsSub: 'Roads Affected',
        healthFacilities: 18,
        healthSub: 'Health Facilities',
        majorBridges: 6,
        bridgesSub: 'Major Bridges'
      },
      projection: {
        title: 'IMPACT PROJECTION',
        estimatedAffected: '3.2M',
        estimatedAffectedLabel: 'Estimated Affected',
        increasePct: '+32%',
        increaseLabel: 'Increase vs Current',
        riskTrend: 'HIGH',
        timeline: [
          { label: 'Now', affected: 2.4, displaced: 1.2 },
          { label: '+7 days', affected: 2.8, displaced: 1.5 },
          { label: '+14 days', affected: 3.1, displaced: 1.8 },
          { label: '+30 days', affected: 3.2, displaced: 1.9 }
        ],
        legendSeries1: 'Affected',
        legendSeries2: 'Displaced'
      },
      rainfall: {
        title: 'RAINFALL FORECAST',
        cumulativeMm: 380,
        cumulativeUnit: 'mm',
        timeframe: 'Next 7 days',
        aboveAveragePct: 45,
        anomalyLabel: 'Above average',
        floodRiskLevel: 'HIGH',
        riskBadgeLabel: 'Flood Risk',
        bars: [
          { day: 'Now', amountMm: 120, anomalyPct: 15 },
          { day: '1d', amountMm: 260, anomalyPct: 35 },
          { day: '3d', amountMm: 520, anomalyPct: 65 },
          { day: '5d', amountMm: 410, anomalyPct: 50 },
          { day: '7d', amountMm: 220, anomalyPct: 25 }
        ]
      },
      infrastructure: {
        title: 'INFRASTRUCTURE IMPACT',
        networkAffectedPct: 37,
        networkLabel: 'Road Network Affected',
        items: [
          { label: 'Roads', count: 37, icon: 'road' },
          { label: 'Highways', count: 8, icon: 'highway' },
          { label: 'Bridges', count: 6, icon: 'bridge' },
          { label: 'Health Facilities', count: 18, icon: 'hospital' },
          { label: 'Power Stations', count: 4, icon: 'power' },
          { label: 'Water Systems', count: 12, icon: 'water' }
        ]
      },
      riskDrivers: [
        { name: 'Hazard Intensity', score: 94, weight: 0.30, description: 'Surma & Kushiyara river crest +1.84m over maximum flood danger mark' },
        { name: 'Population Exposure', score: 88, weight: 0.25, description: '2.4M residents in flood-inundated delta depressions with limited egress' },
        { name: 'Infrastructure Impact', score: 76, weight: 0.20, description: '37 critical arterial links and 4 power distribution substations offline' },
        { name: 'Accessibility Disruption', score: 65, weight: 0.15, description: 'N2 highway flooded; 14 sub-districts reachable only by amphibious craft' },
        { name: 'Vulnerability Index', score: 82, weight: 0.10, description: 'High density of thatched dwellings and contaminated drinking tubewells' }
      ],
      historicalBenchmark: {
        eventName: '1998 Bangladesh Mega-Flood',
        eventYear: 1998,
        comparisons: [
          { metric: 'Inundation Area', current: '38% Nation', historical: '68% Nation', diffPct: '-30%', higherIsWorse: true },
          { metric: 'Displaced Population', current: '1.2M', historical: '30M', diffPct: '-96%', higherIsWorse: true },
          { metric: 'Peak River Crest', current: '+1.84m', historical: '+2.10m', diffPct: '-0.26m', higherIsWorse: true },
          { metric: 'Warning Lead Time', current: '72 hours', historical: '12 hours', diffPct: '+500%', higherIsWorse: false }
        ]
      }
    },
    short_term: {
      incidentId: 'inc-01',
      hazardType: 'flood',
      mode: 'short_term',
      riskLevel: 'CRITICAL',
      confidencePct: 91,
      metrics: {
        peopleAffected: '2.8M',
        peopleAffectedSub: 'Projected +7d',
        displaced: '1.5M',
        displacedSub: 'Shelter Demand',
        districts: 14,
        districtsSub: '2 Expanding',
        roadsAffected: 44,
        roadsSub: '+7 At Risk',
        healthFacilities: 22,
        healthSub: '+4 Threatened',
        majorBridges: 7,
        bridgesSub: '+1 Scour Risk'
      },
      projection: {
        title: 'IMPACT PROJECTION',
        estimatedAffected: '2.8M',
        estimatedAffectedLabel: 'Projected +7d',
        increasePct: '+16.6%',
        increaseLabel: 'Increase vs Current',
        riskTrend: 'HIGH',
        timeline: [
          { label: 'Now', affected: 2.4, displaced: 1.2 },
          { label: '+2 days', affected: 2.55, displaced: 1.35 },
          { label: '+4 days', affected: 2.7, displaced: 1.45 },
          { label: '+7 days', affected: 2.8, displaced: 1.5 }
        ],
        legendSeries1: 'Affected',
        legendSeries2: 'Displaced'
      },
      rainfall: {
        title: 'RAINFALL FORECAST',
        cumulativeMm: 450,
        cumulativeUnit: 'mm',
        timeframe: 'Next 7 days',
        aboveAveragePct: 62,
        anomalyLabel: 'Above average',
        floodRiskLevel: 'CRITICAL',
        riskBadgeLabel: 'Flood Risk',
        bars: [
          { day: 'Now', amountMm: 140, anomalyPct: 20 },
          { day: '1d', amountMm: 310, anomalyPct: 45 },
          { day: '3d', amountMm: 580, anomalyPct: 75 },
          { day: '5d', amountMm: 460, anomalyPct: 55 },
          { day: '7d', amountMm: 290, anomalyPct: 35 }
        ]
      },
      infrastructure: {
        title: 'INFRASTRUCTURE IMPACT',
        networkAffectedPct: 44,
        networkLabel: 'Critical Grid Degradation',
        items: [
          { label: 'Roads', count: 44, icon: 'road' },
          { label: 'Highways', count: 11, icon: 'highway' },
          { label: 'Bridges', count: 7, icon: 'bridge' },
          { label: 'Health Facilities', count: 22, icon: 'hospital' },
          { label: 'Power Stations', count: 6, icon: 'power' },
          { label: 'Water Systems', count: 18, icon: 'water' }
        ]
      },
      riskDrivers: [
        { name: 'Transboundary Runoff', score: 96, weight: 0.35, description: 'Precipitation in Meghalaya hills discharging downstream into Surma basin' },
        { name: 'Embankment Vulnerability', score: 89, weight: 0.25, description: 'Earthen flood dikes experiencing scouring along 32km perimeter' },
        { name: 'Shelter Saturation', score: 84, weight: 0.20, description: 'Designated shelters operating at 91% capacity in Sunamganj and Sylhet' }
      ]
    },
    long_term: {
      incidentId: 'inc-01',
      hazardType: 'flood',
      mode: 'long_term',
      riskLevel: 'HIGH',
      confidencePct: 78,
      metrics: {
        peopleAffected: '3.2M',
        peopleAffectedSub: 'Peak 30d Exposure',
        displaced: '1.9M',
        displacedSub: 'Protracted Stay',
        districts: 15,
        districtsSub: 'Delta Basins',
        roadsAffected: 56,
        roadsSub: 'Structural Damage',
        healthFacilities: 26,
        healthSub: 'Waterborne Surge',
        majorBridges: 9,
        bridgesSub: 'Rehab Required'
      },
      projection: {
        title: 'IMPACT PROJECTION',
        estimatedAffected: '3.2M',
        estimatedAffectedLabel: 'Peak 30d Exposure',
        increasePct: '+33.3%',
        increaseLabel: 'Increase vs Current',
        riskTrend: 'HIGH',
        timeline: [
          { label: 'Now', affected: 2.4, displaced: 1.2 },
          { label: '+10 days', affected: 2.9, displaced: 1.6 },
          { label: '+20 days', affected: 3.15, displaced: 1.85 },
          { label: '+30 days', affected: 3.2, displaced: 1.9 }
        ],
        legendSeries1: 'Affected',
        legendSeries2: 'Displaced'
      },
      rainfall: {
        title: 'RAINFALL FORECAST',
        cumulativeMm: 820,
        cumulativeUnit: 'mm',
        timeframe: 'Next 30 days',
        aboveAveragePct: 28,
        anomalyLabel: 'Above average',
        floodRiskLevel: 'HIGH',
        riskBadgeLabel: 'Flood Risk',
        bars: [
          { day: 'W1', amountMm: 380, anomalyPct: 45 },
          { day: 'W2', amountMm: 240, anomalyPct: 20 },
          { day: 'W3', amountMm: 120, anomalyPct: -5 },
          { day: 'W4', amountMm: 80, anomalyPct: -15 }
        ]
      },
      infrastructure: {
        title: 'INFRASTRUCTURE IMPACT',
        networkAffectedPct: 52,
        networkLabel: 'Transit & Utility Degradation',
        items: [
          { label: 'Roads', count: 56, icon: 'road' },
          { label: 'Highways', count: 14, icon: 'highway' },
          { label: 'Bridges', count: 9, icon: 'bridge' },
          { label: 'Health Facilities', count: 26, icon: 'hospital' },
          { label: 'Power Stations', count: 8, icon: 'power' },
          { label: 'Water Systems', count: 24, icon: 'water' }
        ]
      },
      riskDrivers: [
        { name: 'Hazard Intensity', score: 72, weight: 0.30, description: 'Monsoon plateau followed by slow coastal water recession' },
        { name: 'Population Exposure', score: 85, weight: 0.25, description: 'Prolonged displacement causing agricultural disruption across Aman paddy' }
      ]
    },
    comparative: {
      incidentId: 'inc-01',
      hazardType: 'flood',
      mode: 'comparative',
      riskLevel: 'CRITICAL',
      confidencePct: 94,
      metrics: {
        peopleAffected: '2.4M',
        peopleAffectedSub: 'vs 30M (1998)',
        displaced: '1.2M',
        displacedSub: 'vs 18M (1998)',
        districts: 12,
        districtsSub: 'vs 52 (1998)',
        roadsAffected: 37,
        roadsSub: 'vs 220 (1998)',
        healthFacilities: 18,
        healthSub: 'vs 140 (1998)',
        majorBridges: 6,
        bridgesSub: 'vs 45 (1998)'
      },
      projection: {
        title: 'IMPACT PROJECTION',
        estimatedAffected: '3.2M',
        estimatedAffectedLabel: 'Current Peak',
        increasePct: '+32%',
        increaseLabel: 'Increase vs Current',
        riskTrend: 'HIGH',
        timeline: [
          { label: 'Current 2026', affected: 2.4, displaced: 1.2 },
          { label: '2022 Floods', affected: 7.2, displaced: 3.8 },
          { label: '2004 Floods', affected: 36.0, displaced: 10.5 },
          { label: '1998 Floods', affected: 30.0, displaced: 18.0 }
        ],
        legendSeries1: 'Affected',
        legendSeries2: 'Displaced'
      },
      rainfall: {
        title: 'RAINFALL FORECAST',
        cumulativeMm: 380,
        cumulativeUnit: 'mm',
        timeframe: '7-day Peak Comparative',
        aboveAveragePct: 45,
        anomalyLabel: 'Peak Anomaly',
        floodRiskLevel: 'HIGH',
        riskBadgeLabel: 'Flood Risk',
        bars: [
          { day: '2026 Current', amountMm: 380, anomalyPct: 45 },
          { day: '2022 Surge', amountMm: 510, anomalyPct: 78 },
          { day: '2004 Monsoon', amountMm: 460, anomalyPct: 62 },
          { day: '1998 Record', amountMm: 620, anomalyPct: 110 }
        ]
      },
      infrastructure: {
        title: 'INFRASTRUCTURE IMPACT',
        networkAffectedPct: 37,
        networkLabel: 'Current vs Benchmark',
        items: [
          { label: 'Roads Affected', count: 37, icon: 'road' },
          { label: '1998 Roads Lost', count: 220, icon: 'highway' },
          { label: 'Bridges at Risk', count: 6, icon: 'bridge' },
          { label: '1998 Bridges Lost', count: 45, icon: 'hospital' }
        ]
      },
      riskDrivers: [
        { name: 'Satellite Early Warning', score: 95, weight: 0.35, description: 'SAR Sentinel-1 warning gave 72h lead time vs 12h in 1998' }
      ],
      historicalBenchmark: {
        eventName: '1998 Bangladesh Mega-Flood',
        eventYear: 1998,
        comparisons: [
          { metric: 'Total Population Exposed', current: '2.4M', historical: '30.0M', diffPct: '-92%', higherIsWorse: true },
          { metric: 'National Territory Submerged', current: '38%', historical: '68%', diffPct: '-30%', higherIsWorse: true },
          { metric: 'Displacement Evacuees', current: '1.2M', historical: '18.0M', diffPct: '-93%', higherIsWorse: true }
        ]
      }
    }
  },

  // =========================================================================
  // 2. Cyclone Marex (inc-02)
  // =========================================================================
  'inc-02': {
    current: {
      incidentId: 'inc-02',
      hazardType: 'cyclone',
      mode: 'current',
      riskLevel: 'HIGH',
      confidencePct: 89,
      metrics: {
        peopleAffected: '850K',
        peopleAffectedSub: 'Coastal Corridor',
        displaced: '420K',
        displacedSub: 'Evacuated Inland',
        districts: '185 km/h',
        districtsSub: 'Peak Sustained Wind',
        roadsAffected: '4.5m',
        roadsSub: 'Max Storm Surge',
        healthFacilities: 4,
        healthSub: 'Ports Suspended',
        majorBridges: 28,
        bridgesSub: 'Towers Offline'
      },
      projection: {
        title: 'LANDFALL PROJECTION',
        estimatedAffected: '1.4M',
        estimatedAffectedLabel: 'Coastal Exposure',
        increasePct: '+64%',
        increaseLabel: 'Surge Expansion',
        riskTrend: 'HIGH',
        timeline: [
          { label: 'Now', affected: 0.85, displaced: 0.42 },
          { label: '+7 days', affected: 1.15, displaced: 0.65 },
          { label: '+14 days', affected: 1.35, displaced: 0.78 },
          { label: '+30 days', affected: 1.4, displaced: 0.82 }
        ],
        legendSeries1: 'Coastal Pop',
        legendSeries2: 'Evacuated'
      },
      rainfall: {
        title: 'WIND SPEED FORECAST',
        cumulativeMm: 185,
        cumulativeUnit: 'km/h',
        timeframe: 'Next 7 days',
        aboveAveragePct: 85,
        anomalyLabel: 'Gust Anomaly',
        floodRiskLevel: 'CRITICAL',
        riskBadgeLabel: 'Cyclone Threat',
        bars: [
          { day: 'Now', amountMm: 185, anomalyPct: 40 },
          { day: '1d', amountMm: 215, anomalyPct: 80 },
          { day: '3d', amountMm: 160, anomalyPct: 60 },
          { day: '5d', amountMm: 95, anomalyPct: 20 },
          { day: '7d', amountMm: 55, anomalyPct: -10 }
        ]
      },
      infrastructure: {
        title: 'MARITIME & PORT EXPOSURE',
        networkAffectedPct: 42,
        networkLabel: 'Port & Maritime Grid Affected',
        items: [
          { label: 'Roads & Causeways', count: 19, icon: 'road' },
          { label: 'Commercial Ports', count: 4, icon: 'port' },
          { label: 'Coastal Bridges', count: 3, icon: 'bridge' },
          { label: 'Emergency Clinics', count: 9, icon: 'hospital' },
          { label: 'Power Substations', count: 5, icon: 'power' },
          { label: 'Telecom Towers', count: 28, icon: 'telecom' }
        ]
      },
      riskDrivers: [
        { name: 'Sustained Wind Speed', score: 92, weight: 0.35, description: 'Category 3 cyclone packing 185 km/h gusts with 4.5m storm surge' },
        { name: 'Coastal Elevation Vulnerability', score: 85, weight: 0.25, description: 'Low-lying littoral communities vulnerable to marine overwash' },
        { name: 'Port Disruption', score: 79, weight: 0.20, description: 'Major shipping berths closed; cargo handling cranes secured' }
      ]
    },
    short_term: {
      incidentId: 'inc-02',
      hazardType: 'cyclone',
      mode: 'short_term',
      riskLevel: 'HIGH',
      confidencePct: 86,
      metrics: {
        peopleAffected: '1.15M',
        peopleAffectedSub: 'Projected +7d',
        displaced: '650K',
        displacedSub: 'Shelter Influx',
        districts: '215 km/h',
        districtsSub: 'Peak Eyewall Gusts',
        roadsAffected: '4.8m',
        roadsSub: 'Peak Surge Crest',
        healthFacilities: 5,
        healthSub: 'Ports Offline',
        majorBridges: 36,
        bridgesSub: 'Towers Damaged'
      },
      projection: {
        title: 'LANDFALL PROJECTION',
        estimatedAffected: '1.2M',
        estimatedAffectedLabel: 'Projected +7d',
        increasePct: '+41%',
        increaseLabel: 'Surge Expansion',
        riskTrend: 'HIGH',
        timeline: [
          { label: 'Now', affected: 0.85, displaced: 0.42 },
          { label: '+2d', affected: 1.05, displaced: 0.55 },
          { label: '+4d', affected: 1.15, displaced: 0.65 },
          { label: '+7d', affected: 1.2, displaced: 0.68 }
        ],
        legendSeries1: 'Coastal Pop',
        legendSeries2: 'Evacuated'
      },
      rainfall: {
        title: 'WIND SPEED FORECAST',
        cumulativeMm: 215,
        cumulativeUnit: 'km/h',
        timeframe: 'Next 7 days',
        aboveAveragePct: 92,
        anomalyLabel: 'Gust Anomaly',
        floodRiskLevel: 'CRITICAL',
        riskBadgeLabel: 'Cyclone Threat',
        bars: [
          { day: 'Now', amountMm: 185, anomalyPct: 45 },
          { day: '1d', amountMm: 215, anomalyPct: 90 },
          { day: '3d', amountMm: 170, anomalyPct: 70 },
          { day: '5d', amountMm: 100, anomalyPct: 25 },
          { day: '7d', amountMm: 60, anomalyPct: -5 }
        ]
      },
      infrastructure: {
        title: 'MARITIME & PORT EXPOSURE',
        networkAffectedPct: 48,
        networkLabel: 'Maritime Grid Affected',
        items: [
          { label: 'Roads & Causeways', count: 26, icon: 'road' },
          { label: 'Ports', count: 5, icon: 'port' },
          { label: 'Bridges', count: 4, icon: 'bridge' },
          { label: 'Health Facilities', count: 12, icon: 'hospital' }
        ]
      },
      riskDrivers: [
        { name: 'Storm Surge Inundation', score: 95, weight: 0.40, description: '4.8m surge predicted during high tide window' }
      ]
    },
    long_term: {
      incidentId: 'inc-02',
      hazardType: 'cyclone',
      mode: 'long_term',
      riskLevel: 'MODERATE',
      confidencePct: 75,
      metrics: {
        peopleAffected: '1.4M',
        peopleAffectedSub: 'Peak Exposure',
        displaced: '820K',
        displacedSub: 'Rebuilding Phase',
        districts: '120 km/h',
        districtsSub: 'Inland Dissipation',
        roadsAffected: '2.1m',
        roadsSub: 'Residual Tide',
        healthFacilities: 3,
        healthSub: 'Port Repair',
        majorBridges: 42,
        bridgesSub: 'Grid Restored'
      },
      projection: {
        title: 'LANDFALL PROJECTION',
        estimatedAffected: '1.4M',
        estimatedAffectedLabel: 'Protracted Exposure',
        increasePct: '+64%',
        increaseLabel: 'Surge Expansion',
        riskTrend: 'MODERATE',
        timeline: [
          { label: 'Now', affected: 0.85, displaced: 0.42 },
          { label: '+10d', affected: 1.25, displaced: 0.72 },
          { label: '+20d', affected: 1.38, displaced: 0.80 },
          { label: '+30d', affected: 1.4, displaced: 0.82 }
        ],
        legendSeries1: 'Coastal Pop',
        legendSeries2: 'Evacuated'
      },
      rainfall: {
        title: 'WIND SPEED FORECAST',
        cumulativeMm: 120,
        cumulativeUnit: 'km/h',
        timeframe: 'Next 30 days',
        aboveAveragePct: 35,
        anomalyLabel: 'Dissipation Trend',
        floodRiskLevel: 'MODERATE',
        riskBadgeLabel: 'Cyclone Threat',
        bars: [
          { day: 'W1', amountMm: 185, anomalyPct: 85 },
          { day: 'W2', amountMm: 110, anomalyPct: 20 },
          { day: 'W3', amountMm: 45, anomalyPct: -20 },
          { day: 'W4', amountMm: 25, anomalyPct: -40 }
        ]
      },
      infrastructure: {
        title: 'MARITIME & PORT EXPOSURE',
        networkAffectedPct: 54,
        networkLabel: 'Reconstruction Required',
        items: [
          { label: 'Roads', count: 32, icon: 'road' },
          { label: 'Ports', count: 4, icon: 'port' }
        ]
      },
      riskDrivers: [
        { name: 'Marine Salt Contamination', score: 82, weight: 0.35, description: 'Saline intrusion across agricultural coastal aquifers' }
      ]
    },
    comparative: {
      incidentId: 'inc-02',
      hazardType: 'cyclone',
      mode: 'comparative',
      riskLevel: 'HIGH',
      confidencePct: 91,
      metrics: {
        peopleAffected: '850K',
        peopleAffectedSub: 'vs 2.2M (Freddy)',
        displaced: '420K',
        displacedSub: 'vs 1.4M (Freddy)',
        districts: '185 km/h',
        districtsSub: 'vs 220 km/h (Freddy)',
        roadsAffected: '4.5m',
        roadsSub: 'vs 5.2m (Idai)',
        healthFacilities: 4,
        healthSub: 'vs 9 Ports Closed',
        majorBridges: 28,
        bridgesSub: 'vs 74 Towers Lost'
      },
      projection: {
        title: 'LANDFALL PROJECTION',
        estimatedAffected: '1.4M',
        estimatedAffectedLabel: 'Cyclone Peak',
        increasePct: '+64%',
        increaseLabel: 'Surge Expansion',
        riskTrend: 'HIGH',
        timeline: [
          { label: 'Marex 2026', affected: 0.85, displaced: 0.42 },
          { label: 'Cyclone Freddy 2023', affected: 2.2, displaced: 1.4 },
          { label: 'Cyclone Idai 2019', affected: 3.0, displaced: 1.8 }
        ],
        legendSeries1: 'Coastal Pop',
        legendSeries2: 'Evacuated'
      },
      rainfall: {
        title: 'WIND SPEED FORECAST',
        cumulativeMm: 185,
        cumulativeUnit: 'km/h',
        timeframe: 'Cyclone Benchmark',
        aboveAveragePct: 85,
        anomalyLabel: 'Benchmark Intensity',
        floodRiskLevel: 'CRITICAL',
        riskBadgeLabel: 'Cyclone Threat',
        bars: [
          { day: 'Marex 2026', amountMm: 185, anomalyPct: 85 },
          { day: 'Freddy 2023', amountMm: 220, anomalyPct: 120 },
          { day: 'Idai 2019', amountMm: 195, anomalyPct: 105 }
        ]
      },
      infrastructure: {
        title: 'MARITIME & PORT EXPOSURE',
        networkAffectedPct: 42,
        networkLabel: 'Historical Cyclone Impact',
        items: [
          { label: 'Ports Shut', count: 4, icon: 'port' },
          { label: 'Freddy Ports Lost', count: 9, icon: 'port' }
        ]
      },
      riskDrivers: [
        { name: 'Ocean Heat Content', score: 88, weight: 0.40, description: 'Rapid intensification index triggered over 29.5C sea-surface anomalies' }
      ]
    }
  },

  // =========================================================================
  // 3. Wildfire Complex Outbreak (inc-03) — Canada / British Columbia
  // =========================================================================
  'inc-03': {
    current: {
      incidentId: 'inc-03',
      hazardType: 'wildfire',
      mode: 'current',
      riskLevel: 'HIGH',
      confidencePct: 91,
      metrics: {
        peopleAffected: '85,000 ha',
        peopleAffectedSub: 'Area Burned',
        displaced: '45,000',
        displacedSub: 'Mandatory Evacuees',
        districts: '340 AQI',
        districtsSub: 'Air Quality (Hazardous)',
        roadsAffected: 14,
        roadsSub: 'Highway Closures',
        healthFacilities: 6,
        healthSub: 'Active Firefronts',
        majorBridges: '0%',
        bridgesSub: 'Containment Line'
      },
      projection: {
        title: 'FIRE SPREAD PROJECTION',
        estimatedAffected: '142,000 ha',
        estimatedAffectedLabel: 'Projected Perimeter',
        increasePct: '+67%',
        increaseLabel: 'Spread vs Current',
        riskTrend: 'HIGH',
        timeline: [
          { label: 'Now', affected: 0.85, displaced: 0.45 },
          { label: '+7 days', affected: 1.15, displaced: 0.62 },
          { label: '+14 days', affected: 1.32, displaced: 0.75 },
          { label: '+30 days', affected: 1.42, displaced: 0.80 }
        ],
        legendSeries1: 'Active Firefront',
        legendSeries2: 'Containment Line'
      },
      rainfall: {
        title: 'FIRE WEATHER INDEX (FWI)',
        cumulativeMm: 48,
        cumulativeUnit: 'FWI',
        timeframe: 'Next 72 hours',
        aboveAveragePct: 125,
        anomalyLabel: 'Drought Anomaly',
        floodRiskLevel: 'EXTREME',
        riskBadgeLabel: 'Firefront Risk',
        bars: [
          { day: 'Now', amountMm: 38, anomalyPct: 90 },
          { day: '1d', amountMm: 48, anomalyPct: 125 },
          { day: '3d', amountMm: 55, anomalyPct: 140 },
          { day: '5d', amountMm: 42, anomalyPct: 110 },
          { day: '7d', amountMm: 30, anomalyPct: 60 }
        ]
      },
      infrastructure: {
        title: 'PERIMETER ASSET EXPOSURE',
        networkAffectedPct: 68,
        networkLabel: 'Corridor & Forestry Impact',
        items: [
          { label: 'Hwy 16 Closures', count: 8, icon: 'road' },
          { label: 'Transmission Corridors', count: 4, icon: 'power' },
          { label: 'Timber Stands', count: 16, icon: 'highway' },
          { label: 'Water Reservoirs', count: 2, icon: 'water' },
          { label: 'Evac Centers', count: 6, icon: 'hospital' }
        ]
      },
      riskDrivers: [
        { name: 'Fuel Dryness Index', score: 96, weight: 0.35, description: 'Fine fuel moisture content below 8% under 3-week precipitation drought' },
        { name: 'Wind Velocity Forcing', score: 88, weight: 0.30, description: 'Sustained 42 km/h southwesterly gusts pushing crown fire behavior' },
        { name: 'Perimeter Containment', score: 92, weight: 0.20, description: '0% perimeter containment along eastern front threatening settlements' },
        { name: 'Transport Severance', score: 74, weight: 0.15, description: 'Highway 16 closed between Burns Lake and Vanderhoof' }
      ]
    },
    short_term: {
      incidentId: 'inc-03',
      hazardType: 'wildfire',
      mode: 'short_term',
      riskLevel: 'HIGH',
      confidencePct: 88,
      metrics: {
        peopleAffected: '115,000 ha',
        peopleAffectedSub: 'Projected +7d',
        displaced: '62,000',
        displacedSub: 'Shelter Demand',
        districts: '380 AQI',
        districtsSub: 'Peak Smoke Plume',
        roadsAffected: 18,
        roadsSub: 'Routes Closed',
        healthFacilities: 8,
        healthSub: 'Merged Fronts',
        majorBridges: '12%',
        bridgesSub: 'Bulldozed Line'
      },
      projection: {
        title: 'FIRE SPREAD PROJECTION',
        estimatedAffected: '115,000 ha',
        estimatedAffectedLabel: 'Projected +7d',
        increasePct: '+35%',
        increaseLabel: 'Spread vs Current',
        riskTrend: 'HIGH',
        timeline: [
          { label: 'Now', affected: 0.85, displaced: 0.45 },
          { label: '+2d', affected: 0.98, displaced: 0.52 },
          { label: '+4d', affected: 1.08, displaced: 0.58 },
          { label: '+7d', affected: 1.15, displaced: 0.62 }
        ],
        legendSeries1: 'Active Firefront',
        legendSeries2: 'Containment Line'
      },
      rainfall: {
        title: 'FIRE WEATHER INDEX (FWI)',
        cumulativeMm: 55,
        cumulativeUnit: 'FWI',
        timeframe: 'Next 7 days',
        aboveAveragePct: 140,
        anomalyLabel: 'Drought Anomaly',
        floodRiskLevel: 'EXTREME',
        riskBadgeLabel: 'Firefront Risk',
        bars: [
          { day: 'Now', amountMm: 42, anomalyPct: 95 },
          { day: '1d', amountMm: 52, anomalyPct: 135 },
          { day: '3d', amountMm: 60, anomalyPct: 155 },
          { day: '5d', amountMm: 45, anomalyPct: 115 },
          { day: '7d', amountMm: 32, anomalyPct: 65 }
        ]
      },
      infrastructure: {
        title: 'PERIMETER ASSET EXPOSURE',
        networkAffectedPct: 74,
        networkLabel: 'Corridor & Forestry Impact',
        items: [
          { label: 'Hwy 16 Closures', count: 11, icon: 'road' },
          { label: 'Transmission Corridors', count: 6, icon: 'power' },
          { label: 'Timber Stands', count: 22, icon: 'highway' }
        ]
      },
      riskDrivers: [
        { name: 'Crown Fire Expansion', score: 95, weight: 0.40, description: 'Rapid ember spotting up to 2.5km ahead of active flame front' }
      ]
    },
    long_term: {
      incidentId: 'inc-03',
      hazardType: 'wildfire',
      mode: 'long_term',
      riskLevel: 'MODERATE',
      confidencePct: 72,
      metrics: {
        peopleAffected: '142,000 ha',
        peopleAffectedSub: 'Seasonal Total',
        displaced: '80,000',
        displacedSub: 'Repatriated Pop',
        districts: '120 AQI',
        districtsSub: 'Residual Smoke',
        roadsAffected: 6,
        roadsSub: 'Repairs Underway',
        healthFacilities: 2,
        healthSub: 'Mop-Up Phase',
        majorBridges: '85%',
        bridgesSub: 'Containment Line'
      },
      projection: {
        title: 'FIRE SPREAD PROJECTION',
        estimatedAffected: '142,000 ha',
        estimatedAffectedLabel: 'Seasonal Total',
        increasePct: '+67%',
        increaseLabel: 'Spread vs Current',
        riskTrend: 'MODERATE',
        timeline: [
          { label: 'Now', affected: 0.85, displaced: 0.45 },
          { label: '+10d', affected: 1.20, displaced: 0.68 },
          { label: '+20d', affected: 1.35, displaced: 0.76 },
          { label: '+30d', affected: 1.42, displaced: 0.80 }
        ],
        legendSeries1: 'Active Firefront',
        legendSeries2: 'Containment Line'
      },
      rainfall: {
        title: 'FIRE WEATHER INDEX (FWI)',
        cumulativeMm: 22,
        cumulativeUnit: 'FWI',
        timeframe: 'Next 30 days',
        aboveAveragePct: 15,
        anomalyLabel: 'Autumn Relief',
        floodRiskLevel: 'MODERATE',
        riskBadgeLabel: 'Firefront Risk',
        bars: [
          { day: 'W1', amountMm: 48, anomalyPct: 125 },
          { day: 'W2', amountMm: 28, anomalyPct: 40 },
          { day: 'W3', amountMm: 15, anomalyPct: -10 },
          { day: 'W4', amountMm: 10, anomalyPct: -30 }
        ]
      },
      infrastructure: {
        title: 'PERIMETER ASSET EXPOSURE',
        networkAffectedPct: 45,
        networkLabel: 'Rehabilitation Phase',
        items: [
          { label: 'Highway Repairs', count: 6, icon: 'road' },
          { label: 'Transmission Grid', count: 2, icon: 'power' }
        ]
      },
      riskDrivers: [
        { name: 'Post-Fire Soil Hydrophobicity', score: 78, weight: 0.35, description: 'Debris flow and mudslide danger on denuded slopes during subsequent rain' }
      ]
    },
    comparative: {
      incidentId: 'inc-03',
      hazardType: 'wildfire',
      mode: 'comparative',
      riskLevel: 'HIGH',
      confidencePct: 92,
      metrics: {
        peopleAffected: '85,000 ha',
        peopleAffectedSub: 'vs 1.8M ha (2023)',
        displaced: '45,000',
        displacedSub: 'vs 180,000 (2023)',
        districts: '340 AQI',
        districtsSub: 'vs 450 AQI (2023)',
        roadsAffected: 14,
        roadsSub: 'vs 42 Routes',
        healthFacilities: 6,
        healthSub: 'vs 28 Fronts',
        majorBridges: '0%',
        bridgesSub: 'Containment'
      },
      projection: {
        title: 'FIRE SPREAD PROJECTION',
        estimatedAffected: '142,000 ha',
        estimatedAffectedLabel: 'Seasonal Peak',
        increasePct: '+67%',
        increaseLabel: 'Spread vs Current',
        riskTrend: 'HIGH',
        timeline: [
          { label: 'Outbreak 2026', affected: 0.85, displaced: 0.45 },
          { label: '2023 Record Season', affected: 18.0, displaced: 1.8 },
          { label: '2021 Lytton Outbreak', affected: 3.5, displaced: 0.6 }
        ],
        legendSeries1: 'Active Firefront',
        legendSeries2: 'Containment Line'
      },
      rainfall: {
        title: 'FIRE WEATHER INDEX (FWI)',
        cumulativeMm: 48,
        cumulativeUnit: 'FWI',
        timeframe: 'Historical Benchmark',
        aboveAveragePct: 125,
        anomalyLabel: 'Benchmark Intensity',
        floodRiskLevel: 'EXTREME',
        riskBadgeLabel: 'Firefront Risk',
        bars: [
          { day: '2026 Outbreak', amountMm: 48, anomalyPct: 125 },
          { day: '2023 Record', amountMm: 68, anomalyPct: 185 },
          { day: '2021 Lytton', amountMm: 62, anomalyPct: 165 }
        ]
      },
      infrastructure: {
        title: 'PERIMETER ASSET EXPOSURE',
        networkAffectedPct: 68,
        networkLabel: 'Historical Fire Impact',
        items: [
          { label: 'Current Hwy Closures', count: 8, icon: 'road' },
          { label: '2023 Hwy Closures', count: 42, icon: 'road' }
        ]
      },
      riskDrivers: [
        { name: 'Thermal Detection Velocity', score: 94, weight: 0.40, description: 'Satellite VIIRS infrared updates detected new flares within 35 minutes' }
      ]
    }
  },

  // =========================================================================
  // 4. Noto Peninsula Seismic Swarm (inc-04) — Japan
  // =========================================================================
  'inc-04': {
    current: {
      incidentId: 'inc-04',
      hazardType: 'earthquake',
      mode: 'current',
      riskLevel: 'MODERATE',
      confidencePct: 96,
      metrics: {
        peopleAffected: 'M 7.4',
        peopleAffectedSub: 'Epicenter Magnitude',
        displaced: '18 km',
        displacedSub: 'Focal Depth (Shallow)',
        districts: 'Shindo 7',
        districtsSub: 'Max Ground Intensity',
        roadsAffected: '45,000',
        roadsSub: 'Exposed Population',
        healthFacilities: 38,
        healthSub: 'Aftershocks Recorded',
        majorBridges: 8,
        bridgesSub: 'Bridge Fractures'
      },
      projection: {
        title: 'AFTERSHOCK PROJECTION',
        estimatedAffected: '52 Events',
        estimatedAffectedLabel: 'Projected M4.0+',
        increasePct: '-35%',
        increaseLabel: 'Omori Decay Rate',
        riskTrend: 'MODERATE',
        timeline: [
          { label: 'Now', affected: 0.38, displaced: 0.12 },
          { label: '+7 days', affected: 0.48, displaced: 0.14 },
          { label: '+14 days', affected: 0.51, displaced: 0.15 },
          { label: '+30 days', affected: 0.52, displaced: 0.15 }
        ],
        legendSeries1: 'Aftershocks',
        legendSeries2: 'Shelter Pop'
      },
      rainfall: {
        title: 'PEAK GROUND ACCELERATION',
        cumulativeMm: 124,
        cumulativeUnit: '%g PGA',
        timeframe: 'Next 7 days',
        aboveAveragePct: 38,
        anomalyLabel: 'Crustal Strain Rate',
        floodRiskLevel: 'CRITICAL',
        riskBadgeLabel: 'Seismic Risk',
        bars: [
          { day: 'Now', amountMm: 124, anomalyPct: 38 },
          { day: '1d', amountMm: 85, anomalyPct: -15 },
          { day: '3d', amountMm: 45, anomalyPct: -45 },
          { day: '5d', amountMm: 28, anomalyPct: -65 },
          { day: '7d', amountMm: 15, anomalyPct: -80 }
        ]
      },
      infrastructure: {
        title: 'STRUCTURAL INTEGRITY LOSS',
        networkAffectedPct: 28,
        networkLabel: 'Civil Infrastructure Damage',
        items: [
          { label: 'Route 249 Fractures', count: 12, icon: 'road' },
          { label: 'Water Mains Burst', count: 44, icon: 'water' },
          { label: 'Shika Nuclear Plant', count: 0, icon: 'power' },
          { label: 'Seawall Fractures', count: 6, icon: 'bridge' },
          { label: 'Hospitals Checked', count: 4, icon: 'hospital' }
        ]
      },
      riskDrivers: [
        { name: 'Crustal Rupture Shallow Depth', score: 94, weight: 0.35, description: '18km focal depth generated high surface accelerations across Wajima' },
        { name: 'Slope Failure & Liquefaction', score: 86, weight: 0.25, description: 'Coastal highway Route 249 severed by multiple cliffside rockslides' },
        { name: 'Lifeline Grid Resilience', score: 45, weight: 0.20, description: 'Shika NPP emergency backup generators operational with zero leak detected' },
        { name: 'Tsunami Early Warning Window', score: 92, weight: 0.20, description: 'JMA sirens evacuated 88% of coastal strip before first 1.8m wave' }
      ]
    },
    short_term: {
      incidentId: 'inc-04',
      hazardType: 'earthquake',
      mode: 'short_term',
      riskLevel: 'MODERATE',
      confidencePct: 94,
      metrics: {
        peopleAffected: 'M 7.4',
        peopleAffectedSub: 'Epicenter Magnitude',
        displaced: '14,000',
        displacedSub: 'Shelter Demand',
        districts: 'Shindo 6-',
        districtsSub: 'Max Aftershock',
        roadsAffected: '35,000',
        roadsSub: 'Exposed Population',
        healthFacilities: 48,
        healthSub: 'Aftershocks Recorded',
        majorBridges: 9,
        bridgesSub: 'Under Inspection'
      },
      projection: {
        title: 'AFTERSHOCK PROJECTION',
        estimatedAffected: '48 Events',
        estimatedAffectedLabel: 'Projected +7d',
        increasePct: '-25%',
        increaseLabel: 'Omori Decay Rate',
        riskTrend: 'MODERATE',
        timeline: [
          { label: 'Now', affected: 0.38, displaced: 0.12 },
          { label: '+2d', affected: 0.44, displaced: 0.13 },
          { label: '+4d', affected: 0.46, displaced: 0.14 },
          { label: '+7d', affected: 0.48, displaced: 0.14 }
        ],
        legendSeries1: 'Aftershocks',
        legendSeries2: 'Shelter Pop'
      },
      rainfall: {
        title: 'PEAK GROUND ACCELERATION',
        cumulativeMm: 85,
        cumulativeUnit: '%g PGA',
        timeframe: 'Next 7 days',
        aboveAveragePct: 20,
        anomalyLabel: 'Crustal Strain Rate',
        floodRiskLevel: 'HIGH',
        riskBadgeLabel: 'Seismic Risk',
        bars: [
          { day: 'Now', amountMm: 95, anomalyPct: 25 },
          { day: '1d', amountMm: 75, anomalyPct: -10 },
          { day: '3d', amountMm: 40, anomalyPct: -50 },
          { day: '5d', amountMm: 22, anomalyPct: -70 },
          { day: '7d', amountMm: 12, anomalyPct: -85 }
        ]
      },
      infrastructure: {
        title: 'STRUCTURAL INTEGRITY LOSS',
        networkAffectedPct: 32,
        networkLabel: 'Civil Infrastructure Damage',
        items: [
          { label: 'Route 249 Fractures', count: 14, icon: 'road' },
          { label: 'Water Mains Burst', count: 52, icon: 'water' },
          { label: 'Shika Nuclear Plant', count: 0, icon: 'power' }
        ]
      },
      riskDrivers: [
        { name: 'Aftershock Probability', score: 68, weight: 0.40, description: '15% probability of M5.5+ aftershock within next 72 hours' }
      ]
    },
    long_term: {
      incidentId: 'inc-04',
      hazardType: 'earthquake',
      mode: 'long_term',
      riskLevel: 'LOW',
      confidencePct: 82,
      metrics: {
        peopleAffected: 'M 7.4',
        peopleAffectedSub: 'Epicenter Magnitude',
        displaced: '4,500',
        displacedSub: 'Temporary Housing',
        districts: 'Shindo 3',
        districtsSub: 'Background Microseism',
        roadsAffected: '10,000',
        roadsSub: 'Exposed Population',
        healthFacilities: 52,
        healthSub: 'Total Swarm Events',
        majorBridges: 2,
        bridgesSub: 'Rebuilding'
      },
      projection: {
        title: 'AFTERSHOCK PROJECTION',
        estimatedAffected: '52 Events',
        estimatedAffectedLabel: 'Total Sequence',
        increasePct: '-65%',
        increaseLabel: 'Omori Decay Rate',
        riskTrend: 'LOW',
        timeline: [
          { label: 'Now', affected: 0.38, displaced: 0.12 },
          { label: '+10d', affected: 0.49, displaced: 0.08 },
          { label: '+20d', affected: 0.51, displaced: 0.06 },
          { label: '+30d', affected: 0.52, displaced: 0.045 }
        ],
        legendSeries1: 'Aftershocks',
        legendSeries2: 'Shelter Pop'
      },
      rainfall: {
        title: 'PEAK GROUND ACCELERATION',
        cumulativeMm: 15,
        cumulativeUnit: '%g PGA',
        timeframe: 'Next 30 days',
        aboveAveragePct: -45,
        anomalyLabel: 'Quiescence Trend',
        floodRiskLevel: 'LOW',
        riskBadgeLabel: 'Seismic Risk',
        bars: [
          { day: 'W1', amountMm: 60, anomalyPct: 10 },
          { day: 'W2', amountMm: 25, anomalyPct: -40 },
          { day: 'W3', amountMm: 12, anomalyPct: -70 },
          { day: 'W4', amountMm: 6, anomalyPct: -85 }
        ]
      },
      infrastructure: {
        title: 'STRUCTURAL INTEGRITY LOSS',
        networkAffectedPct: 18,
        networkLabel: 'Restoration Phase',
        items: [
          { label: 'Roads Reopened', count: 18, icon: 'road' },
          { label: 'Water Mains Restored', count: 48, icon: 'water' }
        ]
      },
      riskDrivers: [
        { name: 'Seismic Energy Release', score: 32, weight: 0.40, description: 'Fault stress successfully accommodated along 42km bilateral rupture segment' }
      ]
    },
    comparative: {
      incidentId: 'inc-04',
      hazardType: 'earthquake',
      mode: 'comparative',
      riskLevel: 'MODERATE',
      confidencePct: 98,
      metrics: {
        peopleAffected: 'M 7.4',
        peopleAffectedSub: 'vs M 7.6 (2024)',
        displaced: '12,000',
        displacedSub: 'vs 34,000 (2024)',
        districts: 'Shindo 7',
        districtsSub: 'vs Shindo 7 (2024)',
        roadsAffected: 8,
        roadsSub: 'vs 48 Arterials',
        healthFacilities: 38,
        healthSub: 'vs 1,200 Events',
        majorBridges: 8,
        bridgesSub: 'vs 36 Fractures'
      },
      projection: {
        title: 'AFTERSHOCK PROJECTION',
        estimatedAffected: '52 Events',
        estimatedAffectedLabel: 'Sequence Total',
        increasePct: '-35%',
        increaseLabel: 'Omori Decay Rate',
        riskTrend: 'MODERATE',
        timeline: [
          { label: '2026 Event', affected: 0.38, displaced: 0.12 },
          { label: '2024 Noto Mega-Quake', affected: 1.20, displaced: 0.34 },
          { label: '2016 Kumamoto Quake', affected: 0.85, displaced: 0.28 }
        ],
        legendSeries1: 'Aftershocks',
        legendSeries2: 'Shelter Pop'
      },
      rainfall: {
        title: 'PEAK GROUND ACCELERATION',
        cumulativeMm: 124,
        cumulativeUnit: '%g PGA',
        timeframe: 'Historical Benchmark',
        aboveAveragePct: 38,
        anomalyLabel: 'Benchmark Intensity',
        floodRiskLevel: 'CRITICAL',
        riskBadgeLabel: 'Seismic Risk',
        bars: [
          { day: '2026 Noto', amountMm: 124, anomalyPct: 38 },
          { day: '2024 Noto', amountMm: 168, anomalyPct: 82 },
          { day: '2016 Kumamoto', amountMm: 145, anomalyPct: 55 }
        ]
      },
      infrastructure: {
        title: 'STRUCTURAL INTEGRITY LOSS',
        networkAffectedPct: 28,
        networkLabel: 'Historical Seismic Impact',
        items: [
          { label: '2026 Fractures', count: 12, icon: 'road' },
          { label: '2024 Fractures', count: 86, icon: 'road' }
        ]
      },
      riskDrivers: [
        { name: 'Seismic Retrofitting', score: 92, weight: 0.40, description: 'Post-2024 building code reinforcement prevented 78% of potential structural collapses' }
      ]
    }
  },

  // =========================================================================
  // 5. Compound Cyclone-Flood Cascade (inc-cascade) — Multi-Hazard
  // =========================================================================
  'inc-cascade': {
    current: {
      incidentId: 'inc-cascade',
      hazardType: 'multi_hazard',
      mode: 'current',
      riskLevel: 'CRITICAL',
      confidencePct: 95,
      metrics: {
        peopleAffected: '3.2M',
        peopleAffectedSub: 'Compound Exposure',
        displaced: '1.6M',
        displacedSub: 'Cascading Displaced',
        districts: '4.2m',
        districtsSub: 'Marine Surge Ingress',
        roadsAffected: 48,
        roadsSub: 'Severed Arterials',
        healthFacilities: 12,
        healthSub: 'Substations Flooded',
        majorBridges: '96.4%',
        bridgesSub: 'Systemic Vulnerability'
      },
      projection: {
        title: 'CASCADE PROJECTION',
        estimatedAffected: '4.1M',
        estimatedAffectedLabel: 'Peak Cascade Exposure',
        increasePct: '+82%',
        increaseLabel: 'Confluence Amplification',
        riskTrend: 'HIGH',
        timeline: [
          { label: 'Now', affected: 3.2, displaced: 1.6 },
          { label: '+7 days', affected: 3.7, displaced: 1.95 },
          { label: '+14 days', affected: 4.0, displaced: 2.15 },
          { label: '+30 days', affected: 4.1, displaced: 2.2 }
        ],
        legendSeries1: 'Compound Impact',
        legendSeries2: 'Grid Blackout'
      },
      rainfall: {
        title: 'COMPOUND FORCING FORECAST',
        cumulativeMm: 620,
        cumulativeUnit: 'mm',
        timeframe: 'Next 72 hours',
        aboveAveragePct: 145,
        anomalyLabel: 'Surge + Deluge Coupling',
        floodRiskLevel: 'CATASTROPHIC',
        riskBadgeLabel: 'Cascade Threat',
        bars: [
          { day: 'Now', amountMm: 220, anomalyPct: 60 },
          { day: '1d', amountMm: 480, anomalyPct: 120 },
          { day: '3d', amountMm: 620, anomalyPct: 145 },
          { day: '5d', amountMm: 390, anomalyPct: 90 },
          { day: '7d', amountMm: 180, anomalyPct: 30 }
        ]
      },
      infrastructure: {
        title: 'CRITICAL INFRASTRUCTURE CASCADE',
        networkAffectedPct: 74,
        networkLabel: 'Coupled Network Degradation',
        items: [
          { label: 'Substations Flooded', count: 12, icon: 'power' },
          { label: 'Severed River Bridges', count: 9, icon: 'bridge' },
          { label: 'Breached Coastal Polders', count: 14, icon: 'water' },
          { label: 'Cellular Towers Offline', count: 84, icon: 'telecom' },
          { label: 'Water Plants Inundated', count: 6, icon: 'hospital' }
        ]
      },
      riskDrivers: [
        { name: 'Estuary Confluence Choke', score: 98, weight: 0.35, description: '4.2m marine surge completely blocks upstream transboundary river discharge' },
        { name: 'Power Grid Cascading Trip', score: 92, weight: 0.25, description: 'Flooding of Meghna transmission hub tripped 4 interconnected regional rings' },
        { name: 'Compound Evacuation Gridlock', score: 88, weight: 0.20, description: 'Simultaneous coastal road flooding and bridge scouring cuts evacuation routes' },
        { name: 'Emergency Shelter Capacity', score: 95, weight: 0.20, description: 'Designated shelters operating at 98% capacity with potable water shortages' }
      ]
    },
    short_term: {
      incidentId: 'inc-cascade',
      hazardType: 'multi_hazard',
      mode: 'short_term',
      riskLevel: 'CRITICAL',
      confidencePct: 96,
      metrics: {
        peopleAffected: '3.7M',
        peopleAffectedSub: 'Projected +7d',
        displaced: '1.95M',
        displacedSub: 'Shelter Saturation',
        districts: '4.5m',
        districtsSub: 'Peak Confluence Surge',
        roadsAffected: 56,
        roadsSub: 'Severed Arterials',
        healthFacilities: 16,
        healthSub: 'Grid Outages',
        majorBridges: '98.5%',
        bridgesSub: 'Systemic Vulnerability'
      },
      projection: {
        title: 'CASCADE PROJECTION',
        estimatedAffected: '3.7M',
        estimatedAffectedLabel: 'Projected +7d',
        increasePct: '+15.6%',
        increaseLabel: 'Confluence Amplification',
        riskTrend: 'HIGH',
        timeline: [
          { label: 'Now', affected: 3.2, displaced: 1.6 },
          { label: '+2d', affected: 3.4, displaced: 1.75 },
          { label: '+4d', affected: 3.6, displaced: 1.88 },
          { label: '+7d', affected: 3.7, displaced: 1.95 }
        ],
        legendSeries1: 'Compound Impact',
        legendSeries2: 'Grid Blackout'
      },
      rainfall: {
        title: 'COMPOUND FORCING FORECAST',
        cumulativeMm: 710,
        cumulativeUnit: 'mm',
        timeframe: 'Next 7 days',
        aboveAveragePct: 165,
        anomalyLabel: 'Surge + Deluge Coupling',
        floodRiskLevel: 'CATASTROPHIC',
        riskBadgeLabel: 'Cascade Threat',
        bars: [
          { day: 'Now', amountMm: 240, anomalyPct: 70 },
          { day: '1d', amountMm: 520, anomalyPct: 135 },
          { day: '3d', amountMm: 710, anomalyPct: 165 },
          { day: '5d', amountMm: 440, anomalyPct: 105 },
          { day: '7d', amountMm: 210, anomalyPct: 40 }
        ]
      },
      infrastructure: {
        title: 'CRITICAL INFRASTRUCTURE CASCADE',
        networkAffectedPct: 82,
        networkLabel: 'Coupled Network Degradation',
        items: [
          { label: 'Substations Flooded', count: 16, icon: 'power' },
          { label: 'Severed River Bridges', count: 12, icon: 'bridge' },
          { label: 'Breached Coastal Polders', count: 18, icon: 'water' }
        ]
      },
      riskDrivers: [
        { name: 'Hydraulic Dam Effect', score: 99, weight: 0.45, description: 'Downstream marine surge elevation exceeds inland river grade, reversing flow' }
      ]
    },
    long_term: {
      incidentId: 'inc-cascade',
      hazardType: 'multi_hazard',
      mode: 'long_term',
      riskLevel: 'HIGH',
      confidencePct: 80,
      metrics: {
        peopleAffected: '4.1M',
        peopleAffectedSub: 'Protracted Exposure',
        displaced: '2.2M',
        displacedSub: 'Rebuilding Phase',
        districts: '1.8m',
        districtsSub: 'Residual Waterlogging',
        roadsAffected: 62,
        roadsSub: 'Structural Rehab',
        healthFacilities: 8,
        healthSub: 'Substations Restored',
        majorBridges: '72.0%',
        bridgesSub: 'Reconstruction'
      },
      projection: {
        title: 'CASCADE PROJECTION',
        estimatedAffected: '4.1M',
        estimatedAffectedLabel: 'Protracted Exposure',
        increasePct: '+82%',
        increaseLabel: 'Confluence Amplification',
        riskTrend: 'HIGH',
        timeline: [
          { label: 'Now', affected: 3.2, displaced: 1.6 },
          { label: '+10d', affected: 3.8, displaced: 2.0 },
          { label: '+20d', affected: 4.05, displaced: 2.15 },
          { label: '+30d', affected: 4.1, displaced: 2.2 }
        ],
        legendSeries1: 'Compound Impact',
        legendSeries2: 'Grid Blackout'
      },
      rainfall: {
        title: 'COMPOUND FORCING FORECAST',
        cumulativeMm: 980,
        cumulativeUnit: 'mm',
        timeframe: 'Next 30 days',
        aboveAveragePct: 45,
        anomalyLabel: 'Monsoon Recession',
        floodRiskLevel: 'HIGH',
        riskBadgeLabel: 'Cascade Threat',
        bars: [
          { day: 'W1', amountMm: 520, anomalyPct: 120 },
          { day: 'W2', amountMm: 280, anomalyPct: 40 },
          { day: 'W3', amountMm: 120, anomalyPct: -10 },
          { day: 'W4', amountMm: 60, anomalyPct: -30 }
        ]
      },
      infrastructure: {
        title: 'CRITICAL INFRASTRUCTURE CASCADE',
        networkAffectedPct: 62,
        networkLabel: 'Reconstruction Required',
        items: [
          { label: 'Bridges to Rebuild', count: 9, icon: 'bridge' },
          { label: 'Polder Re-Armoring', count: 14, icon: 'water' }
        ]
      },
      riskDrivers: [
        { name: 'Agricultural Salinization', score: 88, weight: 0.40, description: 'Seawater penetration into 450,000 hectares of prime agricultural land' }
      ]
    },
    comparative: {
      incidentId: 'inc-cascade',
      hazardType: 'multi_hazard',
      mode: 'comparative',
      riskLevel: 'CRITICAL',
      confidencePct: 96,
      metrics: {
        peopleAffected: '3.2M',
        peopleAffectedSub: 'vs 1970 Bhola (10M)',
        displaced: '1.6M',
        displacedSub: 'vs 3.5M (1991)',
        districts: '4.2m',
        districtsSub: 'vs 6.0m (1970)',
        roadsAffected: 48,
        roadsSub: 'vs 140 Arterials',
        healthFacilities: 12,
        healthSub: 'vs 45 Substations',
        majorBridges: '96.4%',
        bridgesSub: 'Coupled Metric'
      },
      projection: {
        title: 'CASCADE PROJECTION',
        estimatedAffected: '4.1M',
        estimatedAffectedLabel: 'Compound Peak',
        increasePct: '+82%',
        increaseLabel: 'Confluence Amplification',
        riskTrend: 'HIGH',
        timeline: [
          { label: 'Current 2026 Cascade', affected: 3.2, displaced: 1.6 },
          { label: '1991 Super Cyclone', affected: 15.0, displaced: 4.5 },
          { label: '1970 Bhola Disaster', affected: 10.0, displaced: 5.0 }
        ],
        legendSeries1: 'Compound Impact',
        legendSeries2: 'Grid Blackout'
      },
      rainfall: {
        title: 'COMPOUND FORCING FORECAST',
        cumulativeMm: 620,
        cumulativeUnit: 'mm',
        timeframe: 'Compound Benchmark',
        aboveAveragePct: 145,
        anomalyLabel: 'Benchmark Intensity',
        floodRiskLevel: 'CATASTROPHIC',
        riskBadgeLabel: 'Cascade Threat',
        bars: [
          { day: '2026 Cascade', amountMm: 620, anomalyPct: 145 },
          { day: '1991 Super Cyclone', amountMm: 780, anomalyPct: 190 },
          { day: '1970 Bhola', amountMm: 650, anomalyPct: 155 }
        ]
      },
      infrastructure: {
        title: 'CRITICAL INFRASTRUCTURE CASCADE',
        networkAffectedPct: 74,
        networkLabel: 'Historical Compound Impact',
        items: [
          { label: 'Polder Breaches 2026', count: 14, icon: 'water' },
          { label: '1991 Polder Breaches', count: 180, icon: 'water' }
        ]
      },
      riskDrivers: [
        { name: 'Digital Early Action Evacuation', score: 96, weight: 0.45, description: 'Early warning automated SMS and siren network moved 1.6M people before surge apex' }
      ]
    }
  }
};

// Fallback helper to safely retrieve analysis data for any incident, hazard type, or mode
export function getAnalysisData(incidentId: string, hazardType: HazardSelectorType, mode: AnalysisMode): IncidentAnalysisData {
  // 1. Direct match by incidentId if it exists in the database
  if (MOCK_ANALYSIS_DATABASE[incidentId] && MOCK_ANALYSIS_DATABASE[incidentId][mode]) {
    const data = MOCK_ANALYSIS_DATABASE[incidentId][mode];
    return { ...data, hazardType };
  }

  // 2. Match by hazard type default incident
  const mappedIncId = HAZARD_INCIDENT_MAP[hazardType] || 'inc-01';
  if (MOCK_ANALYSIS_DATABASE[mappedIncId] && MOCK_ANALYSIS_DATABASE[mappedIncId][mode]) {
    return MOCK_ANALYSIS_DATABASE[mappedIncId][mode];
  }

  // 3. Fallback to Bangladesh Flood current dataset
  const base = MOCK_ANALYSIS_DATABASE['inc-01'][mode] || MOCK_ANALYSIS_DATABASE['inc-01']['current'];
  return {
    ...base,
    incidentId,
    hazardType,
    mode
  };
}
