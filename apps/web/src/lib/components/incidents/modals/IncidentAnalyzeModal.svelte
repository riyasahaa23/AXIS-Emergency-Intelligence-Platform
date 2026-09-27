<script lang="ts">
  import {
    isIncidentAnalyzeModalOpen,
    closeIncidentAnalyzeModal,
    activeNavSection
  } from '$lib/stores/systemStore';
  import { selectedIncident } from '$lib/stores/incidentStore';
  import {
    activeHazardType,
    selectHazard,
    isAnalyzing
  } from '$lib/stores/analysisStore';
  import { recordHistoryEvent } from '$lib/stores/historyStore';
  import type { HazardSelectorType } from '$lib/types';

  const STAGES = [
    { id: 'load', label: 'Loading incident telemetry state' },
    { id: 'hazard', label: 'Assessing hazard intensity & spatial footprint' },
    { id: 'population', label: 'Computing population exposure & demographic risk' },
    { id: 'infra', label: 'Evaluating infrastructure vulnerability & road network' },
    { id: 'access', label: 'Mapping accessibility corridors & relief access' },
    { id: 'fusion', label: 'Risk fusion & neural verification' }
  ];

  let currentStep = 0;
  let status: 'idle' | 'running' | 'complete' | 'error' = 'idle';
  let errorMessage = '';

  $: if ($isIncidentAnalyzeModalOpen && status === 'idle' && $selectedIncident) {
    runPipeline();
  }

  async function runPipeline() {
    if (!$selectedIncident) return;
    status = 'running';
    currentStep = 0;
    errorMessage = '';

    const inc = $selectedIncident;
    recordHistoryEvent(
      'analysis',
      'JARVIS-CORE',
      'Incident Analysis Started',
      inc.name,
      `Initiated multi-layer intelligence analysis for ${inc.region}, ${inc.country}`,
      'info'
    );

    try {
      for (let i = 0; i < STAGES.length; i++) {
        currentStep = i;
        await new Promise((r) => setTimeout(r, 220));
      }

      // Synchronize Analysis Store hazard
      let targetHazard: HazardSelectorType = 'flood';
      if (inc.type === 'cyclone') targetHazard = 'cyclone';
      else if (inc.type === 'wildfire') targetHazard = 'wildfire';
      else if (inc.type === 'earthquake') targetHazard = 'earthquake';
      else if (inc.type === 'compound') targetHazard = 'multi_hazard';
      else targetHazard = 'flood';

      selectHazard(targetHazard);

      recordHistoryEvent(
        'analysis',
        'JARVIS-CORE',
        'Analysis Completed',
        inc.name,
        `Risk Index: ${inc.riskScore}/100, Population Exposed: ${inc.affectedPopulation}, Confidence: ${Math.round(inc.confidence * 100)}%`,
        'success'
      );

      status = 'complete';
    } catch (err: any) {
      status = 'error';
      errorMessage = err?.message || 'Neural analysis pipeline timed out';
    }
  }

  function handleViewAnalysis() {
    closeIncidentAnalyzeModal();
    activeNavSection.set('analysis');
    status = 'idle';
  }

  function handleClose() {
    closeIncidentAnalyzeModal();
    status = 'idle';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && status !== 'running') {
      handleClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $isIncidentAnalyzeModalOpen && $selectedIncident}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-150"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-analyze-title"
  >
    <div
      class="relative w-full max-w-md bg-[#061425]/95 border border-[#00E5FF]/40 rounded-2xl p-5 shadow-[0_0_50px_rgba(0,229,255,0.25)] flex flex-col font-mono text-xs text-white"
    >
      <!-- Header -->
      <div class="flex items-start justify-between pb-3 border-b border-[#00E5FF]/20">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.3)]">
            ⚡
          </div>
          <div>
            <div class="flex items-center gap-1.5 text-[10px] text-[#00E5FF] font-bold tracking-widest uppercase">
              <span>JARVIS</span>
              <span>//</span>
              <span>INCIDENT ANALYSIS</span>
            </div>
            <h2 id="modal-analyze-title" class="text-sm font-bold text-white tracking-wide truncate max-w-[260px]">
              {$selectedIncident.name}
            </h2>
          </div>
        </div>

        <button
          on:click={handleClose}
          disabled={status === 'running'}
          class="text-[#8BA1B8] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          title="Close Modal (Esc)"
        >
          ✕
        </button>
      </div>

      <!-- Content Area -->
      <div class="py-4 space-y-3.5">
        <!-- Incident Context Pill -->
        <div class="p-2.5 rounded-xl bg-[#020914]/70 border border-white/5 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs">📍</span>
            <span class="text-[#C5D1DE] text-[11px]">{$selectedIncident.region}, {$selectedIncident.country}</span>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border {
            $selectedIncident.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
          }">
            {$selectedIncident.severity}
          </span>
        </div>

        <!-- Processing Sequence List -->
        <div class="p-3 rounded-xl bg-[#020711]/60 border border-white/5 space-y-2">
          {#each STAGES as stage, idx}
            <div class="flex items-center justify-between text-[11px] {
              idx === currentStep && status === 'running'
                ? 'text-[#00E5FF] font-bold'
                : idx < currentStep || status === 'complete'
                ? 'text-emerald-400'
                : 'text-[#8BA1B8]/40'
            }">
              <div class="flex items-center gap-2">
                {#if idx < currentStep || status === 'complete'}
                  <span class="text-emerald-400 text-xs">✓</span>
                {:else if idx === currentStep && status === 'running'}
                  <span class="w-2 h-2 rounded-full bg-[#00E5FF] animate-ping"></span>
                {:else}
                  <span class="w-2 h-2 rounded-full bg-white/20"></span>
                {/if}
                <span>{stage.label}</span>
              </div>

              {#if idx < currentStep || status === 'complete'}
                <span class="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">READY</span>
              {:else if idx === currentStep && status === 'running'}
                <span class="text-[9px] uppercase tracking-wider text-[#00E5FF] animate-pulse">COMPUTING</span>
              {:else}
                <span class="text-[9px] uppercase tracking-wider text-white/20">QUEUED</span>
              {/if}
            </div>
          {/each}
        </div>

        <!-- Completion or Error State -->
        {#if status === 'complete'}
          <div class="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between animate-in fade-in">
            <div class="flex items-center gap-2 text-emerald-400">
              <span class="text-base">✓</span>
              <div>
                <span class="font-bold block">ANALYSIS COMPLETE</span>
                <span class="text-[10px] text-emerald-400/80">Hazard intelligence verified & synced to Analysis workspace</span>
              </div>
            </div>
            <div class="text-right">
              <span class="text-xs font-bold text-white">{$selectedIncident.riskScore}/100</span>
              <span class="text-[9px] text-emerald-400 block">Risk Score</span>
            </div>
          </div>
        {:else if status === 'error'}
          <div class="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-400">
            <div class="font-bold flex items-center gap-1.5">
              <span>⚠️</span>
              <span>ANALYSIS UNAVAILABLE</span>
            </div>
            <p class="text-[10px] text-rose-300/80 mt-1">{errorMessage}</p>
          </div>
        {/if}
      </div>

      <!-- Action Buttons Footer -->
      <div class="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
        {#if status === 'error'}
          <button
            on:click={runPipeline}
            class="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-bold text-xs cursor-pointer transition-all"
          >
            RETRY ANALYSIS
          </button>
        {:else if status === 'complete'}
          <button
            on:click={runPipeline}
            class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#8BA1B8] hover:text-white text-xs cursor-pointer transition-all"
          >
            RE-RUN ANALYSIS
          </button>
          <button
            on:click={handleViewAnalysis}
            class="px-4 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#38BDF8] text-[#020711] font-bold text-xs shadow-[0_0_20px_rgba(0,229,255,0.4)] cursor-pointer transition-all flex items-center gap-1.5"
          >
            <span>VIEW ANALYSIS</span>
            <span>→</span>
          </button>
        {:else}
          <div class="text-[10px] text-[#8BA1B8] flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-ping"></span>
            <span>Running neural inference models...</span>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
