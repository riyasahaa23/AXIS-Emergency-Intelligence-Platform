<script lang="ts">
  import {
    upcomingResourceOperations,
    focusOperation,
    selectedResourceId
  } from '../../stores/resourceStore';
  import type { ResourceOperationItem } from '../../types/resources';

  function getTypeClasses(type: string) {
    switch (type) {
      case 'DEPLOYMENT':
        return 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30';
      case 'DELIVERY':
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      case 'EVACUATION':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      default:
        return 'bg-purple-500/15 text-purple-400 border border-purple-500/30';
    }
  }
</script>

<div class="flex flex-col h-full bg-[#061425]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 select-none overflow-hidden">
  <!-- Header -->
  <div class="flex items-center justify-between pb-2 mb-2 border-b border-white/10 shrink-0">
    <div class="flex items-center gap-2">
      <div class="w-3.5 h-3.5 rounded-full border border-[#00E5FF] flex items-center justify-center">
        <span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></span>
      </div>
      <h3 class="text-xs font-mono font-bold tracking-wider text-white uppercase">
        UPCOMING RESOURCE OPERATIONS
      </h3>
    </div>
    <span class="text-[10px] font-mono text-[#00E5FF]">
      {$upcomingResourceOperations.length} Scheduled
    </span>
  </div>

  <!-- Operations List -->
  <div class="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
    {#each $upcomingResourceOperations as op (op.id)}
      <button
        on:click={() => focusOperation(op)}
        class="w-full flex items-center justify-between p-2 rounded-xl border text-xs font-mono transition-all cursor-pointer text-left {
          $selectedResourceId === op.resourceId
            ? 'bg-[#091E36] border-[#00E5FF]/70 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
            : 'bg-[#061425]/40 border-white/5 hover:border-white/20 hover:bg-[#061425]/80'
        }"
        title="Click to locate operation & asset on map"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <!-- Time Badge -->
          <span class="px-2 py-0.5 rounded-md bg-white/5 text-[#8BA1B8] font-bold text-[10px] shrink-0 border border-white/10">
            {op.time}
          </span>

          <!-- Title -->
          <div class="truncate">
            <div class="text-[11px] font-medium text-white truncate">
              {op.title}
            </div>
            <div class="text-[9px] text-[#8BA1B8] truncate">
              Asset: {op.resourceName} ({op.resourceId})
            </div>
          </div>
        </div>

        <!-- Operation Type Badge -->
        <div class="shrink-0 flex items-center">
          <span class="px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wide {getTypeClasses(op.type)}">
            {op.type}
          </span>
        </div>
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
