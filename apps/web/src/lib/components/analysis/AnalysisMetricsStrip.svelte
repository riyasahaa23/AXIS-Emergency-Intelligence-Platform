<script lang="ts">
  import { activeAnalysisData, openRiskDrivers } from '../../stores/analysisStore';

  export let isResponsiveRow: boolean = false;

  $: m = $activeAnalysisData.metrics;
</script>

<div class={isResponsiveRow ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 w-full font-mono select-none" : "flex flex-col justify-between gap-2.5 h-full w-full font-mono select-none"}>
  <!-- 1. People Affected -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    id="metric-card-affected"
    on:click={openRiskDrivers}
    class="flex-1 flex items-center gap-2.5 p-2 rounded-xl bg-[#061425]/85 border border-white/10 hover:border-[#00E5FF]/50 shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all cursor-pointer group"
    title="Click to view explainable risk drivers"
  >
    <div class="p-2 rounded-lg bg-[#00E5FF]/15 text-[#00E5FF] group-hover:scale-110 transition-transform">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </div>
    <div class="flex flex-col min-w-0">
      <span class="text-sm font-bold text-white tracking-tight leading-tight">{m.peopleAffected}</span>
      <span class="text-[9px] text-[#8BA1B8] truncate">{m.peopleAffectedSub || 'People Affected'}</span>
    </div>
  </div>

  <!-- 2. Displaced Population -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    id="metric-card-displaced"
    on:click={openRiskDrivers}
    class="flex-1 flex items-center gap-2.5 p-2 rounded-xl bg-[#061425]/85 border border-white/10 hover:border-red-500/50 shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all cursor-pointer group"
    title="Click to view displacement drivers"
  >
    <div class="p-2 rounded-lg bg-red-500/15 text-red-400 group-hover:scale-110 transition-transform">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    </div>
    <div class="flex flex-col min-w-0">
      <span class="text-sm font-bold text-white tracking-tight leading-tight">{m.displaced}</span>
      <span class="text-[9px] text-[#8BA1B8] truncate">{m.displacedSub || 'Displaced'}</span>
    </div>
  </div>

  <!-- 3. Districts -->
  <div class="flex-1 flex items-center gap-2.5 p-2 rounded-xl bg-[#061425]/85 border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
    <div class="p-2 rounded-lg bg-[#38BDF8]/15 text-[#38BDF8]">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    </div>
    <div class="flex flex-col min-w-0">
      <span class="text-sm font-bold text-white tracking-tight leading-tight">{m.districts}</span>
      <span class="text-[9px] text-[#8BA1B8] truncate">{m.districtsSub || 'Districts'}</span>
    </div>
  </div>

  <!-- 4. Roads Affected -->
  <div class="flex-1 flex items-center gap-2.5 p-2 rounded-xl bg-[#061425]/85 border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
    <div class="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    </div>
    <div class="flex flex-col min-w-0">
      <span class="text-sm font-bold text-white tracking-tight leading-tight">{m.roadsAffected}</span>
      <span class="text-[9px] text-[#8BA1B8] truncate">{m.roadsSub || 'Roads Affected'}</span>
    </div>
  </div>

  <!-- 5. Health Facilities -->
  <div class="flex-1 flex items-center gap-2.5 p-2 rounded-xl bg-[#061425]/85 border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
    <div class="p-2 rounded-lg bg-[#00E5FF]/15 text-[#00E5FF]">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div class="flex flex-col min-w-0">
      <span class="text-sm font-bold text-white tracking-tight leading-tight">{m.healthFacilities}</span>
      <span class="text-[9px] text-[#8BA1B8] truncate">{m.healthSub || 'Health Facilities'}</span>
    </div>
  </div>

  <!-- 6. Major Bridges -->
  <div class="flex-1 flex items-center gap-2.5 p-2 rounded-xl bg-[#061425]/85 border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
    <div class="p-2 rounded-lg bg-[#38BDF8]/15 text-[#38BDF8]">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    </div>
    <div class="flex flex-col min-w-0">
      <span class="text-sm font-bold text-white tracking-tight leading-tight">{m.majorBridges}</span>
      <span class="text-[9px] text-[#8BA1B8] truncate">{m.bridgesSub || 'Major Bridges'}</span>
    </div>
  </div>
</div>
