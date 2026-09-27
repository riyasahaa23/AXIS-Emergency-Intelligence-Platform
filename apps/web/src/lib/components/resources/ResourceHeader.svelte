<script lang="ts">
  import {
    activeResourcesMode,
    isOptimizeModalOpen,
    isResourceReportModalOpen
  } from '../../stores/resourceStore';
  import type { ResourcesMode } from '../../types/resources';

  const tabs: Array<{ id: ResourcesMode; label: string }> = [
    { id: 'overview', label: 'RESOURCE OVERVIEW' },
    { id: 'assets', label: 'ASSETS & EQUIPMENT' },
    { id: 'supplies', label: 'SUPPLIES & LOGISTICS' },
    { id: 'personnel', label: 'PERSONNEL' },
    { id: 'facilities', label: 'FACILITIES' },
    { id: 'supply_chain', label: 'SUPPLY CHAIN' },
    { id: 'requests', label: 'RESOURCE REQUESTS' }
  ];

  function setMode(mode: ResourcesMode) {
    activeResourcesMode.set(mode);
  }
</script>

<div class="flex flex-col gap-3.5 mb-4 shrink-0 select-none">
  <!-- Top Title & Subtitle Row -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl bg-[#061425] border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.25)]">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>

      <div>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]"></span>
          <h1 class="text-base font-bold font-mono tracking-wider text-white">
            RESOURCES <span class="text-[#00E5FF]">//</span> MANAGE. TRACK. OPTIMIZE.
          </h1>
        </div>
        <p class="text-xs text-[#8BA1B8] font-sans mt-0.5">
          Monitor and manage emergency resources, assets and supply chains in real-time.
        </p>
      </div>
    </div>

    <!-- Header Quick Action Buttons -->
    <div class="flex items-center gap-2">
      <button
        on:click={() => isOptimizeModalOpen.set(true)}
        class="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/50 hover:bg-amber-500/25 text-amber-300 font-mono text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)] cursor-pointer"
        title="Open JARVIS AI Logistics Optimizer"
      >
        <span>⚡</span>
        <span>OPTIMIZE FLEET</span>
      </button>

      <button
        on:click={() => isResourceReportModalOpen.set(true)}
        class="px-3 py-1.5 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/50 hover:bg-[#00E5FF]/25 text-[#00E5FF] font-mono text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,229,255,0.2)] cursor-pointer"
        title="Generate Resource Situation Report"
      >
        <span>📊</span>
        <span>SITREP REPORT</span>
      </button>
    </div>
  </div>

  <!-- 7 Navigation Tabs Row -->
  <div class="flex items-center gap-2 border-b border-white/10 pb-2.5 overflow-x-auto custom-scrollbar">
    {#each tabs as tab}
      <button
        on:click={() => setMode(tab.id)}
        class="px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all duration-200 cursor-pointer whitespace-nowrap {
          $activeResourcesMode === tab.id
            ? 'bg-[#00E5FF]/15 border border-[#00E5FF] text-[#00E5FF] shadow-[0_0_14px_rgba(0,229,255,0.25)]'
            : 'bg-[#061425]/50 border border-white/5 text-[#8BA1B8] hover:text-white hover:border-white/20 hover:bg-[#061425]'
        }"
      >
        {tab.label}
      </button>
    {/each}
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    height: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.2);
    border-radius: 4px;
  }
</style>
