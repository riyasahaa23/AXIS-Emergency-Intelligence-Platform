import type { ScenarioItem, TelemetrySummary, IncidentUpdate } from '../types';

export const MOCK_SCENARIOS: ScenarioItem[] = [
  {
    id: 'scen-01',
    title: 'Cyclone Phailin Category 5',
    subtitle: 'Extreme storm surge and super-cyclonic winds',
    location: 'Bay of Bengal / Odisha Coast',
    category: 'Meteorology',
    icon: 'Wind',
    tag: 'CAT 5',
    baselineMetric: 'Track WNW 160kt',
    projectedMetric: '3.2M exposed',
    delta: '+45% Storm surge',
    details: 'Ensemble trajectory modeling across 50 simulated atmospheric paths with severe coastal inundation.',
    impactStats: '3.2M exposed · 160kt max winds'
  },
  {
    id: 'scen-02',
    title: 'Super Typhoon Mawar',
    subtitle: 'Direct landfall trajectory with catastrophic surge',
    location: 'Western Pacific / Guam',
    category: 'Cyclonic',
    icon: 'Waves',
    tag: 'Super Typhoon',
    baselineMetric: 'Barometric 905 hPa',
    projectedMetric: 'Landfall T-12h',
    delta: '180 mph gusts',
    details: 'Category 5 equivalent super typhoon with projected power grid loss across 85% of territory.',
    impactStats: '180 mph gusts · 85% grid risk'
  },
  {
    id: 'scen-03',
    title: 'Grid Cascade Failure',
    subtitle: 'Multi-substation overload & frequency collapse',
    location: 'Eastern Interconnect / Substation Alpha',
    category: 'Infrastructure',
    icon: 'Zap',
    tag: 'N-1 Contingency',
    baselineMetric: '4.2 GW deficit',
    projectedMetric: '14.8M offline',
    delta: '49.1 Hz frequency trip',
    details: 'Cascading transmission line trips leading to regional blackout within 3.8 minutes.',
    impactStats: '14.8M offline · 4.2 GW deficit'
  },
  {
    id: 'scen-04',
    title: 'Port Bottleneck & Supply Shocks',
    subtitle: 'Container throughput halt and supply chain stall',
    location: 'Strait of Malacca / Port Klang',
    category: 'Logistics',
    icon: 'Truck',
    tag: 'Maritime Chokepoint',
    baselineMetric: '84 Vessels queued',
    projectedMetric: '$1.2B daily cargo delay',
    delta: '+14 days dwell time',
    details: 'Vessel queue congestion leading to global semiconductor and LNG supply chain disruption.',
    impactStats: '$1.2B/day delay · 84 vessels stalled'
  },
  {
    id: 'scen-05',
    title: 'Seismic Disruption & Tsunami Wave',
    subtitle: 'Subduction zone rupture with 4.5m wave propagation',
    location: 'Pacific Rim / Mariana Trench',
    category: 'Geophysics',
    icon: 'Layers',
    tag: 'Mw 7.8',
    baselineMetric: 'Depth 22km',
    projectedMetric: 'Tsunami ETA 28m',
    delta: '4.5m wave height',
    details: 'Tsunamigenic megathrust earthquake with coastal early warning trigger for 6 maritime nations.',
    impactStats: 'Mw 7.8 rupture · 4.5m wave ETA 28m'
  }
];

export const MOCK_TELEMETRY: TelemetrySummary = {
  satellitesOnline: 12,
  weatherFeedsStatus: 'Live',
  groundSensors: 1482,
  dataSources: 28,
  activeIncidents: 7,
  highRisk: 3,
  countriesAffected: 12,
  peopleAffected: '2.8M',
  responseTeams: 142,
  activeShelters: 18,
  criticalResourcesPct: 94
};

export const MOCK_UPDATES: IncidentUpdate[] = [
  {
    id: 'upd-1',
    type: 'shelter',
    text: 'Shelter capacity increased in Dhaka',
    timeAgo: '12 mins ago',
    severity: 'alert'
  },
  {
    id: 'upd-2',
    type: 'hazard',
    text: 'New flood zone detected (Sylhet)',
    timeAgo: '28 mins ago',
    severity: 'warning'
  },
  {
    id: 'upd-3',
    type: 'route',
    text: 'Evacuation route optimised',
    timeAgo: '1 hour ago',
    severity: 'info'
  },
  {
    id: 'upd-4',
    type: 'weather',
    text: 'Weather intensity increased',
    timeAgo: '2 hours ago',
    severity: 'warning'
  }
];
