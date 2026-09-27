<script lang="ts">
  import {
    selectedResourceCategory,
    resourceCategoryCounts,
    setCategory
  } from '../../stores/resourceStore';
  import type { ResourceCategory } from '../../types/resources';

  const categories: Array<{ id: ResourceCategory; icon: string }> = [
    { id: 'All Resources', icon: '🌐' },
    { id: 'Helicopters', icon: '🚁' },
    { id: 'Boats', icon: '🚤' },
    { id: 'Ground Vehicles', icon: '🚛' },
    { id: 'Medical Supplies', icon: '✚' },
    { id: 'Food & Water', icon: '🍞' },
    { id: 'Temporary Shelters', icon: '⛺' },
    { id: 'Fuel & Energy', icon: '⚡' },
    { id: 'Communication Equipment', icon: '📡' },
    { id: 'Search & Rescue Equipment', icon: '🛟' }
  ];
</script>

<div class="flex flex-col h-full bg-[#061425]/70 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden p-3.5 select-none">
  <!-- Header -->
  <div class="flex items-center justify-between pb-3 mb-2 border-b border-white/10 shrink-0">
    <div class="flex items-center gap-2">
      <div class="w-3.5 h-3.5 rounded-full border border-[#00E5FF] flex items-center justify-center">
        <span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></span>
      </div>
      <h2 class="text-xs font-bold font-mono tracking-wider text-white uppercase">
        RESOURCE CATEGORIES
      </h2>
    </div>
    <span class="text-[10px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded-md border border-[#00E5FF]/20">
      10 Active
    </span>
  </div>

  <!-- Categories List -->
  <div class="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
    {#each categories as cat (cat.id)}
      {@const count = $resourceCategoryCounts[cat.id] || 0}
      <button
        on:click={() => setCategory(cat.id)}
        class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-mono transition-all duration-200 cursor-pointer text-left {
          $selectedResourceCategory === cat.id
            ? 'bg-[#091E36] border-[#00E5FF]/80 text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)] font-semibold'
            : 'bg-[#061425]/40 border-white/5 text-[#8BA1B8] hover:text-white hover:border-white/20 hover:bg-[#061425]/80'
        }"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="text-sm shrink-0">{cat.icon}</span>
          <span class="truncate">{cat.id}</span>
        </div>

        <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold shrink-0 {
          $selectedResourceCategory === cat.id
            ? 'bg-[#00E5FF]/20 text-[#00E5FF]'
            : 'bg-black/30 text-[#8BA1B8]'
        }">
          {count}
        </span>
      </button>
    {/each}
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.2);
    border-radius: 4px;
  }
</style>
