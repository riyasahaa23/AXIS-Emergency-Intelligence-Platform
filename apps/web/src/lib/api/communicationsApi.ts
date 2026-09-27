/**
 * AXIS Communications API Service
 * 
 * Fetches real tactical radio streams, multi-agency channels, and field transmissions.
 */

import { apiFetch } from './client';
import type { CommunicationChannel, CommunicationMessage } from '../types/communications';

export async function fetchChannels(fallback: CommunicationChannel[]): Promise<CommunicationChannel[]> {
  return apiFetch<CommunicationChannel[]>('/api/comms/channels', fallback);
}

export async function fetchMessages(fallback: CommunicationMessage[]): Promise<CommunicationMessage[]> {
  return apiFetch<CommunicationMessage[]>('/api/comms/messages', fallback);
}
