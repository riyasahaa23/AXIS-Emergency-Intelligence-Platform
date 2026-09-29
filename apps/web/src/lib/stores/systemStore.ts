import { writable } from 'svelte/store';
import { MOCK_TELEMETRY } from '../mock/scenarios';
import { MOCK_FALLBACK_ENABLED } from '../api/client';
import { fetchTelemetry } from '../api/telemetryApi';
import type { TelemetrySummary } from '../types';

const EMPTY_TELEMETRY: TelemetrySummary = {
  satellitesOnline: 0,
  weatherFeedsStatus: 'Offline',
  groundSensors: 0,
  dataSources: 0,
  activeIncidents: 0,
  highRisk: 0,
  countriesAffected: 0,
  peopleAffected: '0',
  responseTeams: 0,
  activeShelters: 0,
  criticalResourcesPct: 0
};

export const currentUtcTime = writable<string>(new Date().toUTCString());
export const activeNavSection = writable<string>('global');
export const telemetry = writable<TelemetrySummary>(MOCK_FALLBACK_ENABLED ? MOCK_TELEMETRY : EMPTY_TELEMETRY);
export const isAiSpeaking = writable<boolean>(false);
export const audioTranscriptionActive = writable<boolean>(false);

// Panel collapse & modal controls
export const isRightPanelCollapsed = writable<boolean>(false);
export const isNavCollapsed = writable<boolean>(false);
export const isRiskLegendExpanded = writable<boolean>(false);
export const isScenarioDrawerOpen = writable<boolean>(false);
export const isIncidentTelemetryCollapsed = writable<boolean>(false);
export const isAlertsDrawerOpen = writable<boolean>(false);
export const isSettingsModalOpen = writable<boolean>(false);

// Global Incident Action Modals
export const isIncidentAnalyzeModalOpen = writable<boolean>(false);
export const isIncidentSimulateModalOpen = writable<boolean>(false);
export const isIncidentPlanModalOpen = writable<boolean>(false);
export const isUploadDataModalOpen = writable<boolean>(false);

export async function syncTelemetryFromBackend() {
  try {
    telemetry.set(await fetchTelemetry());
  } catch (error) {
    console.warn('[systemStore] telemetry unavailable:', error);
  }
}

export function openIncidentAnalyzeModal() {
  isIncidentAnalyzeModalOpen.set(true);
}
export function closeIncidentAnalyzeModal() {
  isIncidentAnalyzeModalOpen.set(false);
}

export function openIncidentSimulateModal() {
  isIncidentSimulateModalOpen.set(true);
}
export function closeIncidentSimulateModal() {
  isIncidentSimulateModalOpen.set(false);
}

export function openIncidentPlanModal() {
  isIncidentPlanModalOpen.set(true);
}
export function closeIncidentPlanModal() {
  isIncidentPlanModalOpen.set(false);
}

export function openUploadDataModal() {
  isUploadDataModalOpen.set(true);
}
export function closeUploadDataModal() {
  isUploadDataModalOpen.set(false);
}

export function openScenarioDrawer() {
  isScenarioDrawerOpen.set(true);
}

export function closeScenarioDrawer() {
  isScenarioDrawerOpen.set(false);
}

export function toggleScenarioDrawer() {
  isScenarioDrawerOpen.update((v) => !v);
}

export function collapseIncidentTelemetry() {
  isIncidentTelemetryCollapsed.set(true);
}

export function expandIncidentTelemetry() {
  isIncidentTelemetryCollapsed.set(false);
}

export function toggleIncidentTelemetry() {
  isIncidentTelemetryCollapsed.update((v) => !v);
}

// Live UTC time updater
if (typeof window !== 'undefined') {
  syncTelemetryFromBackend();

  setInterval(() => {
    const now = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const month = months[now.getUTCMonth()];
    const day = String(now.getUTCDate()).padStart(2, '0');
    const year = now.getUTCFullYear();
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    currentUtcTime.set(`${month} ${day}, ${year} ${hours}:${minutes}:${seconds} UTC`);
  }, 1000);

  // Live providers poll the backend independently. Refresh the dashboard
  // after each provider cycle so new incidents and aggregate counts appear
  // without a full-page reload.
  setInterval(syncTelemetryFromBackend, 60_000);
}
