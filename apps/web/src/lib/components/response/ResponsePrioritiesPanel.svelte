<script lang="ts">
  import {
    responsePriorities,
    selectedPriorityId,
    activePriorityFilter,
    selectPriority,
    runAutoOptimization,
    isDeployTeamModalOpen,
    isAllocateResourceModalOpen,
    isPlanEvacuationModalOpen
  } from '../../stores/responseStore';
  import type { PrioritySeverity, ResponsePriority } from '../../types/response';

  const filterOptions: Array<'ALL' | PrioritySeverity> = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'];

  $: filteredPriorities = $responsePriorities.filter((p) => {
    if ($activePriorityFilter === 'ALL') return true;
    return p.status === $activePriorityFilter;
  });

  function getSeverityClasses(status: PrioritySeverity) {
    switch (status) {
      case 'CRITICAL':
        return 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40';
      case 'HIGH':
        return 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40';
      case 'MEDIUM':
        return 'bg-[#EAB308]/20 text-[#EAB308] border border-[#EAB308]/40';
      default:
        return 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40';
    }
  }

  function getIconBg(category: string) {
    switch (category) {
      case 'Rescue':
        return 'bg-red-500/15 border-red-500/40 text-red-400';
      case 'Medical':
        return 'bg-rose-500/15 border-rose-500/40 text-rose-400';
      case 'Evacuation':
        return 'bg-amber-500/15 border-amber-500/40 text-amber-400';
      case 'Engineering':
        return 'bg-teal-500/15 border-teal-500/40 text-teal-400';
      case 'Logistics':
        return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400';
      default:
        return 'bg-blue-500/15 border-blue-500/40 text-blue-400';
    }
  }

  function handleActionClick(priority: ResponsePriority) {
    if (priority.category === 'Rescue') {
      isDeployTeamModalOpen.set(true);
    } else if (priority.category === 'Medical' || priority.category === 'Logistics') {
      isAllocateResourceModalOpen.set(true);
    } else if (priority.category === 'Evacuation') {
      isPlanEvacuationModalOpen.set(true);
    } else {
      isDeployTeamModalOpen.set(true);
    }
  }
</script>

<div class="flex flex-col h-full bg-[#061425]/70 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden p-3.5 select-none">
  <!-- Header with Auto-Optimize Button -->
  <div class="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
    <div class="flex items-center gap-2">
      <!-- Cyan target dot -->
      <div class="w-3.5 h-3.5 rounded-full border border-[#00E5FF] flex items-center justify-center">
        <span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></span>
      </div>
      <h2 class="text-xs font-bold font-mono tracking-wider text-white uppercase">
        RESPONSE PRIORITIES
      </h2>
    </div>

    <!-- Auto-Optimize Button -->
    <button
      on:click={runAutoOptimization}
      class="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/50 hover:border-[#00E5FF] text-[#00E5FF] transition-all shadow-[0_0_12px_rgba(0,229,255,0.2)] hover:shadow-[0_0_18px_rgba(0,229,255,0.35)] cursor-pointer text-xs font-mono font-medium"
      title="Run automated heuristic AI response optimizer"
    >
      <svg class="w-3.5 h-3.5 group-hover:rotate-12 transition-transform text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <span>Auto-Optimize</span>
    </button>
  </div>

  <!-- Severity Filter Bar -->
  <div class="flex items-center gap-1.5 py-2.5 overflow-x-auto shrink-0">
    {#each filterOptions as opt}
      <button
        on:click={() => activePriorityFilter.set(opt)}
        class="px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer {
          $activePriorityFilter === opt
            ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50 shadow-[0_0_8px_rgba(0,229,255,0.2)]'
            : 'bg-white/5 text-[#8BA1B8] hover:text-white border border-transparent'
        }"
      >
        {opt}
      </button>
    {/each}
  </div>

  <!-- Priority Cards List -->
  <div class="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
    {#each filteredPriorities as p (p.id)}
      <div
        on:click={() => selectPriority(p.id)}
        on:keydown={(e) => e.key === 'Enter' && selectPriority(p.id)}
        tabindex="0"
        role="button"
        class="p-3 rounded-xl border transition-all duration-200 cursor-pointer text-left {
          $selectedPriorityId === p.id
            ? 'bg-[#091E36] border-[#00E5FF]/80 shadow-[0_0_18px_rgba(0,229,255,0.25)]'
            : 'bg-[#061425]/50 border-white/5 hover:border-white/20 hover:bg-[#061425]/90'
        }"
      >
        <!-- Top Row: Number, Icon, Title, Status Badge -->
        <div class="flex items-center justify-between gap-2 mb-2">
          <div class="flex items-center gap-2 min-w-0">
            <!-- Number Circle Badge -->
            <span class="w-5 h-5 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF] text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
              {p.order}
            </span>

            <!-- Category Icon Box -->
            <div class="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 {getIconBg(p.category)}">
              {#if p.category === 'Rescue'}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              {:else if p.category === 'Medical'}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              {:else if p.category === 'Evacuation'}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              {:else if p.category === 'Engineering'}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              {:else}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              {/if}
            </div>

            <!-- Title -->
            <div class="truncate">
              <div class="text-xs font-bold text-white truncate">
                {p.title}
              </div>
            </div>
          </div>

          <!-- Status Badge -->
          <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider shrink-0 {getSeverityClasses(p.status)}">
            {p.status}
          </span>
        </div>

        <!-- Subtitle details -->
        <div class="text-[11px] text-[#C5D1DE] mb-1 font-sans pl-7">
          {p.location}
        </div>
        <div class="text-[10px] text-[#8BA1B8] mb-2 font-mono pl-7">
          {p.affected}
        </div>

        <!-- Progress Bar Strip -->
        <div class="pl-7">
          <div class="flex items-center justify-between text-[10px] font-mono text-[#8BA1B8] mb-1">
            <span>Operational Progress</span>
            <span class="text-[#00E5FF] font-bold">{p.progress}%</span>
          </div>
          <div class="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div
              class="h-full bg-gradient-to-r from-[#00E5FF]/70 to-[#00E5FF] rounded-full transition-all duration-500 shadow-[0_0_8px_#00E5FF]"
              style="width: {p.progress}%"
            ></div>
          </div>
        </div>

        <!-- Expanded Quick Action Bar when Selected -->
        {#if $selectedPriorityId === p.id}
          <div class="mt-3 pt-2.5 border-t border-white/10 pl-7 flex items-center justify-between gap-2">
            <span class="text-[10px] text-[#00E5FF] font-mono truncate">
              {p.actionRequired}
            </span>
            <button
              on:click|stopPropagation={() => handleActionClick(p)}
              class="px-2.5 py-1 rounded-lg bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 border border-[#00E5FF]/60 text-[#00E5FF] text-[10px] font-mono font-semibold transition-all shrink-0 cursor-pointer"
            >
              Execute Action
            </button>
          </div>
        {/if}
      </div>
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
