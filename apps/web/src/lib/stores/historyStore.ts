import { writable, derived, get } from 'svelte/store';
import type {
  HistoryAuditEvent,
  HistoryEventCategory,
  HistoricalIncidentReplay,
  HistoricalReplayState
} from '../types/history';

// Initial Chronological Audit Events
const INITIAL_AUDIT_EVENTS: HistoryAuditEvent[] = [
  {
    id: 'evt-09',
    timestamp: '14:32:18 UTC',
    category: 'system',
    actor: 'JARVIS-CORE',
    action: 'Telemetry Heartbeat Validated',
    target: 'Global Spacecraft Sensor Array',
    result: 'All 8 telemetry links nominal',
    severity: 'info'
  },
  {
    id: 'evt-08',
    timestamp: '14:15:30 UTC',
    category: 'comms',
    actor: 'CIVIL-DEFENSE',
    action: 'Emergency Broadcast Dispatched',
    target: 'Sylhet & Sunamganj Lowlands',
    result: '14 carrier networks alerted (2.4M reach)',
    severity: 'critical'
  },
  {
    id: 'evt-07',
    timestamp: '14:10:45 UTC',
    category: 'response',
    actor: 'COMMANDER',
    action: 'Evacuation Corridor Updated',
    target: 'Corridor Alpha (Highway N-2)',
    result: 'Priority transit lanes designated',
    severity: 'warning'
  },
  {
    id: 'evt-06',
    timestamp: '13:31:20 UTC',
    category: 'resources',
    actor: 'LOGISTICS-LEAD',
    action: 'Resources Allocated to Forward Depot',
    target: 'Sylhet Forward Operating Base (FAC-02)',
    result: '500x water purifiers + 120x medical pods delivered',
    severity: 'success'
  },
  {
    id: 'evt-05',
    timestamp: '13:24:12 UTC',
    category: 'response',
    actor: 'TACTICAL-OPS',
    action: 'Swiftwater Team Deployed',
    target: 'Sunamganj Lowlands Sector 2',
    result: 'Team 01 en route with 4x amphibious RIBs',
    severity: 'success'
  },
  {
    id: 'evt-04',
    timestamp: '13:18:55 UTC',
    category: 'response',
    actor: 'COMMANDER',
    action: 'Response Directive Plan Approved',
    target: 'Dhaka & Sylhet Divisions',
    result: 'Phase 1 high-velocity evacuation authorized',
    severity: 'info'
  },
  {
    id: 'evt-03',
    timestamp: '13:02:40 UTC',
    category: 'scenarios',
    actor: 'NEURAL-SIM',
    action: 'Scenario Simulation Generated',
    target: '+50% Precipitation & Dam Release',
    result: 'Projected inundation depth +2.4m in 48 hours',
    severity: 'warning'
  },
  {
    id: 'evt-02',
    timestamp: '12:48:15 UTC',
    category: 'analysis',
    actor: 'COPERNICUS-SAR',
    action: 'Neural Risk Analysis Completed',
    target: 'Surma & Meghna River Basins',
    result: 'Severity upgraded to CRITICAL (Risk Index 92/100)',
    severity: 'critical'
  },
  {
    id: 'evt-01',
    timestamp: '12:40:02 UTC',
    category: 'incidents',
    actor: 'ORBITAL-WATCH',
    action: 'Hazard Anomaly Detected',
    target: 'Northeastern Bangladesh Drainage Basin',
    result: 'Precipitation 180mm/6hr detected via GPM constellation',
    severity: 'warning'
  }
];

// Replay Packages
const REPLAY_PACKAGES: HistoricalIncidentReplay[] = [
  {
    id: 'replay-bangladesh',
    incidentName: 'Severe Flooding — Bangladesh',
    location: 'Dhaka & Sylhet Divisions',
    hazardType: 'flood',
    states: [
      {
        timeOffset: '12:00',
        label: 'Early Hydrological Anomaly',
        waterLevelDelta: '+0.4m',
        exposedPopulation: '85,000',
        riskScore: 38,
        activeTeamsCount: 2,
        evacuatedCount: '800',
        operationalDirective: 'Continuous sensor monitoring and orbital swath tasking',
        stageSummary: 'Precipitation surge detected over Meghalaya headwaters. River stage gauges show rapid rise.',
        markerCoords: [
          { name: 'Dhaka HQ', coords: [90.41, 23.81], status: 'Standby' },
          { name: 'Sylhet Gauge', coords: [91.86, 24.89], status: 'Monitoring' }
        ]
      },
      {
        timeOffset: '12:30',
        label: 'Upstream Basin Inundation',
        waterLevelDelta: '+1.1m',
        exposedPopulation: '320,000',
        riskScore: 58,
        activeTeamsCount: 8,
        evacuatedCount: '4,500',
        operationalDirective: 'Pre-position rotary wing assets and alert district civil defense',
        stageSummary: 'Surma River approaches danger level. Secondary agricultural embankments overtopped.',
        markerCoords: [
          { name: 'Dhaka HQ', coords: [90.41, 23.81], status: 'Active' },
          { name: 'Sylhet FOB', coords: [91.86, 24.89], status: 'Mobilizing' },
          { name: 'Sunamganj Sector', coords: [91.39, 25.06], status: 'Warning' }
        ]
      },
      {
        timeOffset: '13:00',
        label: 'Primary Embankment Breach',
        waterLevelDelta: '+1.9m',
        exposedPopulation: '1,250,000',
        riskScore: 84,
        activeTeamsCount: 18,
        evacuatedCount: '28,000',
        operationalDirective: 'Execute emergency mass evacuation across Sunamganj and Sylhet lowlands',
        stageSummary: 'CRITICAL: 40-meter breach at Surma floodwall. Water velocity exceeds 2.2 m/s.',
        markerCoords: [
          { name: 'Dhaka HQ', coords: [90.41, 23.81], status: 'Command Active' },
          { name: 'Sylhet FOB', coords: [91.86, 24.89], status: 'Sortie Staging' },
          { name: 'Sunamganj Breach', coords: [91.39, 25.06], status: 'Breached' },
          { name: 'Mymensingh Transit', coords: [90.40, 24.74], status: 'Receiving Evacuees' }
        ]
      },
      {
        timeOffset: '13:30',
        label: 'Peak Flood Surge Wave',
        waterLevelDelta: '+2.4m',
        exposedPopulation: '2,400,000',
        riskScore: 94,
        activeTeamsCount: 32,
        evacuatedCount: '62,000',
        operationalDirective: 'Civil Emergency Broadcast issued; amphibious watercraft rescue priority',
        stageSummary: 'Widespread inundation of residential zones. Power substation isolation protocols initiated.',
        markerCoords: [
          { name: 'Dhaka HQ', coords: [90.41, 23.81], status: 'Command Active' },
          { name: 'Sylhet FOB', coords: [91.86, 24.89], status: 'Continuous Airlift' },
          { name: 'Sunamganj Basin', coords: [91.39, 25.06], status: 'Submerged' },
          { name: 'Barisal Depot', coords: [90.36, 22.70], status: 'Barge Dispatch' }
        ]
      },
      {
        timeOffset: '14:00',
        label: 'Sustained Response & Airhead Airbridge',
        waterLevelDelta: '+2.2m',
        exposedPopulation: '2,150,000',
        riskScore: 86,
        activeTeamsCount: 36,
        evacuatedCount: '94,000',
        operationalDirective: 'Establish potable water points and deliver surgical trauma kits to shelters',
        stageSummary: 'Flood surge plateau reached. Emergency airbridge operating 12 sorties per hour.',
        markerCoords: [
          { name: 'Dhaka HQ', coords: [90.41, 23.81], status: 'Command Active' },
          { name: 'Sylhet FOB', coords: [91.86, 24.89], status: 'Airhead Staging' },
          { name: 'Shelters Active', coords: [91.87, 24.88], status: '48 Shelters Open' }
        ]
      },
      {
        timeOffset: '15:00',
        label: 'Waters Receding & Damage Assessment',
        waterLevelDelta: '+1.6m',
        exposedPopulation: '1,600,000',
        riskScore: 68,
        activeTeamsCount: 28,
        evacuatedCount: '112,000',
        operationalDirective: 'Transition to recovery, disease prevention, and infrastructure repair',
        stageSummary: 'Headwaters receding. Water purification convoys deployed along cleared corridors.',
        markerCoords: [
          { name: 'Dhaka HQ', coords: [90.41, 23.81], status: 'Recovery Phase' },
          { name: 'Sylhet FOB', coords: [91.86, 24.89], status: 'Logistics Center' }
        ]
      }
    ]
  }
];

// Stores
export const historyAuditEvents = writable<HistoryAuditEvent[]>(INITIAL_AUDIT_EVENTS);
export const historyCategoryFilter = writable<'ALL' | HistoryEventCategory>('ALL');
export const historySearchQuery = writable<string>('');

// Incident Replay Stores
export const selectedReplayIncidentId = writable<string>('replay-bangladesh');
export const currentReplayTimeIndex = writable<number>(2); // Default to 13:00 (Breach)
export const isReplayPlaying = writable<boolean>(false);
let replayTimer: any = null;

// Derived: Filtered Audit Events
export const filteredHistoryEvents = derived(
  [historyAuditEvents, historyCategoryFilter, historySearchQuery],
  ([$events, $cat, $query]) => {
    return $events.filter((e) => {
      if ($cat !== 'ALL' && e.category !== $cat) return false;
      if ($query.trim()) {
        const q = $query.toLowerCase();
        return (
          e.action.toLowerCase().includes(q) ||
          e.actor.toLowerCase().includes(q) ||
          e.target.toLowerCase().includes(q) ||
          e.result.toLowerCase().includes(q) ||
          e.timestamp.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }
);

// Derived: Current Replay Package & State
export const activeReplayPackage = derived(selectedReplayIncidentId, ($id) => {
  return REPLAY_PACKAGES.find((p) => p.id === $id) || REPLAY_PACKAGES[0];
});

export const currentReplayState = derived(
  [activeReplayPackage, currentReplayTimeIndex],
  ([$pkg, $idx]) => {
    const safeIdx = Math.max(0, Math.min($pkg.states.length - 1, $idx));
    return $pkg.states[safeIdx];
  }
);

// Actions
export function recordHistoryEvent(
  category: HistoryEventCategory,
  action: string,
  target: string,
  result: string,
  severity: 'critical' | 'warning' | 'info' | 'success' = 'info',
  actor: string = 'COMMANDER'
) {
  const now = new Date();
  const timeStr = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')} UTC`;

  const newEvent: HistoryAuditEvent = {
    id: `evt-${Date.now()}`,
    timestamp: timeStr,
    category,
    actor,
    action,
    target,
    result,
    severity
  };

  historyAuditEvents.update((events) => [newEvent, ...events]);
}

export function setReplayTimeIndex(index: number) {
  currentReplayTimeIndex.set(index);
}

export function toggleReplayPlayback() {
  const playing = get(isReplayPlaying);
  if (playing) {
    isReplayPlaying.set(false);
    if (replayTimer) {
      clearInterval(replayTimer);
      replayTimer = null;
    }
  } else {
    isReplayPlaying.set(true);
    replayTimer = setInterval(() => {
      const pkg = get(activeReplayPackage);
      currentReplayTimeIndex.update((curr) => {
        const next = curr + 1;
        if (next >= pkg.states.length) {
          isReplayPlaying.set(false);
          clearInterval(replayTimer);
          replayTimer = null;
          return 0;
        }
        return next;
      });
    }, 2200);
  }
}
