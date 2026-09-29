/**
 * AXIS Telemetry API Service
 * 
 * Fetches real telemetry summary from backend when online, falls back to canonical mock telemetry.
 */

import { apiFetch } from './client';
import type { TelemetrySummary } from '../types';
import { MOCK_TELEMETRY } from '../mock/scenarios';

export async function fetchTelemetry(): Promise<TelemetrySummary> {
  return apiFetch<TelemetrySummary>('/api/telemetry', MOCK_TELEMETRY);
}
