<script lang="ts">
  import { isRiskDriversOpen, closeRiskDrivers, activeAnalysisData } from '../../stores/analysisStore';

  $: data = $activeAnalysisData;
</script>

{#if $isRiskDriversOpen}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    on:click={closeRiskDrivers}
    class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-none"
  >
    <!-- Modal Card -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      on:click|stopPropagation
      class="w-full max-w-lg p-5 rounded-3xl bg-[#030a16]/95 border border-[#00E5FF]/40 shadow-[0_16px_64px_rgba(0,0,0,0.9)] space-y-4"
    >
      <!-- Header -->
      <div class="flex items-start justify-between pb-3 border-b border-white/10">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse"></span>
            <span class="text-[10px] text-[#00E5FF] font-bold uppercase tracking-widest">
              Explainable Risk Intelligence
            </span>
          </div>
          <h2 class="text-base font-bold text-white uppercase tracking-wider">
            Risk Drivers & Factor Decomposition
          </h2>
        </div>

        <button
          on:click={closeRiskDrivers}
          class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center cursor-pointer transition-colors"
        >
          ✕
        </button>
      </div>

      <!-- Severity vs Confidence Banner -->
      <div class="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#061425] border border-white/10">
        <div class="flex flex-col">
          <span class="text-[9px] text-[#8BA1B8] uppercase">Calculated Severity</span>
          <span class="text-base font-bold text-red-400 mt-0.5">{data.riskLevel}</span>
          <span class="text-[9px] text-[#8BA1B8]">Composite Risk Index: 92/100</span>
        </div>

        <div class="flex flex-col">
          <span class="text-[9px] text-[#8BA1B8] uppercase">Model Confidence</span>
          <span class="text-base font-bold text-[#00E5FF] mt-0.5">{data.confidencePct}%</span>
          <span class="text-[9px] text-[#8BA1B8]">Multi-Sensor Convergence</span>
        </div>
      </div>

      <!-- Breakdown of Weighted Risk Drivers -->
      <div class="space-y-3">
        <span class="text-[10px] text-[#8BA1B8] uppercase tracking-wider font-bold block">
          Weighted Factor Contributions
        </span>

        {#each data.riskDrivers || [] as driver}
          <div class="space-y-1 p-2.5 rounded-xl bg-black/40 border border-white/5">
            <div class="flex justify-between items-center text-xs">
              <span class="text-white font-bold">{driver.name}</span>
              <div class="flex items-center gap-2">
                <span class="text-[9px] text-[#8BA1B8]">Weight: {Math.round(driver.weight * 100)}%</span>
                <span class="font-mono font-bold {driver.score >= 85 ? 'text-red-400' : driver.score >= 70 ? 'text-amber-400' : 'text-cyan-400'}">
                  {driver.score}/100
                </span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500 {
                  driver.score >= 85 ? 'bg-red-500' : driver.score >= 70 ? 'bg-amber-400' : 'bg-[#00E5FF]'
                }"
                style="width: {driver.score}%;"
              ></div>
            </div>

            <p class="text-[10px] text-[#CAD6E2] pt-0.5">
              {driver.description}
            </p>
          </div>
        {/each}
      </div>

      <!-- Footer Button -->
      <div class="pt-2">
        <button
          on:click={closeRiskDrivers}
          class="w-full py-2 rounded-xl bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 border border-[#00E5FF]/60 text-[#00E5FF] hover:text-white font-bold text-xs transition-all cursor-pointer"
        >
          Dismiss Inspection
        </button>
      </div>
    </div>
  </div>
{/if}
