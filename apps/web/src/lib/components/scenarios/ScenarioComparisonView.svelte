<script lang="ts">
  import {
    savedScenarios,
    comparisonScenarioA,
    comparisonScenarioB
  } from '$lib/stores/scenarioStore';
  import { calculateScenarioResults } from '$lib/mock/scenarios/scenarioDatabase';
  import type { SavedScenario } from '$lib/types/scenario';

  let selectedIdA = $comparisonScenarioA?.id || $savedScenarios[0]?.id || '';
  let selectedIdB = $comparisonScenarioB?.id || $savedScenarios[1]?.id || '';

  $: scenA = $savedScenarios.find((s) => s.id === selectedIdA) || $savedScenarios[0];
  $: scenB = $savedScenarios.find((s) => s.id === selectedIdB) || $savedScenarios[1];

  $: resA = scenA ? calculateScenarioResults(scenA.hazardType, scenA.parameters, scenA.factors, 14) : null;
  $: resB = scenB ? calculateScenarioResults(scenB.hazardType, scenB.parameters, scenB.factors, 14) : null;
</script>

<div class="flex flex-col gap-4 w-full h-full font-mono select-none p-2 overflow-y-auto custom-scrollbar">
  
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
    <div>
      <h2 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-[#8B5CF6]"></span>
        <span>SCENARIO COMPARISON MATRIX</span>
      </h2>
      <p class="text-[11px] text-[#8BA1B8] mt-0.5">
        Evaluate divergence between two counterfactual policy or meteorological projections.
      </p>
    </div>
  </div>

  <!-- Pickers Row -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Picker A -->
    <div class="p-3 rounded-xl bg-[#061425] border border-white/10 flex flex-col gap-1.5">
      <span class="text-[10px] uppercase text-[#00E5FF] font-bold">SCENARIO A (BASELINE / ALTERNATIVE)</span>
      <select
        bind:value={selectedIdA}
        class="bg-[#030A16] border border-white/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
      >
        {#each $savedScenarios as s}
          <option value={s.id}>{s.name} ({s.hazardType})</option>
        {/each}
      </select>
    </div>

    <!-- Picker B -->
    <div class="p-3 rounded-xl bg-[#061425] border border-white/10 flex flex-col gap-1.5">
      <span class="text-[10px] uppercase text-[#8B5CF6] font-bold">SCENARIO B (HIGH-STRESS / ESCALATION)</span>
      <select
        bind:value={selectedIdB}
        class="bg-[#030A16] border border-white/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
      >
        {#each $savedScenarios as s}
          <option value={s.id}>{s.name} ({s.hazardType})</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Side-by-Side Comparison Table -->
  {#if resA && resB && scenA && scenB}
    <div class="p-4 rounded-2xl bg-[#030A16]/90 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <div class="overflow-x-auto custom-scrollbar">
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="text-[10px] uppercase text-[#8BA1B8] border-b border-white/10">
              <th class="py-2.5 pr-4">Metric / Dimension</th>
              <th class="py-2.5 px-3 text-[#00E5FF]">{scenA.name}</th>
              <th class="py-2.5 px-3 text-[#8B5CF6]">{scenB.name}</th>
              <th class="py-2.5 pl-3 text-[#EF4444]">Divergence (B vs A)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr>
              <td class="py-2.5 pr-4 font-semibold text-white">Projected Affected Population</td>
              <td class="py-2.5 px-3 text-white">{resA.simulatedMetrics.affectedPopulation}</td>
              <td class="py-2.5 px-3 text-white font-bold">{resB.simulatedMetrics.affectedPopulation}</td>
              <td class="py-2.5 pl-3 text-[#EF4444] font-bold">
                {resB.simulatedMetrics.affectedPopulationRaw > resA.simulatedMetrics.affectedPopulationRaw ? '+' : ''}
                {Math.round((resB.simulatedMetrics.affectedPopulationRaw - resA.simulatedMetrics.affectedPopulationRaw) / 1000)}K
              </td>
            </tr>
            <tr>
              <td class="py-2.5 pr-4 font-semibold text-white">Projected Displaced Population</td>
              <td class="py-2.5 px-3 text-white">{resA.simulatedMetrics.displacedPopulation}</td>
              <td class="py-2.5 px-3 text-white font-bold">{resB.simulatedMetrics.displacedPopulation}</td>
              <td class="py-2.5 pl-3 text-[#EF4444] font-bold">
                {resB.simulatedMetrics.displacedPopulationRaw > resA.simulatedMetrics.displacedPopulationRaw ? '+' : ''}
                {Math.round((resB.simulatedMetrics.displacedPopulationRaw - resA.simulatedMetrics.displacedPopulationRaw) / 1000)}K
              </td>
            </tr>
            <tr>
              <td class="py-2.5 pr-4 font-semibold text-white">Severed Transport Arterials</td>
              <td class="py-2.5 px-3 text-white">{resA.simulatedMetrics.roadsAffected} roads</td>
              <td class="py-2.5 px-3 text-white font-bold">{resB.simulatedMetrics.roadsAffected} roads</td>
              <td class="py-2.5 pl-3 text-[#F59E0B] font-bold">
                +{resB.simulatedMetrics.roadsAffected - resA.simulatedMetrics.roadsAffected} roads
              </td>
            </tr>
            <tr>
              <td class="py-2.5 pr-4 font-semibold text-white">Inundated Health Facilities</td>
              <td class="py-2.5 px-3 text-white">{resA.simulatedMetrics.healthFacilities} clinics</td>
              <td class="py-2.5 px-3 text-white font-bold">{resB.simulatedMetrics.healthFacilities} clinics</td>
              <td class="py-2.5 pl-3 text-[#F59E0B] font-bold">
                +{resB.simulatedMetrics.healthFacilities - resA.simulatedMetrics.healthFacilities} clinics
              </td>
            </tr>
            <tr>
              <td class="py-2.5 pr-4 font-semibold text-white">Composite AI Risk Score</td>
              <td class="py-2.5 px-3 text-white">{resA.simulatedMetrics.riskScore}/100 ({resA.simulatedMetrics.riskLevel})</td>
              <td class="py-2.5 px-3 text-white font-bold">{resB.simulatedMetrics.riskScore}/100 ({resB.simulatedMetrics.riskLevel})</td>
              <td class="py-2.5 pl-3 text-[#EF4444] font-bold">
                +{resB.simulatedMetrics.riskScore - resA.simulatedMetrics.riskScore} pts
              </td>
            </tr>
            <tr>
              <td class="py-2.5 pr-4 font-semibold text-white">Additional Shelters Required</td>
              <td class="py-2.5 px-3 text-white">{resA.responseNeeds[1]?.value}</td>
              <td class="py-2.5 px-3 text-white font-bold">{resB.responseNeeds[1]?.value}</td>
              <td class="py-2.5 pl-3 text-[#8B5CF6] font-bold">Higher capacity demand</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  {/if}

</div>
