/**
 * JARVIS Data Provider Layer
 * 
 * Clean normalization pipeline:
 * REAL API (FastAPI backend / Live Feeds)
 *   ↓ (fallback if offline)
 * MOCK DATA PROVIDER
 *   ↓
 * NORMALIZED JARVIS DATA MODEL
 *   ↓
 * SVELTEKIT STORES / UI
 */

import type { HazardIncident, TelemetrySummary } from '../types';
import { INCIDENTS } from '../mock/incidents';
import { MOCK_TELEMETRY } from '../mock/scenarios';

export interface DataFeedStatus {
  source: 'REAL_API' | 'SIMULATED_MOCK';
  isLive: boolean;
  endpoint: string;
  latencyMs: number;
  lastSync: string;
}

const BACKEND_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
  ? 'http://localhost:8000' 
  : 'http://127.0.0.1:8000';

class DataProviderService {
  private feedStatus: DataFeedStatus = {
    source: 'SIMULATED_MOCK',
    isLive: false,
    endpoint: `${BACKEND_URL}/health`,
    latencyMs: 14,
    lastSync: new Date().toISOString()
  };

  /**
   * Health-check backend probe with 1.2s timeout
   */
  async probeBackend(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${BACKEND_URL}/health`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        this.feedStatus = {
          source: 'REAL_API',
          isLive: true,
          endpoint: `${BACKEND_URL}/health`,
          latencyMs: 18,
          lastSync: new Date().toISOString()
        };
        return true;
      }
    } catch {
      // Backend not yet reachable, gracefully switch to simulated provider
    }

    this.feedStatus = {
      source: 'SIMULATED_MOCK',
      isLive: false,
      endpoint: 'MOCK_ENGINE // AUTONOMOUS FALLBACK',
      latencyMs: 4,
      lastSync: new Date().toISOString()
    };
    return false;
  }

  getFeedStatus(): DataFeedStatus {
    return { ...this.feedStatus };
  }

  /**
   * Load normalized incidents from real backend if online, otherwise structured mock
   */
  async getIncidents(): Promise<HazardIncident[]> {
    const isOnline = await this.probeBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/incidents`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) return data;
        }
      } catch (err) {
        console.warn('Real incidents endpoint failed, falling back to simulated store:', err);
      }
    }
    return INCIDENTS;
  }

  /**
   * Load telemetry summary from backend or fallback
   */
  async getTelemetry(): Promise<TelemetrySummary> {
    const isOnline = await this.probeBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/telemetry`);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Real telemetry endpoint failed, falling back to simulated store:', err);
      }
    }
    return MOCK_TELEMETRY;
  }
}

export const dataProvider = new DataProviderService();
