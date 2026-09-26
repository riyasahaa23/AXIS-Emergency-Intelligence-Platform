<script lang="ts">
  import {
    activeScenarioDetailTab,
    currentHazardConfig,
    scenarioSimulationResult,
    simulationTimelineDay
  } from '$lib/stores/scenarioStore';
  import type { ScenarioDetailTab } from '$lib/types/scenario';

  const detailTabs: Array<{ id: ScenarioDetailTab; label: string; icon: string }> = [
    { id: 'impact_projection', label: 'IMPACT PROJECTION', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { id: 'affected_population', label: 'AFFECTED POPULATION', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'infrastructure', label: 'INFRASTRUCTURE', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'risk_analysis', label: 'RISK ANALYSIS', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { id: 'response_needs', label: 'RESPONSE NEEDS', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' }
  ];
</script>

<div class="flex flex-col gap-4 font-mono select-none w-full">
  
  <!-- Section Title -->
  <div class="flex items-center justify-between pb-1 border-b border-white/10">
    <div class="flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]"></span>
      <h2 class="text-xs md:text-sm font-bold tracking-wider text-white uppercase">
        SCENARIO COMPARISON // CURRENT VS SIMULATED
      </h2>
    </div>
    <span class="text-[10px] text-[#8BA1B8] hidden sm:inline">
      EVALUATING TIMELINE DAY {$simulationTimelineDay}
    </span>
  </div>

  <!-- 1. Three Comparison Cards: Current Situation vs Simulated Scenario vs Difference -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
    
    <!-- CARD 1: CURRENT SITUATION -->
    <div class="flex flex-col p-4 rounded-2xl bg-[#030A16]/80 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div class="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-[#00E5FF]"></span>
          <span class="text-xs font-bold text-white uppercase tracking-wider">CURRENT SITUATION</span>
        </div>
        <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
          BASELINE
        </span>
      </div>

      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <span class="text-xs text-[#8BA1B8]">People Affected</span>
          <span class="text-sm font-bold text-white">{$currentHazardConfig.baseMetrics.affectedPopulation}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-[#8BA1B8]">Displaced</span>
          <span class="text-sm font-bold text-white">{$currentHazardConfig.baseMetrics.displacedPopulation}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-[#8BA1B8]">Affected Districts</span>
          <span class="text-sm font-bold text-white">{$currentHazardConfig.baseMetrics.affectedDistricts}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-[#8BA1B8]">Roads Severed</span>
          <span class="text-sm font-bold text-white">{$currentHazardConfig.baseMetrics.roadsAffected}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-[#8BA1B8]">Health Facilities</span>
          <span class="text-sm font-bold text-white">{$currentHazardConfig.baseMetrics.healthFacilities}</span>
        </div>
      </div>
    </div>

    <!-- CARD 2: SIMULATED SCENARIO -->
    <div class="flex flex-col p-4 rounded-2xl bg-[#0D0B24]/90 border border-[#8B5CF6]/50 shadow-[0_4px_25px_rgba(139,92,246,0.25)] relative overflow-hidden">
      <!-- Glow accent -->
      <div class="absolute -top-12 -right-12 w-28 h-28 bg-[#8B5CF6]/20 rounded-full blur-2xl pointer-events-none"></div>

      <div class="flex items-center justify-between pb-2 mb-3 border-b border-[#8B5CF6]/30">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-[#C084FC] shadow-[0_0_8px_#C084FC]"></span>
          <span class="text-xs font-bold text-[#C084FC] uppercase tracking-wider">SIMULATED SCENARIO</span>
        </div>
        <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-[#8B5CF6]/20 text-[#E9D5FF] border border-[#8B5CF6]/50 animate-pulse">
          PROJECTED
        </span>
      </div>

      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <span class="text-xs text-[#E9D5FF]">People Affected</span>
          <div class="flex items-center gap-1.5">
            <span class="text-sm font-bold text-white">{$scenarioSimulationResult.simulatedMetrics.affectedPopulation}</span>
            <span class="text-[10px] font-bold text-[#C084FC] px-1 rounded bg-[#8B5CF6]/20">
              {$scenarioSimulationResult.diff.affectedPct}
            </span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-[#E9D5FF]">Displaced</span>
          <div class="flex items-center gap-1.5">
            <span class="text-sm font-bold text-white">{$scenarioSimulationResult.simulatedMetrics.displacedPopulation}</span>
            <span class="text-[10px] font-bold text-[#C084FC] px-1 rounded bg-[#8B5CF6]/20">
              {$scenarioSimulationResult.diff.displacedPct}
            </span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-[#E9D5FF]">Affected Districts</span>
          <div class="flex items-center gap-1.5">
            <span class="text-sm font-bold text-white">{$scenarioSimulationResult.simulatedMetrics.affectedDistricts}</span>
            <span class="text-[10px] font-bold text-[#C084FC] px-1 rounded bg-[#8B5CF6]/20">
              {$scenarioSimulationResult.diff.districtsPct}
            </span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-[#E9D5FF]">Roads Severed</span>
          <div class="flex items-center gap-1.5">
            <span class="text-sm font-bold text-white">{$scenarioSimulationResult.simulatedMetrics.roadsAffected}</span>
            <span class="text-[10px] font-bold text-[#C084FC] px-1 rounded bg-[#8B5CF6]/20">
              {$scenarioSimulationResult.diff.roadsPct}
            </span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-[#E9D5FF]">Health Facilities</span>
          <div class="flex items-center gap-1.5">
            <span class="text-sm font-bold text-white">{$scenarioSimulationResult.simulatedMetrics.healthFacilities}</span>
            <span class="text-[10px] font-bold text-[#C084FC] px-1 rounded bg-[#8B5CF6]/20">
              {$scenarioSimulationResult.diff.healthPct}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- CARD 3: DIFFERENCE -->
    <div class="flex flex-col p-4 rounded-2xl bg-[#030A16]/80 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div class="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-[#EF4444]"></span>
          <span class="text-xs font-bold text-white uppercase tracking-wider">DIFFERENCE</span>
        </div>
        <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30">
          DELTA IMPACT
        </span>
      </div>

      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <span class="text-xs text-[#8BA1B8]">Additional Affected</span>
          <span class="text-sm font-bold text-[#EF4444]">{$scenarioSimulationResult.diff.affectedDiff}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-[#8BA1B8]">Additional Displaced</span>
          <span class="text-sm font-bold text-[#EF4444]">{$scenarioSimulationResult.diff.displacedDiff}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-[#8BA1B8]">New Districts Cut Off</span>
          <span class="text-sm font-bold text-[#F59E0B]">{$scenarioSimulationResult.diff.districtsDiff}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-[#8BA1B8]">Additional Roads Cut</span>
          <span class="text-sm font-bold text-[#F59E0B]">{$scenarioSimulationResult.diff.roadsDiff}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-[#8BA1B8]">Hospitals Inundated</span>
          <span class="text-sm font-bold text-[#EF4444]">{$scenarioSimulationResult.diff.healthDiff}</span>
        </div>
      </div>
    </div>

  </div>

  <!-- 2. Detailed Scenario Workspace Tabs Navigation -->
  <div class="flex items-center gap-2 overflow-x-auto custom-scrollbar border-b border-white/10 pb-2">
    {#each detailTabs as tab}
      <button
        type="button"
        on:click={() => activeScenarioDetailTab.set(tab.id)}
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer whitespace-nowrap border {
          $activeScenarioDetailTab === tab.id
            ? 'bg-[#8B5CF6]/20 text-white border-[#8B5CF6] shadow-[0_0_12px_rgba(139,92,246,0.3)] font-bold'
            : 'bg-[#061425]/50 text-[#8BA1B8] border-transparent hover:border-white/10 hover:text-white'
        }"
      >
        <svg class="w-3.5 h-3.5 {$activeScenarioDetailTab === tab.id ? 'text-[#00E5FF]' : 'text-[#8BA1B8]'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d={tab.icon} />
        </svg>
        <span class="text-[11px]">{tab.label}</span>
      </button>
    {/each}
  </div>

  <!-- 3. Dynamic Detail Content Panels -->
  <div class="p-4 rounded-2xl bg-[#030A16]/90 border border-white/10 min-h-[220px]">
    
    {#if $activeScenarioDetailTab === 'impact_projection'}
      <!-- TAB 1: IMPACT PROJECTION -->
      <div class="flex flex-col gap-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
          <div>
            <div class="text-xs font-bold text-white uppercase tracking-wider">30-DAY IMPACT PROJECTION CURVE</div>
            <div class="text-[11px] text-[#8BA1B8]">Comparative trajectory of baseline vs simulated hazard evolution</div>
          </div>
          <div class="flex items-center gap-3 text-xs">
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-0.5 bg-[#00E5FF]"></span>
              <span class="text-[#8BA1B8]">Baseline Path</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-0.5 bg-[#8B5CF6]"></span>
              <span class="text-white font-semibold">Simulated (+{$scenarioSimulationResult.diff.affectedPct})</span>
            </div>
          </div>
        </div>

        <!-- Visual Curve Graph -->
        <div class="relative h-36 w-full flex items-end justify-between px-4 pt-6 pb-2 border-b border-white/10">
          <!-- Baseline Curve Points -->
          <div class="flex flex-col items-center gap-1">
            <span class="text-[9px] text-[#8BA1B8]">Now</span>
            <div class="w-3 h-12 bg-gradient-to-t from-[#00E5FF]/40 to-[#00E5FF] rounded-t"></div>
            <span class="text-[10px] text-white">2.4M</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span class="text-[9px] text-[#8BA1B8]">+3d</span>
            <div class="w-3 h-16 bg-gradient-to-t from-[#00E5FF]/40 to-[#00E5FF] rounded-t"></div>
            <span class="text-[10px] text-white">2.7M</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span class="text-[9px] text-[#8BA1B8]">+7d</span>
            <div class="w-3 h-20 bg-gradient-to-t from-[#00E5FF]/40 to-[#00E5FF] rounded-t"></div>
            <span class="text-[10px] text-white">3.1M</span>
          </div>
          <!-- Simulated High Bar (Peak) -->
          <div class="flex flex-col items-center gap-1">
            <span class="text-[9px] text-[#C084FC] font-bold">+14d (Simulated)</span>
            <div class="w-4 h-28 bg-gradient-to-t from-[#8B5CF6]/50 to-[#C084FC] rounded-t shadow-[0_0_15px_#8B5CF6]"></div>
            <span class="text-[11px] font-bold text-[#00E5FF]">{$scenarioSimulationResult.simulatedMetrics.affectedPopulation}</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span class="text-[9px] text-[#8BA1B8]">+30d</span>
            <div class="w-3 h-24 bg-gradient-to-t from-[#00E5FF]/40 to-[#00E5FF] rounded-t"></div>
            <span class="text-[10px] text-white">3.4M</span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div class="p-2.5 rounded-xl bg-[#061425] border border-white/5">
            <div class="text-[10px] text-[#8BA1B8] uppercase">Peak Flood Inundation Crest</div>
            <div class="text-sm font-bold text-white mt-0.5">+14 Days (Simulated)</div>
          </div>
          <div class="p-2.5 rounded-xl bg-[#061425] border border-white/5">
            <div class="text-[10px] text-[#8BA1B8] uppercase">Population Exposure Shift</div>
            <div class="text-sm font-bold text-[#00E5FF] mt-0.5">{$scenarioSimulationResult.diff.affectedDiff} ({$scenarioSimulationResult.diff.affectedPct})</div>
          </div>
          <div class="p-2.5 rounded-xl bg-[#061425] border border-white/5">
            <div class="text-[10px] text-[#8BA1B8] uppercase">Model Convergence Certainty</div>
            <div class="text-sm font-bold text-[#10B981] mt-0.5">89% Confidence</div>
          </div>
        </div>
      </div>

    {:else if $activeScenarioDetailTab === 'affected_population'}
      <!-- TAB 2: AFFECTED POPULATION -->
      <div class="flex flex-col gap-3">
        <div class="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-white/10">
          DEMOGRAPHIC EXPOSURE & DISPLACEMENT MATRIX
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div class="p-3 rounded-xl bg-[#061425] border border-white/5 flex flex-col gap-1">
            <span class="text-[10px] text-[#8BA1B8] uppercase">Projected Total Exposed</span>
            <span class="text-base font-bold text-white">{$scenarioSimulationResult.simulatedMetrics.affectedPopulation}</span>
            <span class="text-[9px] text-[#00E5FF]">{$scenarioSimulationResult.diff.affectedDiff} vs baseline</span>
          </div>
          <div class="p-3 rounded-xl bg-[#061425] border border-white/5 flex flex-col gap-1">
            <span class="text-[10px] text-[#8BA1B8] uppercase">Displaced to Shelters</span>
            <span class="text-base font-bold text-[#F59E0B]">{$scenarioSimulationResult.simulatedMetrics.displacedPopulation}</span>
            <span class="text-[9px] text-[#F59E0B]">{$scenarioSimulationResult.diff.displacedDiff} additional</span>
          </div>
          <div class="p-3 rounded-xl bg-[#061425] border border-white/5 flex flex-col gap-1">
            <span class="text-[10px] text-[#8BA1B8] uppercase">Severe Vulnerability Cohort</span>
            <span class="text-base font-bold text-[#EF4444]">
              {Math.round($scenarioSimulationResult.simulatedMetrics.affectedPopulationRaw * 0.28 / 1000)}K
            </span>
            <span class="text-[9px] text-[#EF4444]">Elderly, children & special needs</span>
          </div>
          <div class="p-3 rounded-xl bg-[#061425] border border-white/5 flex flex-col gap-1">
            <span class="text-[10px] text-[#8BA1B8] uppercase">Cut Off / Isolated</span>
            <span class="text-base font-bold text-[#8B5CF6]">
              {Math.round($scenarioSimulationResult.simulatedMetrics.affectedPopulationRaw * 0.38 / 1000)}K
            </span>
            <span class="text-[9px] text-[#C084FC]">Requiring boat/air evacuation</span>
          </div>
        </div>
      </div>

    {:else if $activeScenarioDetailTab === 'infrastructure'}
      <!-- TAB 3: INFRASTRUCTURE -->
      <div class="flex flex-col gap-3">
        <div class="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-white/10">
          INFRASTRUCTURE ASSET FAILURE BREAKDOWN
        </div>

        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-xs text-left">
            <thead>
              <tr class="text-[10px] uppercase text-[#8BA1B8] border-b border-white/10">
                <th class="py-2 pr-4">Asset Category</th>
                <th class="py-2 px-3">Baseline</th>
                <th class="py-2 px-3 text-[#C084FC]">Simulated</th>
                <th class="py-2 px-3 text-[#EF4444]">Delta Impact</th>
                <th class="py-2 pl-3">Critical Vulnerability Note</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr>
                <td class="py-2 pr-4 font-semibold text-white">Arterial Highways & Roads</td>
                <td class="py-2 px-3 text-[#8BA1B8]">{$currentHazardConfig.baseMetrics.roadsAffected}</td>
                <td class="py-2 px-3 text-[#C084FC] font-bold">{$scenarioSimulationResult.simulatedMetrics.roadsAffected}</td>
                <td class="py-2 px-3 text-[#EF4444] font-bold">{$scenarioSimulationResult.diff.roadsDiff} ({$scenarioSimulationResult.diff.roadsPct})</td>
                <td class="py-2 pl-3 text-[#8BA1B8]">Dhaka-Sylhet N2 artery inundated at km 48</td>
              </tr>
              <tr>
                <td class="py-2 pr-4 font-semibold text-white">Major Bridges & Viaducts</td>
                <td class="py-2 px-3 text-[#8BA1B8]">{$currentHazardConfig.baseMetrics.bridgesAffected}</td>
                <td class="py-2 px-3 text-[#C084FC] font-bold">{$scenarioSimulationResult.simulatedMetrics.bridgesAffected}</td>
                <td class="py-2 px-3 text-[#EF4444] font-bold">{$scenarioSimulationResult.diff.bridgesDiff}</td>
                <td class="py-2 pl-3 text-[#8BA1B8]">Scour failure risk at Meghna rail connection</td>
              </tr>
              <tr>
                <td class="py-2 pr-4 font-semibold text-white">Healthcare & Hospitals</td>
                <td class="py-2 px-3 text-[#8BA1B8]">{$currentHazardConfig.baseMetrics.healthFacilities}</td>
                <td class="py-2 px-3 text-[#C084FC] font-bold">{$scenarioSimulationResult.simulatedMetrics.healthFacilities}</td>
                <td class="py-2 px-3 text-[#EF4444] font-bold">{$scenarioSimulationResult.diff.healthDiff} ({$scenarioSimulationResult.diff.healthPct})</td>
                <td class="py-2 pl-3 text-[#8BA1B8]">Ground-floor emergency generators compromised</td>
              </tr>
              <tr>
                <td class="py-2 pr-4 font-semibold text-white">Electrical Grid Substations</td>
                <td class="py-2 px-3 text-[#8BA1B8]">4 Submerged</td>
                <td class="py-2 px-3 text-[#C084FC] font-bold">{Math.round(4 * $scenarioSimulationResult.expansionMultiplier)} Submerged</td>
                <td class="py-2 px-3 text-[#EF4444] font-bold">+{Math.round(4 * ($scenarioSimulationResult.expansionMultiplier - 1))} Substations</td>
                <td class="py-2 pl-3 text-[#8BA1B8]">132kV regional grid islanding cascade</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    {:else if $activeScenarioDetailTab === 'risk_analysis'}
      <!-- TAB 4: RISK ANALYSIS (Explainable AI) -->
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between pb-2 border-b border-white/10">
          <div>
            <div class="text-xs font-bold text-white uppercase tracking-wider">EXPLAINABLE AI // RISK DRIVERS DECOMPOSITION</div>
            <div class="text-[11px] text-[#8BA1B8]">Algorithmic attribution of compound risk score elevation</div>
          </div>
          <div class="px-2.5 py-1 rounded-lg bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981] text-xs font-bold">
            CONFIDENCE: {$scenarioSimulationResult.riskAnalysis.confidenceScore}%
          </div>
        </div>

        <div class="space-y-3 pt-1">
          {#each $scenarioSimulationResult.riskAnalysis.drivers as driver}
            <div class="flex flex-col gap-1 bg-[#061425] p-2.5 rounded-xl border border-white/5">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-white">{driver.name}</span>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-[#EF4444] font-semibold">{driver.trend}</span>
                  <span class="font-bold text-[#00E5FF]">{driver.value}%</span>
                </div>
              </div>

              <!-- Progress bar -->
              <div class="w-full h-1.5 bg-[#0F2238] rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-[#00E5FF] via-[#8B5CF6] to-[#EF4444] rounded-full transition-all duration-300"
                  style="width: {driver.value}%"
                ></div>
              </div>

              {#if driver.description}
                <span class="text-[10px] text-[#8BA1B8]">{driver.description}</span>
              {/if}
            </div>
          {/each}
        </div>
      </div>

    {:else}
      <!-- TAB 5: RESPONSE NEEDS -->
      <div class="flex flex-col gap-3">
        <div class="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-white/10">
          OPERATIONAL RESPONSE DEFICIT & RESOURCE ALLOCATION
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {#each $scenarioSimulationResult.responseNeeds as need}
            <div class="p-3 rounded-xl bg-[#061425] border border-white/5 flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <span class="text-lg font-bold text-[#00E5FF]">{need.value}</span>
                <span class="w-2 h-2 rounded-full bg-[#8B5CF6]"></span>
              </div>
              <div class="text-xs font-bold text-white">{need.label}</div>
              <div class="text-[10px] text-[#8BA1B8] leading-tight">{need.change}</div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

  </div>

</div>
