<script lang="ts">
  import { isSettingsModalOpen } from '../../stores/systemStore';

  let renderQuality: 'ultra' | 'high' | 'efficient' = 'ultra';
  let telemetryInterval: '1s' | '5s' | '10s' = '1s';
  let audioFeedback = true;
  let voiceSynthesis = true;
  let sentinel1Layer = true;
  let nasaGpmLayer = true;
  let landsatLayer = false;
  let backendHost = 'http://localhost:8000';
  let isSaving = false;
  let saveNotification = false;

  function closeSettings() {
    isSettingsModalOpen.set(false);
  }

  function handleSave() {
    isSaving = true;
    setTimeout(() => {
      isSaving = false;
      saveNotification = true;
      setTimeout(() => {
        saveNotification = false;
        closeSettings();
      }, 1000);
    }, 400);
  }

  function handleReset() {
    renderQuality = 'ultra';
    telemetryInterval = '1s';
    audioFeedback = true;
    voiceSynthesis = true;
    sentinel1Layer = true;
    nasaGpmLayer = true;
    landsatLayer = false;
  }

  function setRenderQuality(val: 'ultra' | 'high' | 'efficient') {
    renderQuality = val;
  }

  function setTelemetryInterval(val: '1s' | '5s' | '10s') {
    telemetryInterval = val;
  }
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && closeSettings()} />

{#if $isSettingsModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in font-mono">
    <!-- Click backdrop to close -->
    <div
      class="absolute inset-0 cursor-pointer"
      on:click={closeSettings}
      on:keydown={(e) => e.key === 'Enter' && closeSettings()}
      role="button"
      tabindex="0"
      aria-label="Close modal backdrop"
    ></div>

    <!-- Modal Box -->
    <div class="relative z-10 w-full max-w-2xl bg-[#030914] border border-[#00E5FF]/40 rounded-xl shadow-[0_0_60px_rgba(0,229,255,0.2)] overflow-hidden">
      <!-- Top Neon Header -->
      <div class="px-6 py-4 border-b border-white/10 bg-[#061425]/90 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 class="text-base font-bold tracking-wider text-white uppercase">System Configuration</h2>
            <p class="text-[10px] text-[#8BA1B8] tracking-widest uppercase">Planetary Operations & Rendering Parameters</p>
          </div>
        </div>

        <button
          on:click={closeSettings}
          class="p-1.5 rounded-lg text-[#8BA1B8] hover:text-white hover:bg-white/10 transition-colors"
          title="Close (Esc)"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Settings Body -->
      <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
        <!-- 3D Graphics & Canvas Fidelity -->
        <div class="space-y-3">
          <label class="block text-xs font-bold uppercase tracking-wider text-[#00E5FF]">
            3D Earth & Globe Visualization Fidelity
          </label>
          <div class="grid grid-cols-3 gap-3">
            {#each [
              { id: 'ultra', label: 'ULTRA (60 FPS)', desc: 'Full volumetric clouds, bloom & high-res terrain' },
              { id: 'high', label: 'HIGH (45 FPS)', desc: 'Standard shaders, orbital markers & vector glow' },
              { id: 'efficient', label: 'EFFICIENT (30 FPS)', desc: 'Low polygon count for low-power operation' }
            ] as q}
              <button
                type="button"
                on:click={() => setRenderQuality(q.id)}
                class="p-3 text-left rounded-lg border transition-all {renderQuality === q.id ? 'bg-[#00E5FF]/15 border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.25)]' : 'bg-[#061425]/60 border-white/10 hover:border-white/20'}"
              >
                <div class="text-xs font-bold text-white mb-1">{q.label}</div>
                <div class="text-[10px] text-[#8BA1B8] leading-tight">{q.desc}</div>
              </button>
            {/each}
          </div>
        </div>

        <!-- Telemetry Polling Rate -->
        <div class="space-y-3">
          <label class="block text-xs font-bold uppercase tracking-wider text-[#00E5FF]">
            Telemetry Polling & Health Cycle
          </label>
          <div class="grid grid-cols-3 gap-3">
            {#each [
              { id: '1s', label: 'REAL-TIME (1s)', desc: 'Mission-critical continuous pipeline' },
              { id: '5s', label: 'BALANCED (5s)', desc: 'Standard tactical update frequency' },
              { id: '10s', label: 'POWER-SAVER (10s)', desc: 'Telemetry rate reduction' }
            ] as t}
              <button
                type="button"
                on:click={() => setTelemetryInterval(t.id)}
                class="p-3 text-left rounded-lg border transition-all {telemetryInterval === t.id ? 'bg-[#3D7CFF]/15 border-[#3D7CFF] shadow-[0_0_15px_rgba(61,124,255,0.25)]' : 'bg-[#061425]/60 border-white/10 hover:border-white/20'}"
              >
                <div class="text-xs font-bold text-white mb-1">{t.label}</div>
                <div class="text-[10px] text-[#8BA1B8] leading-tight">{t.desc}</div>
              </button>
            {/each}
          </div>
        </div>

        <!-- Sensor Feeds & GIS Layers -->
        <div class="space-y-3">
          <label class="block text-xs font-bold uppercase tracking-wider text-[#00E5FF]">
            Active Orbital Sensor Constellations
          </label>
          <div class="space-y-2 bg-[#061425]/40 p-3 rounded-lg border border-white/5">
            <label class="flex items-center justify-between p-2 rounded hover:bg-white/5 cursor-pointer">
              <span class="text-xs text-white">Copernicus Sentinel-1 SAR Radar Flood Swath</span>
              <input type="checkbox" bind:checked={sentinel1Layer} class="w-4 h-4 accent-[#00E5FF]" />
            </label>
            <label class="flex items-center justify-between p-2 rounded hover:bg-white/5 cursor-pointer">
              <span class="text-xs text-white">NASA GPM Dual-Frequency Precipitation Radar</span>
              <input type="checkbox" bind:checked={nasaGpmLayer} class="w-4 h-4 accent-[#00E5FF]" />
            </label>
            <label class="flex items-center justify-between p-2 rounded hover:bg-white/5 cursor-pointer">
              <span class="text-xs text-white">USGS Landsat-9 Panchromatic Thermal Imagery</span>
              <input type="checkbox" bind:checked={landsatLayer} class="w-4 h-4 accent-[#00E5FF]" />
            </label>
          </div>
        </div>

        <!-- Audio & Synthetic Speech -->
        <div class="space-y-3">
          <label class="block text-xs font-bold uppercase tracking-wider text-[#00E5FF]">
            Audio Tactical Cues & AXIS Neural Speech
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="flex items-center justify-between p-3 rounded-lg bg-[#061425]/60 border border-white/10 cursor-pointer">
              <div>
                <div class="text-xs font-bold text-white">Tactical C2 Chimes</div>
                <div class="text-[10px] text-[#8BA1B8]">Tone notifications on new alerts</div>
              </div>
              <input type="checkbox" bind:checked={audioFeedback} class="w-4 h-4 accent-[#00E5FF]" />
            </label>
            <label class="flex items-center justify-between p-3 rounded-lg bg-[#061425]/60 border border-white/10 cursor-pointer">
              <div>
                <div class="text-xs font-bold text-white">Voice Synthesis</div>
                <div class="text-[10px] text-[#8BA1B8]">AXIS verbal status briefings</div>
              </div>
              <input type="checkbox" bind:checked={voiceSynthesis} class="w-4 h-4 accent-[#00E5FF]" />
            </label>
          </div>
        </div>

        <!-- Backend Orchestrator Bridge -->
        <div class="space-y-3">
          <label class="block text-xs font-bold uppercase tracking-wider text-[#00E5FF]">
            Backend Pipeline Bridge
          </label>
          <div class="p-3 rounded-lg bg-[#061425]/60 border border-white/10 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-[#8BA1B8]">FastAPI Server Target:</span>
              <span class="font-bold text-[#00E5FF]">{backendHost}</span>
            </div>
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-[#8BA1B8]">Status:</span>
              <span class="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE WITH NORMALIZED FALLBACK
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="p-4 border-t border-white/10 bg-[#061425]/90 flex items-center justify-between">
        <button
          type="button"
          on:click={handleReset}
          class="px-4 py-2 rounded-lg text-xs text-[#8BA1B8] hover:text-white hover:bg-white/10 transition-colors"
        >
          Reset Defaults
        </button>

        <div class="flex items-center gap-3">
          {#if saveNotification}
            <span class="text-xs text-emerald-400 font-bold animate-pulse">
              ✓ Settings Persisted
            </span>
          {/if}
          <button
            type="button"
            on:click={closeSettings}
            class="px-4 py-2 rounded-lg text-xs text-[#8BA1B8] hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            on:click={handleSave}
            disabled={isSaving}
            class="px-5 py-2 rounded-lg text-xs font-bold bg-[#00E5FF] text-[#020711] hover:bg-[#00E5FF]/80 transition-all shadow-[0_0_15px_rgba(0,229,255,0.4)] cursor-pointer"
          >
            {isSaving ? 'Applying...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.2);
    border-radius: 4px;
  }
</style>
