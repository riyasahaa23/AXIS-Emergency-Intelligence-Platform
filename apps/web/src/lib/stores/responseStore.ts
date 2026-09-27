import { writable, derived, get } from 'svelte/store';
import type {
  ResponseMode,
  PrioritySeverity,
  TeamStatus,
  ResponsePriority,
  ResponseTeam,
  ResponseResource,
  UpcomingOperation,
  ShelterLocation,
  EvacuationRoute,
  TacticalMarker,
  ResponseStatistics,
  OptimizationResult,
  ResponseAuditEntry
} from '../types/response';
import { responseDatabase, floodResponseData } from '../mock/response/responseDatabase';
import { selectedIncident } from './incidentStore';
import { recordHistoryEvent } from './historyStore';

// Mode Navigation
export const activeResponseMode = writable<ResponseMode>('overview');

// Active Hazard & Data Package
export const activeResponseHazard = writable<string>('flood');
export const currentResponsePackage = writable(floodResponseData);

// Automatically synchronize active response hazard when selectedIncident changes globally
selectedIncident.subscribe((inc) => {
  if (!inc) return;
  const currentHazard = get(activeResponseHazard);
  let targetHazard = 'flood';
  if (inc.type === 'cyclone') targetHazard = 'cyclone';
  else if (inc.type === 'wildfire') targetHazard = 'wildfire';
  else if (inc.type === 'earthquake') targetHazard = 'earthquake';
  else if (inc.type === 'compound') targetHazard = 'multi_hazard';
  else if (inc.type === 'flood') targetHazard = 'flood';

  if (currentHazard !== targetHazard) {
    setResponseHazard(targetHazard);
  }
});

// Priorities & Filtering
export const activePriorityFilter = writable<'ALL' | PrioritySeverity>('ALL');
export const selectedPriorityId = writable<string | null>('p-01');

// Teams, Operations & Markers Selection
export const selectedTeamId = writable<string | null>('team-01');
export const selectedOperationId = writable<string | null>('op-01');
export const selectedMarker = writable<TacticalMarker | null>(null);

// Map Layers
export const activeMapLayers = writable({
  teams: true,
  resources: true,
  evacuation: true,
  riskAreas: true
});

// Map Viewport / Focus Trigger
export const mapCameraFocus = writable<{
  center: [number, number];
  zoom: number;
  highlightId?: string;
}>({
  center: [90.4125, 23.8103],
  zoom: 1
});

// Auto-Optimization Heuristic Pipeline State
export const isAutoOptimizing = writable<boolean>(false);
export const optimizationStage = writable<string>('');
export const optimizationProgress = writable<number>(0);
export const isAutoOptimizeModalOpen = writable<boolean>(false);

// Action Modals State
export const isDeployTeamModalOpen = writable<boolean>(false);
export const isAllocateResourceModalOpen = writable<boolean>(false);
export const isPlanEvacuationModalOpen = writable<boolean>(false);
export const isSendAlertModalOpen = writable<boolean>(false);
export const isUrgentActionsDrawerOpen = writable<boolean>(false);

// Dynamic Reactive Elements from current package
export const responseStatistics = writable<ResponseStatistics>(floodResponseData.statistics);
export const responsePriorities = writable<ResponsePriority[]>(floodResponseData.priorities);
export const responseTeams = writable<ResponseTeam[]>(floodResponseData.teams);
export const responseResources = writable<ResponseResource[]>(floodResponseData.resources);
export const upcomingOperations = writable<UpcomingOperation[]>(floodResponseData.operations);
export const shelterLocations = writable<ShelterLocation[]>(floodResponseData.shelters);
export const evacuationRoutes = writable<EvacuationRoute[]>(floodResponseData.routes);
export const tacticalMarkers = writable<TacticalMarker[]>(floodResponseData.markers);
export const optimizationProposal = writable<OptimizationResult>(floodResponseData.optimizationProposal);

// Audit Trail / Event Log
export const responseAuditLog = writable<ResponseAuditEntry[]>([
  {
    id: 'log-01',
    timestamp: '14:22:04 UTC',
    operator: 'AXIS-CORE',
    action: 'Plan Initialized',
    target: 'Dhaka Flood Sector',
    severity: 'info'
  },
  {
    id: 'log-02',
    timestamp: '14:20:15 UTC',
    operator: 'Capt. T. Rahman',
    action: 'R-01 Deployed to Uttara',
    target: 'Zone 1 - Riverfront',
    severity: 'success'
  },
  {
    id: 'log-03',
    timestamp: '14:15:30 UTC',
    operator: 'AXIS-ALERTS',
    action: 'Critical Surge Advisory',
    target: 'Surma & Buriganga Basins',
    severity: 'warning'
  }
]);

// Switch Hazard Context
export function setResponseHazard(hazard: string) {
  const normHazard = hazard.toLowerCase();
  const pkg = responseDatabase[normHazard] || responseDatabase['flood'];
  activeResponseHazard.set(normHazard);
  currentResponsePackage.set(pkg);

  responseStatistics.set(pkg.statistics);
  responsePriorities.set(pkg.priorities);
  responseTeams.set(pkg.teams);
  responseResources.set(pkg.resources);
  upcomingOperations.set(pkg.operations);
  shelterLocations.set(pkg.shelters);
  evacuationRoutes.set(pkg.routes);
  tacticalMarkers.set(pkg.markers);
  optimizationProposal.set(pkg.optimizationProposal);

  if (pkg.priorities.length > 0) {
    selectedPriorityId.set(pkg.priorities[0].id);
  }
  if (pkg.teams.length > 0) {
    selectedTeamId.set(pkg.teams[0].id);
  }

  mapCameraFocus.set({
    center: pkg.center,
    zoom: 1
  });

  addAuditEntry(`Switched operational theatre to ${pkg.hazardName} (${pkg.locationName})`, 'info');
}

// Select Priority Card
export function selectPriority(priorityId: string) {
  selectedPriorityId.set(priorityId);
  const priorities = get(responsePriorities);
  const found = priorities.find((p) => p.id === priorityId);
  if (found) {
    mapCameraFocus.set({
      center: found.coords,
      zoom: 1.25,
      highlightId: priorityId
    });
  }
}

// Select Deployed Team
export function selectTeam(teamId: string) {
  selectedTeamId.set(teamId);
  const teams = get(responseTeams);
  const found = teams.find((t) => t.id === teamId);
  if (found) {
    mapCameraFocus.set({
      center: found.coords,
      zoom: 1.35,
      highlightId: teamId
    });
    selectedMarker.set({
      id: found.id,
      type: 'team',
      name: `${found.code} ${found.name}`,
      coords: found.coords,
      status: found.status,
      meta: {
        leader: found.leader,
        personnel: found.personnel,
        vehicle: found.vehicle,
        mission: found.mission,
        eta: found.eta,
        radioChannel: found.radioChannel
      }
    });
  }
}

// Toggle Map Layer
export function toggleLayer(layerKey: 'teams' | 'resources' | 'evacuation' | 'riskAreas') {
  activeMapLayers.update((l) => ({
    ...l,
    [layerKey]: !l[layerKey]
  }));
}

// Heuristic Auto-Optimization Pipeline Simulation
export async function runAutoOptimization() {
  isAutoOptimizing.set(true);
  isAutoOptimizeModalOpen.set(true);
  optimizationProgress.set(10);
  optimizationStage.set('Scanning real-time flood vector & topographic LIDAR gradients...');

  await new Promise((r) => setTimeout(r, 600));
  optimizationProgress.set(35);
  optimizationStage.set('Calculating shortest navigable corridors for R-01 to R-08...');

  await new Promise((r) => setTimeout(r, 700));
  optimizationProgress.set(65);
  optimizationStage.set('Balancing shelter occupancy limits & medical triage supply buffers...');

  await new Promise((r) => setTimeout(r, 600));
  optimizationProgress.set(88);
  optimizationStage.set('Scheduling synchronized air drop sorties with weather windows...');

  await new Promise((r) => setTimeout(r, 500));
  optimizationProgress.set(100);
  optimizationStage.set('Optimal response vector synthesized: +340K coverage, -115m delay.');
  isAutoOptimizing.set(false);

  addAuditEntry('Ran AXIS Auto-Optimization heuristic engine', 'success');
}

// Apply single recommendation
export function applyOptimizationAction(actionId: string) {
  optimizationProposal.update((prop) => {
    return {
      ...prop,
      recommendedActions: prop.recommendedActions.map((a) =>
        a.id === actionId ? { ...a, applied: true } : a
      )
    };
  });

  // Boost metrics
  responseStatistics.update((s) => ({
    ...s,
    missionCompletion: Math.min(100, s.missionCompletion + 3),
    activeOperations: s.activeOperations + 1
  }));

  addAuditEntry(`Applied optimized recommendation: [${actionId}]`, 'success');
}

// Apply all recommendations
export function applyAllOptimizationActions() {
  optimizationProposal.update((prop) => {
    return {
      ...prop,
      recommendedActions: prop.recommendedActions.map((a) => ({ ...a, applied: true }))
    };
  });

  responseStatistics.update((s) => ({
    ...s,
    missionCompletion: Math.min(100, s.missionCompletion + 8),
    criticalActionsCount: Math.max(0, s.criticalActionsCount - 2)
  }));

  // Update teams
  responseTeams.update((teams) => {
    return teams.map((t) => {
      if (t.code === 'R-01') return { ...t, progress: Math.min(100, t.progress + 15) };
      if (t.code === 'R-04') return { ...t, status: 'Active', progress: 58 };
      return t;
    });
  });

  addAuditEntry('Applied full AXIS Auto-Optimization package to active theater', 'success');
  isAutoOptimizeModalOpen.set(false);
}

// Deploy Team
export function deployTeam(data: {
  teamCode: string;
  destination: string;
  mission: string;
  vehicle: string;
  personnel: number;
}) {
  responseTeams.update((teams) => {
    return teams.map((t) => {
      if (t.code === data.teamCode) {
        return {
          ...t,
          status: 'Active',
          location: data.destination,
          mission: data.mission,
          vehicle: data.vehicle || t.vehicle,
          personnel: data.personnel || t.personnel,
          progress: 10
        };
      }
      return t;
    });
  });

  responseStatistics.update((s) => ({
    ...s,
    personnelDeployed: s.personnelDeployed + (data.personnel || 24),
    activeOperations: s.activeOperations + 1
  }));

  addAuditEntry(`Deployed team ${data.teamCode} to ${data.destination}`, 'success');
  recordHistoryEvent(
    'response',
    `Deployed Tactical Team ${data.teamCode}`,
    data.destination,
    `Mission: ${data.mission} (${data.personnel || 24} personnel)`,
    'success',
    'TACTICAL-OPS'
  );
  isDeployTeamModalOpen.set(false);
}

// Reassign Team
export function reassignTeam(teamId: string, newSector: string, newMission: string) {
  responseTeams.update((teams) => {
    return teams.map((t) => {
      if (t.id === teamId) {
        return {
          ...t,
          sector: newSector,
          mission: newMission,
          status: 'Active',
          progress: 25
        };
      }
      return t;
    });
  });
  addAuditEntry(`Reassigned team ${teamId} to ${newSector}`, 'info');
}

// Recall Team
export function recallTeam(teamId: string) {
  responseTeams.update((teams) => {
    return teams.map((t) => {
      if (t.id === teamId) {
        return {
          ...t,
          status: 'Standby',
          progress: 100,
          mission: 'Staged at base depot for equipment replenishment'
        };
      }
      return t;
    });
  });
  addAuditEntry(`Recalled team ${teamId} to staging depot`, 'warning');
}

// Update Resource Allocation
export function allocateResource(resourceId: string, newDeployed: number) {
  responseResources.update((resList) => {
    return resList.map((r) => {
      if (r.id === resourceId) {
        const capped = Math.min(r.total, Math.max(0, newDeployed));
        const pct = Math.round((capped / r.total) * 100);
        return {
          ...r,
          deployed: capped,
          percentage: pct,
          status: pct > 85 ? 'warning' : 'optimal'
        };
      }
      return r;
    });
  });
  addAuditEntry(`Updated resource allocation for [${resourceId}] to ${newDeployed}`, 'info');
  recordHistoryEvent(
    'resources',
    `Resource Allocation Updated: ${resourceId}`,
    'Theater Depot',
    `Deployed quantity set to ${newDeployed}`,
    'info',
    'LOGISTICS-LEAD'
  );
}

// Execute Upcoming Operation
export function executeOperation(opId: string) {
  upcomingOperations.update((ops) => {
    return ops.map((op) => {
      if (op.id === opId) {
        return {
          ...op,
          status: 'in_progress',
          priority: 'High Priority'
        };
      }
      return op;
    });
  });

  responseStatistics.update((s) => ({
    ...s,
    missionCompletion: Math.min(100, s.missionCompletion + 2)
  }));

  addAuditEntry(`Launched operation [${opId}] into execution`, 'success');
}

// Emergency Alert Broadcast
export function broadcastEmergencyAlert(data: {
  title: string;
  channels: string[];
  severity: string;
  targetRegion: string;
  instructions: string;
}) {
  addAuditEntry(
    `CAP Emergency Alert Broadcasted via [${data.channels.join(', ')}] to ${data.targetRegion}`,
    'critical'
  );
  recordHistoryEvent(
    'comms',
    `CAP Emergency Alert Broadcasted`,
    data.targetRegion,
    `Channels: ${data.channels.join(', ')}`,
    'critical',
    'CIVIL-DEFENSE'
  );
  isSendAlertModalOpen.set(false);
}

// Helper to append audit entry
function addAuditEntry(action: string, severity: 'info' | 'warning' | 'critical' | 'success' = 'info') {
  const now = new Date();
  const timeStr = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')} UTC`;
  responseAuditLog.update((logs) => [
    {
      id: `log-${Date.now()}`,
      timestamp: timeStr,
      operator: 'COMMANDER',
      action,
      target: 'Theater Alpha',
      severity
    },
    ...logs.slice(0, 19)
  ]);
}
