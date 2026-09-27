<script lang="ts">
  import {
    isAutoOptimizeModalOpen,
    isAutoOptimizing,
    optimizationProgress,
    optimizationStage,
    optimizationProposal,
    applyOptimizationAction,
    applyAllOptimizationActions
  } from '../../../stores/responseStore';
</script>

{#if $isAutoOptimizeModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
    <div class="relative w-full max-w-2xl bg-[#061425] border border-[#00E5FF]/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,229,255,0.25)] flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] shadow-[0_0_15px_#00E5FF]">
            <svg class="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]"></span>
              <h2 class="text-base font-bold font-mono text-white tracking-wider">
                AXIS AUTO-OPTIMIZE ENGINE
              </h2>
            </div>
            <p class="text-xs text-[#8BA1B8] font-sans">
              Algorithmic response balancing across geospatial hazards & asset proximity
            </p>
          </div>
        </div>

        <button
          on:click={() => isAutoOptimizeModalOpen.set(false)}
          class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-[#8BA1B8] hover:text-white flex items-center justify-center font-mono cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Optimization Processing Animation or Proposal Results -->
      <div class="flex-1 overflow-y-auto py-4 space-y-4 pr-1 custom-scrollbar">
        {#if $isAutoOptimizing}
          <div class="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <!-- Animated Radar Ring -->
            <div class="relative w-20 h-20 flex items-center justify-center">
              <div class="absolute inset-0 rounded-full border border-[#00E5FF]/40 animate-ping"></div>
              <div class="w-16 h-16 rounded-full border border-[#00E5FF] flex items-center justify-center bg-[#00E5FF]/10">
                <span class="text-xl">⚡</span>
              </div>
            </div>

            <div class="w-full max-w-md space-y-2">
              <div class="flex justify-between text-xs font-mono">
                <span class="text-[#00E5FF] font-bold">ANALYZING RESPONSE VECTORS...</span>
                <span class="text-white font-bold">{$optimizationProgress}%</span>
              </div>
              <div class="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
                <div
                  class="h-full bg-gradient-to-r from-[#00E5FF] to-emerald-400 rounded-full transition-all duration-300 shadow-[0_0_12px_#00E5FF]"
                  style="width: {$optimizationProgress}%"
                ></div>
              </div>
              <div class="text-[11px] font-mono text-[#8BA1B8] pt-1">
                {$optimizationStage}
              </div>
            </div>
          </div>
        {:else}
          <!-- Optimization Summary Metrics Banner -->
          <div class="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#091E36] border border-[#00E5FF]/30 font-mono text-center">
            <div>
              <div class="text-[10px] text-[#8BA1B8] uppercase">Efficiency Score</div>
              <div class="text-lg font-bold text-emerald-400">{$optimizationProposal.overallScore}%</div>
            </div>
            <div>
              <div class="text-[10px] text-[#8BA1B8] uppercase">Time Saved</div>
              <div class="text-lg font-bold text-[#00E5FF]">-{$optimizationProposal.estimatedTimeSavedMinutes} Mins</div>
            </div>
            <div>
              <div class="text-[10px] text-[#8BA1B8] uppercase">Coverage Boost</div>
              <div class="text-lg font-bold text-white">{$optimizationProposal.additionalPeopleCovered}</div>
            </div>
          </div>

          <!-- Recommended Actions List -->
          <div class="space-y-2.5">
            <h3 class="text-xs font-mono font-bold tracking-wider text-[#00E5FF] uppercase">
              RECOMMENDED OPERATIONAL SHIFTS
            </h3>

            {#each $optimizationProposal.recommendedActions as rec (rec.id)}
              <div class="p-3 rounded-xl border transition-all text-left flex items-start justify-between gap-3 {
                rec.applied
                  ? 'bg-emerald-500/10 border-emerald-500/30 opacity-70'
                  : 'bg-[#061425]/80 border-white/10 hover:border-white/25'
              }">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold {
                      rec.urgency === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                      rec.urgency === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    }">
                      {rec.urgency}
                    </span>
                    <span class="text-xs font-bold text-white font-mono">
                      {rec.action}
                    </span>
                  </div>
                  <p class="text-[11px] text-[#8BA1B8] font-sans">
                    {rec.impact}
                  </p>
                </div>

                <button
                  on:click={() => applyOptimizationAction(rec.id)}
                  disabled={rec.applied}
                  class="px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 cursor-pointer {
                    rec.applied
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : 'bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 text-[#00E5FF] border border-[#00E5FF]/50'
                  }"
                >
                  {rec.applied ? '✓ Applied' : 'Apply'}
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Footer Buttons -->
      {#if !$isAutoOptimizing}
        <div class="flex items-center justify-between pt-4 border-t border-white/10 shrink-0">
          <button
            on:click={() => isAutoOptimizeModalOpen.set(false)}
            class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8BA1B8] hover:text-white text-xs font-mono transition-all cursor-pointer"
          >
            Dismiss
          </button>

          <button
            on:click={applyAllOptimizationActions}
            class="px-5 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#38BDF8] text-[#020711] text-xs font-mono font-bold transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)] cursor-pointer"
          >
            Apply All Recommendations
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.97); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out forwards;
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.2);
    border-radius: 4px;
  }
</style>
