<script lang="ts">
  import {
    isExportModalOpen,
    currentHazardConfig,
    scenarioParameters,
    scenarioFactors,
    simulationTimelineDay,
    scenarioSimulationResult
  } from '$lib/stores/scenarioStore';

  let copied = false;

  $: exportPayload = {
    system: 'AXIS Planetary Emergency Intelligence v2.4',
    timestamp: new Date().toISOString(),
    hazardType: $currentHazardConfig.hazardType,
    incidentName: $currentHazardConfig.incidentName,
    country: $currentHazardConfig.country,
    timelineDay: $simulationTimelineDay,
    parameters: $scenarioParameters,
    factors: $scenarioFactors,
    baselineMetrics: $currentHazardConfig.baseMetrics,
    simulatedMetrics: $scenarioSimulationResult.simulatedMetrics,
    impactDelta: $scenarioSimulationResult.diff,
    riskDecomposition: $scenarioSimulationResult.riskAnalysis,
    responseNeeds: $scenarioSimulationResult.responseNeeds
  };

  $: jsonString = JSON.stringify(exportPayload, null, 2);

  function copyJson() {
    navigator.clipboard?.writeText(jsonString);
    copied = true;
    setTimeout(() => (copied = false), 2500);
  }

  function downloadJson() {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `axis_scenario_${$currentHazardConfig.hazardType}_day${$simulationTimelineDay}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

{#if $isExportModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none font-mono">
    <div class="w-full max-w-xl p-5 rounded-2xl bg-[#030A16] border border-[#00E5FF]/40 shadow-[0_16px_40px_rgba(0,0,0,0.9)] flex flex-col gap-4">
      
      <!-- Top Bar -->
      <div class="flex items-center justify-between pb-2 border-b border-white/10">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-[#00E5FF]"></span>
          <h3 class="text-xs font-bold text-white uppercase tracking-wider">EXPORT SCENARIO INTELLIGENCE DOSSIER</h3>
        </div>
        <button
          type="button"
          on:click={() => isExportModalOpen.set(false)}
          class="text-[#8BA1B8] hover:text-white text-sm cursor-pointer"
        >
          ✕
        </button>
      </div>

      <p class="text-[11px] text-[#8BA1B8] leading-relaxed">
        Formatted structured data payload ready for transmission to FastAPI analyser backend or incident commanders.
      </p>

      <!-- JSON Code View -->
      <div class="relative bg-[#061425] p-3 rounded-xl border border-white/10 max-h-64 overflow-y-auto custom-scrollbar text-[10px] text-[#00E5FF] leading-relaxed">
        <pre>{jsonString}</pre>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
        <button
          type="button"
          on:click={() => isExportModalOpen.set(false)}
          class="px-3 py-1.5 rounded-lg text-[#8BA1B8] hover:text-white transition-colors cursor-pointer"
        >
          Close
        </button>

        <div class="flex items-center gap-2">
          <button
            type="button"
            on:click={copyJson}
            class="px-3 py-1.5 rounded-lg bg-[#061425] hover:bg-white/10 border border-white/20 text-white font-bold transition-all cursor-pointer"
          >
            {copied ? '✓ Copied' : '📋 Copy JSON'}
          </button>
          <button
            type="button"
            on:click={downloadJson}
            class="px-4 py-1.5 rounded-lg bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-[#020711] font-bold transition-all shadow-[0_0_15px_rgba(0,229,255,0.4)] cursor-pointer"
          >
            ⬇ Download JSON
          </button>
        </div>
      </div>

    </div>
  </div>
{/if}
