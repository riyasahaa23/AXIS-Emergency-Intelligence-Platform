<script lang="ts">
  import { filteredIncidents, selectedIncident, selectIncident } from '../../stores/incidentStore';
  import type { HazardIncident } from '../../types';

  let scrollContainer: HTMLDivElement;

  function scroll(offset: number) {
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }

  function handleWheel(e: WheelEvent) {
    if (scrollContainer && Math.abs(e.deltaY) > 0) {
      e.preventDefault();
      scrollContainer.scrollLeft += e.deltaY;
    }
  }

  const typeIcons: Record<string, string> = {
    flood: '🌊',
    cyclone: '🌀',
    wildfire: '🔥',
    earthquake: '⚡',
    infrastructure_failure: '🔌',
    storm: '⛈️',
    heatwave: '☀️'
  };

  const severityBadgeClass: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/40',
    high: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    moderate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    low: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
  };
</script>

<div class="relative w-full group select-none py-1">
  <!-- Left Scroll Arrow -->
  <button
    on:click={() => scroll(-260)}
    class="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-7 h-14 rounded-r-xl bg-[#030a16]/90 border border-y border-r border-[#00E5FF]/40 text-[#00E5FF] hover:text-white hover:bg-[#00E5FF]/20 shadow-[0_0_15px_rgba(0,0,0,0.8)] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
    title="Scroll left"
  >
    ‹
  </button>

  <!-- Horizontal Scroll Container -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    bind:this={scrollContainer}
    on:wheel={handleWheel}
    class="flex items-stretch gap-3 overflow-x-auto scrollbar-none px-1 py-1 scroll-smooth"
    style="scrollbar-width: none; -ms-overflow-style: none;"
  >
    {#each $filteredIncidents as incident (incident.id)}
      {@const isSelected = $selectedIncident?.id === incident.id}
      <button
        on:click={() => selectIncident(incident)}
        class="flex flex-col justify-between w-[240px] shrink-0 p-3 rounded-2xl transition-all duration-200 cursor-pointer text-left border {
          isSelected
            ? 'bg-[#081f3d]/90 border-[#00E5FF] shadow-[0_0_24px_rgba(0,229,255,0.4),inset_0_0_15px_rgba(0,229,255,0.15)] scale-[1.02]'
            : 'bg-[#061425]/75 hover:bg-[#081e36] border-white/10 hover:border-[#00E5FF]/40 hover:shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
        }"
      >
        <!-- Card Top: Category Icon + Severity & Status Pills -->
        <div class="flex items-start justify-between gap-1 mb-2">
          <div class="flex items-center gap-1.5">
            <span class="text-base p-1.5 rounded-lg bg-white/5 border border-white/10">
              {typeIcons[incident.type] || '⚠️'}
            </span>
            <div class="flex flex-col">
              <span class="text-[9px] font-mono tracking-widest text-[#8BA1B8] uppercase">
                {incident.country}
              </span>
              <span class="text-[11px] font-mono font-bold text-white truncate max-w-[120px]">
                {incident.region}
              </span>
            </div>
          </div>

          <div class="flex flex-col items-end gap-1">
            <span class="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase border {severityBadgeClass[incident.severity]}">
              {incident.severity}
            </span>
            <span class="text-[8px] font-mono text-[#8BA1B8] flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full {incident.severity === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'}"></span>
              {incident.status}
            </span>
          </div>
        </div>

        <!-- Card Middle: Incident Name -->
        <div class="mb-2">
          <h3 class="text-xs font-mono font-bold text-white leading-tight line-clamp-1 {isSelected ? 'text-[#00E5FF]' : ''}">
            {incident.name}
          </h3>
          <p class="text-[10px] font-mono text-[#8BA1B8] mt-0.5">
            Updated {incident.relativeTime}
          </p>
        </div>

        <!-- Card Bottom: Affected Metric + Risk Score Meter -->
        <div class="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
          <div class="flex flex-col">
            <span class="text-[8px] text-[#8BA1B8] uppercase">Exposure</span>
            <span class="text-white font-bold">{incident.affectedPopulation}</span>
          </div>

          <div class="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
            <span class="text-[9px] text-[#8BA1B8]">RISK</span>
            <span class="text-xs font-bold {incident.riskScore >= 80 ? 'text-red-400' : incident.riskScore >= 60 ? 'text-amber-400' : 'text-cyan-400'}">
              {incident.riskScore}
            </span>
          </div>
        </div>
      </button>
    {/each}
  </div>

  <!-- Right Scroll Arrow -->
  <button
    on:click={() => scroll(260)}
    class="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-7 h-14 rounded-l-xl bg-[#030a16]/90 border border-y border-l border-[#00E5FF]/40 text-[#00E5FF] hover:text-white hover:bg-[#00E5FF]/20 shadow-[0_0_15px_rgba(0,0,0,0.8)] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
    title="Scroll right"
  >
    ›
  </button>
</div>
