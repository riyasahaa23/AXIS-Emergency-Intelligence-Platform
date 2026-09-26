<script lang="ts">
  import { selectedIncident, incidents, selectIncident } from '../../stores/incidentStore';
  import { activeNavSection } from '../../stores/systemStore';

  let showSwitcher = false;

  function goToIncidents() {
    activeNavSection.set('incidents');
  }
</script>

<div class="relative flex flex-col font-mono text-xs select-none">
  <div class="text-[9px] uppercase tracking-wider text-[#8BA1B8] font-bold mb-1 flex items-center justify-between">
    <span>SELECTED INCIDENT</span>
    <button
      on:click={goToIncidents}
      class="text-[#00E5FF] hover:underline text-[9px] font-normal cursor-pointer"
      title="View all incidents in Incidents tab"
    >
      Change →
    </button>
  </div>

  {#if $selectedIncident}
    <div class="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-[#061425]/90 border border-white/10 hover:border-[#00E5FF]/40 shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-all">
      <!-- Thumbnail with realistic water / incident rendering -->
      <div class="relative w-16 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-[#030914]">
        {#if $selectedIncident.type === 'flood'}
          <div class="w-full h-full bg-gradient-to-b from-[#0a2540] via-[#0e3a63] to-[#041527] relative flex items-end">
            <!-- Distant silhouettes -->
            <div class="absolute bottom-2 left-1.5 w-3 h-5 bg-[#061527]"></div>
            <div class="absolute bottom-2 left-5 w-4 h-7 bg-[#040e1a]"></div>
            <div class="absolute bottom-2 left-10 w-3 h-4 bg-[#081e36]"></div>
            <!-- Flood surface reflection -->
            <div class="w-full h-4 bg-gradient-to-t from-cyan-400/50 via-blue-500/30 to-transparent"></div>
            <div class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></div>
          </div>
        {:else if $selectedIncident.type === 'cyclone'}
          <div class="w-full h-full bg-[#031326] relative flex items-center justify-center overflow-hidden">
            <div class="w-8 h-8 rounded-full border-2 border-dashed border-sky-300/80 animate-spin" style="animation-duration: 5s;"></div>
            <div class="w-2 h-2 rounded-full bg-sky-200"></div>
          </div>
        {:else}
          <div class="w-full h-full bg-gradient-to-t from-orange-600 via-amber-800 to-[#120703] relative flex items-end overflow-hidden">
            <div class="w-full h-3 bg-gradient-to-t from-orange-400/40 to-transparent"></div>
            <div class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div>
          </div>
        {/if}
      </div>

      <!-- Center Metadata -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1.5 mb-0.5">
          <h2 class="text-xs font-bold text-white tracking-wide truncate">
            {$selectedIncident.name}
          </h2>
          <span class="px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider shrink-0 {
            $selectedIncident.severity === 'critical'
              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
          }">
            {$selectedIncident.severity}
          </span>
        </div>

        <p class="text-[10px] text-[#8BA1B8] truncate mb-1">
          {$selectedIncident.country}
        </p>

        <div class="flex items-center gap-2 text-[9px] text-[#00E5FF]">
          <span>{$selectedIncident.affectedPopulation}</span>
          <span class="text-white/30">•</span>
          <span>{$selectedIncident.districtsAffected || 12} districts</span>
        </div>
      </div>
    </div>
  {/if}
</div>
