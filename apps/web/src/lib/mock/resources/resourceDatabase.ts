import type {
  ResourceItem,
  ResourceCategory,
  ResourceMetrics,
  ResourceRequest,
  ShipmentItem,
  FacilityItem,
  PersonnelItem,
  ResourceOperationItem,
  GeographicMapMetadata
} from '../../types/resources';

export interface HazardResourcePackage {
  hazardId: string;
  hazardType: 'flood' | 'cyclone' | 'wildfire' | 'earthquake' | 'multi_hazard';
  hazardName: string;
  locationName: string;
  theatreName: string;
  center: [number, number]; // [lng, lat]
  defaultZoom: number;
  mapMetadata: GeographicMapMetadata;
  metrics: ResourceMetrics;
  categoryCounts: Record<ResourceCategory, number>;
  resources: ResourceItem[];
  requests: ResourceRequest[];
  shipments: ShipmentItem[];
  facilities: FacilityItem[];
  personnel: PersonnelItem[];
  operations: ResourceOperationItem[];
}

// -------------------------------------------------------------
// 1. BANGLADESH — SEVERE FLOODING (Default)
// -------------------------------------------------------------
export const floodResourceData: HazardResourcePackage = {
  hazardId: 'inc-01',
  hazardType: 'flood',
  hazardName: 'Severe Flooding',
  locationName: 'Bangladesh Emergency Operations',
  theatreName: 'Bangladesh - Dhaka Division',
  center: [90.4125, 23.8103],
  defaultZoom: 1.0,
  mapMetadata: {
    bbox: {
      minLng: 88.0,
      maxLng: 92.8,
      minLat: 20.6,
      maxLat: 26.6
    },
    territoryPath:
      'M 320,80 Q 420,50 560,70 Q 640,110 680,180 Q 750,220 720,320 Q 680,420 740,480 Q 720,550 630,520 Q 520,500 480,560 Q 400,540 360,520 Q 320,440 300,320 Q 280,240 320,80 Z',
    waterwayPaths: [
      'M 450,60 Q 480,150 490,220 Q 520,300 540,390 Q 560,480 540,550',
      'M 300,280 Q 400,290 490,300',
      'M 640,160 Q 600,220 540,300'
    ],
    surroundingLabels: [
      { text: 'INDIA', x: 180, y: 320, size: 20, tracking: 4 },
      { text: 'MYANMAR', x: 760, y: 360, size: 18, tracking: 4 },
      { text: 'BAY OF BENGAL', x: 450, y: 610, size: 16, tracking: 6 }
    ],
    cities: [
      { name: 'Dhaka', coords: [90.41, 23.81], isCapital: true },
      { name: 'Mymensingh', coords: [90.40, 24.75] },
      { name: 'Sylhet', coords: [91.87, 24.89] },
      { name: 'Rajshahi', coords: [88.60, 24.37] },
      { name: 'Khulna', coords: [89.54, 22.84] },
      { name: 'Barisal', coords: [90.35, 22.70] },
      { name: 'Chittagong', coords: [91.83, 22.35] }
    ]
  },
  metrics: {
    totalAssets: 512,
    available: 387,
    deployed: 96,
    inMaintenance: 29,
    requested: 24,
    readinessRate: 92,
    utilizationRate: 76
  },
  categoryCounts: {
    'All Resources': 512,
    'Helicopters': 24,
    'Boats': 48,
    'Ground Vehicles': 120,
    'Medical Supplies': 85,
    'Food & Water': 110,
    'Temporary Shelters': 45,
    'Fuel & Energy': 32,
    'Communication Equipment': 28,
    'Search & Rescue Equipment': 20
  },
  resources: [
    {
      id: 'H-001',
      incidentId: 'inc-01',
      category: 'Helicopters',
      type: 'Helicopter',
      name: 'Airbus H145 Super Puma',
      location: 'Dhaka Air Base',
      coords: [90.39, 23.85],
      status: 'AVAILABLE',
      capacity: '8 personnel',
      capacityNum: 8,
      assignedTo: '—',
      fuelOrStockPct: 82,
      condition: 'Excellent',
      hoursOperated: 142,
      operator: 'Bangladesh Air Wing',
      depot: 'Tejgaon Hangar 3',
      lastUpdated: '5 mins ago'
    },
    {
      id: 'H-002',
      incidentId: 'inc-01',
      category: 'Helicopters',
      type: 'Helicopter',
      name: 'UH-60 Black Hawk',
      location: 'Chittagong Base',
      coords: [91.83, 22.36],
      status: 'DEPLOYED',
      capacity: '12 personnel',
      capacityNum: 12,
      assignedTo: 'Rescue Op-01',
      fuelOrStockPct: 65,
      condition: 'Good',
      hoursOperated: 380,
      operator: 'Coast Guard Air Detachment',
      depot: 'Patenga FOB',
      lastUpdated: '12 mins ago'
    },
    {
      id: 'H-003',
      incidentId: 'inc-01',
      category: 'Helicopters',
      type: 'Helicopter',
      name: 'Mil Mi-17 Heavy Lift',
      location: 'Sylhet Air Base',
      coords: [91.87, 24.89],
      status: 'MAINTENANCE',
      capacity: '24 personnel',
      capacityNum: 24,
      assignedTo: 'Avionics Service',
      fuelOrStockPct: 40,
      condition: 'Needs Service',
      hoursOperated: 820,
      operator: 'Joint Aviation Command',
      depot: 'Sylhet Hangar 1',
      lastUpdated: '1 hour ago'
    },
    {
      id: 'H-014',
      incidentId: 'inc-01',
      category: 'Helicopters',
      type: 'Helicopter',
      name: 'Airbus H145',
      location: 'Sylhet Air Base',
      coords: [91.85, 24.87],
      status: 'AVAILABLE',
      capacity: '8 personnel',
      capacityNum: 8,
      assignedTo: '—',
      fuelOrStockPct: 64,
      condition: 'Good',
      hoursOperated: 185,
      operator: 'Bangladesh Air Wing',
      depot: 'Sylhet Hangar 2',
      eta: '12 mins (Standby)',
      lastUpdated: '8 mins ago'
    },
    {
      id: 'B-001',
      incidentId: 'inc-01',
      category: 'Boats',
      type: 'Rescue Boat',
      name: 'Zodiac MilPro Titan 1',
      location: 'Dhaka North Riverfront',
      coords: [90.38, 23.88],
      status: 'DEPLOYED',
      capacity: '10 personnel',
      capacityNum: 10,
      assignedTo: 'Water Evac Team R-01',
      fuelOrStockPct: 74,
      condition: 'Good',
      hoursOperated: 64,
      operator: 'Civil Defense Marine Unit',
      depot: 'Mirpur Boat Ramp',
      lastUpdated: '2 mins ago'
    },
    {
      id: 'B-002',
      incidentId: 'inc-01',
      category: 'Boats',
      type: 'Rescue Boat',
      name: 'Zodiac MilPro Titan 2',
      location: 'Mymensingh Crossing',
      coords: [90.41, 24.75],
      status: 'EN ROUTE',
      capacity: '10 personnel',
      capacityNum: 10,
      assignedTo: 'Brahmaputra Patrol',
      fuelOrStockPct: 88,
      condition: 'Excellent',
      hoursOperated: 32,
      operator: 'Water Rescue Brigade',
      depot: 'Old Brahmaputra Pier',
      lastUpdated: '8 mins ago'
    },
    {
      id: 'B-003',
      incidentId: 'inc-01',
      category: 'Boats',
      type: 'River Patrol Craft',
      name: 'River Patrol Craft',
      location: 'Barisal Naval Pier',
      coords: [90.35, 22.70],
      status: 'AVAILABLE',
      capacity: '15 personnel',
      capacityNum: 15,
      assignedTo: '—',
      fuelOrStockPct: 95,
      condition: 'Excellent',
      hoursOperated: 18,
      operator: 'Southern Riverine Command',
      depot: 'Barisal Docks',
      range: '180 nm',
      lastUpdated: '15 mins ago'
    },
    {
      id: 'V-101',
      incidentId: 'inc-01',
      category: 'Ground Vehicles',
      type: 'Supply Truck',
      name: 'Heavy 6x6 Freight Truck',
      location: 'Dhaka Central Depot',
      coords: [90.42, 23.76],
      status: 'EN ROUTE',
      capacity: '5 tons',
      capacityNum: 5,
      assignedTo: 'Supply Run-03',
      fuelOrStockPct: 70,
      condition: 'Good',
      hoursOperated: 210,
      operator: 'Army Logistics Corps',
      depot: 'Tejgaon Central Depot',
      lastUpdated: '10 mins ago'
    },
    {
      id: 'V-102',
      incidentId: 'inc-01',
      category: 'Ground Vehicles',
      type: 'Amphibious APC',
      name: 'BTR-80 Amphibious Transporter',
      location: 'Rajshahi Depot',
      coords: [88.60, 24.37],
      status: 'AVAILABLE',
      capacity: '14 personnel',
      capacityNum: 14,
      assignedTo: '—',
      fuelOrStockPct: 90,
      condition: 'Excellent',
      hoursOperated: 110,
      operator: 'Armed Forces Relief Div',
      depot: 'Padma Barracks',
      lastUpdated: '25 mins ago'
    },
    {
      id: 'V-103',
      incidentId: 'inc-01',
      category: 'Ground Vehicles',
      type: 'Mobile Triage Unit',
      name: 'Mercedes Unimog Ambulance',
      location: 'Sylhet Relief Hub',
      coords: [91.86, 24.90],
      status: 'DEPLOYED',
      capacity: '4 patients',
      capacityNum: 4,
      assignedTo: 'Triage Unit Alpha',
      fuelOrStockPct: 84,
      condition: 'Good',
      hoursOperated: 140,
      operator: 'Red Crescent Medical',
      depot: 'Sylhet Civil Depot',
      lastUpdated: '4 mins ago'
    },
    {
      id: 'M-201',
      incidentId: 'inc-01',
      category: 'Medical Supplies',
      type: 'Trauma Pod',
      name: 'Emergency Trauma Pod',
      location: 'Sylhet Relief Hub',
      coords: [91.88, 24.88],
      status: 'AVAILABLE',
      capacity: '30 beds',
      capacityNum: 30,
      assignedTo: '—',
      fuelOrStockPct: 92,
      condition: 'Excellent',
      operator: 'WHO Emergency Health',
      depot: 'Sylhet Central Warehouse',
      beds: 30,
      medicalStaff: '12 Surgeons & Nurses',
      supplies: 'Trauma Packs & Blood Plasma',
      lastUpdated: '5 mins ago'
    },
    {
      id: 'M-202',
      incidentId: 'inc-01',
      category: 'Medical Supplies',
      type: 'Surgical Unit',
      name: 'Trauma Surgery Field Kit',
      location: 'Dhaka Central Depot',
      coords: [90.41, 23.77],
      status: 'DEPLOYED',
      capacity: '20 surgeries/day',
      capacityNum: 20,
      assignedTo: 'Dhaka Mobile Hospital',
      fuelOrStockPct: 80,
      condition: 'Good',
      operator: 'Directorate General Health',
      depot: 'Dhaka Medical Stores',
      lastUpdated: '20 mins ago'
    },
    {
      id: 'F-301',
      incidentId: 'inc-01',
      category: 'Food & Water',
      type: 'Water Purification',
      name: 'RO Mobile Water Filtration Truck',
      location: 'Chittagong Port',
      coords: [91.81, 22.34],
      status: 'AVAILABLE',
      capacity: '10,000 L/day',
      capacityNum: 10000,
      assignedTo: '—',
      fuelOrStockPct: 96,
      condition: 'Excellent',
      operator: 'UNICEF Wash Cluster',
      depot: 'Patenga Depot',
      lastUpdated: '18 mins ago'
    },
    {
      id: 'S-401',
      incidentId: 'inc-01',
      category: 'Temporary Shelters',
      type: 'Shelter Kit',
      name: 'HexTent Community Shelter Pods',
      location: 'Cox’s Bazar Base',
      coords: [91.98, 21.43],
      status: 'AVAILABLE',
      capacity: '400 families',
      capacityNum: 400,
      assignedTo: '—',
      fuelOrStockPct: 88,
      condition: 'Excellent',
      operator: 'IOM Emergency Shelter',
      depot: 'Cox’s Bazar Cluster Hub',
      lastUpdated: '35 mins ago'
    },
    {
      id: 'P-501',
      incidentId: 'inc-01',
      category: 'Fuel & Energy',
      type: 'Mobile Generator',
      name: 'CAT 250kVA Silent Diesel Generator',
      location: 'Dhaka Central Depot',
      coords: [90.43, 23.79],
      status: 'DEPLOYED',
      capacity: '250 kW',
      capacityNum: 250,
      assignedTo: 'Mirpur Relief Shelter Grid',
      fuelOrStockPct: 62,
      condition: 'Good',
      operator: 'DESCO Emergency Response',
      depot: 'Tejgaon Power Yard',
      lastUpdated: '12 mins ago'
    },
    {
      id: 'C-601',
      incidentId: 'inc-01',
      category: 'Communication Equipment',
      type: 'Satellite Uplink',
      name: 'Inmarsat BGAN Global Terminal',
      location: 'Dhaka Emergency HQ',
      coords: [90.40, 23.82],
      status: 'AVAILABLE',
      capacity: '320 Mbps Mesh',
      capacityNum: 320,
      assignedTo: '—',
      fuelOrStockPct: 98,
      condition: 'Excellent',
      operator: 'National Disaster Telecom',
      depot: 'Disaster Management HQ',
      lastUpdated: '50 mins ago'
    }
  ],
  facilities: [
    {
      id: 'FAC-01',
      incidentId: 'inc-01',
      name: 'Dhaka Central Logistics Depot',
      type: 'Supply Depot',
      location: 'Tejgaon, Dhaka',
      coords: [90.40, 23.76],
      status: 'OPERATIONAL',
      capacityPct: 78,
      currentStock: '340 tons supplies / 85 vehicles',
      incomingShipments: 4,
      outgoingShipments: 8,
      alerts: 'Operating 24/7 uninterrupted power'
    },
    {
      id: 'FAC-02',
      incidentId: 'inc-01',
      name: 'Sylhet Air Base Forward Hub',
      type: 'Air Base',
      location: 'Osmani Airport Complex',
      coords: [91.87, 24.96],
      status: 'LIMITED CAPACITY',
      capacityPct: 94,
      currentStock: '45 tons emergency medical / rations',
      incomingShipments: 3,
      outgoingShipments: 5,
      alerts: 'Apron space restricted due to taxiway water accumulation'
    },
    {
      id: 'FAC-03',
      incidentId: 'inc-01',
      name: 'Chittagong Port Supply Terminal',
      type: 'Port',
      location: 'Patenga, Chittagong',
      coords: [91.81, 22.25],
      status: 'OPERATIONAL',
      capacityPct: 84,
      currentStock: '1,200 tons maritime cargo / RO water units',
      incomingShipments: 6,
      outgoingShipments: 3,
      alerts: 'Maritime docking open for shallow draft ships'
    },
    {
      id: 'FAC-04',
      incidentId: 'inc-01',
      name: 'Cox’s Bazar Logistics Base',
      type: 'Supply Depot',
      location: 'Southern Highway Corridor',
      coords: [91.98, 21.43],
      status: 'OPERATIONAL',
      capacityPct: 62,
      currentStock: '180 tons rations / 200 shelter kits',
      incomingShipments: 1,
      outgoingShipments: 2,
      alerts: 'Nominal operational status'
    },
    {
      id: 'FAC-05',
      incidentId: 'inc-01',
      name: 'Barisal Marine Station',
      type: 'Port',
      location: 'Kirtankhola River Pier',
      coords: [90.35, 22.70],
      status: 'OPERATIONAL',
      capacityPct: 70,
      currentStock: '32 patrol boats / 4 barges',
      incomingShipments: 2,
      outgoingShipments: 4,
      alerts: 'High tide alert in effect'
    }
  ],
  personnel: [
    {
      id: 'PER-01',
      incidentId: 'inc-01',
      name: 'Dr. Farhana Ahmed',
      role: 'Chief Medical Officer',
      specialization: 'Medical',
      location: 'Sylhet Field Hospital Hub',
      coords: [91.87, 24.89],
      status: 'DEPLOYED',
      assignment: 'Field Triage Directive Alpha',
      contact: '+880-171-554433'
    },
    {
      id: 'PER-02',
      incidentId: 'inc-01',
      name: 'Capt. Tariq Rahman',
      role: 'Water Rescue Commander',
      specialization: 'Rescue',
      location: 'Dhaka North Riverfront',
      coords: [90.38, 23.88],
      status: 'DEPLOYED',
      assignment: 'Team R-01 Boat Ops',
      contact: '+880-181-223344'
    },
    {
      id: 'PER-03',
      incidentId: 'inc-01',
      name: 'Eng. Farhana Shireen',
      role: 'Senior Civil Engineer',
      specialization: 'Engineering',
      location: 'Padma Embankment Sector 4',
      coords: [90.25, 23.50],
      status: 'DEPLOYED',
      assignment: 'Dyke Structural Inspection',
      contact: '+880-191-887766'
    },
    {
      id: 'PER-04',
      incidentId: 'inc-01',
      name: 'Lieut. Hasan Ali',
      role: 'Logistics Fleet Officer',
      specialization: 'Logistics',
      location: 'Chittagong Depot',
      coords: [91.81, 22.34],
      status: 'AVAILABLE',
      assignment: 'Convoy Coordination',
      contact: '+880-161-990011'
    },
    {
      id: 'PER-05',
      incidentId: 'inc-01',
      name: 'Flight Lt. S. Kabir',
      role: 'UAV Recon Specialist',
      specialization: 'Communications',
      location: 'Dhaka Emergency HQ',
      coords: [90.41, 23.81],
      status: 'AVAILABLE',
      assignment: 'Mesh Comms Monitoring',
      contact: '+880-171-112299'
    }
  ],
  shipments: [
    {
      id: 'SH-021',
      incidentId: 'inc-01',
      origin: 'Dhaka Central Depot',
      destination: 'Sylhet Air Base',
      contents: 'IV Saline & Antibiotics (4 tons)',
      quantity: '4 Tons',
      status: 'IN TRANSIT',
      eta: '1h 15m',
      progressPct: 65,
      transportMode: 'Air',
      assignedVehicle: 'Mi-17 Cargo 02',
      path: [
        [90.40, 23.76],
        [91.10, 24.30],
        [91.87, 24.96]
      ]
    },
    {
      id: 'SH-022',
      incidentId: 'inc-01',
      origin: 'Chittagong Port',
      destination: 'Dhaka Central Depot',
      contents: 'Imported Water Filtration Membranes (18 Pallets)',
      quantity: '18 Pallets',
      status: 'DELAYED',
      eta: '4h 30m (Highway waterlogged)',
      progressPct: 35,
      transportMode: 'Road',
      assignedVehicle: 'Heavy Freight Convoy Alpha',
      path: [
        [91.81, 22.25],
        [91.10, 23.00],
        [90.40, 23.76]
      ]
    },
    {
      id: 'SH-023',
      incidentId: 'inc-01',
      origin: 'Cox’s Bazar Depot',
      destination: 'Barisal Naval Pier',
      contents: 'Temporary Shelter HexTents (200 Units)',
      quantity: '200 Units',
      status: 'PREPARING',
      eta: '6h 00m',
      progressPct: 10,
      transportMode: 'Sea',
      assignedVehicle: 'Coastal Barge Sagarika',
      path: [
        [91.98, 21.43],
        [91.20, 21.80],
        [90.35, 22.70]
      ]
    },
    {
      id: 'SH-024',
      incidentId: 'inc-01',
      origin: 'Rajshahi Depot',
      destination: 'Mymensingh Relief Center',
      contents: 'Geotextile Sandbags & Shovels (10 Tons)',
      quantity: '10 Tons',
      status: 'ARRIVED',
      eta: 'Arrived at 13:45 UTC',
      progressPct: 100,
      transportMode: 'Road',
      assignedVehicle: 'Truck Unit 42',
      path: [
        [88.60, 24.37],
        [89.50, 24.55],
        [90.40, 24.75]
      ]
    }
  ],
  requests: [
    {
      id: 'REQ-101',
      incidentId: 'inc-01',
      resourceType: 'Medical Supplies (Cholera Kits)',
      category: 'Medical Supplies',
      quantity: 20,
      requestedBy: 'Sylhet Civil Field Hospital',
      destination: 'Sylhet MC College Relief Camp',
      priority: 'CRITICAL',
      status: 'PENDING',
      requiredBy: 'Immediate',
      reason: 'Outbreak reported in waterlogged camp zones',
      created: '15 mins ago'
    },
    {
      id: 'REQ-102',
      incidentId: 'inc-01',
      resourceType: 'Rescue Boats (Zodiac Inflatable)',
      category: 'Boats',
      quantity: 4,
      requestedBy: 'Capt. Tariq Rahman (R-01)',
      destination: 'Uttara Riverside Sector 4',
      priority: 'HIGH',
      status: 'APPROVED',
      requiredBy: 'Within 2 hours',
      reason: 'Water levels rising rapidly on riverbank dwellings',
      created: '35 mins ago'
    },
    {
      id: 'REQ-103',
      incidentId: 'inc-01',
      resourceType: 'Heavy Water Pumps (10,000 L/min)',
      category: 'Search & Rescue Equipment',
      quantity: 6,
      requestedBy: 'Dhaka Water Board (WASA)',
      destination: 'Buriganga Sluice Gate 2',
      priority: 'MEDIUM',
      status: 'PENDING',
      requiredBy: 'Evening shift',
      reason: 'Drainage channel backflow prevention',
      created: '1 hour ago'
    },
    {
      id: 'REQ-104',
      incidentId: 'inc-01',
      resourceType: 'High-Calorie Emergency Rations',
      category: 'Food & Water',
      quantity: 50,
      requestedBy: 'Red Crescent Chittagong',
      destination: 'Chittagong Coastal Shelters',
      priority: 'MEDIUM',
      status: 'ALLOCATED',
      requiredBy: 'Today',
      reason: 'Replenishing exhausted staging stocks',
      created: '2 hours ago'
    }
  ],
  operations: [
    {
      id: 'op-01',
      incidentId: 'inc-01',
      time: '14:30',
      title: 'Helicopter H-001 → Sylhet',
      location: 'Sylhet Flood Zone',
      resourceId: 'H-001',
      resourceName: 'Airbus H145 (H-001)',
      type: 'DEPLOYMENT',
      targetETA: '15:15 UTC',
      status: 'SCHEDULED',
      coords: [91.87, 24.89]
    },
    {
      id: 'op-02',
      incidentId: 'inc-01',
      time: '15:00',
      title: 'Medical Supplies → Dhaka',
      location: 'Dhaka Central Hub',
      resourceId: 'M-202',
      resourceName: 'Trauma Surgery Kit (M-202)',
      type: 'DELIVERY',
      targetETA: '15:45 UTC',
      status: 'SCHEDULED',
      coords: [90.41, 23.77]
    },
    {
      id: 'op-03',
      incidentId: 'inc-01',
      time: '16:30',
      title: 'Rescue Boat B-003 → Barisal',
      location: 'Barisal Lowlands',
      resourceId: 'B-003',
      resourceName: 'Catamaran Shuttle (B-003)',
      type: 'DEPLOYMENT',
      targetETA: '17:00 UTC',
      status: 'SCHEDULED',
      coords: [90.35, 22.70]
    },
    {
      id: 'op-04',
      incidentId: 'inc-01',
      time: '17:15',
      title: 'Food Supplies → Chittagong',
      location: 'Chittagong Relief Camp',
      resourceId: 'F-301',
      resourceName: 'RO Water Unit (F-301)',
      type: 'DELIVERY',
      targetETA: '18:00 UTC',
      status: 'SCHEDULED',
      coords: [91.81, 22.34]
    },
    {
      id: 'op-05',
      incidentId: 'inc-01',
      time: '18:00',
      title: 'Ground Convoy V-101 → Sylhet',
      location: 'Sylhet Airhead',
      resourceId: 'V-101',
      resourceName: 'Heavy 6x6 Truck (V-101)',
      type: 'DELIVERY',
      targetETA: '21:30 UTC',
      status: 'SCHEDULED',
      coords: [91.86, 24.96]
    }
  ]
};

// -------------------------------------------------------------
// 2. CYCLONE MAREX — BAY OF BENGAL / ODISHA / COASTAL ARC
// -------------------------------------------------------------
export const cycloneResourceData: HazardResourcePackage = {
  hazardId: 'inc-03',
  hazardType: 'cyclone',
  hazardName: 'Cyclone Marex',
  locationName: 'Bay of Bengal Coastal Sector',
  theatreName: 'Bay of Bengal & Coastal Arc',
  center: [88.5, 20.2],
  defaultZoom: 1.05,
  mapMetadata: {
    bbox: {
      minLng: 84.5,
      maxLng: 93.5,
      minLat: 17.5,
      maxLat: 23.5
    },
    territoryPath:
      'M 120,180 Q 280,240 420,290 Q 560,320 680,260 Q 780,200 890,260 L 890,620 L 120,620 Z',
    waterwayPaths: [
      'M 200,450 Q 450,420 750,470',
      'M 350,520 Q 550,480 820,530'
    ],
    surroundingLabels: [
      { text: 'ODISHA / WB COAST', x: 200, y: 160, size: 18, tracking: 4 },
      { text: 'BANGLADESH COAST', x: 680, y: 180, size: 18, tracking: 4 },
      { text: 'BAY OF BENGAL (VORTEX)', x: 440, y: 460, size: 22, tracking: 6 }
    ],
    cities: [
      { name: 'Bhubaneswar', coords: [85.82, 20.30] },
      { name: 'Paradip Port', coords: [86.61, 20.26], isCapital: true },
      { name: 'Puri', coords: [85.83, 19.80] },
      { name: 'Balasore', coords: [86.92, 21.49] },
      { name: 'Digha', coords: [87.51, 21.62] },
      { name: 'Chittagong', coords: [91.83, 22.35] },
      { name: 'Cox’s Bazar', coords: [91.98, 21.43] }
    ]
  },
  metrics: {
    totalAssets: 480,
    available: 345,
    deployed: 105,
    inMaintenance: 30,
    requested: 28,
    readinessRate: 89,
    utilizationRate: 81
  },
  categoryCounts: {
    'All Resources': 480,
    'Helicopters': 32,
    'Boats': 64,
    'Ground Vehicles': 95,
    'Medical Supplies': 70,
    'Food & Water': 90,
    'Temporary Shelters': 60,
    'Fuel & Energy': 40,
    'Communication Equipment': 18,
    'Search & Rescue Equipment': 11
  },
  resources: [
    {
      id: 'H-C01',
      incidentId: 'inc-03',
      category: 'Helicopters',
      type: 'Helicopter',
      name: 'Westland Sea King Marine SAR',
      location: 'Paradip Airhead',
      coords: [86.61, 20.26],
      status: 'AVAILABLE',
      capacity: '20 personnel',
      capacityNum: 20,
      assignedTo: '—',
      fuelOrStockPct: 90,
      condition: 'Excellent',
      hoursOperated: 84,
      operator: 'Coast Guard Air Squadron',
      depot: 'Paradip Helipad',
      lastUpdated: '4 mins ago'
    },
    {
      id: 'H-C02',
      incidentId: 'inc-03',
      category: 'Helicopters',
      type: 'Helicopter',
      name: 'HAL Dhruv Marine Recon',
      location: 'Bhubaneswar Air Base',
      coords: [85.82, 20.30],
      status: 'DEPLOYED',
      capacity: '12 personnel',
      capacityNum: 12,
      assignedTo: 'Eye-of-Storm Recon Flight 2',
      fuelOrStockPct: 72,
      condition: 'Good',
      hoursOperated: 210,
      operator: 'Naval Aviation Command',
      depot: 'Bhubaneswar FOB',
      lastUpdated: '11 mins ago'
    },
    {
      id: 'B-C01',
      incidentId: 'inc-03',
      category: 'Boats',
      type: 'Rescue Boat',
      name: 'Offshore Patrol Vessel Rani',
      location: 'Bay of Bengal Deepwater Sector',
      coords: [88.20, 19.80],
      status: 'DEPLOYED',
      capacity: '60 evacuees',
      capacityNum: 60,
      assignedTo: 'Maritime Evacuation Task Force',
      fuelOrStockPct: 68,
      condition: 'Good',
      hoursOperated: 340,
      operator: 'Indian Coast Guard Fleet',
      depot: 'Paradip Naval Dock',
      lastUpdated: '1 min ago'
    },
    {
      id: 'B-C02',
      incidentId: 'inc-03',
      category: 'Boats',
      type: 'Rescue Boat',
      name: 'High-Speed Surf Rescue Skiff',
      location: 'Puri Beachhead',
      coords: [85.83, 19.80],
      status: 'AVAILABLE',
      capacity: '8 personnel',
      capacityNum: 8,
      assignedTo: '—',
      fuelOrStockPct: 95,
      condition: 'Excellent',
      hoursOperated: 20,
      operator: 'Coastal Lifeguard Corps',
      depot: 'Puri Lifeboat Station',
      lastUpdated: '14 mins ago'
    },
    {
      id: 'B-C03',
      incidentId: 'inc-03',
      category: 'Boats',
      type: 'Rescue Boat',
      name: 'Amphibious Air-Cushion Hovercraft',
      location: 'Balasore Estuary',
      coords: [86.92, 21.49],
      status: 'EN ROUTE',
      capacity: '24 personnel',
      capacityNum: 24,
      assignedTo: 'Mudflat Extraction Mission',
      fuelOrStockPct: 82,
      condition: 'Excellent',
      hoursOperated: 65,
      operator: 'Naval Hover Wing',
      depot: 'Chandipur Marine Yard',
      lastUpdated: '6 mins ago'
    },
    {
      id: 'V-C01',
      incidentId: 'inc-03',
      category: 'Ground Vehicles',
      type: 'Supply Truck',
      name: 'All-Terrain Sandbag Carrier 8x8',
      location: 'Digha Coastal Road',
      coords: [87.51, 21.62],
      status: 'DEPLOYED',
      capacity: '12 tons sandbags',
      capacityNum: 12,
      assignedTo: 'Seawall Reinforcement Unit',
      fuelOrStockPct: 76,
      condition: 'Good',
      hoursOperated: 180,
      operator: 'Disaster Rapid Action Force',
      depot: 'Digha Works Yard',
      lastUpdated: '18 mins ago'
    },
    {
      id: 'M-C01',
      incidentId: 'inc-03',
      category: 'Medical Supplies',
      type: 'Medical Pod',
      name: 'Severe Storm Trauma Resuscitation Kit',
      location: 'Paradip Port Staging',
      coords: [86.63, 20.25],
      status: 'AVAILABLE',
      capacity: '400 patients',
      capacityNum: 400,
      assignedTo: '—',
      fuelOrStockPct: 94,
      condition: 'Excellent',
      operator: 'State Health Disaster Cell',
      depot: 'Paradip Port Warehouse',
      lastUpdated: '22 mins ago'
    },
    {
      id: 'S-C01',
      incidentId: 'inc-03',
      category: 'Temporary Shelters',
      type: 'Shelter Kit',
      name: 'Cyclone Resilient High-Plinth Bunkers',
      location: 'Puri Coastal Sector',
      coords: [85.80, 19.82],
      status: 'AVAILABLE',
      capacity: '1,200 evacuees',
      capacityNum: 1200,
      assignedTo: '—',
      fuelOrStockPct: 90,
      condition: 'Excellent',
      operator: 'Red Cross Cyclone Preparedness',
      depot: 'Puri Shelter Hub',
      lastUpdated: '40 mins ago'
    }
  ],
  facilities: [
    {
      id: 'FAC-C1',
      incidentId: 'inc-03',
      name: 'Paradip Maritime Logistics Terminal',
      type: 'Port',
      location: 'Paradip Sea Port',
      coords: [86.61, 20.26],
      status: 'OPERATIONAL',
      capacityPct: 88,
      currentStock: '650 tons emergency food / heavy tarps',
      incomingShipments: 5,
      outgoingShipments: 6,
      alerts: 'Wind gusts exceeding 95 km/h at outer pier'
    },
    {
      id: 'FAC-C2',
      incidentId: 'inc-03',
      name: 'Bhubaneswar Central Staging Base',
      type: 'Air Base',
      location: 'Bhubaneswar Military Airhead',
      coords: [85.82, 20.30],
      status: 'OPERATIONAL',
      capacityPct: 72,
      currentStock: '320 tons air-droppable rations',
      incomingShipments: 4,
      outgoingShipments: 7,
      alerts: 'All rotary aircraft fueled and tied down on alert'
    },
    {
      id: 'FAC-C3',
      incidentId: 'inc-03',
      name: 'Cox’s Bazar Maritime Bunker Base',
      type: 'Port',
      location: 'Cox’s Bazar Coastal Staging',
      coords: [91.98, 21.43],
      status: 'SURGE CAPACITY',
      capacityPct: 96,
      currentStock: '400 tons supplies / 20 rescue skiffs',
      incomingShipments: 2,
      outgoingShipments: 4,
      alerts: 'Tidal surge approaching seawall safety threshold'
    }
  ],
  personnel: [
    {
      id: 'PER-C1',
      incidentId: 'inc-03',
      name: 'Cmdr. Rajesh Varma',
      role: 'Maritime Search & Rescue Chief',
      specialization: 'Rescue',
      location: 'Paradip Port Staging',
      coords: [86.61, 20.26],
      status: 'DEPLOYED',
      assignment: 'Coastal Evacuation Convoy',
      contact: '+91-984-550112'
    },
    {
      id: 'PER-C2',
      incidentId: 'inc-03',
      name: 'Dr. Ananya Roy',
      role: 'Emergency Trauma Surgeon',
      specialization: 'Medical',
      location: 'Bhubaneswar Airhead Clinic',
      coords: [85.82, 20.30],
      status: 'AVAILABLE',
      assignment: 'Medevac Triage Standby',
      contact: '+91-987-112233'
    },
    {
      id: 'PER-C3',
      incidentId: 'inc-03',
      name: 'Lieut. C. Mohapatra',
      role: 'Hovercraft Division Leader',
      specialization: 'Logistics',
      location: 'Balasore Estuary',
      coords: [86.92, 21.49],
      status: 'DEPLOYED',
      assignment: 'Intertidal Evacuation',
      contact: '+91-943-778899'
    }
  ],
  shipments: [
    {
      id: 'SH-C1',
      incidentId: 'inc-03',
      origin: 'Bhubaneswar Central Staging',
      destination: 'Paradip Maritime Terminal',
      contents: 'Emergency Coastal Ration Packs (8 Tons)',
      quantity: '8 Tons',
      status: 'IN TRANSIT',
      eta: '45 mins',
      progressPct: 70,
      transportMode: 'Air',
      assignedVehicle: 'Sea King Cargo Alpha',
      path: [
        [85.82, 20.30],
        [86.20, 20.28],
        [86.61, 20.26]
      ]
    },
    {
      id: 'SH-C2',
      incidentId: 'inc-03',
      origin: 'Paradip Port',
      destination: 'Puri Beachhead',
      contents: 'Storm Surge Sandbags & Shoring Timber',
      quantity: '25 Tons',
      status: 'IN TRANSIT',
      eta: '2h 15m',
      progressPct: 40,
      transportMode: 'Sea',
      assignedVehicle: 'Barge Varuna',
      path: [
        [86.61, 20.26],
        [86.20, 20.00],
        [85.83, 19.80]
      ]
    }
  ],
  requests: [
    {
      id: 'REQ-C1',
      incidentId: 'inc-03',
      resourceType: 'High-Powered Marine Tugboats',
      category: 'Boats',
      quantity: 4,
      requestedBy: 'Paradip Harbour Master',
      destination: 'Paradip Outer Anchorage',
      priority: 'CRITICAL',
      status: 'PENDING',
      requiredBy: 'Immediate',
      reason: 'Secure drifting commercial barges in rough seas',
      created: '20 mins ago'
    },
    {
      id: 'REQ-C2',
      incidentId: 'inc-03',
      resourceType: 'Mobile Diesel Generators (100 kW)',
      category: 'Fuel & Energy',
      quantity: 12,
      requestedBy: 'Puri District Collector',
      destination: 'Puri Coastal Multi-Purpose Shelters',
      priority: 'HIGH',
      status: 'APPROVED',
      requiredBy: 'Within 3 hours',
      reason: 'Grid failure expected upon cyclone landfall',
      created: '55 mins ago'
    }
  ],
  operations: [
    {
      id: 'op-c1',
      incidentId: 'inc-03',
      time: '15:30',
      title: 'Helicopter H-C01 → Outer Anchor',
      location: 'Bay of Bengal Deepwater',
      resourceId: 'H-C01',
      resourceName: 'Sea King SAR (H-C01)',
      type: 'DEPLOYMENT',
      targetETA: '16:15 UTC',
      status: 'SCHEDULED',
      coords: [88.20, 19.80]
    },
    {
      id: 'op-c2',
      incidentId: 'inc-03',
      time: '17:00',
      title: 'Medical Pod M-C01 → Puri',
      location: 'Puri Shelter Hub',
      resourceId: 'M-C01',
      resourceName: 'Trauma Resuscitation Pod (M-C01)',
      type: 'DELIVERY',
      targetETA: '18:15 UTC',
      status: 'SCHEDULED',
      coords: [85.80, 19.82]
    }
  ]
};

// -------------------------------------------------------------
// 3. CANADA — WILDFIRE COMPLEX OUTBREAK (British Columbia)
// -------------------------------------------------------------
export const wildfireResourceData: HazardResourcePackage = {
  hazardId: 'inc-04',
  hazardType: 'wildfire',
  hazardName: 'Wildfire Complex Outbreak',
  locationName: 'British Columbia Wildfire Operations',
  theatreName: 'British Columbia / Canadian West',
  center: [-120.0, 51.5],
  defaultZoom: 1.05,
  mapMetadata: {
    bbox: {
      minLng: -123.5,
      maxLng: -116.5,
      minLat: 48.5,
      maxLat: 54.5
    },
    territoryPath:
      'M 180,60 Q 350,110 520,70 Q 720,120 840,90 L 820,580 Q 640,540 460,570 Q 280,530 160,560 Z',
    waterwayPaths: [
      'M 280,180 Q 360,340 410,520',
      'M 540,240 Q 560,390 580,510'
    ],
    surroundingLabels: [
      { text: 'PACIFIC OCEAN (WEST)', x: 120, y: 320, size: 16, tracking: 4 },
      { text: 'CANADIAN ROCKIES', x: 740, y: 240, size: 18, tracking: 4 },
      { text: 'USA (WASHINGTON)', x: 420, y: 620, size: 16, tracking: 6 }
    ],
    cities: [
      { name: 'Kamloops', coords: [-120.33, 50.67], isCapital: true },
      { name: 'Kelowna', coords: [-119.49, 49.88] },
      { name: 'Prince George', coords: [-122.75, 53.91] },
      { name: 'Penticton', coords: [-119.59, 49.49] },
      { name: 'Vernon', coords: [-119.27, 50.26] },
      { name: 'Williams Lake', coords: [-122.14, 52.13] }
    ]
  },
  metrics: {
    totalAssets: 340,
    available: 265,
    deployed: 62,
    inMaintenance: 13,
    requested: 18,
    readinessRate: 91,
    utilizationRate: 70
  },
  categoryCounts: {
    'All Resources': 340,
    'Helicopters': 35,
    'Boats': 6,
    'Ground Vehicles': 140,
    'Medical Supplies': 42,
    'Food & Water': 48,
    'Temporary Shelters': 30,
    'Fuel & Energy': 22,
    'Communication Equipment': 12,
    'Search & Rescue Equipment': 5
  },
  resources: [
    {
      id: 'H-W01',
      incidentId: 'inc-04',
      category: 'Helicopters',
      type: 'Water Bomber',
      name: 'Canadair CL-415 Super Scooper',
      location: 'Kamloops Air Tanker Base',
      coords: [-120.44, 50.70],
      status: 'AVAILABLE',
      capacity: '6,137 Liters water/drop',
      capacityNum: 6137,
      assignedTo: '—',
      fuelOrStockPct: 92,
      condition: 'Excellent',
      hoursOperated: 112,
      operator: 'BC Wildfire Service Air Attack',
      depot: 'Kamloops Tanker Hangar 2',
      lastUpdated: '8 mins ago'
    },
    {
      id: 'H-W02',
      incidentId: 'inc-04',
      category: 'Helicopters',
      type: 'Helicopter',
      name: 'Sikorsky S-64 Skycrane Aircrane',
      location: 'Kelowna Helitack Hub',
      coords: [-119.38, 49.96],
      status: 'DEPLOYED',
      capacity: '9,000 Liters retardant',
      capacityNum: 9000,
      assignedTo: 'McDougall Creek Flank Drop',
      fuelOrStockPct: 60,
      condition: 'Good',
      hoursOperated: 245,
      operator: 'Erickson Helitack Squadron',
      depot: 'Kelowna Airport Ramp',
      lastUpdated: '3 mins ago'
    },
    {
      id: 'V-W01',
      incidentId: 'inc-04',
      category: 'Ground Vehicles',
      type: 'Wildland Pumper',
      name: 'Freightliner 4x4 Tactical Fire Engine',
      location: 'Penticton Perimeter Post',
      coords: [-119.59, 49.49],
      status: 'DEPLOYED',
      capacity: '3,000 L tank + Foam',
      capacityNum: 3000,
      assignedTo: 'Structure Protection Sector 2',
      fuelOrStockPct: 78,
      condition: 'Good',
      hoursOperated: 320,
      operator: 'Okanagan Structural Fire Dept',
      depot: 'Penticton Fire Hall 1',
      lastUpdated: '15 mins ago'
    },
    {
      id: 'V-W02',
      incidentId: 'inc-04',
      category: 'Ground Vehicles',
      type: 'Heavy Equipment',
      name: 'CAT D8T Firebreak Bulldozer',
      location: 'Williams Lake Forward Staging',
      coords: [-122.14, 52.13],
      status: 'AVAILABLE',
      capacity: 'Firebreak cutting / clearing',
      assignedTo: '—',
      fuelOrStockPct: 88,
      condition: 'Excellent',
      hoursOperated: 95,
      operator: 'Forestry Heavy Machinery Unit',
      depot: 'Cariboo Machinery Yard',
      lastUpdated: '25 mins ago'
    },
    {
      id: 'M-W01',
      incidentId: 'inc-04',
      category: 'Medical Supplies',
      type: 'Medical Pod',
      name: 'Wildfire Smoke Inhalation & Burn Triage Pod',
      location: 'Kamloops Incident Base',
      coords: [-120.33, 50.67],
      status: 'AVAILABLE',
      capacity: '350 firefighters/civilians',
      capacityNum: 350,
      assignedTo: '—',
      fuelOrStockPct: 96,
      condition: 'Excellent',
      operator: 'Interior Health Rapid Response',
      depot: 'Kamloops Hospital Stores',
      lastUpdated: '45 mins ago'
    },
    {
      id: 'S-W01',
      incidentId: 'inc-04',
      category: 'Temporary Shelters',
      type: 'Shelter Kit',
      name: 'Air-Filtered Evacuation Dome Encampment',
      location: 'Kelowna Fairgrounds',
      coords: [-119.45, 49.88],
      status: 'AVAILABLE',
      capacity: '800 displaced residents',
      capacityNum: 800,
      assignedTo: '—',
      fuelOrStockPct: 90,
      condition: 'Excellent',
      operator: 'Canadian Red Cross BC Branch',
      depot: 'Kelowna Arena Staging',
      lastUpdated: '30 mins ago'
    }
  ],
  facilities: [
    {
      id: 'FAC-W1',
      incidentId: 'inc-04',
      name: 'Kamloops Provincial Wildfire Coordination Centre',
      type: 'Command Center',
      location: 'Kamloops Airport Complex',
      coords: [-120.44, 50.70],
      status: 'OPERATIONAL',
      capacityPct: 82,
      currentStock: '45,000 Gallons Phos-Chek retardant / 120 crew gear',
      incomingShipments: 6,
      outgoingShipments: 8,
      alerts: 'Airspace NOTAM active: FL150 restricted over valley'
    },
    {
      id: 'FAC-W2',
      incidentId: 'inc-04',
      name: 'Kelowna Forward Fire Attack Base',
      type: 'Air Base',
      location: 'Kelowna International Tarmac',
      coords: [-119.38, 49.96],
      status: 'SURGE CAPACITY',
      capacityPct: 92,
      currentStock: '6 Helitack platforms / 8,000 Gal Jet-A',
      incomingShipments: 4,
      outgoingShipments: 6,
      alerts: 'Heavy smoke reducing VFR flight minimums'
    },
    {
      id: 'FAC-W3',
      incidentId: 'inc-04',
      name: 'Prince George Fire Operations Depot',
      type: 'Supply Depot',
      location: 'Northern Interceptor Yard',
      coords: [-122.75, 53.91],
      status: 'OPERATIONAL',
      capacityPct: 65,
      currentStock: '12 dozers / 40,000 ft wildland hose',
      incomingShipments: 2,
      outgoingShipments: 3,
      alerts: 'Nominal operational status'
    }
  ],
  personnel: [
    {
      id: 'PER-W1',
      incidentId: 'inc-04',
      name: 'Chief Mark Reynolds',
      role: 'Incident Commander - Air Operations',
      specialization: 'Command',
      location: 'Kamloops Provincial Coordination',
      coords: [-120.44, 50.70],
      status: 'DEPLOYED',
      assignment: 'Air Attack Tactical Direction',
      contact: '+1-250-555-0192'
    },
    {
      id: 'PER-W2',
      incidentId: 'inc-04',
      name: 'Sarah Jenkins',
      role: 'Unit Leader - Smokejumper Squad',
      specialization: 'Rescue',
      location: 'Kelowna Helitack Hub',
      coords: [-119.38, 49.96],
      status: 'DEPLOYED',
      assignment: 'High-Ridge Spot Fire Containment',
      contact: '+1-250-555-0144'
    },
    {
      id: 'PER-W3',
      incidentId: 'inc-04',
      name: 'Dr. Christine Beaulieu',
      role: 'Wildland Medical Director',
      specialization: 'Medical',
      location: 'Kamloops Incident Base',
      coords: [-120.33, 50.67],
      status: 'AVAILABLE',
      assignment: 'Fireline Health & Inhalation Monitoring',
      contact: '+1-250-555-0188'
    }
  ],
  shipments: [
    {
      id: 'SH-W1',
      incidentId: 'inc-04',
      origin: 'Prince George Depot',
      destination: 'Kamloops Provincial Coordination',
      contents: 'High-Expansion Firefighting Foam Concentrate (15 Tons)',
      quantity: '15 Tons',
      status: 'IN TRANSIT',
      eta: '2h 10m',
      progressPct: 60,
      transportMode: 'Road',
      assignedVehicle: 'Northern Transport Freight 09',
      path: [
        [-122.75, 53.91],
        [-121.50, 52.30],
        [-120.44, 50.70]
      ]
    },
    {
      id: 'SH-W2',
      incidentId: 'inc-04',
      origin: 'Kamloops Tanker Base',
      destination: 'Kelowna Forward Base',
      contents: 'Aviation Jet-A Fuel & Retardant Mixer Kits',
      quantity: '8,000 Gallons',
      status: 'IN TRANSIT',
      eta: '1h 05m',
      progressPct: 75,
      transportMode: 'Road',
      assignedVehicle: 'Fuel Tanker Unit B-3',
      path: [
        [-120.44, 50.70],
        [-119.80, 50.25],
        [-119.38, 49.96]
      ]
    }
  ],
  requests: [
    {
      id: 'REQ-W1',
      incidentId: 'inc-04',
      resourceType: 'Heavy Type-1 Wildland Fire Crews',
      category: 'Search & Rescue Equipment',
      quantity: 4,
      requestedBy: 'Kelowna Incident Operations',
      destination: 'West Kelowna Hillside Line',
      priority: 'CRITICAL',
      status: 'PENDING',
      requiredBy: 'Immediate',
      reason: 'Protect critical water treatment plant from oncoming flank',
      created: '10 mins ago'
    },
    {
      id: 'REQ-W2',
      incidentId: 'inc-04',
      resourceType: 'High-Volume Portable Water Pumps (500 GPM)',
      category: 'Search & Rescue Equipment',
      quantity: 12,
      requestedBy: 'Penticton Perimeter Post',
      destination: 'Skaha Lake Shoreline Setup',
      priority: 'HIGH',
      status: 'APPROVED',
      requiredBy: 'Within 2 hours',
      reason: 'Drafting lake water into structure protection sprinklers',
      created: '40 mins ago'
    }
  ],
  operations: [
    {
      id: 'op-w1',
      incidentId: 'inc-04',
      time: '14:45',
      title: 'Water Bomber H-W01 → Okanagan Lake',
      location: 'Okanagan Water Scoop Line',
      resourceId: 'H-W01',
      resourceName: 'CL-415 Water Bomber (H-W01)',
      type: 'DEPLOYMENT',
      targetETA: '15:20 UTC',
      status: 'SCHEDULED',
      coords: [-119.49, 49.88]
    },
    {
      id: 'op-w2',
      incidentId: 'inc-04',
      time: '16:00',
      title: 'Bulldozer V-W02 → West Ridge',
      location: 'Williams Lake Ridge',
      resourceId: 'V-W02',
      resourceName: 'CAT D8T Bulldozer (V-W02)',
      type: 'DEPLOYMENT',
      targetETA: '16:45 UTC',
      status: 'SCHEDULED',
      coords: [-122.14, 52.13]
    }
  ]
};

// -------------------------------------------------------------
// 4. JAPAN — NOTO PENINSULA SEISMIC SWARM (Ishikawa)
// -------------------------------------------------------------
export const earthquakeResourceData: HazardResourcePackage = {
  hazardId: 'inc-06',
  hazardType: 'earthquake',
  hazardName: 'Noto Peninsula Seismic Swarm',
  locationName: 'Japan Earthquake Response',
  theatreName: 'Ishikawa - Noto Peninsula',
  center: [136.95, 37.15],
  defaultZoom: 1.05,
  mapMetadata: {
    bbox: {
      minLng: 136.2,
      maxLng: 137.6,
      minLat: 36.3,
      maxLat: 37.6
    },
    territoryPath:
      'M 220,590 L 320,440 Q 380,320 460,240 Q 560,140 680,110 Q 760,150 780,240 Q 720,320 620,380 Q 560,450 540,580 Z',
    waterwayPaths: [
      'M 420,380 Q 540,320 660,260',
      'M 320,490 Q 420,470 510,540'
    ],
    surroundingLabels: [
      { text: 'SEA OF JAPAN (WEST)', x: 160, y: 280, size: 16, tracking: 4 },
      { text: 'TOYAMA BAY', x: 620, y: 410, size: 18, tracking: 4 },
      { text: 'HONSHU MAINLAND', x: 380, y: 620, size: 16, tracking: 6 }
    ],
    cities: [
      { name: 'Kanazawa', coords: [136.65, 36.57], isCapital: true },
      { name: 'Nanao', coords: [136.96, 37.04] },
      { name: 'Wajima', coords: [136.90, 37.40] },
      { name: 'Suzu', coords: [137.26, 37.44] },
      { name: 'Anamizu', coords: [136.90, 37.22] },
      { name: 'Toyama', coords: [137.21, 36.70] }
    ]
  },
  metrics: {
    totalAssets: 420,
    available: 290,
    deployed: 110,
    inMaintenance: 20,
    requested: 35,
    readinessRate: 86,
    utilizationRate: 83
  },
  categoryCounts: {
    'All Resources': 420,
    'Helicopters': 26,
    'Boats': 18,
    'Ground Vehicles': 160,
    'Medical Supplies': 65,
    'Food & Water': 75,
    'Temporary Shelters': 45,
    'Fuel & Energy': 16,
    'Communication Equipment': 10,
    'Search & Rescue Equipment': 5
  },
  resources: [
    {
      id: 'H-E01',
      incidentId: 'inc-06',
      category: 'Helicopters',
      type: 'Helicopter',
      name: 'JSDF UH-60J Black Hawk SAR',
      location: 'Kanazawa Air Base',
      coords: [136.65, 36.57],
      status: 'AVAILABLE',
      capacity: '14 personnel / Hoist rescue',
      capacityNum: 14,
      assignedTo: '—',
      fuelOrStockPct: 94,
      condition: 'Excellent',
      hoursOperated: 92,
      operator: 'Japan Air Self-Defense Force',
      depot: 'Komatsu Air Wing Hangar',
      lastUpdated: '2 mins ago'
    },
    {
      id: 'H-E02',
      incidentId: 'inc-06',
      category: 'Helicopters',
      type: 'Helicopter',
      name: 'Tokyo Fire Dept Hyper Rescue Super Puma',
      location: 'Nanao Heliport Hub',
      coords: [136.96, 37.04],
      status: 'DEPLOYED',
      capacity: '20 personnel',
      capacityNum: 20,
      assignedTo: 'Isolated Mountain Village Airlift',
      fuelOrStockPct: 68,
      condition: 'Good',
      hoursOperated: 280,
      operator: 'Tokyo Hyper Rescue Team',
      depot: 'Nanao Staging Ramp',
      lastUpdated: '7 mins ago'
    },
    {
      id: 'V-E01',
      incidentId: 'inc-06',
      category: 'Ground Vehicles',
      type: 'USAR Heavy Extrication',
      name: 'Hydraulic Shear & Shoring Rescue Vehicle',
      location: 'Wajima City Center',
      coords: [136.90, 37.40],
      status: 'DEPLOYED',
      capacity: 'Heavy structural extrication',
      assignedTo: 'Morning Market Collapse Search',
      fuelOrStockPct: 75,
      condition: 'Good',
      hoursOperated: 160,
      operator: 'National Police Agency USAR',
      depot: 'Wajima Forward Post',
      lastUpdated: '1 min ago'
    },
    {
      id: 'V-E02',
      incidentId: 'inc-06',
      category: 'Ground Vehicles',
      type: 'Ambulance',
      name: 'DMAT Mobile Intensive Care Ambulance',
      location: 'Suzu General Hospital Staging',
      coords: [137.26, 37.44],
      status: 'DEPLOYED',
      capacity: '4 ICU patients',
      capacityNum: 4,
      assignedTo: 'Crush Injury Triage Line',
      fuelOrStockPct: 82,
      condition: 'Good',
      hoursOperated: 190,
      operator: 'Japan Disaster Medical Assistance',
      depot: 'Suzu Field Hospital',
      lastUpdated: '12 mins ago'
    },
    {
      id: 'B-E01',
      incidentId: 'inc-06',
      category: 'Boats',
      type: 'Rescue Boat',
      name: 'JSDF Landing Craft Utility (LCU)',
      location: 'Nanao Pier 2',
      coords: [136.98, 37.05],
      status: 'AVAILABLE',
      capacity: '80 tons heavy machinery / supplies',
      capacityNum: 80,
      assignedTo: '—',
      fuelOrStockPct: 90,
      condition: 'Excellent',
      hoursOperated: 75,
      operator: 'Maritime Self-Defense Force',
      depot: 'Nanao Port Pier',
      lastUpdated: '20 mins ago'
    },
    {
      id: 'M-E01',
      incidentId: 'inc-06',
      category: 'Medical Supplies',
      type: 'Medical Pod',
      name: 'Crush Syndrome & Dialysis Field Unit',
      location: 'Anamizu Staging Clinic',
      coords: [136.90, 37.22],
      status: 'AVAILABLE',
      capacity: '200 dialysis treatments',
      capacityNum: 200,
      assignedTo: '—',
      fuelOrStockPct: 96,
      condition: 'Excellent',
      operator: 'Ministry Health Disaster Response',
      depot: 'Anamizu Relief Depot',
      lastUpdated: '35 mins ago'
    }
  ],
  facilities: [
    {
      id: 'FAC-E1',
      incidentId: 'inc-06',
      name: 'Kanazawa Prefectural Disaster Headquarters',
      type: 'Command Center',
      location: 'Ishikawa Prefectural Office',
      coords: [136.65, 36.57],
      status: 'OPERATIONAL',
      capacityPct: 80,
      currentStock: '95 tons survival supplies / 40 generators',
      incomingShipments: 8,
      outgoingShipments: 12,
      alerts: 'Operating on seismic-isolated emergency facility'
    },
    {
      id: 'FAC-E2',
      incidentId: 'inc-06',
      name: 'Wajima Civic Center Evacuation Complex',
      type: 'Shelter',
      location: 'Wajima City Core',
      coords: [136.90, 37.40],
      status: 'SURGE CAPACITY',
      capacityPct: 98,
      currentStock: '3,200 emergency meals / 800 thermal blankets',
      incomingShipments: 4,
      outgoingShipments: 2,
      alerts: 'Municipal water mains ruptured; relying on mobile purification'
    },
    {
      id: 'FAC-E3',
      incidentId: 'inc-06',
      name: 'Nanao Maritime Rescue Depot',
      type: 'Port',
      location: 'Nanao Commercial Port',
      coords: [136.96, 37.04],
      status: 'OPERATIONAL',
      capacityPct: 75,
      currentStock: '5 Landing crafts / 120 tons heavy shoring',
      incomingShipments: 5,
      outgoingShipments: 7,
      alerts: 'Deepwater berths intact following harbor bathymetry scan'
    }
  ],
  personnel: [
    {
      id: 'PER-E1',
      incidentId: 'inc-06',
      name: 'Commander Kenji Takahashi',
      role: 'Hyper Rescue Task Force Commander',
      specialization: 'Rescue',
      location: 'Wajima City Center',
      coords: [136.90, 37.40],
      status: 'DEPLOYED',
      assignment: 'Structural Collapse Search & Extrication',
      contact: '+81-90-5544-1122'
    },
    {
      id: 'PER-E2',
      incidentId: 'inc-06',
      name: 'Dr. Yoko Tanaka',
      role: 'DMAT Chief of Triage',
      specialization: 'Medical',
      location: 'Suzu General Hospital',
      coords: [137.26, 37.44],
      status: 'DEPLOYED',
      assignment: 'Crush Syndrome ICU Management',
      contact: '+81-90-8877-2233'
    },
    {
      id: 'PER-E3',
      incidentId: 'inc-06',
      name: 'Eng. Hiroshi Sato',
      role: 'Seismic Structural Safety Inspector',
      specialization: 'Engineering',
      location: 'Anamizu Staging Clinic',
      coords: [136.90, 37.22],
      status: 'AVAILABLE',
      assignment: 'Roadway & Tunnel Integrity Clearance',
      contact: '+81-90-1122-9988'
    }
  ],
  shipments: [
    {
      id: 'SH-E1',
      incidentId: 'inc-06',
      origin: 'Nanao Maritime Depot',
      destination: 'Wajima City Center',
      contents: 'Heavy Concrete Shoring Timbers & Hydraulic Spreaders',
      quantity: '18 Tons',
      status: 'IN TRANSIT',
      eta: '1h 20m',
      progressPct: 55,
      transportMode: 'Sea',
      assignedVehicle: 'JSDF Landing Craft 01',
      path: [
        [136.98, 37.05],
        [137.20, 37.35],
        [136.90, 37.40]
      ]
    },
    {
      id: 'SH-E2',
      incidentId: 'inc-06',
      origin: 'Kanazawa Headquarters',
      destination: 'Suzu General Hospital',
      contents: 'Emergency Blood Plasma & Dialysis Packs',
      quantity: '600 kg',
      status: 'IN TRANSIT',
      eta: '30 mins',
      progressPct: 80,
      transportMode: 'Air',
      assignedVehicle: 'JSDF UH-60J Sortie 4',
      path: [
        [136.65, 36.57],
        [136.95, 37.10],
        [137.26, 37.44]
      ]
    }
  ],
  requests: [
    {
      id: 'REQ-E1',
      incidentId: 'inc-06',
      resourceType: 'Heavy Hydraulic Concrete Crushers',
      category: 'Search & Rescue Equipment',
      quantity: 6,
      requestedBy: 'Wajima USAR Leader',
      destination: 'Wajima Central Market Collapse',
      priority: 'CRITICAL',
      status: 'PENDING',
      requiredBy: 'Immediate',
      reason: 'Reinforced concrete structures with confirmed acoustic signs of life',
      created: '8 mins ago'
    },
    {
      id: 'REQ-E2',
      incidentId: 'inc-06',
      resourceType: 'Emergency Water Desalination Trucks',
      category: 'Food & Water',
      quantity: 8,
      requestedBy: 'Suzu City Disaster Bureau',
      destination: 'Suzu Coastal Evacuation Shelters',
      priority: 'HIGH',
      status: 'APPROVED',
      requiredBy: 'Within 3 hours',
      reason: 'Drinking water municipal pipelines severed across 100% of peninsula',
      created: '45 mins ago'
    }
  ],
  operations: [
    {
      id: 'op-e1',
      incidentId: 'inc-06',
      time: '15:15',
      title: 'Helicopter H-E01 → Suzu Medevac',
      location: 'Suzu General Hospital',
      resourceId: 'H-E01',
      resourceName: 'UH-60J SAR (H-E01)',
      type: 'EVACUATION',
      targetETA: '15:50 UTC',
      status: 'SCHEDULED',
      coords: [137.26, 37.44]
    },
    {
      id: 'op-e2',
      incidentId: 'inc-06',
      time: '16:30',
      title: 'Landing Craft B-E01 → Wajima',
      location: 'Wajima Port Pier',
      resourceId: 'B-E01',
      resourceName: 'Landing Craft (B-E01)',
      type: 'DELIVERY',
      targetETA: '18:00 UTC',
      status: 'SCHEDULED',
      coords: [136.90, 37.40]
    }
  ]
};

// -------------------------------------------------------------
// 5. COMPOUND CASCADE — MULTI-HAZARD (Delta Confluence)
// -------------------------------------------------------------
export const multiHazardResourceData: HazardResourcePackage = {
  ...floodResourceData,
  hazardId: 'inc-08',
  hazardType: 'multi_hazard',
  hazardName: 'Cyclone-Flood Compound Disaster',
  locationName: 'Coastal & Delta Confluence Operations',
  theatreName: 'Southern Delta Joint Theatre',
  center: [90.5, 22.6],
  defaultZoom: 1.0,
  metrics: {
    totalAssets: 610,
    available: 420,
    deployed: 160,
    inMaintenance: 30,
    requested: 42,
    readinessRate: 88,
    utilizationRate: 85
  },
  categoryCounts: {
    'All Resources': 610,
    'Helicopters': 36,
    'Boats': 72,
    'Ground Vehicles': 150,
    'Medical Supplies': 110,
    'Food & Water': 120,
    'Temporary Shelters': 60,
    'Fuel & Energy': 34,
    'Communication Equipment': 18,
    'Search & Rescue Equipment': 10
  }
};

// -------------------------------------------------------------
// Master Database Mapping Dictionary
// -------------------------------------------------------------
export const resourceDatabase: Record<string, HazardResourcePackage> = {
  flood: floodResourceData,
  cyclone: cycloneResourceData,
  wildfire: wildfireResourceData,
  earthquake: earthquakeResourceData,
  multi_hazard: multiHazardResourceData,
  'multi-hazard': multiHazardResourceData
};
