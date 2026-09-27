export type ResourceCategory =
  | 'All Resources'
  | 'Helicopters'
  | 'Boats'
  | 'Ground Vehicles'
  | 'Medical Supplies'
  | 'Food & Water'
  | 'Temporary Shelters'
  | 'Fuel & Energy'
  | 'Communication Equipment'
  | 'Search & Rescue Equipment';

export type ResourceStatus =
  | 'AVAILABLE'
  | 'DEPLOYED'
  | 'EN ROUTE'
  | 'MAINTENANCE'
  | 'REQUESTED'
  | 'UNAVAILABLE';

export type ResourcesMode =
  | 'overview'
  | 'assets'
  | 'supplies'
  | 'personnel'
  | 'facilities'
  | 'supply_chain'
  | 'requests';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'ALLOCATED' | 'FULFILLED' | 'REJECTED';

export type ShipmentStatus = 'PREPARING' | 'IN TRANSIT' | 'ARRIVED' | 'DELAYED' | 'BLOCKED';

export interface ResourceItem {
  id: string; // e.g. 'H-001', 'B-003', 'V-101', 'M-201'
  incidentId?: string;
  category: ResourceCategory;
  type: string; // e.g. 'Helicopter H145', 'Rescue Boat', 'Supply Truck'
  name: string; // e.g. 'H145 SkyCrane', 'Zodiac Titan 4'
  location: string; // e.g. 'Dhaka Air Base', 'Chittagong Port'
  coords: [number, number]; // [lng, lat]
  status: ResourceStatus;
  capacity: string; // e.g. '8 personnel', '15 tons', '20 beds'
  capacityNum?: number;
  assignedTo: string; // e.g. '—', 'Rescue Op-01', 'Supply Run-03'
  fuelOrStockPct: number; // 0 - 100
  condition: 'Excellent' | 'Good' | 'Needs Service' | 'Critical';
  hoursOperated?: number;
  operator?: string;
  depot?: string;
  lastUpdated: string;
}

export interface ResourceRequest {
  id: string;
  incidentId?: string;
  resourceType: string;
  category: ResourceCategory;
  quantity: number;
  requestedBy: string;
  destination: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: RequestStatus;
  requiredBy: string;
  reason: string;
  rejectionReason?: string;
  created: string;
}

export interface ShipmentItem {
  id: string; // e.g. 'SH-021'
  incidentId?: string;
  origin: string;
  destination: string;
  contents: string;
  quantity: string;
  status: ShipmentStatus;
  eta: string;
  progressPct: number;
  transportMode: 'Air' | 'Sea' | 'Road';
  assignedVehicle?: string;
  path: [number, number][]; // [lng, lat][]
}

export interface FacilityItem {
  id: string;
  incidentId?: string;
  name: string;
  type: 'Supply Depot' | 'Hospital' | 'Air Base' | 'Port' | 'Shelter' | 'Command Center';
  location: string;
  coords: [number, number];
  status: 'OPERATIONAL' | 'LIMITED CAPACITY' | 'SURGE CAPACITY' | 'OFFLINE';
  capacityPct: number;
  currentStock: string;
  incomingShipments: number;
  outgoingShipments: number;
  alerts?: string;
}

export interface PersonnelItem {
  id: string;
  incidentId?: string;
  name: string;
  role: string;
  specialization: 'Medical' | 'Rescue' | 'Logistics' | 'Engineering' | 'Communications' | 'Command';
  location: string;
  coords?: [number, number];
  status: 'AVAILABLE' | 'DEPLOYED' | 'RESTING' | 'UNAVAILABLE';
  assignment: string;
  contact: string;
}

export interface ResourceOperationItem {
  id: string;
  incidentId?: string;
  time: string;
  title: string;
  location: string;
  resourceId: string;
  resourceName: string;
  type: 'DEPLOYMENT' | 'DELIVERY' | 'EVACUATION' | 'MAINTENANCE';
  targetETA: string;
  status: 'SCHEDULED' | 'IN_TRANSIT' | 'COMPLETED';
  coords: [number, number];
}

export interface ResourceMetrics {
  totalAssets: number;
  available: number;
  deployed: number;
  inMaintenance: number;
  requested: number;
  readinessRate: number; // percentage
  utilizationRate: number; // percentage
}

export interface ResourceActivityEntry {
  id: string;
  timestamp: string;
  action: string;
  target: string;
  operator: string;
  severity: 'info' | 'success' | 'warning' | 'critical';
}

export interface GeographicMapMetadata {
  bbox: {
    minLng: number;
    maxLng: number;
    minLat: number;
    maxLat: number;
  };
  territoryPath: string; // SVG path string
  waterwayPaths?: string[]; // SVG paths
  surroundingLabels: Array<{ text: string; x: number; y: number; size?: number; tracking?: number }>;
  cities: Array<{ name: string; coords: [number, number]; isCapital?: boolean }>;
}

export interface ResourceMapMarker {
  id: string;
  entityType: 'resource' | 'facility' | 'personnel' | 'shipment' | 'request';
  name: string;
  category: string;
  coords: [number, number];
  status: string;
  metricLabel: string;
  priority?: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  details?: Record<string, any>;
}

export interface ResourceMapRoute {
  id: string;
  name: string;
  path: [number, number][];
  mode: 'Air' | 'Sea' | 'Road';
  status: 'IN TRANSIT' | 'DELAYED' | 'ARRIVED' | 'BLOCKED' | 'PREPARING';
  color: string;
}

export interface ResourceMapContext {
  incidentId: string;
  incidentName: string;
  theatreName: string;
  mapTitle: string;
  mapSubtitle: string;
  bbox: {
    minLng: number;
    maxLng: number;
    minLat: number;
    maxLat: number;
  };
  center: [number, number];
  defaultZoom: number;
  territoryPath: string;
  waterwayPaths?: string[];
  surroundingLabels: Array<{ text: string; x: number; y: number; size?: number; tracking?: number }>;
  cities: Array<{ name: string; coords: [number, number]; isCapital?: boolean }>;
  activeTab: ResourcesMode;
  activeCategory: ResourceCategory;
  activeMapLayer: 'ALL RESOURCES' | 'HELICOPTERS' | 'BOATS' | 'VEHICLES' | 'SUPPLIES' | 'FACILITIES';
  markers: ResourceMapMarker[];
  routes: ResourceMapRoute[];
  legend: Array<{ label: string; color: string; icon: string }>;
  selectedResource: ResourceItem | null;
  selectedFacility: FacilityItem | null;
  selectedShipment: ShipmentItem | null;
}
