/**
 * AXIS History & Audit API Service
 * 
 * Fetches real tamper-evident chronological event audit logs and incident replay frames.
 */

import { apiFetch } from './client';
import type { HistoryAuditEvent, HistoricalIncidentReplay } from '../types/history';

export async function fetchAuditEvents(fallback: HistoryAuditEvent[]): Promise<HistoryAuditEvent[]> {
  return apiFetch<HistoryAuditEvent[]>('/api/history/audit', fallback);
}

export async function fetchHistoricalReplays(fallback: HistoricalIncidentReplay[]): Promise<HistoricalIncidentReplay[]> {
  return apiFetch<HistoricalIncidentReplay[]>('/api/history/replays', fallback);
}
