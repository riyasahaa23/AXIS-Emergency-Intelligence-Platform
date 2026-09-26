<script lang="ts">
  import {
    activeScenarioView,
    selectedScenarioHazard,
    setScenarioHazard,
    isSimulating,
    simulationStage
  } from '$lib/stores/scenarioStore';
  import type { ScenarioViewTab } from '$lib/types/scenario';

  const viewTabs: Array<{ id: ScenarioViewTab; label: string; icon: string }> = [
    { id: 'builder', label: 'SCENARIO BUILDER', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
    { id: 'library', label: 'SCENARIO LIBRARY', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: 'comparison', label: 'COMPARISON', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'results', label: 'RESULTS', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
  ];

  const hazardPills = [
    { id: 'flood', label: 'Flood', icon: '🌊', color: '#00E5FF' },
    { id: 'cyclone', label: 'Cyclone', icon: '🌀', color: '#38BDF8' },
    { id: 'wildfire', label: 'Wildfire', icon: '🔥', color: '#F97316' },
    { id: 'earthquake', label: 'Earthquake', icon: '⚡', color: '#EAB308' },
    { id: 'multi_hazard', label: 'Multi-Hazard', icon: '⚡🌊', color: '#A855F7' }
  ];
</script>

<div class="flex flex-col gap-2.5 pb-2 border-b border-white/10 select-none">
  <!-- Top Bar: Title & Hazard Selector Pills -->
  <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
    
    <!-- Title & Subtitle -->
    <div class="flex flex-col gap-1">
      <div class="flex items-center gap-2.5 flex-wrap">
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8B5CF6] opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#A855F7] shadow-[0_0_10px_#A855F7]"></span>
        </span>

        <h1 class="text-sm md:text-base font-bold font-mono tracking-wider text-white flex items-center gap-2">
          <span>SCENARIOS</span>
          <span class="text-[#8B5CF6]">//</span>
          <span class="text-[#00E5FF] tracking-widest text-xs md:text-sm font-semibold">SIMULATE. COMPARE. PLAN.</span>
        </h1>

        {#if $isSimulating}
          <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#A855F7]/20 border border-[#A855F7]/60 text-[#C084FC] animate-pulse">
            {$simulationStage}
          </span>
        {/if}
      </div>

      <p class="text-[11px] text-[#8BA1B8] font-mono max-w-2xl leading-relaxed">
        Create and analyze what-if scenarios to understand potential impacts and optimize response strategies.
      </p>
    </div>

    <!-- Hazard Type Selector Pills -->
    <div class="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
      <span class="text-[10px] uppercase font-mono tracking-wider text-[#8BA1B8]/60 mr-1 hidden sm:inline">HAZARD:</span>
      {#each hazardPills as pill}
        <button
          type="button"
          on:click={() => setScenarioHazard(pill.id)}
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer shrink-0 border {
            $selectedScenarioHazard === pill.id
              ? 'bg-[#8B5CF6]/20 text-white border-[#8B5CF6] shadow-[0_0_12px_rgba(139,92,246,0.35)]'
              : 'bg-[#061425]/70 text-[#8BA1B8] border-white/5 hover:border-white/20 hover:text-white'
          }"
        >
          <span class="text-xs">{pill.icon}</span>
          <span class="font-medium text-[11px]">{pill.label}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Bottom Navigation Row: Sub-views (SCENARIO BUILDER, SCENARIO LIBRARY, COMPARISON, RESULTS) -->
  <div class="flex items-center justify-between pt-1 gap-2 overflow-x-auto custom-scrollbar">
    <div class="flex items-center gap-2">
      {#each viewTabs as tab}
        <button
          type="button"
          on:click={() => activeScenarioView.set(tab.id)}
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer whitespace-nowrap border {
            $activeScenarioView === tab.id
              ? 'bg-[#3D7CFF]/20 text-white border-[#00E5FF]/60 shadow-[0_0_14px_rgba(0,229,255,0.2)] font-semibold'
              : 'bg-[#030A16]/60 text-[#8BA1B8] border-white/5 hover:border-white/20 hover:text-white'
          }"
        >
          <svg class="w-3.5 h-3.5 {$activeScenarioView === tab.id ? 'text-[#00E5FF]' : 'text-[#8BA1B8]'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d={tab.icon} />
          </svg>
          <span class="text-[11px] tracking-wider">{tab.label}</span>
        </button>
      {/each}
    </div>

    <!-- Engine Ready Pill -->
    <div class="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#061425]/60 border border-white/10 text-[10px] font-mono text-[#8BA1B8] shrink-0">
      <span class="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]"></span>
      <span>ENGINE // READY</span>
    </div>
  </div>
</div>
