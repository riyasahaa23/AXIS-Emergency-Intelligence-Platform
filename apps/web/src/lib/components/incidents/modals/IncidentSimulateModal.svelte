<script lang="ts">
  import {
    isIncidentSimulateModalOpen,
    closeIncidentSimulateModal,
    activeNavSection,
    openIncidentPlanModal
  } from '$lib/stores/systemStore';
  import { selectedIncident } from '$lib/stores/incidentStore';
  import {
    savedScenarios,
    activeSavedScenarioId,
    activeScenarioView,
    comparisonScenarioA,
    comparisonScenarioB
  } from '$lib/stores/scenarioStore';
  import { recordHistoryEvent } from '$lib/stores/historyStore';
  import type { SavedScenario } from '$lib/types/scenario';

  interface SimParam {
    id: string;
    label: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
    unit: string;
    description: string;
  }

  let isSimulating = false;
  let hasResult = false;
  let paramValues: Record<string, number> = {};
  let simResult: {
    baselineRisk: number;
    scenarioRisk: number;
    riskDelta: number;
    populationImpact: string;
    populationDelta: string;
    infrastructureImpact: string;
    additionalResources: string[];
    scenarioId: string;
  } | null = null;

  // Initialize hazard-specific parameters whenever selectedIncident changes
  $: if ($selectedIncident) {
    const defaultParams = getParamsForHazard($selectedIncident.type);
    const newValues: Record<string, number> = {};
    defaultParams.forEach((p) => {
      newValues[p.id] = p.defaultValue;
    });
    paramValues = newValues;
    hasResult = false;
    simResult = null;
  }

  function getParamsForHazard(type: string): SimParam[] {
    const t = type.toLowerCase();
    if (t.includes('earthquake')) {
      return [
        {
          id: 'magnitude',
          label: 'Earthquake Magnitude',
          min: 5.0,
          max: 8.5,
          step: 0.1,
          defaultValue: 6.8,
          unit: 'M',
          description: 'Moment magnitude scale of primary crustal rupture'
        },
        {
          id: 'aftershockProb',
          label: 'Aftershock Probability (>M5.0)',
          min: 5,
          max: 85,
          step: 5,
          defaultValue: 20,
          unit: '%',
          description: 'Probability of significant secondary seismic ruptures within 48h'
        },
        {
          id: 'infraDegradation',
          label: 'Infrastructure Degradation',
          min: 5,
          max: 60,
          step: 5,
          defaultValue: 15,
          unit: '%',
          description: 'Structural failure percentage across older masonry & bridges'
        },
        {
          id: 'durationHours',
          label: 'Operational Horizon',
          min: 12,
          max: 72,
          step: 6,
          defaultValue: 24,
          unit: 'h',
          description: 'Emergency response and aftershock monitoring window'
        }
      ];
    } else if (t.includes('cyclone')) {
      return [
        {
          id: 'windSpeed',
          label: 'Sustained Wind Speed',
          min: 120,
          max: 290,
          step: 5,
          defaultValue: 195,
          unit: 'km/h',
          description: 'Peak 10-minute maximum sustained eye-wall wind velocity'
        },
        {
          id: 'stormSurge',
          label: 'Coastal Storm Surge Height',
          min: 1.0,
          max: 5.5,
          step: 0.5,
          defaultValue: 2.8,
          unit: 'm',
          description: 'Inundation wave height above standard astronomical high tide'
        },
        {
          id: 'rainfallAcc',
          label: 'Rainfall Accumulation',
          min: 50,
          max: 450,
          step: 25,
          defaultValue: 220,
          unit: 'mm',
          description: '24-hour total precipitation deluge along coastal landfall belt'
        },
        {
          id: 'trackDeviation',
          label: 'Track Deviation Angle',
          min: -30,
          max: 30,
          step: 5,
          defaultValue: 0,
          unit: '°',
          description: 'Westward (-) or Eastward (+) vortex trajectory shift'
        }
      ];
    } else if (t.includes('wildfire')) {
      return [
        {
          id: 'windVelocity',
          label: 'Wind Gust Velocity',
          min: 15,
          max: 85,
          step: 5,
          defaultValue: 45,
          unit: 'km/h',
          description: 'Surface wind velocity driving thermal front advance'
        },
        {
          id: 'relHumidity',
          label: 'Relative Humidity',
          min: 5,
          max: 40,
          step: 1,
          defaultValue: 16,
          unit: '%',
          description: 'Air dryness accelerating atmospheric ember ignition'
        },
        {
          id: 'spreadRate',
          label: 'Front Spread Velocity',
          min: 2,
          max: 28,
          step: 2,
          defaultValue: 14,
          unit: 'km/d',
          description: 'Rate of perimeter perimeter progression through dry timber'
        },
        {
          id: 'tempAnomaly',
          label: 'Ambient Temperature',
          min: 28,
          max: 48,
          step: 1,
          defaultValue: 38,
          unit: '°C',
          description: 'Heatwave conditions suppressing firefighting effectiveness'
        }
      ];
    } else {
      // Default: Flood
      return [
        {
          id: 'rainfallIncrease',
          label: 'Monsoon Rainfall Surge',
          min: 10,
          max: 100,
          step: 5,
          defaultValue: 40,
          unit: '%',
          description: 'Precipitation increase over transboundary catchment basin'
        },
        {
          id: 'riverCrest',
          label: 'Upstream River Crest',
          min: 1.0,
          max: 5.0,
          step: 0.5,
          defaultValue: 2.5,
          unit: 'm',
          description: 'River stage height above designated critical danger threshold'
        },
        {
          id: 'drainageBlock',
          label: 'Drainage Channel Surcharge',
          min: 10,
          max: 80,
          step: 5,
          defaultValue: 35,
          unit: '%',
          description: 'Backwater congestion preventing basin water discharge'
        },
        {
          id: 'durationDays',
          label: 'Inundation Horizon',
          min: 3,
          max: 28,
          step: 1,
          defaultValue: 14,
          unit: 'days',
          description: 'Duration where stagnant floodwaters submerge agricultural zones'
        }
      ];
    }
  }

  async function handleRunSimulation() {
    if (!$selectedIncident) return;
    isSimulating = true;

    const inc = $selectedIncident;
    const baseRisk = inc.riskScore;
    const params = getParamsForHazard(inc.type);

    recordHistoryEvent(
      'scenarios',
      'NEURAL-SIM',
      'Scenario Created',
      inc.name,
      `Configured parameters for ${inc.name}: ${JSON.stringify(paramValues)}`,
      'info'
    );

    await new Promise((r) => setTimeout(r, 650));

    // Deterministic mathematical calculation
    let normDevSum = 0;
    params.forEach((p) => {
      const val = paramValues[p.id] ?? p.defaultValue;
      const range = p.max - p.min || 1;
      const dev = (val - p.defaultValue) / range;
      normDevSum += dev;
    });

    const deltaScore = Math.round(normDevSum * 28);
    const newRisk = Math.min(99, Math.max(15, baseRisk + deltaScore));
    const riskDiff = newRisk - baseRisk;

    const basePopNum = inc.affectedPopulationNum || 50000;
    const multiplier = 1 + (riskDiff / 100) * 0.65;
    const newPopNum = Math.round(basePopNum * multiplier);

    let popFormatted = `${(newPopNum / 1000000).toFixed(1)}M`;
    if (newPopNum < 1000000) popFormatted = `${Math.round(newPopNum / 1000)}K`;

    const popDeltaFormatted = riskDiff >= 0
      ? `+${Math.abs(Math.round((newPopNum - basePopNum) / 1000))}K citizens`
      : `-${Math.abs(Math.round((basePopNum - newPopNum) / 1000))}K citizens`;

    const scenarioId = `scen-${Date.now().toString().slice(-4)}`;

    simResult = {
      baselineRisk: baseRisk,
      scenarioRisk: newRisk,
      riskDelta: riskDiff,
      populationImpact: popFormatted,
      populationDelta: popDeltaFormatted,
      infrastructureImpact: riskDiff >= 0
        ? `+${Math.max(2, Math.round(riskDiff * 0.4))} critical arterials disrupted, ${Math.max(1, Math.round(riskDiff * 0.2))} substations at risk`
        : `Normalizing infrastructure access across primary corridors`,
      additionalResources: riskDiff > 5
        ? ['+4 Search & Rescue Squads', '+2 Field Triage Units', '+3 Amphibious / Heavy Transports']
        : ['Standard deployment posture adequate'],
      scenarioId
    };

    // Commit to saved scenarios store
    const newScenario: SavedScenario = {
      id: scenarioId,
      name: `${inc.name} — What-If (${riskDiff >= 0 ? '+' : ''}${riskDiff} Risk)`,
      hazardType: inc.type,
      incidentName: inc.name,
      createdAt: 'Just now',
      tags: ['Neural Simulation', inc.type.toUpperCase(), `Risk ${newRisk}`],
      parameters: { ...paramValues },
      factors: { simulatedEscalation: riskDiff > 0 },
      timelineDay: 7,
      metrics: {
        affectedPopulation: popFormatted,
        displacedPopulation: `${Math.round(newPopNum * 0.45 / 1000)}K`,
        affectedDistricts: Math.min(18, Math.max(1, inc.districtsAffected + Math.round(riskDiff * 0.1))),
        roadsAffected: Math.max(2, inc.roadsAffected + Math.round(riskDiff * 0.3)),
        healthFacilities: 12,
        bridgesAffected: 4,
        riskLevel: newRisk >= 85 ? 'CRITICAL' : newRisk >= 65 ? 'HIGH' : 'MODERATE',
        riskScore: newRisk
      },
      comparison: {
        popDiffPct: Math.round(((newPopNum - basePopNum) / basePopNum) * 100),
        displacedDiffPct: Math.round(((newPopNum - basePopNum) / basePopNum) * 85),
        districtsDiff: Math.round(riskDiff * 0.1),
        roadsDiff: Math.round(riskDiff * 0.3),
        riskScoreDiff: riskDiff
      }
    };

    savedScenarios.update((list) => [newScenario, ...list]);
    activeSavedScenarioId.set(scenarioId);

    recordHistoryEvent(
      'scenarios',
      'NEURAL-SIM',
      'Scenario Completed',
      newScenario.name,
      `Baseline: ${baseRisk}/100 → Scenario: ${newRisk}/100 (Risk Change: ${riskDiff >= 0 ? '+' : ''}${riskDiff}). Pop impact: ${popFormatted}`,
      riskDiff > 10 ? 'warning' : 'success'
    );

    isSimulating = false;
    hasResult = true;
  }

  function handleViewInScenarios() {
    closeIncidentSimulateModal();
    activeScenarioView.set('builder');
    activeNavSection.set('scenarios');
  }

  function handleCompareWithBaseline() {
    if (!simResult) return;
    const list = $savedScenarios;
    const current = list.find((s) => s.id === simResult!.scenarioId) || list[0];
    const base = list.find((s) => s.id !== simResult!.scenarioId) || list[1] || list[0];
    comparisonScenarioA.set(base);
    comparisonScenarioB.set(current);
    closeIncidentSimulateModal();
    activeScenarioView.set('compare');
    activeNavSection.set('scenarios');
  }

  function handlePlanForScenario() {
    closeIncidentSimulateModal();
    openIncidentPlanModal();
  }

  function handleClose() {
    closeIncidentSimulateModal();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && !isSimulating) {
      handleClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $isIncidentSimulateModalOpen && $selectedIncident}
  {@const params = getParamsForHazard($selectedIncident.type)}

  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-150"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-simulate-title"
  >
    <div
      class="relative w-full max-w-lg bg-[#061425]/95 border border-[#3D7CFF]/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(61,124,255,0.3)] flex flex-col font-mono text-xs text-white max-h-[90vh] overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-start justify-between pb-3.5 border-b border-[#3D7CFF]/20 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-[#3D7CFF]/15 border border-[#3D7CFF]/40 flex items-center justify-center text-[#3D7CFF] shadow-[0_0_12px_rgba(61,124,255,0.35)]">
            ◈
          </div>
          <div>
            <div class="flex items-center gap-1.5 text-[10px] text-[#3D7CFF] font-bold tracking-widest uppercase">
              <span>JARVIS</span>
              <span>//</span>
              <span>WHAT-IF SCENARIO SIMULATOR</span>
            </div>
            <h2 id="modal-simulate-title" class="text-sm font-bold text-white tracking-wide truncate max-w-[340px]">
              {$selectedIncident.name}
            </h2>
          </div>
        </div>

        <button
          on:click={handleClose}
          disabled={isSimulating}
          class="text-[#8BA1B8] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          title="Close Modal (Esc)"
        >
          ✕
        </button>
      </div>

      <!-- Main Body -->
      <div class="flex-1 overflow-y-auto py-4 space-y-4 pr-1 custom-scrollbar">
        <!-- Subtitle & Baseline Banner -->
        <div class="p-3 rounded-xl bg-[#020711]/70 border border-white/5 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-[#8BA1B8] block uppercase">Current Baseline Context</span>
            <span class="text-xs font-bold text-white">{$selectedIncident.name} ({$selectedIncident.region})</span>
          </div>
          <div class="text-right">
            <span class="text-[10px] text-[#8BA1B8] block uppercase">Baseline Risk</span>
            <span class="text-xs font-bold text-amber-400">{$selectedIncident.riskScore} / 100</span>
          </div>
        </div>

        {#if !hasResult}
          <!-- Parameter Sliders -->
          <div class="space-y-3.5">
            <div class="text-[11px] font-bold uppercase tracking-wider text-[#3D7CFF] flex items-center gap-1.5">
              <span>⚙️</span>
              <span>Hazard Simulation Parameters ({$selectedIncident.type.toUpperCase()})</span>
            </div>

            {#each params as p}
              <div class="p-3 rounded-xl bg-[#020914]/60 border border-white/5 space-y-1.5">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-white font-medium">{p.label}</span>
                  <span class="text-[#00E5FF] font-bold">
                    {paramValues[p.id] ?? p.defaultValue} {p.unit}
                  </span>
                </div>

                <input
                  type="range"
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  bind:value={paramValues[p.id]}
                  class="w-full h-1.5 bg-[#061425] rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
                />

                <div class="flex justify-between text-[9px] text-[#8BA1B8]">
                  <span>{p.min} {p.unit}</span>
                  <span class="truncate max-w-[240px] text-white/50">{p.description}</span>
                  <span>{p.max} {p.unit}</span>
                </div>
              </div>
            {/each}
          </div>
        {:else if simResult}
          <!-- Simulation Result Display -->
          <div class="space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
            <div class="p-3 rounded-xl bg-gradient-to-r from-[#061425] to-[#0d2238] border border-[#00E5FF]/40 space-y-3">
              <div class="flex items-center justify-between pb-2 border-b border-white/10">
                <span class="text-xs font-bold text-[#00E5FF] uppercase tracking-wider">
                  Simulation Outcome // Ready
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase {
                  simResult.riskDelta > 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }">
                  {simResult.riskDelta >= 0 ? `+${simResult.riskDelta}` : simResult.riskDelta} Risk Shift
                </span>
              </div>

              <!-- Risk Comparison Meter -->
              <div class="grid grid-cols-3 gap-2 text-center">
                <div class="p-2 rounded-xl bg-[#020711]/60 border border-white/5">
                  <span class="text-[9px] text-[#8BA1B8] uppercase block">Baseline Risk</span>
                  <span class="text-sm font-bold text-white">{simResult.baselineRisk} / 100</span>
                </div>

                <div class="p-2 rounded-xl bg-[#020711]/60 border border-white/5">
                  <span class="text-[9px] text-[#8BA1B8] uppercase block">Scenario Risk</span>
                  <span class="text-sm font-bold {simResult.scenarioRisk > 80 ? 'text-rose-400' : 'text-amber-400'}">
                    {simResult.scenarioRisk} / 100
                  </span>
                </div>

                <div class="p-2 rounded-xl bg-[#020711]/60 border border-white/5">
                  <span class="text-[9px] text-[#8BA1B8] uppercase block">Risk Delta</span>
                  <span class="text-sm font-bold {simResult.riskDelta > 0 ? 'text-rose-400' : 'text-emerald-400'}">
                    {simResult.riskDelta >= 0 ? `+${simResult.riskDelta}` : simResult.riskDelta}
                  </span>
                </div>
              </div>

              <!-- Projected Impact Breakdown -->
              <div class="space-y-1.5 text-[11px] text-[#8BA1B8] pt-1">
                <div class="flex justify-between items-center">
                  <span>Projected Population Exposure:</span>
                  <span class="text-white font-bold">{simResult.populationImpact} ({simResult.populationDelta})</span>
                </div>
                <div class="flex justify-between items-center">
                  <span>Infrastructure Stress:</span>
                  <span class="text-amber-400 font-medium truncate max-w-[240px]" title={simResult.infrastructureImpact}>
                    {simResult.infrastructureImpact}
                  </span>
                </div>
              </div>

              <!-- Additional Resources Required -->
              <div class="pt-2 border-t border-white/10 space-y-1">
                <span class="text-[10px] text-[#00E5FF] font-bold uppercase tracking-wider block">
                  Recommended Resource Surge:
                </span>
                <div class="flex flex-wrap gap-1.5">
                  {#each simResult.additionalResources as res}
                    <span class="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white">
                      {res}
                    </span>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Action Buttons Footer -->
      <div class="pt-3.5 border-t border-white/10 flex items-center justify-between shrink-0">
        {#if !hasResult}
          <button
            on:click={handleClose}
            class="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#8BA1B8] hover:text-white text-xs cursor-pointer transition-all"
          >
            Cancel
          </button>

          <button
            on:click={handleRunSimulation}
            disabled={isSimulating}
            class="px-5 py-2 rounded-xl bg-[#3D7CFF] hover:bg-[#2563EB] text-white font-bold text-xs shadow-[0_0_20px_rgba(61,124,255,0.4)] cursor-pointer transition-all flex items-center gap-2 disabled:opacity-40"
          >
            {#if isSimulating}
              <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span>Running Simulation...</span>
            {:else}
              <span>RUN SIMULATION</span>
              <span>⚡</span>
            {/if}
          </button>
        {:else}
          <button
            on:click={() => (hasResult = false)}
            class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#8BA1B8] hover:text-white text-xs cursor-pointer transition-all"
          >
            ← Modify Parameters
          </button>

          <div class="flex items-center gap-2">
            <button
              on:click={handleCompareWithBaseline}
              class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer transition-all"
              title="Compare with baseline in Scenarios"
            >
              Compare
            </button>
            <button
              on:click={handlePlanForScenario}
              class="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs cursor-pointer transition-all"
              title="Generate Response Plan for this scenario"
            >
              Plan Response
            </button>
            <button
              on:click={handleViewInScenarios}
              class="px-4 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#38BDF8] text-[#020711] font-bold text-xs shadow-[0_0_20px_rgba(0,229,255,0.4)] cursor-pointer transition-all flex items-center gap-1.5"
            >
              <span>VIEW SCENARIO</span>
              <span>→</span>
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
