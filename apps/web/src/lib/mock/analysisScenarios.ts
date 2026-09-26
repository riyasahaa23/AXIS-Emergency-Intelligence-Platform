import type { HazardSelectorType } from '../types';

export interface ScenarioCamera {
  centerLng: number;
  centerLat: number;
  targetLngSpan: number;
  targetLatSpan: number;
  defaultZoom: number;
}

export interface ContextLabel {
  text: string;
  lng: number;
  lat: number;
  color?: string;
  font?: string;
  align?: CanvasTextAlign;
}

export interface CityMarker {
  name: string;
  lng: number;
  lat: number;
  isHQ?: boolean;
  isEpicenter?: boolean;
  population?: string;
  statusText?: string;
}

export interface InfraMarker {
  name: string;
  lng: number;
  lat: number;
  type: 'bridge' | 'port' | 'power' | 'road' | 'hospital' | 'nuclear' | 'basecamp';
  status?: 'critical' | 'warning' | 'nominal';
}

export interface LegendItem {
  label: string;
  type: 'line' | 'fill' | 'dot' | 'diamond' | 'wave' | 'pulse';
  color: string;
}

export interface AnalysisScenario {
  id: HazardSelectorType;
  hazardType: HazardSelectorType;
  incidentId: string;
  label: string;
  icon: string;
  regionTitle: string;
  camera: ScenarioCamera;
  contextLabels: ContextLabel[];
  borders: Array<Array<[number, number]>>;
  riversOrWater: Array<Array<[number, number]>>;
  cities: CityMarker[];
  infrastructure: InfraMarker[];
  legend: {
    title: string;
    levels: Array<{ label: string; color: string }>;
    layers: LegendItem[];
  };
}

export const HAZARD_INCIDENT_MAP: Record<HazardSelectorType, string> = {
  flood: 'inc-01',
  cyclone: 'inc-02',
  wildfire: 'inc-03',
  earthquake: 'inc-04',
  multi_hazard: 'inc-cascade'
};

export const ANALYSIS_SCENARIOS: Record<HazardSelectorType, AnalysisScenario> = {
  // =========================================================================
  // 1. FLOOD — BANGLADESH & BENGAL BASIN
  // =========================================================================
  flood: {
    id: 'flood',
    hazardType: 'flood',
    incidentId: 'inc-01',
    label: 'Flood',
    icon: '💧',
    regionTitle: 'BANGLADESH // BENGAL DELTA BASIN',
    camera: {
      centerLng: 90.35,
      centerLat: 23.65,
      targetLngSpan: 8.6,
      targetLatSpan: 7.2,
      defaultZoom: 1.0
    },
    contextLabels: [
      { text: 'BAY OF BENGAL (NORTHERN BASIN)', lng: 90.1, lat: 20.7, color: 'rgba(56, 189, 248, 0.32)', font: 'italic bold' },
      { text: 'INDIA (WEST BENGAL)', lng: 87.3, lat: 24.3, color: 'rgba(139, 161, 184, 0.45)' },
      { text: 'INDIA (ASSAM / MEGHALAYA)', lng: 91.2, lat: 25.85, color: 'rgba(139, 161, 184, 0.45)' },
      { text: 'INDIA (TRIPURA)', lng: 93.1, lat: 23.9, color: 'rgba(139, 161, 184, 0.45)' },
      { text: 'MYANMAR', lng: 93.2, lat: 21.6, color: 'rgba(139, 161, 184, 0.45)' }
    ],
    borders: [
      // Bangladesh national perimeter
      [
        [88.05, 26.35], [88.55, 26.63], [89.05, 26.15], [89.85, 26.10],
        [89.80, 25.20], [90.55, 25.18], [91.85, 25.20], [92.35, 25.10],
        [92.55, 24.65], [92.35, 24.20], [91.95, 24.05], [92.20, 23.70],
        [92.35, 23.25], [92.65, 22.35], [92.35, 21.45], [92.15, 20.75],
        [91.95, 21.45], [91.45, 22.15], [90.85, 22.10], [90.35, 21.85],
        [89.55, 21.65], [89.05, 21.75], [88.95, 22.45], [88.55, 22.95],
        [88.65, 23.85], [88.25, 24.65], [88.15, 25.45], [88.05, 26.35]
      ]
    ],
    riversOrWater: [
      // Surma & Kushiyara
      [[92.50, 24.88], [92.15, 24.90], [91.87, 24.89], [91.55, 24.95], [91.10, 24.50]],
      [[92.45, 24.80], [92.05, 24.60], [91.70, 24.45], [91.35, 24.40], [90.95, 24.15]],
      // Jamuna / Brahmaputra
      [[89.80, 26.10], [89.70, 25.50], [89.65, 24.80], [89.75, 24.10], [89.85, 23.80]],
      // Padma (Ganges)
      [[88.10, 24.60], [88.50, 24.30], [89.20, 23.90], [89.85, 23.80]],
      // Lower Meghna River to Bay of Bengal
      [[89.85, 23.80], [90.40, 23.60], [90.65, 23.10], [90.60, 22.40], [90.80, 21.80]],
      // Coastal distributaries
      [[90.40, 23.60], [89.80, 22.90], [89.50, 22.20], [89.30, 21.70]]
    ],
    cities: [
      { name: 'Dhaka', lng: 90.41, lat: 23.81, isHQ: true },
      { name: 'Sylhet', lng: 91.87, lat: 24.89, isEpicenter: true },
      { name: 'Chittagong', lng: 91.83, lat: 22.36 },
      { name: 'Mymensingh', lng: 90.40, lat: 24.75 },
      { name: 'Rajshahi', lng: 88.60, lat: 24.36 },
      { name: 'Rangpur', lng: 89.24, lat: 25.74 },
      { name: 'Khulna', lng: 89.54, lat: 22.84 },
      { name: 'Barisal', lng: 90.37, lat: 22.70 }
    ],
    infrastructure: [
      { name: 'Padma Bridge', lng: 90.26, lat: 23.47, type: 'bridge', status: 'warning' },
      { name: 'Jamuna Bridge', lng: 89.77, lat: 24.40, type: 'bridge', status: 'nominal' },
      { name: 'Sylhet Grid Substation', lng: 91.80, lat: 24.78, type: 'power', status: 'critical' },
      { name: 'Meghna Ghat Hub', lng: 90.60, lat: 23.60, type: 'power', status: 'critical' }
    ],
    legend: {
      title: 'FLOOD RISK LEVEL',
      levels: [
        { label: 'Extreme', color: '#EF4444' },
        { label: 'High', color: '#F97316' },
        { label: 'Moderate', color: '#A855F7' },
        { label: 'Low', color: '#00E5FF' }
      ],
      layers: [
        { label: 'Neon Rivers', type: 'line', color: '#00E5FF' },
        { label: 'Inundation Basins', type: 'fill', color: 'rgba(0, 229, 255, 0.3)' },
        { label: 'Key Cities & HQ', type: 'dot', color: '#FFFFFF' },
        { label: 'Critical Infrastructure', type: 'diamond', color: '#00E5FF' }
      ]
    }
  },

  // =========================================================================
  // 2. CYCLONE — BAY OF BENGAL / NORTHERN INDIAN OCEAN
  // =========================================================================
  cyclone: {
    id: 'cyclone',
    hazardType: 'cyclone',
    incidentId: 'inc-02',
    label: 'Cyclone',
    icon: '🌀',
    regionTitle: 'BAY OF BENGAL // CYCLONE MAREX',
    camera: {
      centerLng: 88.5,
      centerLat: 17.5,
      targetLngSpan: 13.0,
      targetLatSpan: 10.8,
      defaultZoom: 1.0
    },
    contextLabels: [
      { text: 'CENTRAL BAY OF BENGAL (MARITIME ZONE)', lng: 88.5, lat: 15.0, color: 'rgba(56, 189, 248, 0.4)', font: 'italic bold' },
      { text: 'INDIA (ODISHA / ANDHRA COAST)', lng: 84.2, lat: 18.5, color: 'rgba(139, 161, 184, 0.5)' },
      { text: 'BANGLADESH (BENGAL DELTA)', lng: 89.8, lat: 22.8, color: 'rgba(139, 161, 184, 0.5)' },
      { text: 'MYANMAR (RAKHINE COAST)', lng: 93.6, lat: 19.2, color: 'rgba(139, 161, 184, 0.5)' },
      { text: 'ANDAMAN ISLANDS', lng: 92.8, lat: 12.5, color: 'rgba(139, 161, 184, 0.45)' }
    ],
    borders: [
      // Indian East Coastline
      [
        [80.3, 13.0], [80.3, 14.5], [81.5, 16.0], [82.3, 17.0],
        [83.3, 17.7], [84.8, 19.2], [86.9, 20.2], [87.5, 21.5], [88.5, 21.8]
      ],
      // Bangladesh Coastline
      [
        [88.5, 21.8], [89.5, 21.6], [90.5, 21.9], [91.5, 22.2], [92.2, 21.0], [92.4, 20.5]
      ],
      // Myanmar Coastline
      [
        [92.4, 20.5], [93.2, 19.5], [93.8, 18.0], [94.5, 16.5], [95.2, 15.8]
      ]
    ],
    riversOrWater: [
      // Major shipping corridors in Bay
      [[81.0, 13.5], [85.0, 16.0], [89.5, 21.0]],
      [[84.0, 18.0], [88.0, 17.5], [93.0, 16.5]],
      [[92.8, 12.0], [91.0, 16.0], [91.5, 21.5]]
    ],
    cities: [
      { name: 'Chittagong Port', lng: 91.83, lat: 22.36, isHQ: true, statusText: 'PORT BERTHS SUSPENDED' },
      { name: 'Cox\'s Bazar', lng: 92.00, lat: 21.43, isEpicenter: true, statusText: 'TIER-3 EVACUATION' },
      { name: 'Visakhapatnam', lng: 83.30, lat: 17.68, statusText: 'PORT WARNING TIER-2' },
      { name: 'Paradip Port', lng: 86.67, lat: 20.31, statusText: 'GALE-FORCE WINDS' },
      { name: 'Kolkata', lng: 88.36, lat: 22.57 },
      { name: 'Port Blair', lng: 92.74, lat: 11.66 }
    ],
    infrastructure: [
      { name: 'Chittagong Deepwater Terminal', lng: 91.75, lat: 22.25, type: 'port', status: 'critical' },
      { name: 'Matarbari LNG Port', lng: 91.90, lat: 21.70, type: 'port', status: 'critical' },
      { name: 'Paradip Offshore Rig', lng: 86.95, lat: 20.10, type: 'power', status: 'warning' },
      { name: 'Kutubdia Radar Station', lng: 91.85, lat: 21.82, type: 'power', status: 'nominal' }
    ],
    legend: {
      title: 'CYCLONE INTENSITY & TRACK',
      levels: [
        { label: 'Cat 4 Eyewall (>215 km/h)', color: '#EF4444' },
        { label: 'Cat 3 Storm (185 km/h)', color: '#F97316' },
        { label: 'Gale Field (>90 km/h)', color: '#00E5FF' },
        { label: 'Outer Circulation', color: '#38BDF8' }
      ],
      layers: [
        { label: 'Spiral Cloud Bands', type: 'line', color: 'rgba(0, 229, 255, 0.7)' },
        { label: 'Storm Center & Eye', type: 'dot', color: '#FFFFFF' },
        { label: 'Forecast Track & Cone', type: 'fill', color: 'rgba(0, 229, 255, 0.2)' },
        { label: 'Coastal Surge Ribbon', type: 'line', color: '#EF4444' },
        { label: 'Shipping Corridors', type: 'line', color: 'rgba(139, 161, 184, 0.4)' }
      ]
    }
  },

  // =========================================================================
  // 3. WILDFIRE — BRITISH COLUMBIA & WESTERN CORRIDOR, CANADA
  // =========================================================================
  wildfire: {
    id: 'wildfire',
    hazardType: 'wildfire',
    incidentId: 'inc-03',
    label: 'Wildfire',
    icon: '🔥',
    regionTitle: 'BRITISH COLUMBIA // WILDFIRE COMPLEX OUTBREAK',
    camera: {
      centerLng: -122.5,
      centerLat: 53.2,
      targetLngSpan: 7.2,
      targetLatSpan: 5.8,
      defaultZoom: 1.0
    },
    contextLabels: [
      { text: 'INTERIOR PLATEAU // CARIBOO FORESTRY BASIN', lng: -122.5, lat: 52.0, color: 'rgba(249, 115, 22, 0.35)', font: 'italic bold' },
      { text: 'ROCKY MOUNTAIN TRENCH', lng: -119.5, lat: 54.0, color: 'rgba(139, 161, 184, 0.45)' },
      { text: 'PACIFIC NORTHWEST COAST', lng: -127.5, lat: 52.5, color: 'rgba(56, 189, 248, 0.35)' },
      { text: 'ALBERTA FOOTHILLS', lng: -117.2, lat: 53.8, color: 'rgba(139, 161, 184, 0.45)' },
      { text: 'HIGHWAY 16 CORRIDOR (EMERGENCY ROUTE)', lng: -123.8, lat: 54.2, color: 'rgba(239, 68, 68, 0.5)' }
    ],
    borders: [
      // British Columbia & Alberta border segment + coast
      [
        [-128.5, 51.5], [-127.5, 52.8], [-128.2, 54.2], [-130.0, 55.0]
      ],
      // Provincial interior divide
      [
        [-120.0, 56.0], [-120.0, 53.8], [-118.5, 52.5], [-117.0, 51.2], [-115.5, 50.0]
      ]
    ],
    riversOrWater: [
      // Fraser River
      [[-122.8, 54.0], [-122.7, 53.0], [-122.5, 52.2], [-121.9, 51.0], [-121.5, 49.5]],
      // Nechako River
      [[-125.0, 54.0], [-123.5, 53.9], [-122.8, 54.0]],
      // Skeena River Corridor
      [[-128.0, 55.2], [-127.0, 54.8], [-126.0, 54.3]]
    ],
    cities: [
      { name: 'Prince George', lng: -122.75, lat: 53.92, isHQ: true, statusText: 'INCIDENT COMMAND POST' },
      { name: 'Quesnel', lng: -122.49, lat: 52.98, isEpicenter: true, statusText: 'EVACUATION ALERT TIER-1' },
      { name: 'Williams Lake', lng: -122.14, lat: 52.14, statusText: 'EMERGENCY SHELTER HUB' },
      { name: 'Burns Lake', lng: -125.76, lat: 54.23, statusText: 'HIGHWAY 16 BLOCKED' },
      { name: 'Kamloops', lng: -120.33, lat: 50.67, statusText: 'REGIONAL DISPATCH' },
      { name: 'Vancouver', lng: -123.12, lat: 49.28, statusText: 'AIR QUALITY HAZARD' }
    ],
    infrastructure: [
      { name: 'Highway 16 Cut-Off Point', lng: -124.50, lat: 54.10, type: 'road', status: 'critical' },
      { name: 'Nechako Hydro Substation', lng: -123.90, lat: 53.80, type: 'power', status: 'warning' },
      { name: 'Cariboo Water Reservoir', lng: -122.30, lat: 52.60, type: 'power', status: 'nominal' },
      { name: 'Prince George Air Tanker Base', lng: -122.68, lat: 53.88, type: 'basecamp', status: 'nominal' }
    ],
    legend: {
      title: 'FIRE SEVERITY & PERIMETERS',
      levels: [
        { label: 'Extreme Firefront (Zero Containment)', color: '#EF4444' },
        { label: 'Active Perimeter Flare', color: '#F97316' },
        { label: 'Thermal Hotspots (IR)', color: '#FDE047' },
        { label: 'Smoke Plume Drift', color: 'rgba(203, 213, 225, 0.4)' }
      ],
      layers: [
        { label: 'Active Fire Perimeters', type: 'fill', color: 'rgba(239, 68, 68, 0.35)' },
        { label: 'Thermal IR Detections', type: 'dot', color: '#FDE047' },
        { label: 'Smoke Dispersion Cone', type: 'wave', color: 'rgba(148, 163, 184, 0.3)' },
        { label: 'Evacuation Exclusion Boundary', type: 'line', color: '#EF4444' },
        { label: 'Highway Closures', type: 'diamond', color: '#F97316' }
      ]
    }
  },

  // =========================================================================
  // 4. EARTHQUAKE — NOTO PENINSULA & HONSHU SEISMIC ZONE, JAPAN
  // =========================================================================
  earthquake: {
    id: 'earthquake',
    hazardType: 'earthquake',
    incidentId: 'inc-04',
    label: 'Earthquake',
    icon: '⚡',
    regionTitle: 'NOTO PENINSULA // ISHIKAWA SEISMIC SWARM',
    camera: {
      centerLng: 137.2,
      centerLat: 37.3,
      targetLngSpan: 6.8,
      targetLatSpan: 5.6,
      defaultZoom: 1.0
    },
    contextLabels: [
      { text: 'SEA OF JAPAN (SEISMIC RUPTURE ZONE)', lng: 137.0, lat: 38.2, color: 'rgba(56, 189, 248, 0.4)', font: 'italic bold' },
      { text: 'TOYAMA BAY', lng: 137.25, lat: 36.85, color: 'rgba(56, 189, 248, 0.3)' },
      { text: 'SADO ISLAND', lng: 138.4, lat: 38.05, color: 'rgba(139, 161, 184, 0.45)' },
      { text: 'NIIGATA PREFECTURE', lng: 139.0, lat: 37.6, color: 'rgba(139, 161, 184, 0.45)' },
      { text: 'CENTRAL HONSHU MAINLAND', lng: 136.5, lat: 36.0, color: 'rgba(139, 161, 184, 0.45)' }
    ],
    borders: [
      // Noto Peninsula & Ishikawa Coastline
      [
        [136.6, 36.5], [136.7, 36.8], [136.7, 37.1], [136.9, 37.4],
        [137.1, 37.5], [137.35, 37.52], [137.4, 37.35], [137.15, 37.15],
        [137.05, 36.95], [137.2, 36.8], [137.5, 36.85], [138.0, 37.2],
        [138.8, 37.7], [139.2, 38.0]
      ],
      // Sado Island Outline
      [
        [138.2, 38.0], [138.5, 38.2], [138.6, 38.1], [138.3, 37.8], [138.2, 38.0]
      ]
    ],
    riversOrWater: [
      // Major maritime shelf contours
      [[136.5, 37.2], [137.0, 37.6], [137.6, 37.6], [138.2, 37.4]],
      [[136.8, 37.5], [137.25, 37.7], [137.8, 37.8]]
    ],
    cities: [
      { name: 'Wajima', lng: 136.90, lat: 37.39, isEpicenter: true, statusText: 'SHINDO 7 // SEVERE DAMAGE' },
      { name: 'Suzu', lng: 137.26, lat: 37.43, isEpicenter: true, statusText: 'SHINDO 6+ // TSUNAMI ARRIVED' },
      { name: 'Nanao', lng: 136.96, lat: 37.04, statusText: 'SHINDO 6- // WATER MAINS CUT' },
      { name: 'Kanazawa', lng: 136.65, lat: 36.56, isHQ: true, statusText: 'PREFECTURAL RESPONSE HQ' },
      { name: 'Toyama', lng: 137.21, lat: 36.70, statusText: 'SHINDO 5+ // AIRPORT SAFE' },
      { name: 'Niigata', lng: 139.02, lat: 37.90, statusText: 'SEISMIC MONITORING' }
    ],
    infrastructure: [
      { name: 'Shika Nuclear Power Plant', lng: 136.72, lat: 37.05, type: 'nuclear', status: 'nominal' },
      { name: 'Route 249 Coastal Bypass', lng: 137.10, lat: 37.46, type: 'road', status: 'critical' },
      { name: 'Noto Airport Runway', lng: 136.96, lat: 37.29, type: 'road', status: 'nominal' },
      { name: 'Wajima Municipal Water Plant', lng: 136.88, lat: 37.38, type: 'power', status: 'critical' }
    ],
    legend: {
      title: 'SEISMIC INTENSITY (SHINDO)',
      levels: [
        { label: 'Shindo 7 (Violent / Collapse)', color: '#EF4444' },
        { label: 'Shindo 6+ (Very Strong / Fractures)', color: '#F97316' },
        { label: 'Shindo 5+ (Strong / Wall Cracks)', color: '#A855F7' },
        { label: 'Shindo 4 (Moderate Shaking)', color: '#00E5FF' }
      ],
      layers: [
        { label: 'Seismic Epicenter (M7.4)', type: 'dot', color: '#FFFFFF' },
        { label: 'Fault Rupture Zone', type: 'line', color: '#EF4444' },
        { label: 'Expanding P / S Wavefronts', type: 'pulse', color: 'rgba(239, 68, 68, 0.6)' },
        { label: 'Aftershock Cluster Swarm', type: 'dot', color: '#F97316' },
        { label: 'Tsunami Warning Coastal Ribbon', type: 'line', color: '#FDE047' },
        { label: 'Nuclear / Critical Facilities', type: 'diamond', color: '#10B981' }
      ]
    }
  },

  // =========================================================================
  // 5. MULTI-HAZARD — COMPOUND CYCLONE + FLOOD DELTA CASCADE
  // =========================================================================
  multi_hazard: {
    id: 'multi_hazard',
    hazardType: 'multi_hazard',
    incidentId: 'inc-cascade',
    label: 'Multi-Hazard',
    icon: '🗂️',
    regionTitle: 'BENGAL DELTA // COMPOUND CYCLONE & FLOOD CASCADE',
    camera: {
      centerLng: 90.6,
      centerLat: 22.8,
      targetLngSpan: 5.6,
      targetLatSpan: 4.8,
      defaultZoom: 1.0
    },
    contextLabels: [
      { text: 'COMPOUND ESTUARY CONFLUENCE CHOKE POINT', lng: 90.65, lat: 22.55, color: '#EF4444', font: 'bold' },
      { text: 'UPSTREAM MONSOON DELUGE (DISCHARGE BLOCKED)', lng: 90.4, lat: 24.2, color: 'rgba(0, 229, 255, 0.5)' },
      { text: 'MARITIME CYCLONE SURGE FRONT (+4.2m OVERWASH)', lng: 90.2, lat: 21.4, color: 'rgba(249, 115, 22, 0.55)' },
      { text: 'SYSTEMIC POWER GRID TRIP CASCADE', lng: 91.2, lat: 23.3, color: 'rgba(239, 68, 68, 0.5)' },
      { text: 'BAY OF BENGAL MARITIME SECTOR', lng: 88.8, lat: 21.0, color: 'rgba(56, 189, 248, 0.35)' }
    ],
    borders: [
      // Delta shoreline & border
      [
        [88.8, 22.5], [89.5, 21.8], [90.2, 21.8], [90.8, 22.1], [91.5, 22.2],
        [91.9, 21.5], [92.2, 20.8], [92.6, 21.5], [92.5, 23.2], [91.8, 23.8],
        [91.2, 24.5], [90.2, 24.6], [89.5, 24.0], [88.8, 23.2], [88.8, 22.5]
      ]
    ],
    riversOrWater: [
      // Deluge rivers rushing into estuary
      [[89.8, 24.5], [90.1, 23.8], [90.5, 23.2], [90.65, 22.6]],
      [[91.8, 24.8], [91.2, 24.1], [90.8, 23.4], [90.65, 22.6]],
      // Blocked mouth to Bay of Bengal
      [[90.65, 22.6], [90.75, 22.1], [90.85, 21.7]]
    ],
    cities: [
      { name: 'Dhaka', lng: 90.41, lat: 23.81, isHQ: true, statusText: 'NATIONAL COMMAND HQ' },
      { name: 'Chandpur Confluence', lng: 90.65, lat: 23.23, isEpicenter: true, statusText: 'HYDRAULIC DAM CRITICAL' },
      { name: 'Barisal', lng: 90.37, lat: 22.70, statusText: 'SURGE INUNDATION 85%' },
      { name: 'Chittagong', lng: 91.83, lat: 22.36, statusText: 'COASTAL SEA WALL BREACH' },
      { name: 'Khulna', lng: 89.54, lat: 22.84, statusText: 'SALINE MARINE INTRUSION' }
    ],
    infrastructure: [
      { name: 'Padma Bridge Approach Hub', lng: 90.26, lat: 23.47, type: 'bridge', status: 'critical' },
      { name: 'Meghna Transmission Tower Hub', lng: 90.60, lat: 23.60, type: 'power', status: 'critical' },
      { name: 'Barisal Polder 32 Breached', lng: 90.32, lat: 22.65, type: 'power', status: 'critical' },
      { name: 'Chittagong Port Deepwater', lng: 91.75, lat: 22.25, type: 'port', status: 'critical' }
    ],
    legend: {
      title: 'MULTI-HAZARD CASCADE RISK',
      levels: [
        { label: 'Compound Critical (Coupled Surge+Flood)', color: '#EF4444' },
        { label: 'High Estuary Hydraulic Bottleneck', color: '#F97316' },
        { label: 'Secondary Grid Failure Risk', color: '#A855F7' },
        { label: 'Isolated Sub-Basin', color: '#00E5FF' }
      ],
      layers: [
        { label: 'Approaching Cyclone Vortex', type: 'pulse', color: 'rgba(249, 115, 22, 0.7)' },
        { label: 'Marine Surge Water Ingress', type: 'wave', color: '#F97316' },
        { label: 'Blocked River Runoff Deluge', type: 'line', color: '#00E5FF' },
        { label: 'Estuary Confluence Choke Point', type: 'dot', color: '#EF4444' },
        { label: 'Compromised Power Substations', type: 'diamond', color: '#EF4444' },
        { label: 'Severed Arterial Bridges', type: 'diamond', color: '#F97316' }
      ]
    }
  }
};
