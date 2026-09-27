<script lang="ts">
  import { openJarvisCentral, submitCommand } from '../../stores/commandStore';
  import { openScenarioDrawer, openIncidentPlanModal, openUploadDataModal } from '../../stores/systemStore';

  function onAskAnything() {
    openJarvisCentral('LISTENING');
  }

  function onAction(action: string) {
    submitCommand(`Command: ${action}`);
  }
</script>

<div class="flex items-center justify-center flex-wrap gap-2.5 px-3 py-1.5 rounded-2xl bg-[#020711]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] select-none">
  <!-- Ask Anything Primary Voice / Central Activation Button -->
  <button
    on:click={onAskAnything}
    class="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3D7CFF] via-[#00E5FF] to-[#8B5CFF] text-[#020711] font-mono font-bold text-xs shadow-[0_0_25px_rgba(0,229,255,0.45)] hover:shadow-[0_0_35px_rgba(0,229,255,0.7)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
    title="Activate Central JARVIS Intelligence"
  >
    <div class="flex items-center justify-center w-5 h-5 rounded-full bg-[#020711]/20">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </div>
    <span class="tracking-wide">Ask anything</span>
  </button>

  <!-- Dedicated Explore Scenarios Trigger Pill -->
  <button
    on:click={openScenarioDrawer}
    class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#061425]/90 hover:bg-[#082038] border border-[#00E5FF]/40 hover:border-[#00E5FF] text-[#00E5FF] hover:text-white text-xs font-mono font-bold transition-all backdrop-blur-md shadow-[0_0_15px_rgba(0,229,255,0.25)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] cursor-pointer active:scale-95 group"
    title="Open Simulation Scenarios Drawer"
  >
    <span class="text-sm text-[#00E5FF] group-hover:scale-110 transition-transform">◈</span>
    <span class="tracking-wide">Explore Scenarios</span>
    <span class="text-xs group-hover:translate-x-1 transition-transform">→</span>
  </button>

  <!-- Upload Data Button -->
  <button
    on:click={openUploadDataModal}
    class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#061425]/85 hover:bg-[#061425] border border-[#00E5FF]/25 hover:border-[#00E5FF] text-white text-xs font-mono transition-all backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.4)] cursor-pointer hover:shadow-[0_0_15px_rgba(0,229,255,0.2)]"
    title="Upload Dataset / Telemetry"
  >
    <svg class="w-3.5 h-3.5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <span>Upload data</span>
  </button>

  <!-- Plan Response Button -->
  <button
    on:click={openIncidentPlanModal}
    class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#061425]/85 hover:bg-[#061425] border border-[#00E5FF]/25 hover:border-[#00E5FF] text-white text-xs font-mono transition-all backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.4)] cursor-pointer hover:shadow-[0_0_15px_rgba(139,92,255,0.2)]"
    title="Plan Emergency Response"
  >
    <svg class="w-3.5 h-3.5 text-[#8B5CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    <span>Plan response</span>
  </button>
</div>