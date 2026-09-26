<script lang="ts">
  import { activeHazardType, selectHazard, isTransitioningHazard, hazardTransitionStage } from '../../stores/analysisStore';
  import type { HazardSelectorType } from '../../types';

  const hazards: Array<{ id: HazardSelectorType; label: string; icon: string }> = [
    { id: 'flood', label: 'Flood', icon: '💧' },
    { id: 'cyclone', label: 'Cyclone', icon: '🌀' },
    { id: 'wildfire', label: 'Wildfire', icon: '🔥' },
    { id: 'earthquake', label: 'Earthquake', icon: '⚡' },
    { id: 'multi_hazard', label: 'Multi-Hazard', icon: '🗂️' }
  ];
</script>

<div class="flex flex-wrap items-center justify-between gap-3 pb-2 select-none font-mono">
  <!-- Title & Subtitle -->
  <div class="flex flex-col">
    <div class="flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] animate-pulse"></span>
      <h1 class="text-sm sm:text-base font-bold tracking-[0.16em] text-white flex items-center gap-2">
        <span>ANALYSIS</span>
        <span class="text-[#00E5FF] font-light">//</span>
        <span class="text-[#00E5FF] font-semibold tracking-wider">MULTI-HAZARD INTELLIGENCE</span>
      </h1>
    </div>
    <p class="text-[10px] text-[#8BA1B8] tracking-wider mt-0.5">
      AI-powered risk analysis, impact modeling and predictive intelligence
    </p>
  </div>

  <!-- Hazard Type Selector Pills -->
  <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
    {#each hazards as item}
      {@const isActive = $activeHazardType === item.id}
      <button
        on:click={() => selectHazard(item.id)}
        class="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-medium transition-all duration-200 cursor-pointer border {
          isActive
            ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-white shadow-[0_0_16px_rgba(0,229,255,0.4)] font-bold'
            : 'bg-[#061425]/70 hover:bg-[#061425] border-white/10 text-[#8BA1B8] hover:text-white hover:border-white/30'
        }"
        title="Analyze {item.label}"
      >
        <span class="text-xs">{item.icon}</span>
        <span class="tracking-wide">{item.label}</span>
      </button>
    {/each}
  </div>
</div>
