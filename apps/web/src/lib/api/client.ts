/**
 * AXIS Base API Client & Fallback Engine
 * 
 * Manages live backend health probing, configurable endpoint URLs,
 * and seamless fallback to high-fidelity mock data when backend is offline.
 */

import { writable } from 'svelte/store';

export interface DataFeedStatus {
  source: 'REAL_API' | 'SIMULATED_MOCK';
  isLive: boolean;
  endpoint: string;
  latencyMs: number;
  lastSync: string;
}

// Configurable backend URL with Vite environment variable support
export const BACKEND_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
  ? (import.meta.env.VITE_API_URL as string)
  : (typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:8000'
      : 'http://127.0.0.1:8000');

export const dataFeedStatus = writable<DataFeedStatus>({
  source: 'SIMULATED_MOCK',
  isLive: false,
  endpoint: 'AUTONOMOUS FALLBACK ENGINE',
  latencyMs: 8,
  lastSync: new Date().toISOString()
});

let lastProbeTime = 0;
let cachedProbeResult = false;
const PROBE_CACHE_TTL_MS = 10_000; // Cache probe status for 10 seconds to avoid spamming

/**
 * Resets probe cache for test isolation.
 */
export function _resetProbeCache() {
  lastProbeTime = 0;
  cachedProbeResult = false;
}

/**
 * Probes the backend `/health` endpoint with a 1.2s timeout.
 * @param force Force a live network probe ignoring cache
 */
export async function probeBackend(force: boolean = false): Promise<boolean> {
  const now = Date.now();
  if (!force && (now - lastProbeTime < PROBE_CACHE_TTL_MS)) {
    return cachedProbeResult;
  }

  const startTime = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const latencyMs = Math.round(performance.now() - startTime);

    if (res.ok) {
      cachedProbeResult = true;
      lastProbeTime = now;
      dataFeedStatus.set({
        source: 'REAL_API',
        isLive: true,
        endpoint: `${BACKEND_URL}/health`,
        latencyMs,
        lastSync: new Date().toISOString()
      });
      return true;
    }
  } catch {
    // Backend offline or unreachable — expected during local dev / demo mode
  }

  cachedProbeResult = false;
  lastProbeTime = now;
  dataFeedStatus.set({
    source: 'SIMULATED_MOCK',
    isLive: false,
    endpoint: 'AUTONOMOUS FALLBACK ENGINE',
    latencyMs: 4,
    lastSync: new Date().toISOString()
  });
  return false;
}

/**
 * Universal safe API fetcher with automatic fallback to canonical mock data.
 * Guarantees zero uncaught exceptions in UI components.
 */
export async function apiFetch<T>(
  endpoint: string,
  fallback: T | (() => T | Promise<T>),
  options?: RequestInit
): Promise<T> {
  const isOnline = await probeBackend();

  if (isOnline) {
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_URL}${endpoint}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      const apiKey = typeof import.meta !== 'undefined' && import.meta.env?.VITE_AXIS_API_KEY;
      if (apiKey) {
        headers['x-api-key'] = apiKey as string;
      }

      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...headers,
          ...options?.headers
        }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        // Validate non-empty payload
        if (data !== null && data !== undefined) {
          return data as T;
        }
      } else {
        console.info(`[AXIS API] ${endpoint} returned status ${res.status}. Using fallback dataset.`);
      }
    } catch (err) {
      console.warn(`[AXIS API] Network error on ${endpoint}:`, err, '— reverting to fallback.');
    }
  }

  // Gracefully resolve fallback data
  if (typeof fallback === 'function') {
    return await (fallback as () => T | Promise<T>)();
  }
  return fallback;
}
