export type ChannelStatus = 'CONNECTED' | 'DEGRADED' | 'OFFLINE';
export type MessageSeverity = 'critical' | 'warning' | 'info' | 'routine';
export type NodeType = 'command' | 'medical' | 'rescue' | 'logistics' | 'shelter' | 'field';

export interface CommunicationChannel {
  id: string;
  name: string;
  icon: string;
  status: ChannelStatus;
  unreadCount: number;
  isMuted: boolean;
  unitCount: number;
  description: string;
}

export interface CommunicationMessage {
  id: string;
  channelId: string;
  senderName: string;
  senderRole: string;
  senderLocation: string;
  timestamp: string;
  content: string;
  severity: MessageSeverity;
  acknowledged: boolean;
  unread: boolean;
  attachedIncidentId?: string;
  coords?: [number, number]; // [lng, lat]
}

export interface CommunicationNode {
  id: string;
  name: string;
  type: NodeType;
  coords: [number, number]; // [lng, lat]
  status: 'ONLINE' | 'DEGRADED';
  channelIds: string[];
  unitCallsign: string;
}

export interface CommunicationLink {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  status: 'OPTIMAL' | 'DEGRADED';
  latencyMs: number;
}
