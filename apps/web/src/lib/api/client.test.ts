import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiFetch, probeBackend, dataFeedStatus, _resetProbeCache } from './client';
import { get } from 'svelte/store';

describe('client - apiFetch and probeBackend fallback architecture', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    _resetProbeCache();
  });

  it('falls back to static fallback value when backend is unreachable', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    const fallbackData = [{ id: 'mock-1', title: 'Fallback Incident' }];
    const result = await apiFetch('/api/v1/incidents', fallbackData);

    expect(result).toEqual(fallbackData);
    expect(get(dataFeedStatus).source).toBe('SIMULATED_MOCK');
    expect(get(dataFeedStatus).isLive).toBe(false);
  });

  it('evaluates functional fallback when provided as a generator function', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('ECONNREFUSED'));

    const fallbackFn = () => ({ status: 'generated-fallback', timestamp: 12345 });
    const result = await apiFetch('/api/v1/telemetry', fallbackFn);

    expect(result).toEqual({ status: 'generated-fallback', timestamp: 12345 });
  });

  it('returns real API response when backend is online and responds with 200 OK', async () => {
    const mockApiResponse = { status: 'healthy', data: [1, 2, 3] };

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockApiResponse
    } as Response);

    const fallback = { status: 'mock' };
    const result = await apiFetch('/api/v1/data', fallback);

    expect(result).toEqual(mockApiResponse);
    expect(get(dataFeedStatus).source).toBe('REAL_API');
    expect(get(dataFeedStatus).isLive).toBe(true);
  });
});
