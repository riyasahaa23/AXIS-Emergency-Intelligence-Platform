<script lang="ts">
  import { selectedIncident, activeDetailTab } from '../../stores/incidentStore';
  import { openScenarioDrawer } from '../../stores/systemStore';
  import { submitCommand } from '../../stores/commandStore';

  const tabs: Array<{ id: 'overview' | 'impact' | 'forecast' | 'response'; label: string }> = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'impact', label: 'IMPACT' },
    { id: 'forecast', label: 'FORECAST' },
    { id: 'response', label: 'RESPONSE' }
  ];

  function runAnalysis() {
    if (!$selectedIncident) return;
    submitCommand(`Run high-resolution neural impact analysis for ${$selectedIncident.name} in ${$selectedIncident.region}, ${$selectedIncident.country}`);
  }

  function simulateScenario() {
    openScenarioDrawer();
  }

  function assignResources() {
    if (!$selectedIncident) return;
    submitCommand(`Deploy emergency relief supplies and response teams to ${$selectedIncident.name} zone in ${$selectedIncident.country}`);
  }
</script>

{#if $selectedIncident}
  <aside class="flex flex-col w-full md:w-[360px] lg:w-[390px] shrink-0 h-full p-3.5 rounded-2xl bg-[#061425]/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] font-mono text-xs select-none overflow-hidden">
    
    <!-- Incident Header & Summary Card -->
    <div class="pb-3 border-b border-white/10 shrink-0">
      <div class="flex items-start justify-between gap-2">
        <div class="flex flex-col">
          <div class="flex items-center gap-2 mb-1">
            <span class="w-2 h-2 rounded-full {$selectedIncident.severity === 'critical' ? 'bg-[#EF4444] animate-ping' : 'bg-[#F59E0B]'}"></span>
            <span class="text-[10px] font-bold tracking-widest text-[#00E5FF] uppercase">
              {$selectedIncident.type.toUpperCase()} // INCIDENT
            </span>
          </div>
          <h2 class="text-base sm:text-lg font-bold text-white tracking-wide uppercase leading-tight">
            {$selectedIncident.name}
          </h2>
          <p class="text-xs text-[#8BA1B8] font-medium mt-0.5">
            {$selectedIncident.region}, <span class="text-white font-semibold">{$selectedIncident.country}</span>
          </p>
        </div>

        <!-- Severity & Active Pill -->
        <div class="flex flex-col items-end gap-1">
          <span class="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border {
            $selectedIncident.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.4)]' :
            $selectedIncident.severity === 'high' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.4)]' :
            $selectedIncident.severity === 'moderate' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
            'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
          }">
            {$selectedIncident.severity}
          </span>
          <span class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] uppercase font-bold tracking-wider">
            {$selectedIncident.status}
          </span>
        </div>
      </div>

      <div class="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-[#8BA1B8]">
        <span>Last updated: {$selectedIncident.relativeTime}</span>
        <span class="text-[#00E5FF] font-semibold">CONFIDENCE: {Math.round($selectedIncident.confidence * 100)}%</span>
      </div>
    </div>

    <!-- Navigation Tabs (OVERVIEW | IMPACT | FORECAST | RESPONSE) -->
    <div class="flex items-center justify-between gap-1 p-1 my-2.5 rounded-xl bg-[#020711]/70 border border-white/10 shrink-0">
      {#each tabs as tab}
        <button
          on:click={() => activeDetailTab.set(tab.id)}
          class="flex-1 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold tracking-wider text-center transition-all cursor-pointer {
            $activeDetailTab === tab.id
              ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50 shadow-[0_0_15px_rgba(0,229,255,0.3)]'
              : 'text-[#8BA1B8] hover:text-white hover:bg-white/5 border border-transparent'
          }"
        >
          {tab.label}
        </button>
      {/each}
    </div>

    <!-- Tab Dynamic Content Container (Scrollable) -->
    <div class="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
      
      <!-- ======================================================== -->
      <!-- TAB 1: OVERVIEW -->
      <!-- ======================================================== -->
      {#if $activeDetailTab === 'overview'}
        <!-- 4 Primary KPI metric cards -->
        <div class="grid grid-cols-2 gap-2">
          {#if $selectedIncident.overview?.keyMetrics}
            {#each $selectedIncident.overview.keyMetrics as metric}
              <div class="p-2.5 rounded-xl bg-[#030a16]/80 border border-white/10 flex flex-col justify-between">
                <span class="text-[9px] uppercase text-[#8BA1B8] tracking-wider">{metric.label}</span>
                <span class="text-lg font-bold text-white tracking-tight my-0.5">{metric.value}</span>
                {#if metric.sub}
                  <span class="text-[9px] text-[#00E5FF]">{metric.sub}</span>
                {/if}
              </div>
            {/each}
          {:else}
            <div class="p-2.5 rounded-xl bg-[#030a16]/80 border border-white/10">
              <span class="text-[9px] text-[#8BA1B8] uppercase">People Affected</span>
              <span class="text-base font-bold text-white block">{$selectedIncident.affectedPopulation}</span>
            </div>
            <div class="p-2.5 rounded-xl bg-[#030a16]/80 border border-white/10">
              <span class="text-[9px] text-[#8BA1B8] uppercase">Severity Rank</span>
              <span class="text-base font-bold text-red-400 block uppercase">{$selectedIncident.severity}</span>
            </div>
          {/if}
        </div>

        <!-- Narrative Summary -->
        <div class="p-3 rounded-xl bg-[#020711]/60 border border-white/10 space-y-1.5">
          <span class="text-[10px] text-[#00E5FF] font-bold uppercase tracking-wider block">Operational Summary</span>
          <p class="text-[11px] text-[#CAD6E2] leading-relaxed">
            {$selectedIncident.overview?.summary || $selectedIncident.details.description}
          </p>
        </div>

        <!-- Critical Risk Alert Banner -->
        <div class="p-3 rounded-xl bg-red-500/10 border border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <div class="flex items-center gap-2 text-red-400 font-bold text-[11px] tracking-wider mb-1">
            <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>RISK LEVEL: {$selectedIncident.overview?.riskLevel || 'CRITICAL'}</span>
          </div>
          <p class="text-[10px] text-[#CAD6E2] leading-snug">
            {$selectedIncident.overview?.projectedConditions || 'Conditions expected to worsen over the next 48 hours.'}
          </p>
        </div>

      <!-- ======================================================== -->
      <!-- TAB 2: IMPACT -->
      <!-- ======================================================== -->
      {:else if $activeDetailTab === 'impact'}
        <!-- Demographic Population Exposure -->
        <div class="p-3 rounded-xl bg-[#020711]/60 border border-white/10 space-y-2">
          <span class="text-[10px] text-[#00E5FF] font-bold uppercase tracking-wider block">Population Breakdown</span>
          {#if $selectedIncident.impact?.population}
            {#each $selectedIncident.impact.population as pop}
              <div class="space-y-1">
                <div class="flex justify-between text-[10px]">
                  <span class="text-[#8BA1B8]">{pop.label}</span>
                  <span class="text-white font-bold">{pop.value} ({pop.pct}%)</span>
                </div>
                <div class="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div class="h-full rounded-full" style="width: {pop.pct}%; background-color: {pop.color || '#00E5FF'};"></div>
                </div>
              </div>
            {/each}
          {/if}
        </div>

        <!-- Infrastructure Impact -->
        <div class="p-3 rounded-xl bg-[#020711]/60 border border-white/10 space-y-2">
          <span class="text-[10px] text-[#00E5FF] font-bold uppercase tracking-wider block">Infrastructure & Utilities</span>
          {#if $selectedIncident.impact?.infrastructure}
            <div class="space-y-1.5">
              {#each $selectedIncident.impact.infrastructure as item}
                <div class="flex items-start justify-between gap-2 p-1.5 rounded-lg bg-black/30 border border-white/5">
                  <span class="text-[10px] text-[#CAD6E2]">{item.label}</span>
                  <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 {
                    item.status === 'critical' ? 'bg-red-500/20 text-red-400' :
                    item.status === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }">
                    {item.value}
                  </span>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Healthcare & Shelter Demands -->
        <div class="p-2.5 rounded-xl bg-[#020711]/60 border border-white/10 space-y-1 text-[10px]">
          <div class="text-[#00E5FF] font-bold uppercase">Emergency Facilities</div>
          <p class="text-[#CAD6E2]">{$selectedIncident.impact?.healthcare || 'Medical facilities operational on backup power.'}</p>
          <div class="text-amber-400 font-semibold pt-1">{$selectedIncident.impact?.shelterOccupancy}</div>
        </div>

      <!-- ======================================================== -->
      <!-- TAB 3: FORECAST -->
      <!-- ======================================================== -->
      {:else if $activeDetailTab === 'forecast'}
        <!-- Timeline Trend Progression -->
        <div class="p-3 rounded-xl bg-[#020711]/60 border border-white/10 space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-[10px] text-[#00E5FF] font-bold uppercase tracking-wider">72-Hour Inundation Curve</span>
            <span class="text-[9px] text-[#8BA1B8] font-mono">km² Inundation</span>
          </div>

          {#if $selectedIncident.forecast?.timeline}
            <div class="space-y-1.5">
              {#each $selectedIncident.forecast.timeline as step}
                <div class="flex items-center gap-2 text-[10px]">
                  <span class="w-8 font-mono font-bold {step.time === 'NOW' ? 'text-[#00E5FF]' : 'text-[#8BA1B8]'}">{step.time}</span>
                  <div class="flex-1 h-3 rounded-md bg-white/10 overflow-hidden relative">
                    <div
                      class="h-full rounded-md transition-all duration-500 {step.time === 'NOW' ? 'bg-[#00E5FF]' : 'bg-[#38BDF8]/60'}"
                      style="width: {Math.min(100, Math.round((step.areaKm2 / 2000) * 100))}%;"
                    ></div>
                  </div>
                  <span class="w-16 text-right font-mono text-white font-bold">{step.areaKm2} km²</span>
                  <span class="w-14 text-right font-mono text-amber-400">{step.popAtRisk}</span>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Crest Warning -->
        {#if $selectedIncident.forecast?.crestTime}
          <div class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-[10px] text-amber-300">
            <span class="font-bold uppercase block mb-0.5">⚠️ Hydrologic Forecast Peak</span>
            {$selectedIncident.forecast.crestTime}
          </div>
        {/if}

        <div class="p-2.5 rounded-xl bg-[#020711]/60 border border-white/10 text-[10px] text-[#CAD6E2] leading-relaxed">
          {$selectedIncident.forecast?.trendSummary || 'Hazard modeling suggests plateau within 36 hours.'}
        </div>

      <!-- ======================================================== -->
      <!-- TAB 4: RESPONSE -->
      <!-- ======================================================== -->
      {:else if $activeDetailTab === 'response'}
        <!-- Response Capacity Counters -->
        <div class="grid grid-cols-2 gap-2">
          <div class="p-2 rounded-xl bg-[#030a16]/80 border border-white/10">
            <span class="text-[9px] text-[#8BA1B8] uppercase">Response Teams</span>
            <span class="text-base font-bold text-[#00E5FF] block">{$selectedIncident.response?.teamsDeployed || 142} Units</span>
          </div>
          <div class="p-2 rounded-xl bg-[#030a16]/80 border border-white/10">
            <span class="text-[9px] text-[#8BA1B8] uppercase">Surge Capacity</span>
            <span class="text-base font-bold text-emerald-400 block">{($selectedIncident.response?.bedsAvailable || 14800).toLocaleString()} Beds</span>
          </div>
        </div>

        <!-- Active Units -->
        <div class="p-2.5 rounded-xl bg-[#020711]/60 border border-white/10 space-y-1.5">
          <span class="text-[10px] text-[#00E5FF] font-bold uppercase tracking-wider block">Deployed Emergency Units</span>
          {#if $selectedIncident.response?.units}
            <div class="space-y-1">
              {#each $selectedIncident.response.units as unit}
                <div class="p-1.5 rounded-lg bg-black/40 border border-white/5 text-[10px]">
                  <div class="flex justify-between font-bold text-white">
                    <span>{unit.name}</span>
                    <span class="text-emerald-400">{unit.status}</span>
                  </div>
                  <div class="flex justify-between text-[9px] text-[#8BA1B8]">
                    <span>{unit.type}</span>
                    <span>{unit.location}</span>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Action Control Buttons -->
        <div class="pt-2 space-y-2">
          <button
            on:click={runAnalysis}
            class="w-full py-2 rounded-xl bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 border border-[#00E5FF]/60 text-[#00E5FF] hover:text-white font-mono font-bold text-xs shadow-[0_0_15px_rgba(0,229,255,0.25)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>📈</span>
            <span>Run Impact Analysis</span>
          </button>

          <button
            on:click={simulateScenario}
            class="w-full py-2 rounded-xl bg-[#38BDF8]/20 hover:bg-[#38BDF8]/30 border border-[#38BDF8]/60 text-[#38BDF8] hover:text-white font-mono font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>◈</span>
            <span>Simulate Scenario</span>
          </button>

          <button
            on:click={assignResources}
            class="w-full py-2 rounded-xl bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 border border-[#F59E0B]/60 text-[#F59E0B] hover:text-white font-mono font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>📦</span>
            <span>Assign Resources</span>
          </button>
        </div>
      {/if}

    </div>

  </aside>
{/if}
