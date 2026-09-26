<script lang="ts">
  import { onMount } from 'svelte';
  import JarvisCore3D from './JarvisCore3D.svelte';
  import {
    isJarvisCentralActive,
    jarvisState,
    jarvisResponseText,
    closeJarvisCentral,
    submitCommand,
    type JarvisActivityState
  } from '../../stores/commandStore';
  import { openScenarioDrawer } from '../../stores/systemStore';
  import { selectIncident, clearIncidentSelection, incidents } from '../../stores/incidentStore';
  import { masterHeartbeat } from '../../three/jarvisHeartbeat';

  let inputVal = '';
  let inputEl: HTMLInputElement;

  // Progressive disclosure contextual states
  let contextualPanel: 'flood' | 'rainfall' | 'shelters' | null = null;
  let isExecuting = false;
  let activeOperationStep = '';

  // Heartbeat synchronizer for audio waveform and bio-synthetic HUD
  let hbPulse = 0;
  let hbBpm = 40;
  let animFrameId: number;

  onMount(() => {
    if (inputEl) inputEl.focus();
    if ($jarvisState === 'IDLE') {
      jarvisState.set('LISTENING');
    }

    function syncHeartbeat() {
      const sample = masterHeartbeat.getSample();
      hbPulse = sample.pulse;
      hbBpm = sample.bpm;
      animFrameId = requestAnimationFrame(syncHeartbeat);
    }
    animFrameId = requestAnimationFrame(syncHeartbeat);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (contextualPanel) {
          dismissContextual();
        } else {
          closeJarvisCentral();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  });

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function runQuery(queryText: string) {
    if (!queryText.trim()) return;
    const lower = queryText.toLowerCase();

    isExecuting = true;
    contextualPanel = null;
    jarvisState.set('THINKING');

    if (lower.includes('flood') || lower.includes('zone 4') || lower.includes('bangladesh')) {
      activeOperationStep = 'UNDERSTANDING REQUEST: FLOOD RISK ZONE 4';
      await delay(450);
      
      activeOperationStep = 'IDENTIFYING LOCATION: BANGLADESH (23.7°N, 90.4°E)';
      const bangladeshInc = $incidents.find((i) => i.id === 'inc-01');
      if (bangladeshInc) {
        selectIncident(bangladeshInc);
      }
      await delay(550);

      activeOperationStep = 'LOADING REAL-TIME HYDROLOGIC TELEMETRY...';
      await delay(500);

      activeOperationStep = 'RUNNING NEURAL FLOOD IMPACT SIMULATION...';
      await delay(500);

      jarvisState.set('RESPONDING');
      contextualPanel = 'flood';
      isExecuting = false;
      submitCommand(queryText);
    } else if (lower.includes('rain') || lower.includes('30%') || lower.includes('scenario')) {
      activeOperationStep = 'UNDERSTANDING SCENARIO: +30% PRECIPITATION';
      await delay(450);

      activeOperationStep = 'ANALYSING MONSOON CONVERGENCE VECTORS...';
      await delay(550);

      activeOperationStep = 'PROJECTING 72-HOUR INUNDATION DELTA...';
      await delay(500);

      jarvisState.set('RESPONDING');
      contextualPanel = 'rainfall';
      isExecuting = false;
      submitCommand(queryText);
    } else if (lower.includes('shelter') || lower.includes('beds') || lower.includes('capacity')) {
      activeOperationStep = 'QUERYING REGIONAL EMERGENCY SHELTERS...';
      await delay(450);

      activeOperationStep = 'CALCULATING FACILITY OCCUPANCY & SURGE CAPACITY...';
      await delay(550);

      jarvisState.set('RESPONDING');
      contextualPanel = 'shelters';
      isExecuting = false;
      submitCommand(queryText);
    } else {
      activeOperationStep = 'PROCESSING PLANETARY QUERY WITH AI CORE...';
      await delay(700);
      jarvisState.set('RESPONDING');
      isExecuting = false;
      submitCommand(queryText);
    }
  }

  function handleSend() {
    if (inputVal.trim()) {
      const q = inputVal;
      inputVal = '';
      runQuery(q);
    }
  }

  function handleChip(query: string) {
    runQuery(query);
  }

  function dismissContextual() {
    contextualPanel = null;
    clearIncidentSelection();
    jarvisState.set('LISTENING');
  }

  function onMicToggle() {
    if ($jarvisState === 'LISTENING') {
      jarvisState.set('IDLE');
    } else {
      jarvisState.set('LISTENING');
    }
  }

  function cycleState() {
    const states: JarvisActivityState[] = ['LISTENING', 'THINKING', 'ANALYSING', 'SIMULATING', 'RESPONDING', 'IDLE'];
    const next = states[(states.indexOf($jarvisState) + 1) % states.length];
    jarvisState.set(next);
  }
</script>

{#if $isJarvisCentralActive}
  <!-- Central Activation Backdrop: Highly transparent to let the glowing 3D Earth shine through -->
  <div class="absolute inset-0 z-40 flex flex-col items-center justify-between p-4 md:p-6 bg-[#020711]/25 backdrop-blur-[1px] select-none transition-all duration-700 animate-in fade-in overflow-hidden">
    
    <!-- Top Bar Controls -->
    <div class="w-full flex items-center justify-between z-10 shrink-0">
      <div class="flex items-center gap-2.5">
        <span class="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_12px_#00E5FF] animate-pulse"></span>
        <span class="text-xs font-mono uppercase tracking-[0.25em] text-[#00E5FF] font-bold">JARVIS // Central Intelligence Core</span>
      </div>

      <button
        on:click={closeJarvisCentral}
        class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#061425]/80 hover:bg-[#082038] border border-[#00E5FF]/40 hover:border-[#00E5FF] text-xs font-mono text-[#8BA1B8] hover:text-white transition-all shadow-[0_0_20px_rgba(0,0,0,0.6)] cursor-pointer"
        title="Return to Planetary Orbit (ESC)"
      >
        <span>Return to Orbit</span>
        <span class="px-1.5 py-0.2 rounded bg-white/10 text-[10px] text-white font-mono">ESC</span>
      </button>
    </div>

    <!-- Center Stage Container: Clean, uncluttered, with generous negative space around the AI Core -->
    <div class="relative flex flex-col items-center justify-center w-full max-w-4xl my-auto z-10">
      
      <!-- 3D WebGL Core Hero Component (Spacious, Unobstructed AI Core with Negative Space) -->
      <div class="relative w-[360px] h-[340px] sm:w-[480px] sm:h-[440px] md:w-[560px] md:h-[480px] flex items-center justify-center -my-2">
        <JarvisCore3D size="lg" interactive={true} animateActivation={true} />
      </div>

      <!-- ======================================================== -->
      <!-- DYNAMIC CONTEXTUAL ANALYSIS PANELS (Progressive Disclosure) -->
      <!-- Only appear when relevant query is active; never permanent -->
      <!-- ======================================================== -->
      {#if contextualPanel === 'flood'}
        <div class="absolute right-0 xl:right-[-40px] top-[26%] -translate-y-1/2 w-80 p-4 rounded-2xl bg-[#030d1c]/90 backdrop-blur-xl border border-[#00E5FF]/50 shadow-[0_0_35px_rgba(0,229,255,0.3)] font-mono text-xs z-30 animate-in zoom-in-95 duration-300">
          <div class="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
            <div class="flex items-center gap-2 text-[#00E5FF] font-bold tracking-wider">
              <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span>FLOOD ANALYSIS // ZONE 04</span>
            </div>
            <button on:click={dismissContextual} class="text-[#8BA1B8] hover:text-white px-1.5 py-0.5 rounded bg-white/10 text-[10px] cursor-pointer" title="Dismiss Panel">✕</button>
          </div>
          <div class="space-y-2 text-[#8BA1B8]">
            <div class="flex justify-between">
              <span>Location:</span>
              <span class="text-white font-bold">Sylhet & Dhaka (Bangladesh)</span>
            </div>
            <div class="flex justify-between">
              <span>Risk Severity:</span>
              <span class="text-red-400 font-bold px-1.5 py-0.2 rounded bg-red-500/20">CRITICAL (92/100)</span>
            </div>
            <div class="flex justify-between">
              <span>Population Exposure:</span>
              <span class="text-[#00E5FF] font-bold">2.4M Affected</span>
            </div>
            <div class="flex justify-between">
              <span>Precipitation Delta:</span>
              <span class="text-amber-400 font-bold">+142 mm / 24h</span>
            </div>
            <div class="flex justify-between">
              <span>Inundated Roads:</span>
              <span class="text-white font-bold">37 Arterials Submerged</span>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-white/10 flex gap-2">
            <button on:click={() => openScenarioDrawer()} class="flex-1 py-1.5 rounded-lg bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 border border-[#00E5FF]/60 text-[#00E5FF] text-[11px] font-bold text-center transition-all cursor-pointer">
              Simulate Evacuation
            </button>
            <button on:click={dismissContextual} class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[11px] transition-all cursor-pointer">
              Dismiss
            </button>
          </div>
        </div>
      {:else if contextualPanel === 'rainfall'}
        <div class="absolute right-0 xl:right-[-40px] top-[26%] -translate-y-1/2 w-80 p-4 rounded-2xl bg-[#030d1c]/90 backdrop-blur-xl border border-[#38BDF8]/50 shadow-[0_0_35px_rgba(56,189,248,0.3)] font-mono text-xs z-30 animate-in zoom-in-95 duration-300">
          <div class="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
            <div class="flex items-center gap-2 text-[#38BDF8] font-bold tracking-wider">
              <span class="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse"></span>
              <span>SCENARIO // +30% RAINFALL</span>
            </div>
            <button on:click={dismissContextual} class="text-[#8BA1B8] hover:text-white px-1.5 py-0.5 rounded bg-white/10 text-[10px] cursor-pointer" title="Dismiss Panel">✕</button>
          </div>
          <div class="space-y-2 text-[#8BA1B8]">
            <div class="flex justify-between">
              <span>Precipitation Delta:</span>
              <span class="text-[#38BDF8] font-bold">+30% Monsoonal Surge</span>
            </div>
            <div class="flex justify-between">
              <span>Additional Exposure:</span>
              <span class="text-red-400 font-bold">+480,000 People</span>
            </div>
            <div class="flex justify-between">
              <span>Basin Inundation:</span>
              <span class="text-amber-400 font-bold">+1,240 km² Submerged</span>
            </div>
            <div class="flex justify-between">
              <span>Critical Levees:</span>
              <span class="text-white font-bold">14 Embankments at Risk</span>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-white/10 flex gap-2">
            <button on:click={() => openScenarioDrawer()} class="flex-1 py-1.5 rounded-lg bg-[#38BDF8]/20 hover:bg-[#38BDF8]/30 border border-[#38BDF8]/60 text-[#38BDF8] text-[11px] font-bold text-center transition-all cursor-pointer">
              View Simulation
            </button>
            <button on:click={dismissContextual} class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[11px] transition-all cursor-pointer">
              Dismiss
            </button>
          </div>
        </div>
      {:else if contextualPanel === 'shelters'}
        <div class="absolute right-0 xl:right-[-40px] top-[26%] -translate-y-1/2 w-80 p-4 rounded-2xl bg-[#030d1c]/90 backdrop-blur-xl border border-[#F59E0B]/50 shadow-[0_0_35px_rgba(245,158,11,0.3)] font-mono text-xs z-30 animate-in zoom-in-95 duration-300">
          <div class="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
            <div class="flex items-center gap-2 text-[#F59E0B] font-bold tracking-wider">
              <span class="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
              <span>RESOURCES // SHELTERS</span>
            </div>
            <button on:click={dismissContextual} class="text-[#8BA1B8] hover:text-white px-1.5 py-0.5 rounded bg-white/10 text-[10px] cursor-pointer" title="Dismiss Panel">✕</button>
          </div>
          <div class="space-y-2 text-[#8BA1B8]">
            <div class="flex justify-between">
              <span>Designated Facilities:</span>
              <span class="text-white font-bold">18 Emergency Shelters</span>
            </div>
            <div class="flex justify-between">
              <span>Current Occupancy:</span>
              <span class="text-amber-400 font-bold">86% Critical Capacity</span>
            </div>
            <div class="flex justify-between">
              <span>Available Capacity:</span>
              <span class="text-emerald-400 font-bold">14,800 Beds</span>
            </div>
            <div class="flex justify-between">
              <span>Relief Supplies:</span>
              <span class="text-[#00E5FF] font-bold">4.2 Days Reserves</span>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-white/10 flex gap-2">
            <button on:click={() => runQuery('Deploy critical supply reserves to Zone 4 shelters')} class="flex-1 py-1.5 rounded-lg bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 border border-[#F59E0B]/60 text-[#F59E0B] text-[11px] font-bold text-center transition-all cursor-pointer">
              Deploy Supplies
            </button>
            <button on:click={dismissContextual} class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[11px] transition-all cursor-pointer">
              Dismiss
            </button>
          </div>
        </div>
      {/if}

      <!-- JARVIS Branding (High-Impact Typography) -->
      <div class="flex flex-col items-center mt-1 mb-2">
        <h2 class="text-2xl sm:text-3xl font-bold font-mono tracking-[0.35em] text-white drop-shadow-[0_0_20px_rgba(0,229,255,0.7)]">
          JARVIS
        </h2>
        <p class="text-[10px] sm:text-xs font-mono tracking-[0.3em] text-[#8BA1B8] uppercase mt-0.5">
          PLANETARY EMERGENCY INTELLIGENCE
        </p>
      </div>

      <!-- Real-Time Operation Progress Indicator (Only visible during active command execution) -->
      {#if isExecuting && activeOperationStep}
        <div class="flex items-center gap-2.5 px-4 py-1.5 mb-2.5 rounded-full bg-[#061425]/90 border border-[#00E5FF]/60 text-xs font-mono text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.4)] animate-pulse">
          <span class="w-2 h-2 rounded-full bg-[#00E5FF] animate-ping"></span>
          <span class="tracking-widest uppercase font-bold text-[11px]">{activeOperationStep}</span>
        </div>
      {/if}

      <!-- Live Animated Audio Waveform & Status Indicator Pill (Heartbeat-Synchronized) -->
      <div class="flex items-center justify-center gap-3 mb-3">
        <!-- Left Waveform Bars (Height breathes in sync with master heartbeat pulse) -->
        <div class="flex items-center gap-0.5 h-6">
          {#each [10, 16, 8, 22, 14, 20, 10, 24, 16, 20, 12, 18, 14, 22] as baseH, i}
            <span
              class="w-0.5 bg-[#00E5FF] rounded-full transition-all duration-75 shadow-[0_0_6px_#00E5FF]"
              style="height: {Math.max(4, Math.round(baseH * (0.35 + 0.80 * hbPulse + 0.15 * Math.sin(i * 0.8))))}px; opacity: {0.5 + 0.5 * hbPulse};"
            ></span>
          {/each}
        </div>

        <!-- Center Status Pill (Interactive: Click to Cycle States + Displays Live BPM) -->
        <button
          on:click={cycleState}
          class="flex items-center gap-2.5 px-5 py-1.5 rounded-full bg-[#061425]/90 border border-[#00E5FF] text-[#00E5FF] text-xs font-mono font-bold tracking-widest uppercase shadow-[0_0_25px_rgba(0,229,255,0.6)] cursor-pointer hover:scale-105 active:scale-95 transition-all"
          style="box-shadow: 0 0 {15 + 20 * hbPulse}px rgba(0, 229, 255, {0.35 + 0.45 * hbPulse});"
          title="Click to toggle AI state simulation"
        >
          <span class="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] animate-ping"></span>
          <span>{hbBpm} BPM // {$jarvisState}</span>
        </button>

        <!-- Right Waveform Bars (Height breathes in sync with master heartbeat pulse) -->
        <div class="flex items-center gap-0.5 h-6">
          {#each [18, 14, 22, 10, 20, 16, 24, 12, 18, 8, 20, 14, 22, 12] as baseH, i}
            <span
              class="w-0.5 bg-[#00E5FF] rounded-full transition-all duration-75 shadow-[0_0_6px_#00E5FF]"
              style="height: {Math.max(4, Math.round(baseH * (0.35 + 0.80 * hbPulse + 0.15 * Math.cos(i * 0.8))))}px; opacity: {0.5 + 0.5 * hbPulse};"
            ></span>
          {/each}
        </div>
      </div>

      <!-- Response Banner (if available and no contextual panel active) -->
      {#if $jarvisResponseText && !contextualPanel}
        <div class="w-full max-w-2xl mb-3 p-3.5 rounded-2xl bg-[#061425]/95 border border-[#00E5FF]/40 shadow-[0_8px_32px_rgba(0,0,0,0.8)] text-xs sm:text-sm font-mono text-[#F0F6FC] animate-in fade-in slide-in-from-bottom-2">
          <div class="flex items-center gap-2 text-xs text-[#00E5FF] mb-1 uppercase font-bold tracking-wider">
            <span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF]"></span>
            Synthesized Intelligence
          </div>
          <p class="leading-relaxed">{$jarvisResponseText}</p>
        </div>
      {/if}

      <!-- Main Natural Language Command Input -->
      <div class="w-full max-w-2xl mb-2.5">
        <div class="flex items-center px-4 py-2.5 rounded-full bg-[#061425]/95 border-2 border-transparent bg-origin-border [background-clip:padding-box,border-box] shadow-[0_0_35px_rgba(0,229,255,0.35),0_0_20px_rgba(124,58,237,0.3)] transition-all" style="background-image: linear-gradient(#061425, #061425), linear-gradient(to right, #00E5FF, #7C3AED);">
          
          <!-- Microphone Button -->
          <button
            on:click={onMicToggle}
            class="flex items-center justify-center w-8 h-8 mr-3 rounded-full {$jarvisState === 'LISTENING' ? 'bg-[#00E5FF] text-[#020711]' : 'bg-[#00E5FF]/20 text-[#00E5FF]'} hover:brightness-125 transition-all shadow-[0_0_12px_rgba(0,229,255,0.4)] cursor-pointer"
            title="Toggle Voice Input"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          <!-- Input Text Field -->
          <input
            bind:this={inputEl}
            type="text"
            bind:value={inputVal}
            on:keydown={(e) => e.key === 'Enter' && handleSend()}
            placeholder='Instruct JARVIS... e.g. "What happens if rainfall increases by 30%?"'
            class="flex-1 bg-transparent text-xs sm:text-[13px] text-white placeholder-[#8BA1B8]/60 focus:outline-none font-mono tracking-wide"
          />

          <!-- Execute Submit Button -->
          <button
            on:click={handleSend}
            class="flex items-center justify-center w-8 h-8 ml-2 rounded-full bg-[#00E5FF] text-[#020711] hover:brightness-125 transition-all shadow-[0_0_18px_rgba(0,229,255,0.7)] cursor-pointer"
            title="Execute Mission"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Quick Action Prompt Chips (Clean, purposeful triggers) -->
      <div class="flex flex-wrap justify-center items-center gap-2 max-w-2xl mb-4 text-[11px] font-mono">
        <button
          on:click={() => handleChip('Analyze flood situation and risk factors in Zone 4')}
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#061425]/80 hover:bg-[#061425] border border-[#00E5FF]/25 hover:border-[#00E5FF] text-[#8BA1B8] hover:text-white transition-all cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
        >
          <span class="text-[#00E5FF]">📈</span>
          <span>Analyze flood risk in Zone 4</span>
        </button>

        <button
          on:click={() => handleChip('What happens if rainfall increases by 30%?')}
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#061425]/80 hover:bg-[#061425] border border-[#00E5FF]/25 hover:border-[#00E5FF] text-[#8BA1B8] hover:text-white transition-all cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
        >
          <span class="text-[#38BDF8]">☁️</span>
          <span>What if +30% rainfall?</span>
        </button>

        <button
          on:click={() => handleChip('Which shelters can handle the affected population?')}
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#061425]/80 hover:bg-[#061425] border border-[#00E5FF]/25 hover:border-[#00E5FF] text-[#8BA1B8] hover:text-white transition-all cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
        >
          <span class="text-[#F59E0B]">🏠</span>
          <span>Find available shelters</span>
        </button>

        <button
          on:click={() => handleChip('Generate response plan for planetary hazards')}
          class="px-2.5 py-1.5 rounded-xl bg-[#061425]/80 hover:bg-[#061425] border border-[#00E5FF]/25 hover:border-[#00E5FF] text-[#8BA1B8] hover:text-white transition-all cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
          title="More queries"
        >
          •••
        </button>
      </div>

      <!-- Bottom Explore Scenarios Trigger Pill -->
      <button
        on:click={openScenarioDrawer}
        class="flex flex-col items-center gap-0.5 px-8 py-2 rounded-2xl bg-gradient-to-r from-[#00E5FF]/20 via-[#061425] to-[#7C3AED]/20 border border-[#00E5FF]/50 hover:border-[#00E5FF] shadow-[0_0_25px_rgba(0,229,255,0.35)] hover:shadow-[0_0_35px_rgba(124,58,237,0.6)] transition-all cursor-pointer group active:scale-95"
        title="Open Simulation Scenarios Drawer"
      >
        <span class="text-xs text-[#00E5FF] group-hover:-translate-y-0.5 transition-transform leading-none font-bold">⌃</span>
        <div class="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-white">
          <span class="text-[#00E5FF]">◈</span>
          <span>EXPLORE SCENARIOS</span>
        </div>
      </button>

    </div>

    <!-- Empty Spacer for Bottom Balance -->
    <div class="h-1"></div>

  </div>
{/if}