import { describe, it, expect } from 'vitest';
import {
  formatPopulation,
  calculateScenarioResults,
  HAZARD_SCENARIO_CONFIGS
} from './scenarioDatabase';

describe('scenarioDatabase - formatPopulation', () => {
  it('formats millions correctly', () => {
    expect(formatPopulation(2400000)).toBe('2.4M');
    expect(formatPopulation(3000000)).toBe('3M');
    expect(formatPopulation(1550000)).toBe('1.6M');
  });

  it('formats thousands correctly', () => {
    expect(formatPopulation(45000)).toBe('45K');
    expect(formatPopulation(1200)).toBe('1K');
    expect(formatPopulation(98000)).toBe('98K');
  });

  it('handles numbers under 1000', () => {
    expect(formatPopulation(500)).toBe('500');
    expect(formatPopulation(0)).toBe('0');
  });
});

describe('scenarioDatabase - calculateScenarioResults', () => {
  it('returns valid simulation metrics for flood hazard', () => {
    const params = { rainfallIncrease: 50, riverDischarge: 40, durationDays: 7, drainageFailure: 30 };
    const factors = { highTideLock: false, upstreamDamRelease: false, embankmentBreach: false };

    const result = calculateScenarioResults('flood', params, factors, 'D+3');

    expect(result).toBeDefined();
    expect(result.expansionMultiplier).toBeGreaterThan(1.0);
    expect(result.simulatedMetrics.affectedPopulationRaw).toBeGreaterThan(0);
    expect(result.simulatedMetrics.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.simulatedMetrics.riskScore).toBeLessThanOrEqual(100);
    expect(result.riskAnalysis.drivers.length).toBeGreaterThan(0);
    expect(result.diff.affectedDiff).toBeDefined();
    expect(result.diff.affectedPct).toBeDefined();
  });

  it('handles earthquake magnitude escalation properly', () => {
    const baselineParams = { magnitude: 6.8, aftershockRate: 20, infraVulnerability: 15, roadAccessibility: 70 };
    const escalatedParams = { magnitude: 7.8, aftershockRate: 60, infraVulnerability: 45, roadAccessibility: 30 };
    const factors = { tsunamiAdvisory: true, bridgeRupture: true, pipelineRupture: true };

    const baseResult = calculateScenarioResults('earthquake', baselineParams, factors, 'D+1');
    const escalatedResult = calculateScenarioResults('earthquake', escalatedParams, factors, 'D+1');

    expect(escalatedResult.simulatedMetrics.affectedPopulationRaw).toBeGreaterThan(
      baseResult.simulatedMetrics.affectedPopulationRaw
    );
    expect(escalatedResult.expansionMultiplier).toBeGreaterThan(baseResult.expansionMultiplier);
  });

  it('contains valid configuration schemas for all supported hazards', () => {
    const hazards = ['flood', 'cyclone', 'wildfire', 'earthquake', 'multi_hazard'];
    hazards.forEach((hazard) => {
      const config = HAZARD_SCENARIO_CONFIGS[hazard];
      expect(config).toBeDefined();
      expect(config.parameters.length).toBeGreaterThan(0);
      expect(config.presets.length).toBeGreaterThan(0);
      expect(config.baseMetrics).toBeDefined();
    });
  });
});
