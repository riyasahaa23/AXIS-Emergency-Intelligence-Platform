export type HistoryEventCategory =
  | 'incidents'
  | 'analysis'
  | 'scenarios'
  | 'response'
  | 'resources'
  | 'comms'
  | 'system';

export interface HistoryAuditEvent {
  id: string;
  timestamp: string;
  category: HistoryEventCategory;
  actor: string;
  action: string;
  target: string;
  result: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  incidentId?: string;
}

export interface HistoricalReplayState {
  timeOffset: string;     // e.g. "12:00", "12:30", "13:00"
  label: string;          // e.g. "Early Inundation Anomaly"
  waterLevelDelta: string;// e.g. "+0.8m"
  exposedPopulation: string; // e.g. "120,000"
  riskScore: number;      // e.g. 42
  activeTeamsCount: number; // e.g. 4
  evacuatedCount: string; // e.g. "2,400"
  operationalDirective: string;
  stageSummary: string;
  markerCoords: Array<{ name: string; coords: [number, number]; status: string }>;
}

export interface HistoricalIncidentReplay {
  id: string;
  incidentName: string;
  location: string;
  hazardType: string;
  states: HistoricalReplayState[];
}
