<script lang="ts">
  import {
    activeResponseMode,
    responseStatistics,
    isUrgentActionsDrawerOpen,
    activePriorityFilter
  } from '../../stores/responseStore';
  import type { ResponseMode } from '../../types/response';

  const modes: Array<{ id: ResponseMode; label: string }> = [
    { id: 'overview', label: 'Response Overview' },
    { id: 'teams', label: 'Team Deployment' },
    { id: 'resources', label: 'Resource Allocation' },
    { id: 'evacuation', label: 'Evacuation Planning' },
    { id: 'shelters', label: 'Shelter Management' }
  ];

  function setMode(mode: ResponseMode) {
    activeResponseMode.set(mode);
  }

  function toggleUrgentDrawer() {
    isUrgentActionsDrawerOpen.update((v) => !v);
  }
</script>

<div class="flex flex-col gap-3.5 mb-4 shrink-0">
  <!-- Top Title & Urgent Action Button Row -->
  <div class="flex items-center justify-between">
    <!-- Left Title & Subtitle -->
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl bg-[#061425] border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.25)]">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>

      <div>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]"></span>
          <h1 class="text-base font-bold font-mono tracking-wider text-white">
            RESPONSE <span class="text-[#00E5FF]">//</span> COORDINATE. DEPLOY. MONITOR.
          </h1>
        </div>
        <p class="text-xs text-[#8BA1B8] font-sans mt-0.5">
          Plan and coordinate emergency response operations with real-time intelligence
        </p>
      </div>
    </div>

    <!-- Right Urgent Action Banner Button -->
    <button
      on:click={toggleUrgentDrawer}
      class="group flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#260B0F]/90 border border-[#EF4444]/60 hover:border-[#EF4444] shadow-[0_0_15px_rgba(239,68,68,0.25)] hover:shadow-[0_0_22px_rgba(239,68,68,0.4)] transition-all cursor-pointer text-left"
      title="View urgent emergency actions requiring immediate commander authorization"
    >
      <div class="w-7 h-7 rounded-lg bg-[#EF4444]/20 border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444] shrink-0 group-hover:scale-105 transition-transform">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <div class="flex flex-col">
        <div class="text-xs font-mono font-bold text-[#F87171] tracking-wide flex items-center gap-1.5">
          <span>{$responseStatistics.criticalActionsCount} CRITICAL ACTIONS</span>
          <span class="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-ping"></span>
        </div>
        <div class="text-[10px] text-[#A05A5A] font-mono">
          Require immediate attention
        </div>
      </div>
    </button>
  </div>

  <!-- Mode Navigation Pills Row -->
  <div class="flex items-center gap-2 border-b border-white/10 pb-2.5 overflow-x-auto">
    {#each modes as mode}
      <button
        on:click={() => setMode(mode.id)}
        class="px-4 py-1.5 rounded-xl text-xs font-mono font-medium transition-all duration-200 cursor-pointer whitespace-nowrap {
          $activeResponseMode === mode.id
            ? 'bg-[#00E5FF]/15 border border-[#00E5FF] text-[#00E5FF] shadow-[0_0_14px_rgba(0,229,255,0.25)]'
            : 'bg-[#061425]/50 border border-white/5 text-[#8BA1B8] hover:text-white hover:border-white/20 hover:bg-[#061425]'
        }"
      >
        {mode.label}
      </button>
    {/each}
  </div>
</div>
