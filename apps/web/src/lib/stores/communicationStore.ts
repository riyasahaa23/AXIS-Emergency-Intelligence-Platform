import { writable, derived, get } from 'svelte/store';
import type {
  CommunicationChannel,
  CommunicationMessage,
  CommunicationNode,
  CommunicationLink,
  MessageSeverity
} from '../types/communications';
import { selectedIncident } from './incidentStore';
import { recordHistoryEvent } from './historyStore';

// Initial 6 Channels
const INITIAL_CHANNELS: CommunicationChannel[] = [
  {
    id: 'cmd',
    name: 'Emergency Command',
    icon: '⚡',
    status: 'CONNECTED',
    unreadCount: 2,
    isMuted: false,
    unitCount: 14,
    description: 'Joint Inter-Agency Strategic Directive & Order Stream'
  },
  {
    id: 'med',
    name: 'Medical',
    icon: '🏥',
    status: 'CONNECTED',
    unreadCount: 1,
    isMuted: false,
    unitCount: 28,
    description: 'Triage Hospital Network, Trauma Surgical Units & Medevac'
  },
  {
    id: 'field',
    name: 'Field Operations',
    icon: '🧭',
    status: 'CONNECTED',
    unreadCount: 4,
    isMuted: false,
    unitCount: 42,
    description: 'Ground Reconnaissance, Perimeter Watch & Evacuation Leads'
  },
  {
    id: 'rescue',
    name: 'Rescue',
    icon: '🚁',
    status: 'CONNECTED',
    unreadCount: 0,
    isMuted: false,
    unitCount: 18,
    description: 'Helicopter Hoist Sorties, Flood Watercraft & USAR Teams'
  },
  {
    id: 'logistics',
    name: 'Logistics',
    icon: '📦',
    status: 'DEGRADED',
    unreadCount: 3,
    isMuted: false,
    unitCount: 32,
    description: 'Depot Convoys, Fuel Tankers & Water Membrane Distribution'
  },
  {
    id: 'intel',
    name: 'Intelligence',
    icon: '🛰️',
    status: 'CONNECTED',
    unreadCount: 0,
    isMuted: false,
    unitCount: 12,
    description: 'Synthetic Aperture Radar Feeds, Hydrologic Sensor Array'
  }
];

// Initial Messages
const INITIAL_MESSAGES: CommunicationMessage[] = [
  {
    id: 'msg-01',
    channelId: 'cmd',
    senderName: 'General HQ Command',
    senderRole: 'Strategic Commander',
    senderLocation: 'Dhaka Joint Ops Center',
    timestamp: '14:31:02 UTC',
    content: 'DEFCON 2 ALERT: Authorizing emergency relocation of helicopter H-001 to Sylhet Forward Airhead. All secondary units maintain continuous frequency monitoring.',
    severity: 'critical',
    acknowledged: true,
    unread: false,
    coords: [90.4125, 23.8103]
  },
  {
    id: 'msg-02',
    channelId: 'cmd',
    senderName: 'Civil Defense Directorate',
    senderRole: 'Operations Liaison',
    senderLocation: 'Sylhet Disaster Division',
    timestamp: '14:28:44 UTC',
    content: 'Surma River embankment breached at Sector 4. Inundation velocity 1.8m/s. Evacuation priority ordered for 12,000 residents in Sunamganj lowlands.',
    severity: 'critical',
    acknowledged: false,
    unread: true,
    coords: [91.8687, 24.8949]
  },
  {
    id: 'msg-03',
    channelId: 'med',
    senderName: 'Field Hospital Alpha',
    senderRole: 'Chief Medical Officer',
    senderLocation: 'Sylhet Central Hospital',
    timestamp: '14:25:12 UTC',
    content: 'Emergency blood plasma and water purification membranes arrived via shipment SH-021. Intensive care capacity expanded by 45 beds.',
    severity: 'info',
    acknowledged: true,
    unread: false,
    coords: [91.8687, 24.8949]
  },
  {
    id: 'msg-04',
    channelId: 'med',
    senderName: 'Mobile Trauma Unit 2',
    senderRole: 'Paramedic Lead',
    senderLocation: 'Mymensingh Transit Post',
    timestamp: '14:20:18 UTC',
    content: 'En route to Barisal lowlands. Requesting additional tetanus antitoxins and pediatric rehydration packs at next resupply waypoint.',
    severity: 'warning',
    acknowledged: false,
    unread: true,
    coords: [90.4074, 24.7471]
  },
  {
    id: 'msg-05',
    channelId: 'field',
    senderName: 'Recon Team Bravo-4',
    senderRole: 'Squad Leader',
    senderLocation: 'Chittagong Coastal Sector',
    timestamp: '14:18:00 UTC',
    content: 'Access road N-1 cleared of debris by engineering detachment. Heavy convoy transport cleared up to 25 metric tons.',
    severity: 'info',
    acknowledged: true,
    unread: false,
    coords: [91.8317, 22.3569]
  },
  {
    id: 'msg-06',
    channelId: 'field',
    senderName: 'Perimeter Watch 07',
    senderRole: 'Field Observer',
    senderLocation: 'Khulna Lowlands',
    timestamp: '14:15:30 UTC',
    content: 'Tidal surge rising faster than projected model (+0.4m above baseline). Secondary floodwall showing stress micro-fractures.',
    severity: 'warning',
    acknowledged: false,
    unread: true,
    coords: [89.5403, 22.8456]
  },
  {
    id: 'msg-07',
    channelId: 'rescue',
    senderName: 'Aero-Rescue Sortie 03',
    senderRole: 'Flight Commander',
    senderLocation: 'Sunamganj Overflight',
    timestamp: '14:12:05 UTC',
    content: 'Hoisted 28 evacuees from isolated school roof. Delivering to Sylhet Stadium shelter. Fuel reserves at 65%.',
    severity: 'info',
    acknowledged: true,
    unread: false,
    coords: [91.3992, 25.0658]
  },
  {
    id: 'msg-08',
    channelId: 'logistics',
    senderName: 'Freight Logistics Control',
    senderRole: 'Dispatcher',
    senderLocation: 'Dhaka Supply Depot',
    timestamp: '14:08:50 UTC',
    content: 'WARNING: Cellular uplink degraded across Comilla transit corridor. Convoys falling back to tactical VHF radio link.',
    severity: 'warning',
    acknowledged: false,
    unread: true,
    coords: [90.4125, 23.8103]
  },
  {
    id: 'msg-09',
    channelId: 'intel',
    senderName: 'AXIS Orbital Recon',
    senderRole: 'Autonomous AI',
    senderLocation: 'Copernicus Sentinel Feed',
    timestamp: '14:02:11 UTC',
    content: 'SAR Satellite radar swath confirms 420 sq km inundation extent. Cloud coverage 98%. Neural hydrological model updated.',
    severity: 'routine',
    acknowledged: true,
    unread: false,
    coords: [90.4125, 23.8103]
  }
];

// Initial Topology Nodes
const INITIAL_NODES: CommunicationNode[] = [
  {
    id: 'node-dhaka',
    name: 'National Strategic Command',
    type: 'command',
    coords: [90.4125, 23.8103],
    status: 'ONLINE',
    channelIds: ['cmd', 'intel', 'logistics'],
    unitCallsign: 'ALPHA-HQ-01'
  },
  {
    id: 'node-sylhet-fob',
    name: 'Sylhet Advanced Forward Base',
    type: 'rescue',
    coords: [91.8687, 24.8949],
    status: 'ONLINE',
    channelIds: ['cmd', 'rescue', 'med', 'field'],
    unitCallsign: 'BRAVO-FOB-02'
  },
  {
    id: 'node-sylhet-med',
    name: 'Sylhet Emergency Triage Hospital',
    type: 'medical',
    coords: [91.875, 24.882],
    status: 'ONLINE',
    channelIds: ['med', 'logistics'],
    unitCallsign: 'MEDIC-SYL-01'
  },
  {
    id: 'node-sunamganj',
    name: 'Sunamganj Disaster Shelter',
    type: 'shelter',
    coords: [91.3992, 25.0658],
    status: 'ONLINE',
    channelIds: ['field', 'rescue', 'med'],
    unitCallsign: 'SHELTER-SUN-04'
  },
  {
    id: 'node-chittagong',
    name: 'Chittagong Coastal Naval Depot',
    type: 'logistics',
    coords: [91.8317, 22.3569],
    status: 'ONLINE',
    channelIds: ['logistics', 'field', 'cmd'],
    unitCallsign: 'NAV-DEPOT-03'
  },
  {
    id: 'node-barisal',
    name: 'Barisal River Transport Station',
    type: 'field',
    coords: [90.3696, 22.701],
    status: 'DEGRADED',
    channelIds: ['logistics', 'rescue', 'field'],
    unitCallsign: 'RIVER-BAR-05'
  }
];

// Initial Topology Links
const INITIAL_LINKS: CommunicationLink[] = [
  { id: 'link-01', fromNodeId: 'node-dhaka', toNodeId: 'node-sylhet-fob', status: 'OPTIMAL', latencyMs: 14 },
  { id: 'link-02', fromNodeId: 'node-sylhet-fob', toNodeId: 'node-sylhet-med', status: 'OPTIMAL', latencyMs: 4 },
  { id: 'link-03', fromNodeId: 'node-sylhet-fob', toNodeId: 'node-sunamganj', status: 'OPTIMAL', latencyMs: 22 },
  { id: 'link-04', fromNodeId: 'node-dhaka', toNodeId: 'node-chittagong', status: 'OPTIMAL', latencyMs: 18 },
  { id: 'link-05', fromNodeId: 'node-dhaka', toNodeId: 'node-barisal', status: 'DEGRADED', latencyMs: 98 },
  { id: 'link-06', fromNodeId: 'node-chittagong', toNodeId: 'node-barisal', status: 'DEGRADED', latencyMs: 84 }
];

// Stores
export const communicationChannels = writable<CommunicationChannel[]>(INITIAL_CHANNELS);
export const activeCommunicationChannelId = writable<string>('cmd');
export const communicationMessages = writable<CommunicationMessage[]>(INITIAL_MESSAGES);
export const communicationNodes = writable<CommunicationNode[]>(INITIAL_NODES);
export const communicationLinks = writable<CommunicationLink[]>(INITIAL_LINKS);
export const communicationSearchQuery = writable<string>('');
export const activeMessageSeverityFilter = writable<'ALL' | MessageSeverity>('ALL');
export const selectedCommunicationNodeId = writable<string | null>(null);
export const isBroadcastModalOpen = writable<boolean>(false);

// Derived: Current Active Channel
export const activeCommunicationChannel = derived(
  [communicationChannels, activeCommunicationChannelId],
  ([$channels, $activeId]) => {
    return $channels.find((c) => c.id === $activeId) || $channels[0];
  }
);

// Derived: Filtered Message Stream
export const filteredCommunicationMessages = derived(
  [communicationMessages, activeCommunicationChannelId, communicationSearchQuery, activeMessageSeverityFilter],
  ([$messages, $channelId, $query, $severity]) => {
    return $messages.filter((m) => {
      if (m.channelId !== $channelId) return false;
      if ($severity !== 'ALL' && m.severity !== $severity) return false;
      if ($query.trim()) {
        const q = $query.toLowerCase();
        return (
          m.content.toLowerCase().includes(q) ||
          m.senderName.toLowerCase().includes(q) ||
          m.senderRole.toLowerCase().includes(q) ||
          m.senderLocation.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }
);

// Actions
export function selectCommunicationChannel(channelId: string) {
  activeCommunicationChannelId.set(channelId);
  // Mark channel unread as cleared
  communicationChannels.update((channels) =>
    channels.map((c) => (c.id === channelId ? { ...c, unreadCount: 0 } : c))
  );
}

export function toggleMuteChannel(channelId: string) {
  communicationChannels.update((channels) =>
    channels.map((c) => (c.id === channelId ? { ...c, isMuted: !c.isMuted } : c))
  );
}

export function sendMessage(content: string, severity: MessageSeverity = 'routine') {
  if (!content.trim()) return;
  const channelId = get(activeCommunicationChannelId);
  const now = new Date();
  const timeStr = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')} UTC`;

  const newMsg: CommunicationMessage = {
    id: `msg-${Date.now()}`,
    channelId,
    senderName: 'AXIS Command Station',
    senderRole: 'Mission Operations',
    senderLocation: 'Planetary Emergency Ops',
    timestamp: timeStr,
    content,
    severity,
    acknowledged: true,
    unread: false,
    coords: [90.4125, 23.8103]
  };

  communicationMessages.update((msgs) => [newMsg, ...msgs]);

  recordHistoryEvent(
    'comms',
    `Transmission Sent to #${channelId.toUpperCase()}`,
    channelId,
    content.slice(0, 80),
    severity === 'critical' ? 'critical' : severity === 'warning' ? 'warning' : 'info',
    'AXIS-OPERATOR'
  );
}

export function acknowledgeMessage(messageId: string) {
  communicationMessages.update((msgs) =>
    msgs.map((m) => (m.id === messageId ? { ...m, acknowledged: true, unread: false } : m))
  );
}

export function toggleMessageRead(messageId: string) {
  communicationMessages.update((msgs) =>
    msgs.map((m) => (m.id === messageId ? { ...m, unread: !m.unread } : m))
  );
}

export function focusCommunicationNode(nodeId: string) {
  selectedCommunicationNodeId.set(nodeId);
}

export function dispatchEmergencyBroadcast(data: {
  severity: MessageSeverity;
  targetSector: string;
  message: string;
}) {
  const now = new Date();
  const timeStr = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')} UTC`;

  const broadcastMsg: CommunicationMessage = {
    id: `bcast-${Date.now()}`,
    channelId: get(activeCommunicationChannelId),
    senderName: '🚨 EMERGENCY BROADCAST SYSTEM (EBS)',
    senderRole: 'Civil Protection Agency',
    senderLocation: data.targetSector,
    timestamp: timeStr,
    content: `[URGENT BROADCAST TO ${data.targetSector.toUpperCase()}]: ${data.message}`,
    severity: data.severity,
    acknowledged: false,
    unread: true,
    coords: [90.4125, 23.8103]
  };

  communicationMessages.update((msgs) => [broadcastMsg, ...msgs]);
  isBroadcastModalOpen.set(false);

  recordHistoryEvent(
    'comms',
    `EBS Emergency Alert Dispatched: ${data.targetSector}`,
    data.targetSector,
    data.message.slice(0, 100),
    'critical',
    'CIVIL-DEFENSE'
  );
}
