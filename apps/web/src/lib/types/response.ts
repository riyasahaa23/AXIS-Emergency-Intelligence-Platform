export type ResponseMode =
  | 'overview'
  | 'teams'
  | 'resources'
  | 'evacuation'
  | 'shelters';

export type PrioritySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TeamStatus = 'Active' | 'En Route' | 'Delayed' | 'Standby';
export type OperationPriority = 'High Priority' | 'Medium Priority' | 'Low Priority';
export type ShelterStatus = 'Accepting' | 'Near Capacity' | 'Full';
export type RouteStatus = 'Clear' | 'Congested' | 'Flooded' | 'Alternative';

export interface ResponsePriority {
  id: string;
  order: number;
  title: string;
  status: PrioritySeverity;
  category: string;
  location: string;
  affected: string;
  facilitiesNeeded?: string;
  routesCount?: string;
  sheltersCount?: string;
  progress: number; // 0 - 100
  icon: string;
  coords: [number, number]; // [lng, lat]
  actionRequired: string;
  color: string;
}

export interface ResponseTeam {
  id: string;
  code: string; // e.g. 'R-01'
  name: string;
  location: string;
  sector: string;
  coords: [number, number]; // [lng, lat]
  status: TeamStatus;
  progress: number; // 0 - 100
  leader: string;
  personnel: number;
  vehicle: string;
  equipment: string[];
  mission: string;
  eta: string;
  radioChannel: string;
  specialization: 'Rescue' | 'Medical' | 'Logistics' | 'Engineering' | 'Aviation';
}

export interface ResponseResource {
  id: string;
  name: string;
  icon: string;
  deployed: number;
  total: number;
  unit: string;
  category: 'air' | 'water' | 'medical' | 'food' | 'shelter' | 'heavy';
  percentage: number;
  depot: string;
  status: 'optimal' | 'warning' | 'critical';
  color: string;
}

export interface UpcomingOperation {
  id: string;
  time: string;
  title: string;
  location: string;
  priority: OperationPriority;
  coords: [number, number];
  assignedTeam?: string;
  targetETA: string;
  type: 'air_drop' | 'medical' | 'evacuation' | 'infrastructure' | 'relief';
  status: 'scheduled' | 'in_progress' | 'completed';
}

export interface ShelterLocation {
  id: string;
  name: string;
  location: string;
  coords: [number, number];
  capacity: number;
  currentOccupancy: number;
  occupancyPct: number;
  status: ShelterStatus;
  foodDays: number;
  waterDays: number;
  medSuppliesPct: number;
  powerStatus: 'Grid' | 'Generator' | 'Failing';
  contact: string;
}

export interface EvacuationRoute {
  id: string;
  name: string;
  origin: string;
  destination: string;
  status: RouteStatus;
  clearanceTimeHours: number;
  evacueesCount: string;
  path: [number, number][]; // Array of [lng, lat]
  bottleneckWarning?: string;
}

export interface TacticalMarker {
  id: string;
  type: 'team' | 'medical' | 'shelter' | 'helicopter' | 'risk' | 'corridor';
  name: string;
  coords: [number, number];
  status: string;
  meta: Record<string, any>;
}

export interface ResponseStatistics {
  responseTeams: number;
  personnelDeployed: number;
  activeOperations: number;
  missionCompletion: number;
  highPriorityAreas: number;
  peopleReached: string;
  criticalActionsCount: number;
}

export interface OptimizationResult {
  timestamp: string;
  overallScore: number;
  estimatedTimeSavedMinutes: number;
  additionalPeopleCovered: string;
  recommendedActions: Array<{
    id: string;
    action: string;
    impact: string;
    urgency: PrioritySeverity;
    applied: boolean;
  }>;
}

export interface ResponseAuditEntry {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  target: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
}
