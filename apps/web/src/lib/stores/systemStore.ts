import { writable } from 'svelte/store';
import { MOCK_TELEMETRY } from '../mock/scenarios';
import type { TelemetrySummary } from '../types';

export const currentUtcTime = writable<string>('Oct 26, 2024 14:32:18 UTC');
export const activeNavSection = writable<string>('global');
export const telemetry = writable<TelemetrySummary>(MOCK_TELEMETRY);
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
}