/**
 * AXIS Data Provider Layer
 * 
 * Clean normalization pipeline:
 * REAL API (FastAPI backend / Live Feeds)
 *   ↓ (fallback if offline)
 * MOCK DATA PROVIDER
 *   ↓
 * NORMALIZED AXIS DATA MODEL
 *   ↓
 * SVELTEKIT STORES / UI
 */

import type { HazardIncident, TelemetrySummary } from '../types';
import { probeBackend, dataFeedStatus, BACKEND_URL, type DataFeedStatus } from './client';
import { fetchIncidents, fetchIncidentById } from './incidentsApi';
import { fetchTelemetry } from './telemetryApi';
import { fetchAnalysis, fetchAnalysisScenario } from './analysisApi';
import { fetchScenarioConfigs, fetchSavedScenarios, runSimulation } from './scenariosApi';
import { fetchResourcePackage, fetchAllResources } from './resourcesApi';
import { fetchResponsePackage, fetchAllResponses } from './responseApi';
import { fetchChannels, fetchMessages } from './communicationsApi';
import { fetchAuditEvents, fetchHistoricalReplays } from './historyApi';

export { type DataFeedStatus, dataFeedStatus, BACKEND_URL, probeBackend };

class DataProviderService {
  /**
   * Health-check backend probe with 1.2s timeout
   */
  async probeBackend(force: boolean = false): Promise<boolean> {
    return probeBackend(force);
  }

  /**
   * Return current data feed status
   */
  getFeedStatus(): DataFeedStatus {
    let current: DataFeedStatus = {
      source: 'SIMULATED_MOCK',
      isLive: false,
      endpoint: 'AUTONOMOUS FALLBACK ENGINE',
      latencyMs: 4,
      lastSync: new Date().toISOString()
    };
    const unsubscribe = dataFeedStatus.subscribe((s) => { current = s; });
    unsubscribe();
    return current;
  }

  /**
   * Load normalized incidents from real backend if online, otherwise structured mock
   */
  async getIncidents(): Promise<HazardIncident[]> {
    return fetchIncidents();
  }

  /**
   * Load telemetry summary from backend or fallback
   */
  async getTelemetry(): Promise<TelemetrySummary> {
    return fetchTelemetry();
  }
}

export const dataProvider = new DataProviderService();

// Export all individual domain API functions
export {
  fetchIncidents,
  fetchIncidentById,
  fetchTelemetry,
  fetchAnalysis,
  fetchAnalysisScenario,
  fetchScenarioConfigs,
  fetchSavedScenarios,
  runSimulation,
  fetchResourcePackage,
  fetchAllResources,
  fetchResponsePackage,
  fetchAllResponses,
  fetchChannels,
  fetchMessages,
  fetchAuditEvents,
  fetchHistoricalReplays
};
