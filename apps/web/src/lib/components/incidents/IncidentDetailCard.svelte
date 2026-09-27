<script lang="ts">
  import { selectedIncident, clearIncidentSelection } from '../../stores/incidentStore';
  import {
    isIncidentTelemetryCollapsed,
    openIncidentAnalyzeModal,
    openIncidentSimulateModal,
    openIncidentPlanModal
  } from '../../stores/systemStore';

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && !$isIncidentTelemetryCollapsed) {
      isIncidentTelemetryCollapsed.set(true);
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $selectedIncident}
  {#if $isIncidentTelemetryCollapsed}
    <!-- Collapsed Telemetry Reopen Control -->
    <button
      on:click={() => isIncidentTelemetryCollapsed.set(false)}
      class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#061425]/90 backdrop-blur-md border border-[#00E5FF]/40 text-[#00E5FF] hover:text-white hover:border-[#00E5FF] shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all cursor-pointer font-mono text-xs group"
      title="Restore Incident Telemetry Panel"
    >
      <span class="w-2 h-2 rounded-full {$selectedIncident.severity === 'critical' ? 'bg-[#EF4444] animate-ping' : 'bg-[#F59E0B]'}"></span>
      <span class="text-[10px] font-bold uppercase tracking-wider truncate max-w-[200px]">
        {$selectedIncident.name} Telemetry
      </span>
      <span class="text-[#8BA1B8] group-hover:text-[#00E5FF] text-xs">▶</span>
    </button>
  {:else}
    <div class="p-4 rounded-2xl bg-[#061425]/85 backdrop-blur-xl border border-[#00E5FF]/40 shadow-[0_8px_32px_rgba(0,0,0,0.7),0_0_20px_rgba(0,229,255,0.2)] select-none w-80 font-mono animate-in fade-in zoom-in-95 duration-200">
      <!-- Header -->
      <div class="flex items-start justify-between pb-2 mb-3 border-b border-[#00E5FF]/20">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full {$selectedIncident.severity === 'critical' ? 'bg-[#EF4444] animate-ping' : 'bg-[#F59E0B]'}"></span>
            <span class="text-xs font-bold uppercase tracking-widest text-[#00E5FF]">Incident Telemetry</span>
          </div>
          <h3 class="text-sm font-bold text-white mt-0.5">{$selectedIncident.name}</h3>
          <p class="text-[11px] text-[#8BA1B8]">{$selectedIncident.region}, {$selectedIncident.country}</p>
        </div>

        <button
          on:click={() => isIncidentTelemetryCollapsed.set(true)}
          class="text-[#8BA1B8] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          title="Collapse telemetry panel (Esc)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Severity & Risk Score Meter -->
      <div class="grid grid-cols-2 gap-2 mb-3">
        <div class="p-2 rounded-xl bg-[#020711]/60 border border-white/5">
          <span class="text-[9px] text-[#8BA1B8] uppercase block">Severity Tier</span>
          <span class="text-xs font-bold uppercase {$selectedIncident.severity === 'critical' ? 'text-[#EF4444]' : 'text-[#F59E0B]'}">
            {$selectedIncident.severity}
          </span>
        </div>

        <div class="p-2 rounded-xl bg-[#020711]/60 border border-white/5">
          <span class="text-[9px] text-[#8BA1B8] uppercase block">Risk Index</span>
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-bold text-white">{$selectedIncident.riskScore}/100</span>
            <span class="text-[9px] text-[#00E5FF]">({Math.round($selectedIncident.confidence * 100)}% conf)</span>
          </div>
        </div>
      </div>

      <!-- Hazard-Aware Vital Stats -->
      <div class="space-y-1.5 text-[11px] mb-3 pb-3 border-b border-[#00E5FF]/15">
        <div class="flex justify-between">
          <span class="text-[#8BA1B8]">Population Exposed:</span>
          <span class="text-white font-semibold">{$selectedIncident.affectedPopulation}</span>
        </div>

        {#if $selectedIncident.type === 'earthquake'}
          <div class="flex justify-between">
            <span class="text-[#8BA1B8]">Seismic Intensity:</span>
            <span class="text-[#00E5FF] font-semibold">
              {$selectedIncident.overview?.keyMetrics?.find((m) => m.label.includes('Intensity'))?.value || 'Shindo 6- (M6.2)'}
            </span>
          </div>
        {:else if $selectedIncident.type === 'flood'}
          {#if $selectedIncident.details.riverLevelMeters}
            <div class="flex justify-between">
              <span class="text-[#8BA1B8]">Flood River Level:</span>
              <span class="text-[#00E5FF]">+{$selectedIncident.details.riverLevelMeters}m (Danger Crest)</span>
            </div>
          {/if}
          {#if $selectedIncident.details.rainfallRate && $selectedIncident.details.rainfallRate !== 'N/A'}
            <div class="flex justify-between">
              <span class="text-[#8BA1B8]">Precipitation:</span>
              <span class="text-[#38BDF8]">{$selectedIncident.details.rainfallRate}</span>
            </div>
          {/if}
        {:else if $selectedIncident.type === 'cyclone'}
          {#if $selectedIncident.details.windSpeed && $selectedIncident.details.windSpeed !== 'N/A'}
            <div class="flex justify-between">
              <span class="text-[#8BA1B8]">Sustained Winds:</span>
              <span class="text-[#3D7CFF] font-semibold">{$selectedIncident.details.windSpeed}</span>
            </div>
          {/if}
          <div class="flex justify-between">
            <span class="text-[#8BA1B8]">Track Forecast:</span>
            <span class="text-[#00E5FF] truncate max-w-[150px]">Coastal Arc Inundation</span>
          </div>
        {:else if $selectedIncident.type === 'wildfire'}
          <div class="flex justify-between">
            <span class="text-[#8BA1B8]">Fire Spread Rate:</span>
            <span class="text-amber-400 font-semibold">14 km/day (High Gusts)</span>
          </div>
          {#if $selectedIncident.details.temperature && $selectedIncident.details.temperature !== 'N/A'}
            <div class="flex justify-between">
              <span class="text-[#8BA1B8]">Thermal / RH:</span>
              <span class="text-rose-400">{$selectedIncident.details.temperature}</span>
            </div>
          {/if}
        {/if}

        <div class="flex justify-between">
          <span class="text-[#8BA1B8]">Infrastructure Impact:</span>
          <span class="text-amber-400 truncate max-w-[160px]" title={$selectedIncident.details.roadAccessibility || 'Monitoring'}>
            {$selectedIncident.details.roadAccessibility || 'Monitoring'}
          </span>
        </div>

        <div class="flex justify-between">
          <span class="text-[#8BA1B8]">Shelter Capacity:</span>
          <span class="text-white truncate max-w-[160px]" title={$selectedIncident.details.shelterDemand || 'Active'}>
            {$selectedIncident.details.shelterDemand || 'Active'}
          </span>
        </div>
      </div>

      <!-- Operational Actions -->
      <div class="grid grid-cols-3 gap-1.5 text-[10px]">
        <button
          on:click={openIncidentAnalyzeModal}
          class="py-1.5 px-2 rounded-lg bg-[#00E5FF]/10 hover:bg-[#00E5FF] hover:text-[#020711] text-[#00E5FF] border border-[#00E5FF]/30 transition-all font-bold text-center cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.15)] active:scale-95"
          title="Run Incident Neural Intelligence Pipeline"
        >
          Analyze
        </button>

        <button
          on:click={openIncidentSimulateModal}
          class="py-1.5 px-2 rounded-lg bg-[#3D7CFF]/10 hover:bg-[#3D7CFF] text-white border border-[#3D7CFF]/30 transition-all font-bold text-center cursor-pointer shadow-[0_0_10px_rgba(61,124,255,0.15)] active:scale-95"
          title="Run What-If Hazard Simulation"
        >
          Simulate
        </button>

        <button
          on:click={openIncidentPlanModal}
          class="py-1.5 px-2 rounded-lg bg-[#8B5CFF]/15 hover:bg-[#8B5CFF] text-white border border-[#8B5CFF]/40 transition-all font-bold text-center cursor-pointer shadow-[0_0_10px_rgba(139,92,246,0.15)] active:scale-95"
          title="Synthesize Tactical Emergency Response Plan"
        >
          Plan
        </button>
      </div>
    </div>
  {/if}
{/if}