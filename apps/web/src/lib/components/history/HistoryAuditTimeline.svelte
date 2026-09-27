<script lang="ts">
  import {
    filteredHistoryEvents,
    historyCategoryFilter,
    historySearchQuery
  } from '../../stores/historyStore';
  import type { HistoryEventCategory } from '../../types/history';

  const categories: Array<{ id: 'ALL' | HistoryEventCategory; label: string }> = [
    { id: 'ALL', label: 'All Events' },
    { id: 'incidents', label: 'Incidents' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'scenarios', label: 'Scenarios' },
    { id: 'response', label: 'Response' },
    { id: 'resources', label: 'Resources' },
    { id: 'comms', label: 'Communications' },
    { id: 'system', label: 'System' }
  ];

  function getCategoryColor(cat: HistoryEventCategory): string {
    switch (cat) {
      case 'incidents': return 'text-[#EF4444] border-red-500/40 bg-red-500/10';
      case 'analysis': return 'text-[#3D7CFF] border-blue-500/40 bg-blue-500/10';
      case 'scenarios': return 'text-[#8B5CF6] border-purple-500/40 bg-purple-500/10';
      case 'response': return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
      case 'resources': return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
      case 'comms': return 'text-[#00E5FF] border-cyan-500/40 bg-cyan-500/10';
      default: return 'text-slate-400 border-slate-500/40 bg-slate-500/10';
    }
  }

  function getSeverityPill(sev: string): string {
    switch (sev) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'warning': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'success': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  }
</script>

<div class="flex flex-col h-full bg-[#061425]/85 backdrop-blur-xl border border-white/10 rounded-2xl p-4 font-mono select-none overflow-hidden gap-3">
  <!-- Header & Search Controls -->
  <div class="pb-3 border-b border-white/10 shrink-0 space-y-2.5">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-base">📜</span>
        <h2 class="text-xs font-bold uppercase tracking-wider text-white">PLANETARY AUDIT LOG & DECISION TRAIL</h2>
      </div>
      <span class="text-[10px] text-[#8BA1B8]">{$filteredHistoryEvents.length} recorded events</span>
    </div>

    <!-- Search Input & Category Pills -->
    <div class="flex flex-col md:flex-row gap-2">
      <div class="relative flex-1">
        <input
          type="text"
          bind:value={$historySearchQuery}
          placeholder="Search by action, actor, target, location, or keyword..."
          class="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-[#8BA1B8]/60 focus:outline-none focus:border-[#00E5FF]/50"
        />
        {#if $historySearchQuery}
          <button
            on:click={() => historySearchQuery.set('')}
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8BA1B8] hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        {/if}
      </div>

      <!-- Category Filter Pills -->
      <div class="flex items-center gap-1 bg-black/40 p-0.5 rounded-xl border border-white/10 shrink-0 overflow-x-auto">
        {#each categories as cat}
          <button
            on:click={() => historyCategoryFilter.set(cat.id)}
            class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap {
              $historyCategoryFilter === cat.id
                ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                : 'text-[#8BA1B8] hover:text-white border border-transparent'
            }"
          >
            {cat.label}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Chronological Timeline Stream -->
  <div class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
    {#if $filteredHistoryEvents.length === 0}
      <div class="flex flex-col items-center justify-center h-32 text-center text-[#8BA1B8] text-xs">
        <span class="text-2xl mb-1">🔍</span>
        <p>No historical events match the current filter or search criteria</p>
      </div>
    {:else}
      {#each $filteredHistoryEvents as event (event.id)}
        <div class="p-3 rounded-xl bg-black/30 border border-white/5 hover:border-white/15 transition-all flex flex-col gap-1.5">
          <!-- Top Row: Timestamp, Category, Severity -->
          <div class="flex items-center justify-between text-[10px]">
            <div class="flex items-center gap-2">
              <span class="text-[#00E5FF] font-bold">{event.timestamp}</span>
              <span class="px-2 py-0.2 rounded border uppercase font-bold text-[9px] {getCategoryColor(event.category)}">
                {event.category}
              </span>
              <span class="text-[#8BA1B8]">Actor: <span class="text-white font-bold">{event.actor}</span></span>
            </div>

            <span class="px-2 py-0.2 rounded border text-[9px] font-bold uppercase {getSeverityPill(event.severity)}">
              {event.severity}
            </span>
          </div>

          <!-- Action & Target -->
          <div class="text-xs font-bold text-white tracking-wide">
            {event.action} → <span class="text-[#00E5FF]">{event.target}</span>
          </div>

          <!-- Outcome / Result -->
          <p class="text-[11px] text-[#8BA1B8] font-sans">
            Result: <span class="text-slate-200">{event.result}</span>
          </p>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.2);
    border-radius: 2px;
  }
</style>
