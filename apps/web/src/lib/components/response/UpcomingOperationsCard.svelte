<script lang="ts">
  import {
    upcomingOperations,
    executeOperation,
    selectedOperationId
  } from '../../stores/responseStore';
  import type { OperationPriority, UpcomingOperation } from '../../types/response';

  function getPriorityClasses(priority: OperationPriority) {
    switch (priority) {
      case 'High Priority':
        return 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30';
      case 'Medium Priority':
        return 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30';
      default:
        return 'bg-[#3D7CFF]/15 text-[#3D7CFF] border border-[#3D7CFF]/30';
    }
  }

  function handleOpClick(op: UpcomingOperation) {
    selectedOperationId.set(op.id);
    if (op.status === 'scheduled') {
      executeOperation(op.id);
    }
  }
</script>

<div class="flex flex-col h-full bg-[#061425]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-3 select-none">
  <!-- Header with View All -->
  <div class="flex items-center justify-between pb-2 mb-2 border-b border-white/10 shrink-0">
    <div class="flex items-center gap-2">
      <div class="w-3.5 h-3.5 rounded-full border border-[#00E5FF] flex items-center justify-center">
        <span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></span>
      </div>
      <h3 class="text-xs font-mono font-bold tracking-wider text-white uppercase">
        UPCOMING OPERATIONS
      </h3>
    </div>

    <button
      class="text-[10px] font-mono text-[#00E5FF] hover:underline cursor-pointer bg-transparent border-0 p-0"
    >
      View all →
    </button>
  </div>

  <!-- Operations Timeline List -->
  <div class="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
    {#each $upcomingOperations as op (op.id)}
      <button
        on:click={() => handleOpClick(op)}
        class="w-full flex items-center justify-between p-2 rounded-xl border text-xs font-mono transition-all cursor-pointer text-left {
          $selectedOperationId === op.id
            ? 'bg-[#091E36] border-[#00E5FF]/60 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
            : 'bg-[#061425]/40 border-white/5 hover:border-white/20 hover:bg-[#061425]/80'
        }"
        title="Click to execute or stage operation"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <!-- Time Badge -->
          <span class="px-2 py-0.5 rounded-md bg-white/5 text-[#8BA1B8] font-bold text-[10px] shrink-0 border border-white/10">
            {op.time}
          </span>

          <!-- Title & Assigned Unit -->
          <div class="truncate">
            <div class="text-[11px] font-medium text-white truncate">
              {op.title}
            </div>
            {#if op.assignedTeam}
              <div class="text-[9px] text-[#8BA1B8] truncate">
                {op.assignedTeam}
              </div>
            {/if}
          </div>
        </div>

        <!-- Priority / Status Badge -->
        <div class="shrink-0 flex items-center gap-1.5">
          {#if op.status === 'in_progress'}
            <span class="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
              IN FLIGHT
            </span>
          {:else}
            <span class="px-2 py-0.5 rounded-full text-[9px] font-medium tracking-wide {getPriorityClasses(op.priority)}">
              {op.priority}
            </span>
          {/if}
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
