<script lang="ts">
  import {
    scenarioSimulationResult,
    activeScenarioView,
    isSaveModalOpen,
    isExportModalOpen,
    setScenarioHazard
  } from '$lib/stores/scenarioStore';
  import { incidents, selectedIncident, selectIncident } from '$lib/stores/incidentStore';

  function handleIncidentClick(inc: any) {
    selectIncident(inc);
    if (inc.type === 'flood') setScenarioHazard('flood');
    else if (inc.type === 'cyclone') setScenarioHazard('cyclone');
    else if (inc.type === 'wildfire') setScenarioHazard('wildfire');
    else if (inc.type === 'earthquake') setScenarioHazard('earthquake');
    else setScenarioHazard('multi_hazard');
  }
</script>

<div class="flex flex-col h-full bg-[#030A16]/90 border border-white/10 rounded-2xl p-4 font-mono select-none overflow-y-auto custom-scrollbar shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
  
  <!-- Header: Operational Context -->
  <div class="flex items-center justify-between pb-3 mb-3 border-b border-white/10 shrink-0">
    <div class="flex items-center gap-2">
      <span class="w-1.5 h-3.5 bg-[#00E5FF] rounded-sm"></span>
      <h2 class="text-xs font-bold tracking-wider text-white uppercase">OPERATIONAL CONTEXT</h2>
    </div>
    <span class="text-[9px] text-[#00E5FF] font-semibold">SYNCHRONIZED</span>
  </div>

  <!-- 1. Active Incidents Selector -->
  <div class="mb-4 shrink-0">
    <div class="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#8BA1B8] mb-2">
      <span>ACTIVE INCIDENTS</span>
      <span class="text-[#00E5FF] text-[9px]">Select to Simulate</span>
    </div>

    <div class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-0.5">
      {#each $incidents.slice(0, 4) as inc}
        <button
          type="button"
          on:click={() => handleIncidentClick(inc)}
          class="w-full text-left p-2 rounded-xl border transition-all cursor-pointer {
            $selectedIncident?.id === inc.id
              ? 'bg-[#061425] border-[#00E5FF]/60 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
              : 'bg-[#061425]/40 border-white/5 hover:border-white/20'
          }"
        >
          <div class="flex items-center gap-2.5">
            <!-- Icon/Indicator -->
            <div class="w-8 h-8 rounded-lg bg-slate-950 border border-white/10 flex items-center justify-center shrink-0 text-sm">
              {#if inc.type === 'flood'}🌊
              {:else if inc.type === 'cyclone'}🌀
              {:else if inc.type === 'wildfire'}🔥
              {:else if inc.type === 'earthquake'}⚡
              {:else}⚡🌊{/if}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1 mb-0.5">
                <span class="text-xs font-bold text-white truncate">{inc.name}</span>
                <span class="px-1 py-0.2 rounded text-[7px] font-bold uppercase {
                  inc.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                }">
                  {inc.severity}
                </span>
              </div>
              <div class="text-[10px] text-[#8BA1B8] truncate">{inc.country} • {inc.affectedPopulation}</div>
            </div>
          </div>
        </button>
      {/each}
    </div>
  </div>

  <!-- 2. Scenario Insights (4 KPI Cards) -->
  <div class="mb-4 shrink-0 flex flex-col gap-2">
    <div class="text-[10px] uppercase tracking-wider text-[#8BA1B8] border-b border-white/5 pb-1">
      SCENARIO INSIGHTS
    </div>

    <div class="grid grid-cols-2 gap-2">
      <!-- KPI 1 -->
      <div class="p-2.5 rounded-xl bg-[#061425] border border-white/5 flex flex-col">
        <span class="text-base font-bold text-[#8B5CF6]">
          {$scenarioSimulationResult.insights.potentialIncrease}
        </span>
        <span class="text-[9px] text-[#8BA1B8] uppercase mt-0.5">Potential Increase</span>
      </div>

      <!-- KPI 2 -->
      <div class="p-2.5 rounded-xl bg-[#061425] border border-white/5 flex flex-col">
        <span class="text-base font-bold text-white">
          {$scenarioSimulationResult.insights.projectedAffected}
        </span>
        <span class="text-[9px] text-[#8BA1B8] uppercase mt-0.5">Projected Affected</span>
      </div>

      <!-- KPI 3 -->
      <div class="p-2.5 rounded-xl bg-[#061425] border border-white/5 flex flex-col">
        <span class="text-base font-bold {
          $scenarioSimulationResult.insights.riskLevel === 'CRITICAL' ? 'text-[#EF4444]' : 'text-[#F59E0B]'
        }">
          {$scenarioSimulationResult.insights.riskLevel}
        </span>
        <span class="text-[9px] text-[#8BA1B8] uppercase mt-0.5">Risk Level</span>
      </div>

      <!-- KPI 4 -->
      <div class="p-2.5 rounded-xl bg-[#061425] border border-white/5 flex flex-col">
        <span class="text-base font-bold text-[#00E5FF]">
          {$scenarioSimulationResult.insights.infrastructureImpact}
        </span>
        <span class="text-[9px] text-[#8BA1B8] uppercase mt-0.5">Infrastructure Impact</span>
      </div>
    </div>
  </div>

  <!-- 3. Scenario Tools (4 Buttons) -->
  <div class="mb-4 shrink-0 flex flex-col gap-2">
    <div class="text-[10px] uppercase tracking-wider text-[#8BA1B8] border-b border-white/5 pb-1">
      SCENARIO TOOLS
    </div>

    <div class="grid grid-cols-2 gap-2 text-xs">
      <button
        type="button"
        on:click={() => isSaveModalOpen.set(true)}
        class="flex items-center gap-2 p-2 rounded-xl bg-[#061425] hover:bg-[#061425]/80 border border-white/10 hover:border-[#8B5CF6] transition-colors cursor-pointer text-left text-white"
      >
        <span class="text-[#8B5CF6] text-xs">💾</span>
        <span class="text-[11px] truncate">Save Scenario</span>
      </button>

      <button
        type="button"
        on:click={() => activeScenarioView.set('library')}
        class="flex items-center gap-2 p-2 rounded-xl bg-[#061425] hover:bg-[#061425]/80 border border-white/10 hover:border-[#00E5FF] transition-colors cursor-pointer text-left text-white"
      >
        <span class="text-[#00E5FF] text-xs">📂</span>
        <span class="text-[11px] truncate">Load Scenario</span>
      </button>

      <button
        type="button"
        on:click={() => activeScenarioView.set('comparison')}
        class="flex items-center gap-2 p-2 rounded-xl bg-[#061425] hover:bg-[#061425]/80 border border-white/10 hover:border-[#F59E0B] transition-colors cursor-pointer text-left text-white"
      >
        <span class="text-[#F59E0B] text-xs">⚖</span>
        <span class="text-[11px] truncate">Compare</span>
      </button>

      <button
        type="button"
        on:click={() => isExportModalOpen.set(true)}
        class="flex items-center gap-2 p-2 rounded-xl bg-[#061425] hover:bg-[#061425]/80 border border-white/10 hover:border-[#10B981] transition-colors cursor-pointer text-left text-white"
      >
        <span class="text-[#10B981] text-xs">📊</span>
        <span class="text-[11px] truncate">Export Results</span>
      </button>
    </div>
  </div>

  <!-- 4. System Status -->
  <div class="mt-auto pt-2 shrink-0 border-t border-white/10">
    <div class="flex items-center justify-between text-[10px] text-[#8BA1B8]">
      <div class="flex items-center gap-2">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-[#10B981] shadow-[0_0_8px_#10B981]"></span>
        </span>
        <span class="font-bold text-white tracking-wider">SIMULATION ENGINE OPERATIONAL</span>
      </div>
      <span class="text-[9px] text-[#10B981]">v2.4</span>
    </div>
  </div>

</div>
