import type {
  ResponsePriority,
  ResponseTeam,
  ResponseResource,
  UpcomingOperation,
  ShelterLocation,
  EvacuationRoute,
  TacticalMarker,
  ResponseStatistics,
  OptimizationResult
} from '../../types/response';

export interface HazardResponsePackage {
  hazardId: string;
  hazardName: string;
  locationName: string;
  center: [number, number]; // [lng, lat]
  bounds: [[number, number], [number, number]];
  statistics: ResponseStatistics;
  priorities: ResponsePriority[];
  teams: ResponseTeam[];
  resources: ResponseResource[];
  operations: UpcomingOperation[];
  shelters: ShelterLocation[];
  routes: EvacuationRoute[];
  markers: TacticalMarker[];
  optimizationProposal: OptimizationResult;
}

// 1. FLOOD RESPONSE PACKAGE (Primary Reference - Bangladesh)
export const floodResponseData: HazardResponsePackage = {
  hazardId: 'inc-001',
  hazardName: 'Severe Flooding',
  locationName: 'Bangladesh - Dhaka Division',
  center: [90.4125, 23.8103],
  bounds: [[88.0, 20.7], [92.6, 26.6]],
  statistics: {
    responseTeams: 12,
    personnelDeployed: 1248,
    activeOperations: 28,
    missionCompletion: 84,
    highPriorityAreas: 3,
    peopleReached: '3.2M',
    criticalActionsCount: 3
  },
  priorities: [
    {
      id: 'p-01',
      order: 1,
      title: 'Rescue Operations',
      status: 'CRITICAL',
      category: 'Rescue',
      location: 'Flooded areas - Dhaka Division',
      affected: '2.4M people affected',
      progress: 28,
      icon: 'lifebuoy',
      coords: [90.4125, 23.8103],
      actionRequired: 'Deploy 4 additional zodiac rescue units to inundated riverside zones',
      color: '#EF4444'
    },
    {
      id: 'p-02',
      order: 2,
      title: 'Medical Support',
      status: 'HIGH',
      category: 'Medical',
      location: '12 districts affected',
      facilitiesNeeded: '18 facilities needed',
      affected: '18 facilities needed across 12 districts',
      progress: 45,
      icon: 'cross',
      coords: [90.28, 24.12],
      actionRequired: 'Deliver water purification and cholera vaccines to Gazipur clinics',
      color: '#F59E0B'
    },
    {
      id: 'p-03',
      order: 3,
      title: 'Evacuation Coordination',
      status: 'HIGH',
      category: 'Evacuation',
      location: 'High-risk zones',
      affected: '850K people at risk',
      progress: 32,
      icon: 'arrow-right-circle',
      coords: [90.35, 23.65],
      actionRequired: 'Open North-South arterial highway corridor with flood barricades',
      color: '#F59E0B'
    },
    {
      id: 'p-04',
      order: 4,
      title: 'Infrastructure Assessment',
      status: 'MEDIUM',
      category: 'Engineering',
      location: 'Roads and bridges',
      routesCount: '37 critical routes',
      affected: '37 critical routes under structural inspection',
      progress: 68,
      icon: 'alert-triangle',
      coords: [90.45, 23.95],
      actionRequired: 'Reinforce embankment breaches along the Buriganga corridor',
      color: '#EAB308'
    },
    {
      id: 'p-05',
      order: 5,
      title: 'Shelter Management',
      status: 'MEDIUM',
      category: 'Logistics',
      location: 'Displaced population',
      sheltersCount: '12 shelters active',
      affected: '12 shelters active (84% capacity)',
      progress: 75,
      icon: 'home',
      coords: [90.52, 23.75],
      actionRequired: 'Re-route incoming evacuees to Mirpur Arena auxiliary shelters',
      color: '#10B981'
    }
  ],
  teams: [
    {
      id: 'team-01',
      code: 'R-01',
      name: 'Alpha Water Rescue',
      location: 'Dhaka North',
      sector: 'Zone 1 - Riverfront',
      coords: [90.39, 23.86],
      status: 'Active',
      progress: 65,
      leader: 'Capt. Tariq Rahman',
      personnel: 48,
      vehicle: '4x Zodiac Inflatables + 2x Amphibious Trucks',
      equipment: ['Thermal Scanners', 'Life Rafts', 'Satellite Comms'],
      mission: 'Evacuating stranded families in Uttara and Mirpur lowlands',
      eta: 'On Site',
      radioChannel: 'TAC-1 (156.800 MHz)',
      specialization: 'Rescue'
    },
    {
      id: 'team-02',
      code: 'R-02',
      name: 'Bravo Rapid Triage',
      location: 'Mymensingh',
      sector: 'Sector 4 - Rural Crossing',
      coords: [90.4074, 24.7471],
      status: 'En Route',
      progress: 30,
      leader: 'Dr. Nusrat Jahan',
      personnel: 32,
      vehicle: '3x Mobile Trauma Vans',
      equipment: ['Water Purification Units', 'Emergency Trauma Kits', 'Generators'],
      mission: 'Setting up secondary field hospital near Brahmaputra flood wall',
      eta: '24 mins',
      radioChannel: 'MED-2 (155.340 MHz)',
      specialization: 'Medical'
    },
    {
      id: 'team-03',
      code: 'R-03',
      name: 'Charlie Aviation Unit',
      location: 'Sylhet',
      sector: 'Zone 8 - Surma Basin',
      coords: [91.8687, 24.8949],
      status: 'Active',
      progress: 78,
      leader: 'Maj. Rafiqul Islam',
      personnel: 24,
      vehicle: '2x Mi-17 Transport Helicopters',
      equipment: ['Cargo Slings', 'Winch Hoists', 'Emergency Rations'],
      mission: 'Airdropping 12 tons of dry rations and medical supplies',
      eta: 'On Site',
      radioChannel: 'AIR-1 (121.500 MHz)',
      specialization: 'Aviation'
    },
    {
      id: 'team-04',
      code: 'R-04',
      name: 'Delta Logistics Fleet',
      location: 'Chittagong',
      sector: 'Coast Supply Corridor',
      coords: [91.8322, 22.3569],
      status: 'Delayed',
      progress: 45,
      leader: 'Lieut. Hasan Ali',
      personnel: 56,
      vehicle: '8x Heavy Cargo Trucks',
      equipment: ['Fuel Bladders', 'Water Tankers', 'Bridge Pontoon Kits'],
      mission: 'Transiting high-capacity water pumps through flooded N1 highway',
      eta: '55 mins (Highway 1 Waterlogged)',
      radioChannel: 'LOG-4 (143.900 MHz)',
      specialization: 'Logistics'
    },
    {
      id: 'team-05',
      code: 'R-05',
      name: 'Echo Civil Engineers',
      location: 'Rajshahi',
      sector: 'Padma Embankment',
      coords: [88.6049, 24.3745],
      status: 'Active',
      progress: 60,
      leader: 'Eng. Farhana Shireen',
      personnel: 40,
      vehicle: '3x Excavators + 4x Dumpers',
      equipment: ['Geotextile Bags', 'Hydraulic Compactors', 'Drone LIDAR'],
      mission: 'Reinforcing vulnerable dykes along western river curve',
      eta: 'On Site',
      radioChannel: 'ENG-3 (148.125 MHz)',
      specialization: 'Engineering'
    },
    {
      id: 'team-06',
      code: 'R-06',
      name: 'Foxtrot Swift Water',
      location: 'Khulna',
      sector: 'Rupsha Estuary',
      coords: [89.5403, 22.8456],
      status: 'Active',
      progress: 82,
      leader: 'Capt. Ariful Haque',
      personnel: 36,
      vehicle: '6x Rigid Inflatable Boats',
      equipment: ['Sonar Sounders', 'Diver Kits', 'Emergency Lights'],
      mission: 'Patrolling tidal influx and assisting riverine evacuations',
      eta: 'On Site',
      radioChannel: 'TAC-2 (156.850 MHz)',
      specialization: 'Rescue'
    },
    {
      id: 'team-07',
      code: 'R-07',
      name: 'Golf Medical Strike',
      location: 'Barisal',
      sector: 'Kirtankhola Delta',
      coords: [90.3535, 22.701],
      status: 'Standby',
      progress: 20,
      leader: 'Dr. K. Mahmud',
      personnel: 28,
      vehicle: '2x Medical Barges',
      equipment: ['Field Autoclave', 'IV Drip Stockpiles', 'Portable Ultrasound'],
      mission: 'Staged at Barisal naval pier ready to surge to delta islands',
      eta: 'Standby',
      radioChannel: 'MED-1 (155.280 MHz)',
      specialization: 'Medical'
    },
    {
      id: 'team-08',
      code: 'R-08',
      name: 'Hotel Air Recon',
      location: 'Dhaka South',
      sector: 'Capital Ring',
      coords: [90.43, 23.71],
      status: 'Active',
      progress: 90,
      leader: 'Flight Lt. S. Kabir',
      personnel: 16,
      vehicle: '3x Long-Range Recon Drones',
      equipment: ['Infrared FLIR', 'SAR Radar Pod', 'Live Broadcast Mesh'],
      mission: 'Real-time flood line mapping and survivor thermal detection',
      eta: 'On Site',
      radioChannel: 'AIR-2 (123.100 MHz)',
      specialization: 'Aviation'
    }
  ],
  resources: [
    {
      id: 'res-01',
      name: 'Helicopters',
      icon: 'helicopter',
      deployed: 6,
      total: 8,
      unit: 'Units',
      category: 'air',
      percentage: 75,
      depot: 'Tejgaon Airbase & Sylhet FOB',
      status: 'optimal',
      color: '#10B981'
    },
    {
      id: 'res-02',
      name: 'Boats',
      icon: 'ship',
      deployed: 24,
      total: 30,
      unit: 'Watercraft',
      category: 'water',
      percentage: 80,
      depot: 'Sadarghat Marina & Narayanganj',
      status: 'warning',
      color: '#00E5FF'
    },
    {
      id: 'res-03',
      name: 'Medical Supplies',
      icon: 'plus-circle',
      deployed: 12,
      total: 15,
      unit: 'Tons',
      category: 'medical',
      percentage: 80,
      depot: 'Central Medical Stores Dhaka',
      status: 'optimal',
      color: '#00E5FF'
    },
    {
      id: 'res-04',
      name: 'Food Supplies',
      icon: 'package',
      deployed: 45,
      total: 60,
      unit: 'Tons',
      category: 'food',
      percentage: 75,
      depot: 'WFP Warehouse Tongi',
      status: 'optimal',
      color: '#10B981'
    },
    {
      id: 'res-05',
      name: 'Temporary Shelters',
      icon: 'home',
      deployed: 18,
      total: 25,
      unit: 'Facilities',
      category: 'shelter',
      percentage: 72,
      depot: 'Red Crescent Regional Depots',
      status: 'warning',
      color: '#F59E0B'
    }
  ],
  operations: [
    {
      id: 'op-01',
      time: '14:30',
      title: 'Air drop supplies - Sylhet',
      location: 'Sylhet Basin - Kanaighat',
      priority: 'High Priority',
      coords: [91.95, 24.95],
      assignedTeam: 'R-03 Charlie Aviation',
      targetETA: '14:30 UTC',
      type: 'air_drop',
      status: 'scheduled'
    },
    {
      id: 'op-02',
      time: '16:00',
      title: 'Medical team deployment',
      location: 'Mymensingh Rural Clinics',
      priority: 'High Priority',
      coords: [90.41, 24.75],
      assignedTeam: 'R-02 Bravo Triage',
      targetETA: '16:00 UTC',
      type: 'medical',
      status: 'scheduled'
    },
    {
      id: 'op-03',
      time: '18:00',
      title: 'Evacuation operation',
      location: 'Narayanganj Lowland Enclave',
      priority: 'Medium Priority',
      coords: [90.50, 23.62],
      assignedTeam: 'R-01 Alpha Water',
      targetETA: '18:00 UTC',
      type: 'evacuation',
      status: 'scheduled'
    },
    {
      id: 'op-04',
      time: '20:00',
      title: 'Infrastructure assessment',
      location: 'Padma Expressway Link Bridge',
      priority: 'Medium Priority',
      coords: [90.35, 23.50],
      assignedTeam: 'R-05 Echo Engineers',
      targetETA: '20:00 UTC',
      type: 'infrastructure',
      status: 'scheduled'
    },
    {
      id: 'op-05',
      time: '22:00',
      title: 'Relief distribution',
      location: 'Mirpur Stadium Distribution Center',
      priority: 'Low Priority',
      coords: [90.36, 23.80],
      assignedTeam: 'R-04 Delta Logistics',
      targetETA: '22:00 UTC',
      type: 'relief',
      status: 'scheduled'
    }
  ],
  shelters: [
    {
      id: 'sh-01',
      name: 'Mirpur National Stadium Shelter',
      location: 'Mirpur, Dhaka',
      coords: [90.363, 23.807],
      capacity: 5000,
      currentOccupancy: 4200,
      occupancyPct: 84,
      status: 'Near Capacity',
      foodDays: 6,
      waterDays: 5,
      medSuppliesPct: 78,
      powerStatus: 'Generator',
      contact: '+880-171-889922'
    },
    {
      id: 'sh-02',
      name: 'Uttara High School Complex',
      location: 'Sector 7, Uttara',
      coords: [90.398, 23.868],
      capacity: 3200,
      currentOccupancy: 2150,
      occupancyPct: 67,
      status: 'Accepting',
      foodDays: 8,
      waterDays: 7,
      medSuppliesPct: 90,
      powerStatus: 'Grid',
      contact: '+880-181-445511'
    },
    {
      id: 'sh-03',
      name: 'Sylhet MC College Relief Camp',
      location: 'Tilagarh, Sylhet',
      coords: [91.905, 24.898],
      capacity: 4000,
      currentOccupancy: 3950,
      occupancyPct: 98,
      status: 'Full',
      foodDays: 3,
      waterDays: 2,
      medSuppliesPct: 52,
      powerStatus: 'Generator',
      contact: '+880-191-223388'
    },
    {
      id: 'sh-04',
      name: 'Mymensingh Agricultural University Center',
      location: 'Old Brahmaputra Bank',
      coords: [90.435, 24.725],
      capacity: 3500,
      currentOccupancy: 2300,
      occupancyPct: 65,
      status: 'Accepting',
      foodDays: 9,
      waterDays: 9,
      medSuppliesPct: 85,
      powerStatus: 'Grid',
      contact: '+880-161-998877'
    }
  ],
  routes: [
    {
      id: 'rt-01',
      name: 'Dhaka-Mawa Elevated Corridor',
      origin: 'Keraniganj South Inundation',
      destination: 'Munshiganj High Ground Safe Haven',
      status: 'Clear',
      clearanceTimeHours: 1.5,
      evacueesCount: '142,000 processed',
      path: [
        [90.39, 23.75],
        [90.38, 23.68],
        [90.35, 23.55],
        [90.32, 23.45]
      ]
    },
    {
      id: 'rt-02',
      name: 'Dhaka-Chittagong Arterial Highway (N1)',
      origin: 'Kanchpur Bottleneck',
      destination: 'Comilla Ridge Relief Base',
      status: 'Congested',
      clearanceTimeHours: 4.2,
      evacueesCount: '280,000 processed',
      bottleneckWarning: 'Water depth 0.4m at km-34; heavy vehicles only',
      path: [
        [90.52, 23.71],
        [90.65, 23.62],
        [90.85, 23.50],
        [91.18, 23.46]
      ]
    },
    {
      id: 'rt-03',
      name: 'Sylhet-Bypass North High Line',
      origin: 'Surma Inundation Basin',
      destination: 'Tamabil Highland Shelter Hub',
      status: 'Clear',
      clearanceTimeHours: 2.1,
      evacueesCount: '95,000 processed',
      path: [
        [91.86, 24.89],
        [91.95, 24.98],
        [92.05, 25.10],
        [92.10, 25.18]
      ]
    }
  ],
  markers: [
    {
      id: 'm-team-1',
      type: 'team',
      name: 'R-01 Alpha Water',
      coords: [90.39, 23.86],
      status: 'Active',
      meta: { personnel: 48, vehicle: 'Zodiac' }
    },
    {
      id: 'm-team-2',
      type: 'team',
      name: 'R-02 Bravo Triage',
      coords: [90.41, 24.75],
      status: 'En Route',
      meta: { personnel: 32, vehicle: 'Trauma Vans' }
    },
    {
      id: 'm-team-3',
      type: 'team',
      name: 'R-03 Charlie Aviation',
      coords: [91.87, 24.89],
      status: 'Active',
      meta: { personnel: 24, vehicle: 'Mi-17' }
    },
    {
      id: 'm-team-4',
      type: 'team',
      name: 'R-04 Delta Logistics',
      coords: [91.83, 22.36],
      status: 'Delayed',
      meta: { personnel: 56, vehicle: 'Heavy Trucks' }
    },
    {
      id: 'm-team-5',
      type: 'team',
      name: 'R-05 Echo Engineers',
      coords: [88.60, 24.37],
      status: 'Active',
      meta: { personnel: 40, vehicle: 'Excavators' }
    },
    {
      id: 'm-med-1',
      type: 'medical',
      name: 'Dhaka Medical Triage Station',
      coords: [90.40, 23.72],
      status: 'Operational',
      meta: { beds: 350, doctors: 45 }
    },
    {
      id: 'm-med-2',
      type: 'medical',
      name: 'Sylhet Civil Field Hospital',
      coords: [91.85, 24.91],
      status: 'Surge Capacity',
      meta: { beds: 200, doctors: 28 }
    },
    {
      id: 'm-shelter-1',
      type: 'shelter',
      name: 'Mirpur Stadium Shelter',
      coords: [90.36, 23.81],
      status: '84% Full',
      meta: { capacity: 5000, current: 4200 }
    },
    {
      id: 'm-shelter-2',
      type: 'shelter',
      name: 'Sylhet MC College Camp',
      coords: [91.90, 24.90],
      status: '98% Full',
      meta: { capacity: 4000, current: 3950 }
    },
    {
      id: 'm-heli-1',
      type: 'helicopter',
      name: 'SAR Rotor Flight 04',
      coords: [90.48, 24.20],
      status: 'Airborne',
      meta: { altitude: '1,200 ft', speed: '110 kts' }
    },
    {
      id: 'm-risk-1',
      type: 'risk',
      name: 'Dhaka Core Lowland Breach',
      coords: [90.41, 23.81],
      status: 'Critical Rise',
      meta: { waterLevel: '+2.8m above datum' }
    }
  ],
  optimizationProposal: {
    timestamp: 'Just now',
    overallScore: 94.6,
    estimatedTimeSavedMinutes: 115,
    additionalPeopleCovered: '+340,000 civilians',
    recommendedActions: [
      {
        id: 'opt-1',
        action: 'Reassign 2x Zodiac rescue boats from Rajshahi to Dhaka North riverside',
        impact: 'Cuts rescue queue by 42 minutes across 18,000 isolated residents',
        urgency: 'CRITICAL',
        applied: false
      },
      {
        id: 'opt-2',
        action: 'Divert 4 tons of medical supplies from Khulna reserve to Sylhet MC College',
        impact: 'Prevents acute IV saline stockout within next 6 hours',
        urgency: 'HIGH',
        applied: false
      },
      {
        id: 'opt-3',
        action: 'Route upcoming 18:00 evacuation convoy via Elevated Expressway instead of N1',
        impact: 'Bypasses 4.2-hour flood choke point at Kanchpur',
        urgency: 'HIGH',
        applied: false
      },
      {
        id: 'opt-4',
        action: 'Spin up 2 auxiliary field generators at Uttara High School shelter',
        impact: 'Enables continuous water purification throughput for 3,200 evacuees',
        urgency: 'MEDIUM',
        applied: false
      }
    ]
  }
};

// 2. CYCLONE RESPONSE PACKAGE (Cyclone Marex - Indian Ocean / Coastal)
export const cycloneResponseData: HazardResponsePackage = {
  hazardId: 'inc-002',
  hazardName: 'Cyclone Marex',
  locationName: 'Bay of Bengal Coast & Odisha',
  center: [86.9, 19.8],
  bounds: [[84.0, 17.5], [89.5, 22.5]],
  statistics: {
    responseTeams: 16,
    personnelDeployed: 1540,
    activeOperations: 34,
    missionCompletion: 76,
    highPriorityAreas: 4,
    peopleReached: '1.8M',
    criticalActionsCount: 4
  },
  priorities: [
    {
      id: 'p-cyc-01',
      order: 1,
      title: 'Storm Surge Evacuation',
      status: 'CRITICAL',
      category: 'Evacuation',
      location: 'Puri & Kendrapara Coastline',
      affected: '620K coastal residents',
      progress: 54,
      icon: 'arrow-right-circle',
      coords: [85.83, 19.81],
      actionRequired: 'Move final 80,000 residents from within 5km of shoreline before landfall',
      color: '#EF4444'
    },
    {
      id: 'p-cyc-02',
      order: 2,
      title: 'Harbor & Marine Securing',
      status: 'HIGH',
      category: 'Marine',
      location: 'Paradip Port & Fishing Harbors',
      facilitiesNeeded: '3 harbors secured',
      affected: '1,400 fishing vessels docked',
      progress: 88,
      icon: 'shield',
      coords: [86.61, 20.31],
      actionRequired: 'Ensure all deep-sea trawlers are accounted for and berthed',
      color: '#F59E0B'
    },
    {
      id: 'p-cyc-03',
      order: 3,
      title: 'Power Grid Pre-emptive Isolation',
      status: 'HIGH',
      category: 'Engineering',
      location: 'Transmission Grid East',
      routesCount: '48 substations',
      affected: '48 high-voltage substations',
      progress: 62,
      icon: 'zap',
      coords: [85.82, 20.29],
      actionRequired: 'Isolate exposed 400kV coastal towers to prevent cascading blackouts',
      color: '#F59E0B'
    },
    {
      id: 'p-cyc-04',
      order: 4,
      title: 'Cyclone Shelter Stocking',
      status: 'MEDIUM',
      category: 'Logistics',
      location: '320 Reinforced Multipurpose Shelters',
      sheltersCount: '320 shelters active',
      affected: '450K capacity prepared',
      progress: 91,
      icon: 'home',
      coords: [86.2, 20.0],
      actionRequired: 'Verify satellite phones and diesel generators in all coastal shelters',
      color: '#10B981'
    }
  ],
  teams: [
    {
      id: 'team-c1',
      code: 'NDRF-01',
      name: 'Coastal Battalion 03',
      location: 'Puri Coast',
      sector: 'Zone 1 - Storm Front',
      coords: [85.83, 19.81],
      status: 'Active',
      progress: 72,
      leader: 'Commandant R. K. Nayak',
      personnel: 64,
      vehicle: '6x Amphibious APCs',
      equipment: ['Tree Clearers', 'Inflatable Rafts', 'Satellite Comms'],
      mission: 'Clearing arterial roads and assisting vulnerable coastal settlements',
      eta: 'On Site',
      radioChannel: 'NDRF-PRI (149.200 MHz)',
      specialization: 'Rescue'
    },
    {
      id: 'team-c2',
      code: 'CG-04',
      name: 'Coast Guard Cutter Varuna',
      location: 'Offshore Paradip',
      sector: 'Maritime Sector 2',
      coords: [86.85, 20.15],
      status: 'Active',
      progress: 85,
      leader: 'Cmdr. S. Roy',
      personnel: 45,
      vehicle: 'Offshore Patrol Vessel + Chetak Heli',
      equipment: ['Maritime SAR Radar', 'Survivor Hoists'],
      mission: 'Guarding sea approach and escorting late trawlers to anchorage',
      eta: 'On Site',
      radioChannel: 'VHF-16 (156.800 MHz)',
      specialization: 'Rescue'
    }
  ],
  resources: [
    {
      id: 'res-c1',
      name: 'Coast Guard Cutters',
      icon: 'ship',
      deployed: 5,
      total: 6,
      unit: 'Vessels',
      category: 'water',
      percentage: 83,
      depot: 'Paradip Port Command',
      status: 'optimal',
      color: '#00E5FF'
    },
    {
      id: 'res-c2',
      name: 'Naval Helicopters',
      icon: 'helicopter',
      deployed: 8,
      total: 10,
      unit: 'Aircraft',
      category: 'air',
      percentage: 80,
      depot: 'INS Dega & Bhubaneswar Base',
      status: 'optimal',
      color: '#10B981'
    },
    {
      id: 'res-c3',
      name: 'Emergency Generators',
      icon: 'zap',
      deployed: 95,
      total: 120,
      unit: 'Units',
      category: 'heavy',
      percentage: 79,
      depot: 'State Emergency Stockpile',
      status: 'warning',
      color: '#F59E0B'
    }
  ],
  operations: [
    {
      id: 'op-c1',
      time: '15:00',
      title: 'Final coastal sweep - Chandrabhaga',
      location: 'Konark Coastline',
      priority: 'High Priority',
      coords: [86.1, 19.88],
      assignedTeam: 'NDRF-01',
      targetETA: '15:00 UTC',
      type: 'evacuation',
      status: 'scheduled'
    },
    {
      id: 'op-c2',
      time: '17:30',
      title: 'Power transmission line lockout',
      location: 'Puri Grid Substation',
      priority: 'High Priority',
      coords: [85.83, 19.82],
      assignedTeam: 'Echo Civil Engineers',
      targetETA: '17:30 UTC',
      type: 'infrastructure',
      status: 'scheduled'
    }
  ],
  shelters: [
    {
      id: 'sh-c1',
      name: 'Puri Cyclone Multipurpose Complex',
      location: 'VIP Road, Puri',
      coords: [85.84, 19.82],
      capacity: 6500,
      currentOccupancy: 4800,
      occupancyPct: 73,
      status: 'Accepting',
      foodDays: 14,
      waterDays: 12,
      medSuppliesPct: 92,
      powerStatus: 'Generator',
      contact: '+91-6752-224411'
    }
  ],
  routes: [
    {
      id: 'rt-c1',
      name: 'Puri-Bhubaneswar Expressway Evacuation Corridor',
      origin: 'Coastal Beachfront',
      destination: 'Bhubaneswar Staging Enclave',
      status: 'Clear',
      clearanceTimeHours: 1.2,
      evacueesCount: '210,000 evacuated',
      path: [
        [85.83, 19.81],
        [85.85, 20.05],
        [85.82, 20.29]
      ]
    }
  ],
  markers: [
    {
      id: 'm-cyc-team-1',
      type: 'team',
      name: 'NDRF-01 Coastal',
      coords: [85.83, 19.81],
      status: 'Active',
      meta: { personnel: 64, vehicle: 'Amphibious APCs' }
    },
    {
      id: 'm-cyc-ship-1',
      type: 'team',
      name: 'Cutter Varuna',
      coords: [86.85, 20.15],
      status: 'Active',
      meta: { personnel: 45, vehicle: 'Patrol Vessel' }
    }
  ],
  optimizationProposal: {
    timestamp: 'Just now',
    overallScore: 92.1,
    estimatedTimeSavedMinutes: 80,
    additionalPeopleCovered: '+110,000 civilians',
    recommendedActions: [
      {
        id: 'opt-c1',
        action: 'Advance mandatory shelter deadline by 2 hours ahead of gale force winds',
        impact: 'Prevents vehicular accidents on NH-316 under 140 km/h gusts',
        urgency: 'CRITICAL',
        applied: false
      }
    ]
  }
};

// 3. WILDFIRE RESPONSE PACKAGE (Canada Wildfire Outbreak)
export const wildfireResponseData: HazardResponsePackage = {
  hazardId: 'inc-003',
  hazardName: 'Wildfire Outbreak',
  locationName: 'Northern Alberta / Boreal Belt',
  center: [-111.38, 56.72],
  bounds: [[-115.0, 54.0], [-108.0, 59.0]],
  statistics: {
    responseTeams: 18,
    personnelDeployed: 890,
    activeOperations: 22,
    missionCompletion: 68,
    highPriorityAreas: 5,
    peopleReached: '185K',
    criticalActionsCount: 3
  },
  priorities: [
    {
      id: 'p-fire-01',
      order: 1,
      title: 'Perimeter Firebreak Cutting',
      status: 'CRITICAL',
      category: 'Containment',
      location: 'Fort McMurray West Flank',
      affected: '120K hectares burning',
      progress: 38,
      icon: 'flame',
      coords: [-111.45, 56.75],
      actionRequired: 'Deploy 8 heavy bulldozers along Highway 63 buffer zone',
      color: '#EF4444'
    },
    {
      id: 'p-fire-02',
      order: 2,
      title: 'Aerial Water Bomber Drops',
      status: 'HIGH',
      category: 'Aviation',
      location: 'Athabasca River Sector',
      facilitiesNeeded: '6 bombers active',
      affected: 'Direct flame front suppression',
      progress: 62,
      icon: 'plane',
      coords: [-111.32, 56.82],
      actionRequired: 'Continuous retardant drops on northern ridge line',
      color: '#F59E0B'
    }
  ],
  teams: [
    {
      id: 'team-f1',
      code: 'FIRE-01',
      name: 'Wildland Strike Team 7',
      location: 'Timberlea Ridge',
      sector: 'Fire Flank Alpha',
      coords: [-111.42, 56.74],
      status: 'Active',
      progress: 55,
      leader: 'Chief D. Campbell',
      personnel: 38,
      vehicle: '4x Heavy Bush Fire Engines',
      equipment: ['Water Cannons', 'Drip Torches', 'Chainsaws'],
      mission: 'Holding controlled burn perimeter against shifting wind',
      eta: 'On Site',
      radioChannel: 'FIRE-CMD (154.280 MHz)',
      specialization: 'Rescue'
    }
  ],
  resources: [
    {
      id: 'res-f1',
      name: 'Air Tankers (CL-415)',
      icon: 'plane',
      deployed: 6,
      total: 8,
      unit: 'Water Bombers',
      category: 'air',
      percentage: 75,
      depot: 'Fort McMurray Regional Airport',
      status: 'optimal',
      color: '#00E5FF'
    }
  ],
  operations: [
    {
      id: 'op-f1',
      time: '14:00',
      title: 'Aerial retardant drop run',
      location: 'Highway 63 North Corridor',
      priority: 'High Priority',
      coords: [-111.40, 56.78],
      assignedTeam: 'FIRE-01',
      targetETA: '14:00 UTC',
      type: 'air_drop',
      status: 'scheduled'
    }
  ],
  shelters: [
    {
      id: 'sh-f1',
      name: 'MacDonald Island Evacuation Hub',
      location: 'Fort McMurray',
      coords: [-111.37, 56.73],
      capacity: 3500,
      currentOccupancy: 2100,
      occupancyPct: 60,
      status: 'Accepting',
      foodDays: 10,
      waterDays: 12,
      medSuppliesPct: 88,
      powerStatus: 'Grid',
      contact: '+1-780-791-0000'
    }
  ],
  routes: [
    {
      id: 'rt-f1',
      name: 'Highway 63 Southbound Evac Corridor',
      origin: 'Fort McMurray Urban Core',
      destination: 'Edmonton Reception Center',
      status: 'Clear',
      clearanceTimeHours: 4.5,
      evacueesCount: '62,000 evacuated',
      path: [
        [-111.38, 56.72],
        [-111.55, 56.20],
        [-112.10, 55.45]
      ]
    }
  ],
  markers: [
    {
      id: 'm-fire-1',
      type: 'team',
      name: 'Wildland Strike 7',
      coords: [-111.42, 56.74],
      status: 'Active',
      meta: { personnel: 38, vehicle: 'Bush Fire Engines' }
    }
  ],
  optimizationProposal: {
    timestamp: 'Just now',
    overallScore: 91.0,
    estimatedTimeSavedMinutes: 65,
    additionalPeopleCovered: '+45,000 civilians',
    recommendedActions: [
      {
        id: 'opt-f1',
        action: 'Mobilize second Canadair water bomber wing from Cold Lake Base',
        impact: 'Halts wildfire advance 4km north of industrial refinery complex',
        urgency: 'CRITICAL',
        applied: false
      }
    ]
  }
};

// 4. EARTHQUAKE RESPONSE PACKAGE
export const earthquakeResponseData: HazardResponsePackage = {
  hazardId: 'inc-004',
  hazardName: 'Magnitude 7.8 Seismic Rupture',
  locationName: 'Southeastern Anatolia / Kahramanmaraş',
  center: [36.93, 37.58],
  bounds: [[35.0, 36.0], [39.0, 39.0]],
  statistics: {
    responseTeams: 22,
    personnelDeployed: 2140,
    activeOperations: 45,
    missionCompletion: 61,
    highPriorityAreas: 6,
    peopleReached: '1.2M',
    criticalActionsCount: 5
  },
  priorities: [
    {
      id: 'p-eq-01',
      order: 1,
      title: 'Urban Search & Rescue (USAR)',
      status: 'CRITICAL',
      category: 'Rescue',
      location: 'Central Collapse Sectors 1-6',
      affected: '4,200 collapsed structures',
      progress: 35,
      icon: 'search',
      coords: [36.93, 37.58],
      actionRequired: 'Deploy acoustic listening & search dog teams to pancaked apartments',
      color: '#EF4444'
    },
    {
      id: 'p-eq-02',
      order: 2,
      title: 'Emergency Field Hospitals',
      status: 'CRITICAL',
      category: 'Medical',
      location: 'Stadium & Open Fields',
      facilitiesNeeded: '8 surgical field pods',
      affected: 'Over 14,000 injured in triage',
      progress: 48,
      icon: 'cross',
      coords: [36.90, 37.56],
      actionRequired: 'Erect inflatable surgical tents with backup oxygen generators',
      color: '#EF4444'
    }
  ],
  teams: [
    {
      id: 'team-eq1',
      code: 'USAR-01',
      name: 'Heavy USAR Task Force 1',
      location: 'Kahramanmaraş Center',
      sector: 'Sector 3 - Downtown',
      coords: [36.93, 37.58],
      status: 'Active',
      progress: 42,
      leader: 'Commander M. Demir',
      personnel: 72,
      vehicle: 'Heavy Crane + 4x Rescue Transporters',
      equipment: ['Acoustic Listening Probes', 'Search Canines', 'Hydraulic Spreaders'],
      mission: 'Rescuing survivors trapped in collapsed multi-story buildings',
      eta: 'On Site',
      radioChannel: 'USAR-NET (151.625 MHz)',
      specialization: 'Rescue'
    }
  ],
  resources: [
    {
      id: 'res-eq1',
      name: 'Heavy Cranes & Excavators',
      icon: 'truck',
      deployed: 35,
      total: 50,
      unit: 'Machines',
      category: 'heavy',
      percentage: 70,
      depot: 'Provincial Heavy Machinery Depot',
      status: 'warning',
      color: '#F59E0B'
    }
  ],
  operations: [
    {
      id: 'op-eq1',
      time: '15:15',
      title: 'Search & rescue grid sweep',
      location: 'Atatürk Boulevard Residential Blocks',
      priority: 'High Priority',
      coords: [36.92, 37.57],
      assignedTeam: 'USAR-01',
      targetETA: '15:15 UTC',
      type: 'medical',
      status: 'scheduled'
    }
  ],
  shelters: [
    {
      id: 'sh-eq1',
      name: '12 February Stadium Tent City',
      location: 'Kahramanmaraş',
      coords: [36.91, 37.57],
      capacity: 12000,
      currentOccupancy: 11400,
      occupancyPct: 95,
      status: 'Near Capacity',
      foodDays: 5,
      waterDays: 4,
      medSuppliesPct: 65,
      powerStatus: 'Generator',
      contact: '+90-344-2200000'
    }
  ],
  routes: [
    {
      id: 'rt-eq1',
      name: 'Gaziantep-Maraş Relief Highway Corridor',
      origin: 'Gaziantep Airport Airhead',
      destination: 'Kahramanmaraş Staging Point',
      status: 'Clear',
      clearanceTimeHours: 1.8,
      evacueesCount: '85,000 injured transported',
      path: [
        [37.38, 37.06],
        [37.15, 37.32],
        [36.93, 37.58]
      ]
    }
  ],
  markers: [
    {
      id: 'm-eq-1',
      type: 'team',
      name: 'USAR Task Force 1',
      coords: [36.93, 37.58],
      status: 'Active',
      meta: { personnel: 72, vehicle: 'Cranes & Transporters' }
    }
  ],
  optimizationProposal: {
    timestamp: 'Just now',
    overallScore: 93.8,
    estimatedTimeSavedMinutes: 140,
    additionalPeopleCovered: '+520,000 civilians',
    recommendedActions: [
      {
        id: 'opt-eq1',
        action: 'Establish military air bridge via İncirlik AB for continuous medical evacuations',
        impact: 'Evacuates 850 critical trauma patients to Ankara hospitals within 4 hours',
        urgency: 'CRITICAL',
        applied: false
      }
    ]
  }
};

// Master database mapping
export const responseDatabase: Record<string, HazardResponsePackage> = {
  flood: floodResponseData,
  cyclone: cycloneResponseData,
  wildfire: wildfireResponseData,
  earthquake: earthquakeResponseData,
  multi_hazard: {
    ...floodResponseData,
    hazardName: 'Multi-Hazard Convergence',
    locationName: 'Coastal & Delta Vulnerability Zone',
    statistics: {
      ...floodResponseData.statistics,
      activeOperations: 38,
      criticalActionsCount: 6
    }
  }
};
