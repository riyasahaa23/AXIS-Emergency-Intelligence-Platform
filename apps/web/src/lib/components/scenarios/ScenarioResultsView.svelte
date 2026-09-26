<script lang="ts">
  import {
    currentHazardConfig,
    scenarioParameters,
    scenarioFactors,
    simulationTimelineDay,
    scenarioSimulationResult,
    isExportModalOpen
  } from '$lib/stores/scenarioStore';

  let copied = false;

  function copySummary() {
    const text = `JARVIS EMERGENCY SCENARIO INTELLIGENCE REPORT
Hazard: ${$currentHazardConfig.hazardType.toUpperCase()} (${$currentHazardConfig.incidentName})
Location: ${$currentHazardConfig.country} - ${$currentHazardConfig.location}
Timeline Horizon: Day ${$simulationTimelineDay}
Projected Affected Population: ${$scenarioSimulationResult.simulatedMetrics.affectedPopulation} (${$scenarioSimulationResult.diff.affectedPct} vs baseline)
Projected Displaced Population: ${$scenarioSimulationResult.simulatedMetrics.displacedPopulation} (${$scenarioSimulationResult.diff.displacedPct} vs baseline)
Severed Roads: ${$scenarioSimulationResult.simulatedMetrics.roadsAffected}
Health Facilities Impacted: ${$scenarioSimulationResult.simulatedMetrics.healthFacilities}
Composite Risk Score: ${$scenarioSimulationResult.simulatedMetrics.riskScore}/100 (${$scenarioSimulationResult.simulatedMetrics.riskLevel})
Key Directives: Deploy ${$scenarioSimulationResult.responseNeeds[0]?.value} teams, activate ${$scenarioSimulationResult.responseNeeds[1]?.value} shelters.`;

    navigator.clipboard?.writeText(text);
    copied = true;
    setTimeout(() => (copied = false), 2500);
  }
</script>

<div class="flex flex-col gap-4 w-full h-full font-mono select-none p-2 overflow-y-auto custom-scrollbar">
  
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
    <div>
      <h2 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-[#10B981]"></span>
        <span>SIMULATION DOSSIER // MISSION CONTROL REPORT</span>
      </h2>
      <p class="text-[11px] text-[#8BA1B8] mt-0.5">
        Authoritative simulation results and decision-support directives ready for command dissemination.
      </p>
    </div>

    <div class="flex items-center gap-2">
      <button
        type="button"
        on:click={copySummary}
        class="px-3 py-1.5 rounded-lg bg-[#061425] hover:bg-white/10 border border-white/10 text-xs text-white transition-colors cursor-pointer"
      >
        {copied ? '✓ Copied' : '📋 Copy Text'}
      </button>

      <button
        type="button"
        on:click={() => isExportModalOpen.set(true)}
        class="px-3 py-1.5 rounded-lg bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-[#020711] font-bold text-xs transition-colors cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.4)]"
      >
        Export Dossier →
      </button>
    </div>
  </div>

  <!-- Key Metrics 4-Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    <div class="p-3.5 rounded-2xl bg-[#030A16]/90 border border-white/10 flex flex-col gap-1">
      <span class="text-[10px] text-[#8BA1B8] uppercase">Projected Exposure</span>
      <span class="text-xl font-bold text-white">{$scenarioSimulationResult.simulatedMetrics.affectedPopulation}</span>
      <span class="text-[10px] text-[#00E5FF] font-semibold">{$scenarioSimulationResult.diff.affectedPct} Increase</span>
    </div>
    <div class="p-3.5 rounded-2xl bg-[#030A16]/90 border border-white/10 flex flex-col gap-1">
      <span class="text-[10px] text-[#8BA1B8] uppercase">Displaced Citizens</span>
      <span class="text-xl font-bold text-[#F59E0B]">{$scenarioSimulationResult.simulatedMetrics.displacedPopulation}</span>
      <span class="text-[10px] text-[#F59E0B] font-semibold">{$scenarioSimulationResult.diff.displacedDiff} vs baseline</span>
    </div>
    <div class="p-3.5 rounded-2xl bg-[#030A16]/90 border border-white/10 flex flex-col gap-1">
      <span class="text-[10px] text-[#8BA1B8] uppercase">Infrastructure Impact</span>
      <span class="text-xl font-bold text-[#8B5CF6]">{$scenarioSimulationResult.insights.infrastructureImpact}</span>
      <span class="text-[10px] text-[#8B5CF6] font-semibold">{$scenarioSimulationResult.simulatedMetrics.roadsAffected} roads severed</span>
    </div>
    <div class="p-3.5 rounded-2xl bg-[#030A16]/90 border border-white/10 flex flex-col gap-1">
      <span class="text-[10px] text-[#8BA1B8] uppercase">AI Severity Rating</span>
      <span class="text-xl font-bold text-[#EF4444]">{$scenarioSimulationResult.simulatedMetrics.riskLevel}</span>
      <span class="text-[10px] text-[#EF4444] font-semibold">Score: {$scenarioSimulationResult.simulatedMetrics.riskScore}/100</span>
    </div>
  </div>

  <!-- Detailed Sections: Model Parameters & Intervention Needs -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <!-- Active Parameters & Factor Conditions -->
    <div class="p-4 rounded-2xl bg-[#030A16]/90 border border-white/10 flex flex-col gap-3">
      <div class="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-white/10">
        CONFIGURED PHYSICAL SIMULATION PARAMETERS
      </div>

      <div class="space-y-2 text-xs">
        {#each $currentHazardConfig.parameters as p}
          <div class="flex items-center justify-between p-2 rounded-lg bg-[#061425] border border-white/5">
            <span class="text-[#8BA1B8]">{p.label}</span>
            <span class="text-white font-bold">{$scenarioParameters[p.id] !== undefined ? $scenarioParameters[p.id] : p.defaultValue}{p.unit}</span>
          </div>
        {/each}
      </div>

      <div class="text-[10px] uppercase text-[#8BA1B8] pt-1">Active Secondary Drivers</div>
      <div class="flex flex-wrap gap-1.5">
        {#each $currentHazardConfig.factors as f}
          {#if $scenarioFactors[f.id]}
            <span class="px-2 py-1 rounded bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#C084FC] text-[10px] font-semibold">
              ✓ {f.label}
            </span>
          {/if}
        {/each}
      </div>
    </div>

    <!-- Strategic Command Directives -->
    <div class="p-4 rounded-2xl bg-[#030A16]/90 border border-white/10 flex flex-col gap-3">
      <div class="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-white/10">
        RECOMMENDED OPERATIONAL DIRECTIVES
      </div>

      <div class="space-y-2.5">
        {#each $scenarioSimulationResult.responseNeeds as need}
          <div class="p-2.5 rounded-xl bg-[#061425] border border-white/5 flex items-center justify-between">
            <div>
              <div class="text-xs font-bold text-white">{need.label}</div>
              <div class="text-[10px] text-[#8BA1B8]">{need.change}</div>
            </div>
            <span class="text-base font-bold text-[#00E5FF] px-2 py-0.5 rounded bg-[#00E5FF]/10">
              {need.value}
            </span>
          </div>
        {/each}
      </div>
    </div>
  </div>

</div>
