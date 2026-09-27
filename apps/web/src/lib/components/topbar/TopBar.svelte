<script lang="ts">
  import { currentUtcTime, isAlertsDrawerOpen, isSettingsModalOpen } from '../../stores/systemStore';
  import AlertsDrawer from './AlertsDrawer.svelte';
  import SettingsModal from './SettingsModal.svelte';
  import {
    currentCommand,
    isProcessingCommand,
    activeStage,
    stageProgress,
    openAxisCentral,
    submitCommand
  } from '../../stores/commandStore';
  import { dataFeedStatus, probeBackend } from '../../api';
  import { onMount } from 'svelte';

  onMount(() => {
    probeBackend();
  });

  let inputVal = '';

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && inputVal.trim()) {
      submitCommand(inputVal);
      inputVal = '';
    }
  }

  function handleExecute() {
    if (inputVal.trim()) {
      submitCommand(inputVal);
      inputVal = '';
    } else {
      openAxisCentral('LISTENING');
    }
  }
</script>

<header class="relative z-40 flex items-center justify-between px-6 py-2 bg-[#020711]/85 backdrop-blur-xl border-b border-white/10 select-none">
  <!-- Left: AXIS Emblem & Title -->
  <div class="flex items-center gap-3.5">
    <button
      on:click={() => openAxisCentral('IDLE')}
      class="relative flex items-center justify-center w-10 h-10 rounded-full border border-[#00E5FF]/50 bg-[#061425]/80 shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:scale-105 transition-transform cursor-pointer"
      title="Click to Activate AXIS Central Core"
    >
      <div class="absolute inset-1 rounded-full border border-[#3D7CFF]/60 border-t-[#00E5FF] animate-spin" style="animation-duration: 5s;"></div>
      <div class="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#00E5FF] to-[#8B5CFF] shadow-[0_0_10px_#00E5FF]"></div>
    </button>

    <div>
      <div class="flex items-center gap-2">
        <h1 class="text-xl font-bold tracking-[0.18em] text-white font-mono drop-shadow-[0_0_12px_rgba(0,229,255,0.6)]">
          AXIS
        </h1>
        <span class="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 tracking-widest font-bold">
          v2.4
        </span>
      </div>
      <p class="text-[9px] uppercase tracking-[0.25em] text-[#8BA1B8] font-mono">
        Planetary Emergency Intelligence
      </p>
    </div>
  </div>

  <!-- Center: Main Command Bar -->
  <div class="flex-1 max-w-2xl mx-8">
    <div class="relative flex items-center px-4 py-2 rounded-full bg-[#061425]/90 border border-[#00E5FF]/30 shadow-[0_0_20px_rgba(0,229,255,0.15)] transition-all duration-300 focus-within:border-[#00E5FF] focus-within:shadow-[0_0_30px_rgba(0,229,255,0.35)]">
      
      <!-- Audio Waveform / Pulsing Indicator (Clickable to open voice central mode) -->
      <button
        on:click={() => openAxisCentral('LISTENING')}
        class="flex items-center gap-0.5 mr-3 cursor-pointer hover:opacity-80"
        title="Open AXIS Voice Assistant"
      >
        <span class="w-0.5 h-3 bg-[#00E5FF] rounded-full animate-pulse" style="animation-duration: 0.8s;"></span>
        <span class="w-0.5 h-4.5 bg-[#3D7CFF] rounded-full animate-pulse" style="animation-duration: 0.6s;"></span>
        <span class="w-0.5 h-2.5 bg-[#8B5CFF] rounded-full animate-pulse" style="animation-duration: 1.1s;"></span>
        <span class="w-0.5 h-4 bg-[#00E5FF] rounded-full animate-pulse" style="animation-duration: 0.9s;"></span>
      </button>

      {#if $isProcessingCommand}
        <div class="flex-1 flex items-center justify-between text-xs font-mono text-[#00E5FF]">
          <div class="flex items-center gap-2">
            <span class="inline-block w-2 h-2 rounded-full bg-[#00E5FF] animate-ping"></span>
            <span class="tracking-wider uppercase">{$activeStage}</span>
          </div>
          <span class="text-xs text-[#8BA1B8] tracking-widest">{$stageProgress}%</span>
        </div>
      {:else}
        <input
          type="text"
          bind:value={inputVal}
          on:keydown={handleKeyDown}
          placeholder='Ask AXIS... e.g. "What happens if rainfall increases by 30%?"'
          class="flex-1 bg-transparent text-sm text-[#F0F6FC] placeholder-[#8BA1B8]/60 focus:outline-none font-mono tracking-wide"
        />

        <button
          on:click={handleExecute}
          class="flex items-center justify-center w-7 h-7 ml-2 rounded-full bg-[#00E5FF]/15 text-[#00E5FF] hover:bg-[#00E5FF] hover:text-[#020711] transition-all border border-[#00E5FF]/40 shadow-[0_0_10px_rgba(0,229,255,0.3)] cursor-pointer"
          title="Execute query"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      {/if}
    </div>
  </div>

  <!-- Right: Status, Clock, Alerts & Profile -->
  <div class="flex items-center gap-3.5 text-xs font-mono">
    <!-- Data Feed Status (Live Backend vs Autonomous Fallback Demo) -->
    <button
      on:click={() => probeBackend(true)}
      class="flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer transition-all hover:scale-105 {$dataFeedStatus.isLive ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'bg-cyan-500/15 border border-cyan-500/30 text-[#00E5FF]'}"
      title={$dataFeedStatus.isLive ? `Live Backend Connected (${$dataFeedStatus.latencyMs}ms) · Click to re-probe` : 'Autonomous Mock Fallback Engine · Click to probe real backend'}
    >
      <span class="w-1.5 h-1.5 rounded-full {$dataFeedStatus.isLive ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse' : 'bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]'}"></span>
      <span class="font-bold tracking-widest text-[10px]">
        {$dataFeedStatus.isLive ? 'LIVE DATA' : 'FALLBACK DATA'}
      </span>
    </button>

    <!-- UTC Clock -->
    <div class="hidden lg:block text-[#8BA1B8] tracking-wider font-mono text-[11px] px-2.5 py-1 rounded-lg bg-[#061425]/50 border border-white/5">
      {$currentUtcTime}
    </div>

    <!-- Notification Bell -->
    <button
      on:click={() => isAlertsDrawerOpen.set(true)}
      class="relative p-1.5 rounded-lg text-[#8BA1B8] hover:text-[#00E5FF] hover:bg-[#061425] transition-colors cursor-pointer"
      title="System Telemetry Alerts"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EF4444] shadow-[0_0_6px_#EF4444]"></span>
    </button>

    <!-- Settings Gear -->
    <button
      on:click={() => isSettingsModalOpen.set(true)}
      class="p-1.5 rounded-lg text-[#8BA1B8] hover:text-[#00E5FF] hover:bg-[#061425] transition-colors cursor-pointer"
      title="System Configuration"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    <!-- Operator Avatar -->
    <div class="relative w-8 h-8 rounded-full border border-[#00E5FF]/40 overflow-hidden shadow-[0_0_10px_rgba(0,229,255,0.3)] bg-[#061425]">
      <div class="w-full h-full flex items-center justify-center font-bold text-xs text-[#00E5FF] bg-gradient-to-br from-[#061425] to-[#3D7CFF]/30">
        OP
      </div>
    </div>
  </div>
</header>

<AlertsDrawer />
<SettingsModal />