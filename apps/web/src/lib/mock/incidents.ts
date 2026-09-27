import type { HazardIncident } from '../types';

export const MOCK_INCIDENTS: HazardIncident[] = [
  {
    id: 'inc-01',
    name: 'Severe Flooding',
    type: 'flood',
    region: 'Sylhet & Dhaka Divisions',
    country: 'Bangladesh',
    coords: { lat: 23.685, lng: 90.356 },
    severity: 'critical',
    affectedPopulation: '2.4M affected',
    affectedPopulationNum: 2400000,
    displacedPopulation: '1.2M displaced',
    displacedPopulationNum: 1200000,
    roadsAffected: 37,
    districtsAffected: 12,
    relativeTime: '3 hours ago',
    timestamp: '2026-09-26T15:00:00Z',
    riskScore: 92,
    confidence: 0.94,
    thumbnailUrl: '/assets/flood_thumb.jpg',
    status: 'escalating',
    details: {
      rainfallRate: '+38mm/hr (Monsoon surge)',
      riverLevelMeters: 4.8,
      shelterDemand: '18 Shelters at 86% Capacity',
      roadAccessibility: '37 Major Arterials Inaccessible',
      description: 'Severe monsoon flooding across northeastern Bangladesh. Multiple rivers have exceeded danger levels, affecting 12 districts.'
    },
    overview: {
      summary: 'Severe monsoon flooding across northeastern Bangladesh. Multiple rivers have exceeded danger levels, affecting 12 districts with catastrophic inundation across low-lying agricultural basins and transit corridors.',
      riskLevel: 'CRITICAL',
      projectedConditions: 'Conditions expected to worsen over the next 48 hours as upstream transboundary runoff converges into the Meghna basin.',
      keyMetrics: [
        { label: 'People Affected', value: '2.4M', sub: '+180K in past 12h' },
        { label: 'Displaced Population', value: '1.2M', sub: 'In emergency shelters' },
        { label: 'Roads Affected', value: '37', sub: 'Submerged arterials' },
        { label: 'Districts Affected', value: '12', sub: 'Northeastern sector' }
      ]
    },
    impact: {
      population: [
        { label: 'Severe Vulnerability (Children & Elderly)', value: '620,000', pct: 26, color: '#EF4444' },
        { label: 'Evacuated to Official Shelters', value: '410,000', pct: 17, color: '#10B981' },
        { label: 'Isolated by Floodwaters', value: '890,000', pct: 37, color: '#F59E0B' },
        { label: 'Secondary Shelter Seekers', value: '480,000', pct: 20, color: '#38BDF8' }
      ],
      infrastructure: [
        { label: 'Regional Power Substations', value: '4 Submerged / Offline', status: 'critical' },
        { label: 'Cellular Transceiver Towers', value: '18 Towers on Battery Backup', status: 'warning' },
        { label: 'Potable Water Distribution Wells', value: '142 Deep Tubewells Contaminated', status: 'critical' },
        { label: 'Sylhet Osmani Airport Runway', value: 'Operational with Minor Waterlogging', status: 'nominal' }
      ],
      healthcare: '3 District General Hospitals operating on emergency generator power. 28 community health clinics submerged in Sunamganj.',
      shelterOccupancy: '86% Critical Capacity across 18 designated flood relief shelters.',
      roadAccessibility: '37 Major Arterial highways submerged; N2 Dhaka-Sylhet Highway impassable between Habiganj and Moulvibazar.'
    },
    forecast: {
      timeline: [
        { time: '-24h', areaKm2: 840, popAtRisk: '1.6M', rainfallDelta: '+85mm', severityScore: 78 },
        { time: '-12h', areaKm2: 1080, popAtRisk: '1.9M', rainfallDelta: '+115mm', severityScore: 85 },
        { time: 'NOW', areaKm2: 1420, popAtRisk: '2.4M', rainfallDelta: '+142mm', severityScore: 92 },
        { time: '+24h', areaKm2: 1750, popAtRisk: '2.8M', rainfallDelta: '+165mm', severityScore: 95 },
        { time: '+48h', areaKm2: 1980, popAtRisk: '3.1M', rainfallDelta: '+190mm', severityScore: 96 },
        { time: '+72h', areaKm2: 1820, popAtRisk: '2.9M', rainfallDelta: '+80mm', severityScore: 88 }
      ],
      trendSummary: 'Precipitation will peak within +36 hours before transboundary drainage allows gradual cresting in lower Meghna plain.',
      crestTime: 'Peak river crest projected at +36h (+1.84m above danger threshold)'
    },
    response: {
      teamsDeployed: 142,
      activeShelters: 18,
      bedsAvailable: 14800,
      reliefSuppliesDays: 4.2,
      units: [
        { name: 'Bangladesh Army 17th Infantry Div', type: 'Rescue & Amphibious Evacuation', status: 'Active', location: 'Sylhet Sadar' },
        { name: 'Fire Service & Civil Defence Rapid Unit', type: 'Search & Water Rescue', status: 'Active', location: 'Sunamganj' },
        { name: 'Red Crescent Emergency Medical Corps', type: 'Field Healthcare & Triage', status: 'Active', location: 'Habiganj' },
        { name: 'BDR Disaster Relief Logistics Taskforce', type: 'Supply Distribution & Water Treatment', status: 'Mobilizing', location: 'Dhaka Command' }
      ]
    },
    geometry: {
      center: [91.87, 24.89], // Sylhet focus
      bounds: [[88.0, 20.6], [92.7, 26.6]], // Bangladesh bounds
      floodExtent: [
        [91.15, 25.12], [91.45, 25.18], [91.85, 25.15], [92.15, 24.95],
        [92.35, 24.65], [92.05, 24.35], [91.65, 24.25], [91.25, 24.45],
        [90.95, 24.75], [90.85, 24.95]
      ],
      secondaryExtent: [
        [90.45, 24.85], [90.85, 25.05], [91.15, 24.65], [90.75, 24.25], [90.35, 24.45]
      ],
      highRiskZones: [
        { name: 'Sylhet Sadar Basin', coords: [91.87, 24.89], radiusKm: 32, severity: 'critical' },
        { name: 'Sunamganj Lowlands', coords: [91.40, 25.07], radiusKm: 44, severity: 'critical' },
        { name: 'Netrokona Haor Depression', coords: [90.73, 24.88], radiusKm: 28, severity: 'high' },
        { name: 'Habiganj River Valley', coords: [91.41, 24.38], radiusKm: 24, severity: 'high' }
      ],
      affectedDistricts: [
        { name: 'Sylhet', coords: [91.87, 24.89], population: '3.9M', risk: 'Critical' },
        { name: 'Sunamganj', coords: [91.40, 25.07], population: '2.5M', risk: 'Critical' },
        { name: 'Netrokona', coords: [90.73, 24.88], population: '2.2M', risk: 'High' },
        { name: 'Habiganj', coords: [91.41, 24.38], population: '2.1M', risk: 'High' },
        { name: 'Moulvibazar', coords: [91.77, 24.48], population: '1.9M', risk: 'High' },
        { name: 'Kishoreganj', coords: [90.78, 24.44], population: '3.0M', risk: 'Moderate' },
        { name: 'Kurigram', coords: [89.65, 25.81], population: '2.1M', risk: 'Moderate' },
        { name: 'Brahmanbaria', coords: [91.11, 23.96], population: '2.8M', risk: 'Moderate' }
      ],
      rivers: [
        {
          name: 'Surma River',
          path: [[92.50, 24.88], [92.15, 24.90], [91.87, 24.89], [91.55, 24.95], [91.25, 25.02]]
        },
        {
          name: 'Kushiyara River',
          path: [[92.45, 24.80], [92.05, 24.60], [91.70, 24.45], [91.35, 24.40], [91.05, 24.45]]
        },
        {
          name: 'Jamuna / Brahmaputra',
          path: [[89.80, 25.90], [89.70, 25.20], [89.65, 24.50], [89.75, 23.90], [89.85, 23.40]]
        },
        {
          name: 'Meghna River',
          path: [[91.05, 24.45], [90.85, 23.95], [90.65, 23.40], [90.55, 22.80], [90.65, 22.20]]
        }
      ],
      cities: [
        { name: 'Dhaka', coords: [90.41, 23.81], population: '10.3M', isCapital: true },
        { name: 'Sylhet', coords: [91.87, 24.89], population: '850K' },
        { name: 'Chittagong', coords: [91.83, 22.36], population: '5.2M' },
        { name: 'Mymensingh', coords: [90.40, 24.75], population: '580K' },
        { name: 'Comilla', coords: [91.18, 23.46], population: '440K' }
      ]
    }
  },
  {
    id: 'inc-06',
    name: 'Monsoon Surge & Landslides',
    type: 'flood',
    region: 'Wayanad & Idukki Districts',
    country: 'India',
    coords: { lat: 11.685, lng: 76.132 },
    severity: 'critical',
    affectedPopulation: '680K affected',
    affectedPopulationNum: 680000,
    displacedPopulation: '240K displaced',
    displacedPopulationNum: 240000,
    roadsAffected: 19,
    districtsAffected: 6,
    relativeTime: '2 hours ago',
    timestamp: '2026-09-26T16:00:00Z',
    riskScore: 90,
    confidence: 0.92,
    thumbnailUrl: '/assets/landslide_thumb.jpg',
    status: 'escalating',
    details: {
      rainfallRate: '+52mm/hr (Extreme torrential)',
      shelterDemand: '14 Camps Operating at Max',
      roadAccessibility: 'Ghat Road Pass Blocked',
      description: 'Massive debris flows and flash torrents triggered by cloudburst along Western Ghats escarpment.'
    },
    overview: {
      summary: 'Catastrophic debris flow and hillside slope failures triggered by consecutive cloudburst events across the Western Ghats. Inundation of river valleys and collapse of critical road passes.',
      riskLevel: 'CRITICAL',
      projectedConditions: 'Further torrential spells forecast for next 24 hours. High risk of secondary slope liquefaction.',
      keyMetrics: [
        { label: 'People Affected', value: '680K', sub: 'Across 6 districts' },
        { label: 'Displaced Population', value: '240K', sub: 'In relief camps' },
        { label: 'Road Passes Blocked', value: '19', sub: 'Western Ghats corridors' },
        { label: 'High-Risk Slopes', value: '42', sub: 'Monitored by radar' }
      ]
    },
    impact: {
      population: [
        { label: 'High Altitude Settlements', value: '180,000', pct: 26, color: '#EF4444' },
        { label: 'Valley Evacuees', value: '240,000', pct: 35, color: '#10B981' },
        { label: 'Stranded Transit Passengers', value: '45,000', pct: 7, color: '#F59E0B' },
        { label: 'Peripheral Lowland Residents', value: '215,000', pct: 32, color: '#38BDF8' }
      ],
      infrastructure: [
        { label: 'Meppadi-Chooralmala Bridge', value: 'Swept Away by Torrent', status: 'critical' },
        { label: 'Mountain High-Tension Grid', value: '3 Substations Disconnected', status: 'critical' },
        { label: 'Water Filtration Plants', value: 'Turbidity Exceeds Limits', status: 'warning' },
        { label: 'Calicut International Highway', value: 'Restricted Single Lane', status: 'warning' }
      ],
      healthcare: 'Field military hospitals deployed in Meppadi. Kozhikode Medical College handling trauma admissions.',
      shelterOccupancy: '94% Capacity across 48 taluk relief camps.',
      roadAccessibility: 'Thamarassery Churam ghat road blocked by major boulders; bypass routes active for light emergency vehicles.'
    },
    forecast: {
      timeline: [
        { time: '-24h', areaKm2: 320, popAtRisk: '340K', rainfallDelta: '+90mm', severityScore: 72 },
        { time: '-12h', areaKm2: 480, popAtRisk: '490K', rainfallDelta: '+140mm', severityScore: 82 },
        { time: 'NOW', areaKm2: 680, popAtRisk: '680K', rainfallDelta: '+210mm', severityScore: 90 },
        { time: '+24h', areaKm2: 810, popAtRisk: '740K', rainfallDelta: '+175mm', severityScore: 92 },
        { time: '+48h', areaKm2: 720, popAtRisk: '690K', rainfallDelta: '+60mm', severityScore: 84 },
        { time: '+72h', areaKm2: 550, popAtRisk: '510K', rainfallDelta: '+25mm', severityScore: 70 }
      ],
      trendSummary: 'Heavy downpours persisting through +24h, easing sharply by +48h as Arabian Sea trough drifts northward.'
    },
    response: {
      teamsDeployed: 98,
      activeShelters: 48,
      bedsAvailable: 8200,
      reliefSuppliesDays: 5.0,
      units: [
        { name: 'NDRF 4th Battalion Detachment', type: 'Canine Search & Heavy Extraction', status: 'Active', location: 'Chooralmala' },
        { name: 'Indian Army Madras Sappers', type: 'Bailey Bridge Construction', status: 'Active', location: 'Mundakkai' },
        { name: 'Indian Air Force SAR Squadrons', type: 'Airlift & Aerial Reconnaissance', status: 'Active', location: 'Sulur Base' }
      ]
    },
    geometry: {
      center: [76.13, 11.68],
      bounds: [[74.8, 8.2], [77.6, 12.8]],
      floodExtent: [
        [75.85, 11.85], [76.25, 11.90], [76.40, 11.65], [76.20, 11.45], [75.80, 11.55]
      ],
      highRiskZones: [
        { name: 'Chooralmala Valley', coords: [76.18, 11.54], radiusKm: 18, severity: 'critical' },
        { name: 'Mundakkai Ridge', coords: [76.22, 11.52], radiusKm: 15, severity: 'critical' },
        { name: 'Meppadi Foothills', coords: [76.12, 11.55], radiusKm: 22, severity: 'high' }
      ],
      affectedDistricts: [
        { name: 'Wayanad', coords: [76.13, 11.68], population: '820K', risk: 'Critical' },
        { name: 'Kozhikode', coords: [75.78, 11.25], population: '3.1M', risk: 'High' },
        { name: 'Malappuram', coords: [76.07, 11.07], population: '4.1M', risk: 'High' },
        { name: 'Kannur', coords: [75.37, 11.87], population: '2.5M', risk: 'Moderate' }
      ],
      rivers: [
        { name: 'Chaliyar River', path: [[76.35, 11.55], [76.15, 11.35], [75.95, 11.20], [75.80, 11.15]] },
        { name: 'Kabini River', path: [[76.05, 11.75], [76.25, 11.85], [76.45, 11.95]] }
      ],
      cities: [
        { name: 'Kalpetta', coords: [76.08, 11.61], population: '35K' },
        { name: 'Kozhikode', coords: [75.78, 11.25], population: '610K' },
        { name: 'Kochi', coords: [76.26, 9.93], population: '2.1M' }
      ]
    }
  },
  {
    id: 'inc-02',
    name: 'Cyclone Marex',
    type: 'cyclone',
    region: 'Central Basin & Coastal Madagascar',
    country: 'Indian Ocean',
    coords: { lat: -12.2, lng: 76.5 },
    severity: 'high',
    affectedPopulation: '850K affected',
    affectedPopulationNum: 850000,
    displacedPopulation: '320K displaced',
    displacedPopulationNum: 320000,
    roadsAffected: 24,
    districtsAffected: 8,
    relativeTime: '5 hours ago',
    timestamp: '2026-09-26T13:00:00Z',
    riskScore: 84,
    confidence: 0.89,
    thumbnailUrl: '/assets/cyclone_thumb.jpg',
    status: 'active',
    details: {
      windSpeed: '185 km/h (Category 3)',
      shelterDemand: 'Coastal Evacuation Protocol Tier 2',
      roadAccessibility: 'Maritime Shipping Lanes Closed',
      description: 'Intense cyclonic vortex tracking northeastward with sustained central barometric pressure of 958 hPa.'
    },
    overview: {
      summary: 'Category 3 Tropical Cyclone Marex continues to generate destructive wind gusts up to 215 km/h and extreme storm surges along low-lying island archipelagos and coastal shipping corridors.',
      riskLevel: 'HIGH',
      projectedConditions: 'Storm eye tracking toward populated coastline over next 28 hours with storm surge forecast up to 3.8 meters.',
      keyMetrics: [
        { label: 'People Affected', value: '850K', sub: 'Coastal & maritime' },
        { label: 'Displaced Population', value: '320K', sub: 'In storm shelters' },
        { label: 'Sustained Winds', value: '185 km/h', sub: 'Category 3 system' },
        { label: 'Central Pressure', value: '958 hPa', sub: 'Deepening low' }
      ]
    },
    impact: {
      population: [
        { label: 'Coastal Island Inhabitants', value: '380,000', pct: 45, color: '#EF4444' },
        { label: 'Fisherfolk & Maritime Crews', value: '120,000', pct: 14, color: '#F59E0B' },
        { label: 'Inland Flood Zone Residents', value: '350,000', pct: 41, color: '#38BDF8' }
      ],
      infrastructure: [
        { label: 'Deepwater Port Terminals', value: 'All Berths Suspended', status: 'critical' },
        { label: 'Coastal Radar Arrays', value: 'Telemetry Active (100%)', status: 'nominal' },
        { label: 'Offshore Gas Extraction Rigs', value: 'Personnel Evacuated', status: 'warning' }
      ],
      healthcare: 'Regional coastal clinics evacuated to inland concrete facilities.',
      shelterOccupancy: '78% Capacity across reinforced cyclone shelters.',
      roadAccessibility: 'Coastal causeway routes closed due to wave overtopping.'
    },
    forecast: {
      timeline: [
        { time: '-24h', areaKm2: 4200, popAtRisk: '400K', rainfallDelta: '+50mm', severityScore: 70 },
        { time: '-12h', areaKm2: 5600, popAtRisk: '620K', rainfallDelta: '+90mm', severityScore: 78 },
        { time: 'NOW', areaKm2: 7200, popAtRisk: '850K', rainfallDelta: '+140mm', severityScore: 84 },
        { time: '+24h', areaKm2: 8900, popAtRisk: '1.1M', rainfallDelta: '+220mm', severityScore: 89 },
        { time: '+48h', areaKm2: 7800, popAtRisk: '920K', rainfallDelta: '+160mm', severityScore: 80 },
        { time: '+72h', areaKm2: 5100, popAtRisk: '450K', rainfallDelta: '+40mm', severityScore: 65 }
      ],
      trendSummary: 'Landfall anticipated at +28h followed by rapid frictional dissipation over mountainous terrain.'
    },
    response: {
      teamsDeployed: 76,
      activeShelters: 34,
      bedsAvailable: 11200,
      reliefSuppliesDays: 6.2,
      units: [
        { name: 'Indian Ocean Disaster Taskforce', type: 'Naval SAR & Relief Vessels', status: 'Active', location: 'Maritime Sector 4' },
        { name: 'Regional Civil Protection Units', type: 'Evacuation Escort', status: 'Active', location: 'Coastline' }
      ]
    },
    geometry: {
      center: [76.5, -12.2],
      bounds: [[68.0, -18.0], [84.0, -6.0]],
      floodExtent: [
        [74.0, -11.0], [77.5, -10.5], [79.0, -13.0], [76.5, -14.5], [73.5, -13.0]
      ],
      highRiskZones: [
        { name: 'Cyclone Eye Vortex', coords: [76.5, -12.2], radiusKm: 65, severity: 'critical' },
        { name: 'Eastern Eyewall Swell', coords: [77.8, -11.8], radiusKm: 120, severity: 'high' }
      ],
      cities: [
        { name: 'Port Louis', coords: [57.50, -20.16], population: '150K' },
        { name: 'Antsiranana', coords: [49.29, -12.28], population: '130K' }
      ]
    }
  },
  {
    id: 'inc-03',
    name: 'Wildfire Complex Outbreak',
    type: 'wildfire',
    region: 'Alberta / British Columbia',
    country: 'Canada',
    coords: { lat: 54.1, lng: -116.8 },
    severity: 'high',
    affectedPopulation: '120K affected',
    affectedPopulationNum: 120000,
    displacedPopulation: '45K displaced',
    displacedPopulationNum: 45000,
    roadsAffected: 14,
    districtsAffected: 4,
    relativeTime: '6 hours ago',
    timestamp: '2026-09-26T12:00:00Z',
    riskScore: 78,
    confidence: 0.91,
    thumbnailUrl: '/assets/wildfire_thumb.jpg',
    status: 'active',
    details: {
      temperature: '34°C (Severe Drought & Gusts)',
      shelterDemand: 'Regional Emergency Centers Activated',
      roadAccessibility: 'Highway 16 Corridor Intermittent',
      description: 'Multiple lightning-induced firefronts merged under gusting conditions, threatening perimeter communities.'
    },
    overview: {
      summary: 'Aggressive wildfire complex spanning over 85,000 hectares driven by dry southwesterly winds and multi-week drought conditions across boreal forest reserves.',
      riskLevel: 'HIGH',
      projectedConditions: 'Wind shift expected within 18 hours may push smoke plumes and embers toward major transport arteries.',
      keyMetrics: [
        { label: 'Area Burned', value: '85,000 ha', sub: '+12,000 ha in 24h' },
        { label: 'People Evacuated', value: '45,000', sub: 'Under mandatory orders' },
        { label: 'Air Quality Index', value: '310+ AQI', sub: 'Hazardous smoke plume' },
        { label: 'Active Firefronts', value: '6 Merged', sub: '0% Perimeter containment' }
      ]
    },
    impact: {
      population: [
        { label: 'Evacuated Townships', value: '45,000', pct: 38, color: '#EF4444' },
        { label: 'Smoke Inhalation Alert Zone', value: '75,000', pct: 62, color: '#F59E0B' }
      ],
      infrastructure: [
        { label: 'Trans-Canada Rail Freight Link', value: 'Speed Restrictions Imposed', status: 'warning' },
        { label: 'Oil Sands Extraction Pipelines', value: 'Automatic Valve Isolation Active', status: 'nominal' },
        { label: 'Boreal Transmission Towers', value: '2 Circuits Damaged by Heat', status: 'critical' }
      ],
      healthcare: 'Mobile respiratory triage units deployed in Edmonton and Grande Prairie evacuation centers.',
      shelterOccupancy: '62% Capacity across provincial arena shelters.',
      roadAccessibility: 'Highway 16 intermittent due to dense zero-visibility smoke.'
    },
    forecast: {
      timeline: [
        { time: '-24h', areaKm2: 450, popAtRisk: '65K', rainfallDelta: '0mm', severityScore: 68 },
        { time: '-12h', areaKm2: 620, popAtRisk: '90K', rainfallDelta: '0mm', severityScore: 74 },
        { time: 'NOW', areaKm2: 850, popAtRisk: '120K', rainfallDelta: '0mm', severityScore: 78 },
        { time: '+24h', areaKm2: 1100, popAtRisk: '145K', rainfallDelta: '0mm', severityScore: 82 },
        { time: '+48h', areaKm2: 1250, popAtRisk: '150K', rainfallDelta: '+8mm (Cold front)', severityScore: 75 },
        { time: '+72h', areaKm2: 1280, popAtRisk: '130K', rainfallDelta: '+18mm', severityScore: 60 }
      ],
      trendSummary: 'Approaching cold front and light precipitation anticipated to curb firefront spread by +48h.'
    },
    response: {
      teamsDeployed: 110,
      activeShelters: 12,
      bedsAvailable: 6400,
      reliefSuppliesDays: 8.5,
      units: [
        { name: 'Alberta Wildfire Initial Attack Crews', type: 'Wildland Firefighting', status: 'Active', location: 'Sector Bravo' },
        { name: 'Conair Air Tanker Fleet', type: 'Retardant Drops', status: 'Active', location: 'Edmonton Base' },
        { name: 'Canadian Armed Forces Op LENTUS', type: 'Evacuation & Perimeter Security', status: 'Active', location: 'Grande Prairie' }
      ]
    },
    geometry: {
      center: [-116.8, 54.1],
      bounds: [[-122.0, 50.0], [-110.0, 58.0]],
      floodExtent: [
        [-117.4, 54.4], [-116.2, 54.5], [-116.0, 53.8], [-117.2, 53.7]
      ],
      highRiskZones: [
        { name: 'Chinchaga Firehead', coords: [-116.8, 54.1], radiusKm: 35, severity: 'critical' },
        { name: 'Fox Creek Ridge', coords: [-116.3, 53.9], radiusKm: 25, severity: 'high' }
      ],
      cities: [
        { name: 'Grande Prairie', coords: [-118.80, 55.17], population: '68K' },
        { name: 'Edmonton', coords: [-113.49, 53.54], population: '1.0M' }
      ]
    }
  },
  {
    id: 'inc-07',
    name: 'Super Typhoon Vinta',
    type: 'cyclone',
    region: 'Eastern Luzon & Cagayan Valley',
    country: 'Philippines',
    coords: { lat: 16.8, lng: 122.2 },
    severity: 'high',
    affectedPopulation: '940K affected',
    affectedPopulationNum: 940000,
    displacedPopulation: '410K displaced',
    displacedPopulationNum: 410000,
    roadsAffected: 28,
    districtsAffected: 7,
    relativeTime: '7 hours ago',
    timestamp: '2026-09-26T11:00:00Z',
    riskScore: 86,
    confidence: 0.93,
    thumbnailUrl: '/assets/typhoon_thumb.jpg',
    status: 'active',
    details: {
      windSpeed: '215 km/h (Super Typhoon Tier 4)',
      shelterDemand: '62 Municipal Evacuation Centers Active',
      roadAccessibility: 'Sierra Madre Passes Blocked by Debris',
      description: 'Super Typhoon making landfall with devastating storm surge and flash flood inundation across coastal Isabela.'
    },
    overview: {
      summary: 'Super Typhoon Vinta generating catastrophic storm surge along northeastern Luzon, with 215 km/h sustained winds and over 350 mm of precipitation triggering landslides in the Sierra Madre range.',
      riskLevel: 'HIGH',
      projectedConditions: 'Storm center traversing Cagayan Valley before emerging into the South China Sea within 36 hours.',
      keyMetrics: [
        { label: 'People Affected', value: '940K', sub: 'Across 7 provinces' },
        { label: 'Displaced Population', value: '410K', sub: 'In evacuation centers' },
        { label: 'Peak Wind Gusts', value: '260 km/h', sub: 'Severe destruction' },
        { label: 'Storm Surge Height', value: '4.2 m', sub: 'Inundated coast' }
      ]
    },
    impact: {
      population: [
        { label: 'Coastal Storm Surge Zone', value: '380,000', pct: 40, color: '#EF4444' },
        { label: 'Riverine Flood Basins', value: '340,000', pct: 36, color: '#F59E0B' },
        { label: 'Mountain Landslide Hazard', value: '220,000', pct: 24, color: '#38BDF8' }
      ],
      infrastructure: [
        { label: 'Tuguegarao Power Grid', value: 'Blackout across 4 Municipalities', status: 'critical' },
        { label: 'National Highway 1 (Maharlika)', value: 'Passable with Debris Caution', status: 'warning' },
        { label: 'Seaport of Aparri', value: 'Closed to Navigation', status: 'critical' }
      ],
      healthcare: 'Provincial hospitals operating on backup solar/diesel microgrids.',
      shelterOccupancy: '91% Capacity across reinforced school evacuation hubs.',
      roadAccessibility: '28 roads impassable due to fallen electrical pylons and water accumulation.'
    },
    forecast: {
      timeline: [
        { time: '-24h', areaKm2: 3800, popAtRisk: '550K', rainfallDelta: '+80mm', severityScore: 76 },
        { time: '-12h', areaKm2: 4900, popAtRisk: '780K', rainfallDelta: '+160mm', severityScore: 82 },
        { time: 'NOW', areaKm2: 6200, popAtRisk: '940K', rainfallDelta: '+280mm', severityScore: 86 },
        { time: '+24h', areaKm2: 7400, popAtRisk: '1.05M', rainfallDelta: '+340mm', severityScore: 88 },
        { time: '+48h', areaKm2: 5800, popAtRisk: '700K', rainfallDelta: '+110mm', severityScore: 78 },
        { time: '+72h', areaKm2: 3200, popAtRisk: '310K', rainfallDelta: '+30mm', severityScore: 60 }
      ],
      trendSummary: 'Typhoon will traverse Cordillera mountains, losing intensity before offshore exit into West Philippine Sea.'
    },
    response: {
      teamsDeployed: 125,
      activeShelters: 62,
      bedsAvailable: 16400,
      reliefSuppliesDays: 5.8,
      units: [
        { name: 'Philippine Coast Guard Strike Force', type: 'Flood Rescue & Amphibious Trucks', status: 'Active', location: 'Isabela' },
        { name: 'AFP Northern Luzon Command', type: 'Clearance & Humanitarian Airlift', status: 'Active', location: 'Tuguegarao' },
        { name: 'DOH Emergency Response Medical Fleet', type: 'Disease Prevention & Mobile Clinics', status: 'Active', location: 'Ilagan' }
      ]
    },
    geometry: {
      center: [122.2, 16.8],
      bounds: [[119.0, 14.0], [125.0, 19.5]],
      floodExtent: [
        [121.2, 17.6], [122.8, 17.4], [122.5, 16.0], [121.0, 16.2]
      ],
      highRiskZones: [
        { name: 'Palanan Bay Landfall', coords: [122.4, 17.0], radiusKm: 40, severity: 'critical' },
        { name: 'Cagayan River Basin', coords: [121.7, 17.5], radiusKm: 35, severity: 'high' }
      ],
      cities: [
        { name: 'Tuguegarao', coords: [121.72, 17.61], population: '160K' },
        { name: 'Ilagan', coords: [121.88, 17.13], population: '150K' },
        { name: 'Manila', coords: [120.98, 14.60], population: '13.5M', isCapital: true }
      ]
    }
  },
  {
    id: 'inc-04',
    name: 'Noto Peninsula Seismic Swarm',
    type: 'earthquake',
    region: 'Ishikawa Prefecture',
    country: 'Japan',
    coords: { lat: 37.5, lng: 137.2 },
    severity: 'moderate',
    affectedPopulation: '45K affected',
    affectedPopulationNum: 45000,
    displacedPopulation: '12K displaced',
    displacedPopulationNum: 12000,
    roadsAffected: 8,
    districtsAffected: 3,
    relativeTime: '8 hours ago',
    timestamp: '2026-09-26T10:00:00Z',
    riskScore: 64,
    confidence: 0.96,
    thumbnailUrl: '/assets/earthquake_thumb.jpg',
    status: 'contained',
    details: {
      windSpeed: 'N/A',
      shelterDemand: '12 Community Centers Active',
      roadAccessibility: 'Coastal Route 249 Fractured',
      description: 'Magnitude 6.2 shallow crustal earthquake followed by 18 aftershocks exceeding M4.0 along the northern coast.'
    },
    overview: {
      summary: 'Magnitude 6.2 shallow seismic event centered off the Noto Peninsula coast. Ground liquefaction and structural damage to older wood-frame constructions across Wajima and Suzu.',
      riskLevel: 'MODERATE',
      projectedConditions: 'Aftershock probabilities decaying steadily; tsunami advisories safely lifted by JMA.',
      keyMetrics: [
        { label: 'Earthquake Magnitude', value: 'M 6.2', sub: 'Depth: 10 km (Shallow)' },
        { label: 'Max Seismic Intensity', value: 'Shindo 6-', sub: 'Wajima & Suzu' },
        { label: 'Displaced Population', value: '12,000', sub: 'In designated centers' },
        { label: 'Aftershocks Recorded', value: '38', sub: 'Past 12 hours' }
      ]
    },
    impact: {
      population: [
        { label: 'Elderly Population in Shelters', value: '6,800', pct: 57, color: '#F59E0B' },
        { label: 'Homebound Residents Checked', value: '5,200', pct: 43, color: '#10B981' }
      ],
      infrastructure: [
        { label: 'Shika Nuclear Power Plant', value: 'Zero Anomalies Detected (Safe)', status: 'nominal' },
        { label: 'Noto Airport Runway', value: 'Minor Hairline Cracks (Repaired)', status: 'nominal' },
        { label: 'Wajima Municipal Water Network', value: 'Burst Mains in 3 Sectors', status: 'warning' }
      ],
      healthcare: 'Suzu General Hospital operational on municipal water tankers.',
      shelterOccupancy: '48% Capacity across seismic community centers.',
      roadAccessibility: 'Route 249 coastal bypass closed for slope reinforcement.'
    },
    forecast: {
      timeline: [
        { time: '-24h', areaKm2: 450, popAtRisk: '45K', rainfallDelta: 'N/A', severityScore: 82 },
        { time: '-12h', areaKm2: 450, popAtRisk: '45K', rainfallDelta: 'N/A', severityScore: 72 },
        { time: 'NOW', areaKm2: 450, popAtRisk: '45K', rainfallDelta: 'N/A', severityScore: 64 },
        { time: '+24h', areaKm2: 450, popAtRisk: '35K', rainfallDelta: 'N/A', severityScore: 55 },
        { time: '+48h', areaKm2: 450, popAtRisk: '20K', rainfallDelta: 'N/A', severityScore: 42 },
        { time: '+72h', areaKm2: 450, popAtRisk: '10K', rainfallDelta: 'N/A', severityScore: 30 }
      ],
      trendSummary: 'Aftershock activity tapering down predictably according to Omori-Utsu seismic laws.'
    },
    response: {
      teamsDeployed: 52,
      activeShelters: 12,
      bedsAvailable: 4200,
      reliefSuppliesDays: 12.0,
      units: [
        { name: 'Japan Ground Self-Defense Force 10th Div', type: 'Engineering & Water Supply', status: 'Active', location: 'Wajima' },
        { name: 'Ishikawa Prefecture Disaster Medical Team', type: 'Mobile Health Checkups', status: 'Active', location: 'Suzu' }
      ]
    },
    geometry: {
      center: [137.2, 37.5],
      bounds: [[136.0, 36.5], [138.0, 38.0]],
      floodExtent: [
        [136.8, 37.4], [137.3, 37.5], [137.4, 37.3], [136.9, 37.2]
      ],
      highRiskZones: [
        { name: 'Wajima Epicenter Zone', coords: [137.0, 37.4], radiusKm: 18, severity: 'moderate' },
        { name: 'Suzu Coastal Fault', coords: [137.3, 37.5], radiusKm: 22, severity: 'moderate' }
      ],
      cities: [
        { name: 'Wajima', coords: [136.90, 37.39], population: '25K' },
        { name: 'Kanazawa', coords: [136.65, 36.56], population: '460K' },
        { name: 'Tokyo', coords: [139.69, 35.69], population: '14.0M', isCapital: true }
      ]
    }
  },
  {
    id: 'inc-05',
    name: 'Major Grid Substation Failure',
    type: 'infrastructure_failure',
    region: 'Frankfurt Rhine-Main',
    country: 'Germany',
    coords: { lat: 50.11, lng: 8.68 },
    severity: 'low',
    affectedPopulation: '28K affected',
    affectedPopulationNum: 28000,
    displacedPopulation: '0 displaced',
    displacedPopulationNum: 0,
    roadsAffected: 4,
    districtsAffected: 2,
    relativeTime: '10 hours ago',
    timestamp: '2026-09-26T08:00:00Z',
    riskScore: 32,
    confidence: 0.98,
    thumbnailUrl: '/assets/grid_thumb.jpg',
    status: 'contained',
    details: {
      temperature: '19°C',
      shelterDemand: 'None Required',
      roadAccessibility: 'Traffic Signals Operational on UPS',
      description: 'Transformer insulation breakdown at 380kV Ostend transmission substation triggering automatic localized trip.'
    },
    overview: {
      summary: 'Controlled cascading trip of a 380kV main transmission transformer in east Frankfurt. Power rerouted via redundant ring feeders with 92% of households restored.',
      riskLevel: 'LOW',
      projectedConditions: 'Complete restoration of industrial customers projected within 4 hours. No public safety hazards detected.',
      keyMetrics: [
        { label: 'Subscribers Affected', value: '28,000', sub: '92% restored' },
        { label: 'Substations Tripped', value: '1', sub: 'Ostend 380kV' },
        { label: 'Backup Feeders Engaged', value: '4', sub: 'Ring grid routing' },
        { label: 'Critical Facilities Down', value: '0', sub: 'Tier-4 UPS held' }
      ]
    },
    impact: {
      population: [
        { label: 'Restored Households', value: '25,800', pct: 92, color: '#10B981' },
        { label: 'Remaining Localized Outage', value: '2,200', pct: 8, color: '#38BDF8' }
      ],
      infrastructure: [
        { label: 'Frankfurt Data Center Alley', value: '100% Online on Redundant Grids', status: 'nominal' },
        { label: 'Frankfurt Airport Terminal 1 & 2', value: 'Fully Operational', status: 'nominal' },
        { label: 'S-Bahn Suburban Rail Network', value: 'Minor 10-Minute Delays on S1/S2', status: 'nominal' }
      ],
      healthcare: 'Frankfurt University Hospital unaffected; dual dedicated feed held without interruption.',
      shelterOccupancy: '0% — No evacuation required.',
      roadAccessibility: 'All main streets clear; 4 intersection traffic lights briefly running on solar/battery modules.'
    },
    forecast: {
      timeline: [
        { time: '-24h', areaKm2: 0, popAtRisk: '0', rainfallDelta: 'N/A', severityScore: 0 },
        { time: '-12h', areaKm2: 45, popAtRisk: '42K', rainfallDelta: 'N/A', severityScore: 48 },
        { time: 'NOW', areaKm2: 12, popAtRisk: '28K', rainfallDelta: 'N/A', severityScore: 32 },
        { time: '+24h', areaKm2: 0, popAtRisk: '0', rainfallDelta: 'N/A', severityScore: 5 },
        { time: '+48h', areaKm2: 0, popAtRisk: '0', rainfallDelta: 'N/A', severityScore: 0 },
        { time: '+72h', areaKm2: 0, popAtRisk: '0', rainfallDelta: 'N/A', severityScore: 0 }
      ],
      trendSummary: 'Repairs to replacement transformer bushings finishing on schedule; full grid reintegration by evening.'
    },
    response: {
      teamsDeployed: 18,
      activeShelters: 0,
      bedsAvailable: 0,
      reliefSuppliesDays: 0,
      units: [
        { name: 'Mainova High-Voltage Engineering Crew', type: 'Transformer Repair & Isolation', status: 'Active', location: 'Ostend Substation' },
        { name: 'Stadtpolizei Traffic Control', type: 'Intersection Management', status: 'Standby', location: 'City Center' }
      ]
    },
    geometry: {
      center: [8.68, 50.11],
      bounds: [[8.40, 49.95], [8.95, 50.25]],
      floodExtent: [
        [8.65, 50.13], [8.72, 50.13], [8.72, 50.09], [8.65, 50.09]
      ],
      highRiskZones: [
        { name: 'Ostend Substation Sector', coords: [8.70, 50.11], radiusKm: 4, severity: 'low' }
      ],
      cities: [
        { name: 'Frankfurt am Main', coords: [8.68, 50.11], population: '760K' },
        { name: 'Offenbach', coords: [8.76, 50.10], population: '130K' },
        { name: 'Wiesbaden', coords: [8.24, 50.08], population: '280K' }
      ]
    }
  },
  {
    id: 'inc-cascade',
    name: 'Cyclone-Flood Compound Cascade',
    type: 'multi_hazard',
    region: 'Bay of Bengal & Meghna Estuary',
    country: 'Bangladesh',
    coords: { lat: 22.8, lng: 90.5 },
    severity: 'critical',
    affectedPopulation: '3.2M affected',
    affectedPopulationNum: 3200000,
    displacedPopulation: '1.6M displaced',
    displacedPopulationNum: 1600000,
    roadsAffected: 48,
    districtsAffected: 14,
    relativeTime: '1 hour ago',
    timestamp: '2026-09-26T16:00:00Z',
    riskScore: 96,
    confidence: 0.95,
    thumbnailUrl: '/assets/flood_thumb.jpg',
    status: 'escalating',
    details: {
      rainfallRate: '+45mm/hr combined with 4.2m marine surge',
      windSpeed: '165 km/h gusts at coastal front',
      shelterDemand: '32 Shelters at 98% Capacity',
      roadAccessibility: '48 Arterials Severed // Coastal Bridges Compromised',
      description: 'Compound systemic disaster: maritime cyclonic surge pushing inland meeting transboundary river runoff deluge at Meghna Estuary.'
    },
    overview: {
      summary: 'Catastrophic compound multi-hazard cascade: maritime cyclone storm surge of +4.2m prevents transboundary monsoon river runoff from discharging, creating an upstream hydraulic dam effect across the central delta basin.',
      riskLevel: 'CRITICAL',
      projectedConditions: 'Compound surge-discharge backwater peaking within 18 hours. Complete isolation of 14 delta sub-districts and simultaneous electrical grid failures.',
      keyMetrics: [
        { label: 'Compound Affected', value: '3.2M', sub: 'Surge + Flood zone' },
        { label: 'Displaced Population', value: '1.6M', sub: 'In emergency shelters' },
        { label: 'Critical Arterials Lost', value: '48', sub: 'Bridges & Highways' },
        { label: 'Grid Failure Nodes', value: '12', sub: 'Substations Submerged' }
      ]
    },
    impact: {
      population: [
        { label: 'Extreme Trapped (Surge & Flood)', value: '980,000', pct: 31, color: '#EF4444' },
        { label: 'Evacuated to High-Ground Polders', value: '620,000', pct: 19, color: '#10B981' },
        { label: 'Isolated Delta Communities', value: '1,150,000', pct: 36, color: '#F59E0B' },
        { label: 'Disrupted Coastal Workforce', value: '450,000', pct: 14, color: '#38BDF8' }
      ],
      infrastructure: [
        { label: 'Meghna Ghat Transmission Hub', value: 'Flooded & Tripped Offline', status: 'critical' },
        { label: 'Padma Bridge Southern Approach', value: 'Scour Alert Tier-1', status: 'warning' },
        { label: 'Chittagong Coastal Floodwall', value: 'Breached in 3 Sectors', status: 'critical' },
        { label: 'Regional Microwave Telecom Towers', value: 'Operating on Emergency Gen', status: 'warning' }
      ],
      healthcare: '6 Coastal Regional Hospitals operating on emergency amphibious supply lines.',
      shelterOccupancy: '98% Critical Capacity across 32 fortified cyclone/flood shelters.',
      roadAccessibility: '48 Main Arterial routes severed; N1 Dhaka-Chittagong and N8 Dhaka-Barisal impassable.'
    },
    forecast: {
      timeline: [
        { time: '-24h', areaKm2: 1200, popAtRisk: '2.1M', rainfallDelta: '+90mm', severityScore: 84 },
        { time: '-12h', areaKm2: 1850, popAtRisk: '2.7M', rainfallDelta: '+130mm', severityScore: 90 },
        { time: 'NOW', areaKm2: 2600, popAtRisk: '3.2M', rainfallDelta: '+185mm', severityScore: 96 },
        { time: '+24h', areaKm2: 3200, popAtRisk: '3.8M', rainfallDelta: '+220mm', severityScore: 98 },
        { time: '+48h', areaKm2: 3450, popAtRisk: '4.1M', rainfallDelta: '+210mm', severityScore: 97 },
        { time: '+72h', areaKm2: 2900, popAtRisk: '3.5M', rainfallDelta: '+110mm', severityScore: 89 }
      ],
      trendSummary: 'Peak compound confluence crest expected at +18h when astronomical high tide locks river drainage.',
      crestTime: 'Compound marine-river crest at +18h (+4.2m marine / +2.1m river)'
    },
    response: {
      teamsDeployed: 210,
      activeShelters: 32,
      bedsAvailable: 18400,
      reliefSuppliesDays: 3.5,
      units: [
        { name: 'Joint Armed Forces Amphibious Command', type: 'Rapid Evacuation & Air-Drop', status: 'Active', location: 'Meghna Confluence' },
        { name: 'Coast Guard Deep-Water Rescue Group', type: 'Marine & Estuary SAR', status: 'Active', location: 'Bay of Bengal Littoral' },
        { name: 'Red Crescent Compound Disaster Taskforce', type: 'Emergency Medical & Water Purif', status: 'Active', location: 'Barisal Command' }
      ]
    },
    geometry: {
      center: [90.50, 22.80],
      bounds: [[88.2, 20.8], [92.6, 24.8]],
      floodExtent: [
        [90.1, 23.4], [91.2, 23.2], [91.5, 22.4], [90.8, 21.8], [89.8, 22.2]
      ],
      highRiskZones: [
        { name: 'Meghna Confluence Bottleneck', coords: [90.65, 22.65], radiusKm: 42, severity: 'critical' },
        { name: 'Barisal Coastal Surge Zone', coords: [90.35, 22.40], radiusKm: 38, severity: 'critical' }
      ],
      cities: [
        { name: 'Dhaka', coords: [90.41, 23.81], population: '22.0M', isCapital: true },
        { name: 'Barisal', coords: [90.37, 22.70], population: '520K' },
        { name: 'Chittagong', coords: [91.83, 22.36], population: '5.2M' }
      ]
    }
  }
];

export const INCIDENTS = MOCK_INCIDENTS;


