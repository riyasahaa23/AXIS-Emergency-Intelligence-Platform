<script lang="ts">
  import {
    isOptimizeModalOpen,
    applyOptimizationRecommendation,
    currentResourcePackage
  } from '$lib/stores/resourceStore';

  $: pkg = $currentResourcePackage;

  interface OptimizationItem {
    id: string;
    title: string;
    description: string;
    category: string;
    impact: string;
    benefit: string;
    resourceId: string;
    destination: string;
    operation: string;
    applied: boolean;
  }

  let recommendations: OptimizationItem[] = [
    {
      id: 'opt-01',
      title: 'Reposition Amphibious SAR Boats to High-Risk Inundation Zone',
      description: 'Move 2x Rigid Inflatable SAR Crafts from Dhaka central reservoir to Sunamganj lowlands.',
      category: 'Watercraft',
      impact: '-24 min latency',
      benefit: '+32% rescue reach in 1hr',
      resourceId: 'B-001',
      destination: 'Sunamganj Lowlands',
      operation: 'High-Velocity Flood Evacuation',
      applied: false
    },
    {
      id: 'opt-02',
      title: 'Pre-position Water Purification Systems at High-Density Shelters',
      description: 'Transfer 500x potable water filtration units from secondary storehouse to Mirpur National Stadium.',
      category: 'Supplies',
      impact: '0 shortage risk',
      benefit: 'Covers 4,200 evacuees for 72h',
      resourceId: 'MED-KIT-01',
      destination: 'Mirpur National Stadium Shelter',
      operation: 'Emergency Hydration Supply',
      applied: false
    },
    {
      id: 'opt-03',
      title: 'Forward Staging of Heavy Lift Rotary Wing Asset',
      description: 'Relocate Mi-17 (H-002) from reserve tarmac to Sylhet Forward Operating Base for quick casualty airlift.',
      category: 'Aviation',
      impact: '-38 min flight time',
      benefit: 'Immediate medevac readiness',
      resourceId: 'H-002',
      destination: 'Sylhet FOB',
      operation: 'Forward Casualty Evacuation',
      applied: false
    },
    {
      id: 'opt-04',
      title: 'Mobilize Specialized Structural Triage Personnel',
      description: 'Deploy Trauma Medical Unit Beta (PERS-02) directly to Kurigram Field Hospital.',
      category: 'Personnel',
      impact: '+60 triage slots/hr',
      benefit: 'Reduces ICU overflow by 45%',
      resourceId: 'PERS-02',
      destination: 'Kurigram Field Hospital',
      operation: 'Critical Care Expansion',
      applied: false
    }
  ];

  let isOptimizing = false;
  let allApplied = false;

  function close() {
    isOptimizeModalOpen.set(false);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }

  function applyItem(item: OptimizationItem) {
    if (item.applied) return;
    applyOptimizationRecommendation({
      resourceId: item.resourceId,
      destination: item.destination,
      operation: item.operation
    });
    item.applied = true;
    recommendations = [...recommendations];
    checkAllApplied();
  }

  function applyAll() {
    isOptimizing = true;
    setTimeout(() => {
      recommendations.forEach((item) => {
        if (!item.applied) {
          applyOptimizationRecommendation({
            resourceId: item.resourceId,
            destination: item.destination,
            operation: item.operation
          });
          item.applied = true;
        }
      });
      recommendations = [...recommendations];
      allApplied = true;
      isOptimizing = false;
    }, 600);
  }

  function checkAllApplied() {
    allApplied = recommendations.every((r) => r.applied);
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $isOptimizeModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
    <div
      class="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-lg border border-amber-500/40 bg-[#060c14] shadow-2xl shadow-amber-950/40 text-slate-100 overflow-hidden font-mono"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-amber-900/40 bg-amber-950/20">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded border border-amber-400/50 bg-amber-950/60 flex items-center justify-center text-amber-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-bold tracking-wider text-amber-300 uppercase">
                JARVIS AI Logistics Optimization Engine
              </h2>
              <span class="px-1.5 py-0.5 text-[9px] rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-semibold">
                Autonomous Heuristic v4.2
              </span>
            </div>
            <p class="text-[11px] text-slate-400">
              Active Theatre: <span class="text-white font-semibold">{pkg.hazardName}</span> // {pkg.locationName}
            </p>
          </div>
        </div>

        <button
          on:click={close}
          class="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          title="Close modal"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Scrollable Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-5 text-xs custom-scrollbar">
        <!-- Impact Metric Prognosis -->
        <div class="grid grid-cols-3 gap-3 p-3 rounded-lg border border-amber-900/30 bg-amber-950/10">
          <div class="text-center">
            <div class="text-[10px] text-slate-400 uppercase tracking-wider">Avg Latency Reduction</div>
            <div class="text-lg font-bold text-amber-300 mt-0.5">-31.4 min</div>
            <div class="text-[10px] text-emerald-400">Optimal triage window</div>
          </div>
          <div class="text-center border-x border-amber-900/30">
            <div class="text-[10px] text-slate-400 uppercase tracking-wider">Projected Coverage</div>
            <div class="text-lg font-bold text-emerald-400 mt-0.5">96.8%</div>
            <div class="text-[10px] text-slate-400">+14.2% over current</div>
          </div>
          <div class="text-center">
            <div class="text-[10px] text-slate-400 uppercase tracking-wider">Fuel / Transit Cost</div>
            <div class="text-lg font-bold text-cyan-300 mt-0.5">-28.5%</div>
            <div class="text-[10px] text-slate-400">Direct waypoint routes</div>
          </div>
        </div>

        <!-- Recommendations List -->
        <div>
          <div class="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Recommended Tactical Reallocations ({recommendations.filter(r => !r.applied).length} Pending)
            </div>
            {#if allApplied}
              <span class="text-emerald-400 font-semibold text-[10px] flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                ALL OPTIMIZATIONS EXECUTED
              </span>
            {/if}
          </div>

          <div class="space-y-2.5">
            {#each recommendations as item}
              <div
                class="p-3.5 rounded border transition-all {item.applied
                  ? 'border-emerald-500/30 bg-emerald-950/10 opacity-70'
                  : 'border-slate-800 bg-[#070f1a] hover:border-amber-500/30'}"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-1 flex-1">
                    <div class="flex items-center gap-2">
                      <span class="px-1.5 py-0.5 text-[9px] rounded font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {item.category}
                      </span>
                      <h3 class="text-xs font-bold text-slate-100">{item.title}</h3>
                    </div>
                    <p class="text-[11px] text-slate-400 leading-relaxed">{item.description}</p>
                    <div class="flex items-center gap-4 text-[10px] text-slate-400 pt-1">
                      <span>Target: <strong class="text-white">{item.destination}</strong></span>
                      <span>Latency: <strong class="text-amber-400">{item.impact}</strong></span>
                      <span>Outcome: <strong class="text-emerald-400">{item.benefit}</strong></span>
                    </div>
                  </div>

                  <div class="shrink-0 flex items-center self-center">
                    {#if item.applied}
                      <span class="px-3 py-1.5 rounded text-[11px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        APPLIED
                      </span>
                    {:else}
                      <button
                        type="button"
                        on:click={() => applyItem(item)}
                        class="px-3 py-1.5 rounded text-[11px] font-bold tracking-wider uppercase border border-amber-500/50 bg-amber-500/20 text-amber-200 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                      >
                        Apply
                      </button>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-between px-6 py-4 border-t border-amber-900/40 bg-slate-950/60">
        <button
          type="button"
          on:click={close}
          class="px-4 py-2 rounded text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          Dismiss
        </button>

        <div class="flex items-center gap-3">
          <button
            type="button"
            disabled={allApplied || isOptimizing}
            on:click={applyAll}
            class="px-5 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 {allApplied
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-not-allowed'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'}"
          >
            {#if isOptimizing}
              <svg class="w-4 h-4 animate-spin text-slate-950" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Optimizing...</span>
            {:else if allApplied}
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>All Recommendations Applied</span>
            {:else}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Apply All ({recommendations.filter(r => !r.applied).length})</span>
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.6);
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(245, 158, 11, 0.25);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(245, 158, 11, 0.5);
  }
</style>
