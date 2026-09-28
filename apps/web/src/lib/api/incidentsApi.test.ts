import { describe, it, expect, vi } from 'vitest';
import { normalizeIncident } from './incidentsApi';
import { MOCK_INCIDENTS } from '../mock/incidents';

describe('incidentsApi - normalizeIncident', () => {
  it('rejects empty payloads instead of fabricating an incident', () => {
    expect(() => normalizeIncident(null)).toThrow('Incident payload is empty');
  });

  it('preserves existing canonical HazardIncident format intact', () => {
    const canonical = MOCK_INCIDENTS[1];
    const result = normalizeIncident(canonical);
    expect(result.id).toBe(canonical.id);
    expect(result.name).toBe(canonical.name);
    expect(result.coords).toEqual(canonical.coords);
  });

  it('normalizes raw backend FastAPI payload with numeric severity and population', () => {
    const rawBackendPayload = {
      id: 'backend-test-99',
      title: 'Sylhet Flash Flood',
      hazard_type: 'FLOOD',
      location: 'Sylhet Division',
      country: 'Bangladesh',
      severity: 85,
      population: 1500000,
      confidence: 0.95
    };

    const normalized = normalizeIncident(rawBackendPayload);

    expect(normalized.id).toBe('backend-test-99');
    expect(normalized.name).toBe('Sylhet Flash Flood');
    expect(normalized.type).toBe('flood');
    expect(normalized.severity).toBe('critical'); // >= 80 is critical
    expect(normalized.affectedPopulation).toContain('1.5M affected');
    expect(normalized.affectedPopulationNum).toBe(1500000);
    expect(normalized.displacedPopulationNum).toBe(0);
    expect(normalized.roadsAffected).toBe(0);
    expect(normalized.districtsAffected).toBe(0);
    expect(normalized.riskScore).toBe(85);
    expect(normalized.overview).toBeDefined();
    expect(normalized.details).toBeDefined();
  });

  it('correctly maps severity thresholds for high, moderate, and low', () => {
    expect(normalizeIncident({ severity: 75 }).severity).toBe('high');
    expect(normalizeIncident({ severity: 50 }).severity).toBe('moderate');
    expect(normalizeIncident({ severity: 20 }).severity).toBe('low');
  });
});
