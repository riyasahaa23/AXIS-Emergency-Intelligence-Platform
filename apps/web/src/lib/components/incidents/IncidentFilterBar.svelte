<script lang="ts">
  import {
    activeSeverityFilter,
    activeTypeFilter,
    searchQuery,
    sortBy,
    severityCounts
  } from '../../stores/incidentStore';
  import type { SeverityLevel } from '../../types';

  const severityPills: Array<{ id: SeverityLevel | 'all'; label: string; countKey: keyof typeof $severityCounts; color: string; activeGlow: string }> = [
    { id: 'all', label: 'ALL', countKey: 'all', color: 'text-white border-white/20', activeGlow: 'bg-[#00E5FF]/20 border-[#00E5FF] text-white shadow-[0_0_18px_rgba(0,229,255,0.4)]' },
    { id: 'critical', label: 'CRITICAL', countKey: 'critical', color: 'text-red-400 border-red-500/30', activeGlow: 'bg-red-500/25 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]' },
    { id: 'high', label: 'HIGH', countKey: 'high', color: 'text-amber-400 border-amber-500/30', activeGlow: 'bg-amber-500/25 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)]' },
    { id: 'moderate', label: 'MODERATE', countKey: 'moderate', color: 'text-yellow-400 border-yellow-500/30', activeGlow: 'bg-yellow-500/25 border-yellow-400 text-white shadow-[0_0_18px_rgba(234,179,8,0.45)]' },
    { id: 'low', label: 'LOW', countKey: 'low', color: 'text-cyan-400 border-cyan-500/30', activeGlow: 'bg-cyan-500/25 border-cyan-400 text-white shadow-[0_0_18px_rgba(6,182,212,0.45)]' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'flood', label: 'Flood' },
    { value: 'cyclone', label: 'Cyclone / Typhoon' },
    { value: 'wildfire', label: 'Wildfire' },
    { value: 'earthquake', label: 'Earthquake' },
    { value: 'infrastructure_failure', label: 'Infrastructure' }
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'severity', label: 'Highest Severity' },
    { value: 'affected', label: 'Most Affected' }
  ];

  function setSeverity(sev: SeverityLevel | 'all') {
    activeSeverityFilter.set(sev);
  }
</script>

<div class="w-full flex flex-col gap-2.5 pb-2 border-b border-white/10 select-none">
  <!-- Top Operational Header -->
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div class="flex flex-col">
      <div class="flex items-center gap-2.5">
        <span class="w-2.5 h-2.5 rounded-full bg-[#EF4444] shadow-[0_0_12px_#EF4444] animate-pulse"></span>
        <h1 class="text-base sm:text-lg font-mono font-bold tracking-[0.2em] text-white flex items-center gap-2">
          <span>INCIDENTS</span>
          <span class="text-[#00E5FF] font-normal">//</span>
          <span class="text-[#00E5FF] tracking-wider text-sm sm:text-base font-semibold">ACTIVE GLOBAL THREATS</span>
        </h1>
      </div>
      <p class="text-[11px] font-mono text-[#8BA1B8] tracking-wider mt-0.5">
        Real-time monitoring and analysis of critical incidents worldwide
      </p>
    </div>

    <!-- Severity Level Filters -->
    <div class="flex items-center gap-1.5 flex-wrap">
      {#each severityPills as pill}
        <button
          on:click={() => setSeverity(pill.id)}
          class="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold tracking-wider transition-all duration-200 cursor-pointer border {
            $activeSeverityFilter === pill.id
              ? pill.activeGlow
              : `bg-[#061425]/70 hover:bg-[#061425] ${pill.color} hover:border-white/40`
          }"
        >
          <span>{pill.label}</span>
          <span class="px-1.5 py-0.2 rounded bg-black/40 text-[10px] font-mono {
            $activeSeverityFilter === pill.id ? 'text-white' : 'text-[#8BA1B8]'
          }">
            {$severityCounts[pill.countKey]}
          </span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Search & Dropdown Control Row -->
  <div class="flex flex-wrap items-center gap-2.5 pt-0.5">
    <!-- Live Search Input -->
    <div class="relative flex-1 min-w-[200px]">
      <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#8BA1B8]">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        bind:value={$searchQuery}
        placeholder="Search incidents by name, country, region..."
        class="w-full pl-9 pr-8 py-1.5 rounded-xl bg-[#061425]/90 border border-white/10 hover:border-[#00E5FF]/40 focus:border-[#00E5FF] focus:outline-none focus:shadow-[0_0_15px_rgba(0,229,255,0.25)] text-xs font-mono text-white placeholder-[#8BA1B8]/60 transition-all"
      />
      {#if $searchQuery}
        <button
          on:click={() => ($searchQuery = '')}
          class="absolute inset-y-0 right-2.5 flex items-center text-[#8BA1B8] hover:text-white"
        >
          ✕
        </button>
      {/if}
    </div>

    <!-- Category / Type Dropdown -->
    <div class="relative min-w-[140px]">
      <select
        bind:value={$activeTypeFilter}
        class="w-full appearance-none px-3.5 py-1.5 pr-8 rounded-xl bg-[#061425]/90 border border-white/10 hover:border-[#00E5FF]/40 focus:border-[#00E5FF] focus:outline-none text-xs font-mono text-white cursor-pointer transition-all shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
      >
        {#each typeOptions as opt}
          <option value={opt.value} class="bg-[#030914] text-white">{opt.label}</option>
        {/each}
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[#00E5FF]">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <!-- Sort Order Dropdown -->
    <div class="relative min-w-[140px]">
      <select
        bind:value={$sortBy}
        class="w-full appearance-none px-3.5 py-1.5 pr-8 rounded-xl bg-[#061425]/90 border border-white/10 hover:border-[#00E5FF]/40 focus:border-[#00E5FF] focus:outline-none text-xs font-mono text-white cursor-pointer transition-all shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
      >
        {#each sortOptions as sOpt}
          <option value={sOpt.value} class="bg-[#030914] text-white">{sOpt.label}</option>
        {/each}
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[#00E5FF]">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
</div>
