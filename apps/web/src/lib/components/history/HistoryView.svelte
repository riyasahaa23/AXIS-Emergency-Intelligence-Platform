<script lang="ts">
  import IncidentReplayEngine from './IncidentReplayEngine.svelte';
  import HistoryAuditTimeline from './HistoryAuditTimeline.svelte';
  import { selectedIncident } from '../../stores/incidentStore';
</script>

<div class="flex-1 flex flex-col h-full bg-[#050b14] overflow-hidden text-slate-100 font-mono p-3 gap-3">
  <!-- Top Title Strip -->
  <div class="flex items-center justify-between p-3 rounded-2xl bg-[#061425]/70 backdrop-blur-xl border border-white/10 shrink-0 select-none">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/40 flex items-center justify-center text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]">
        📜
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-sm font-bold tracking-wider text-white uppercase">
            PLANETARY MEMORY & INCIDENT REPLAY // AUDIT. LEARN. RECONSTRUCT.
          </h1>
          <span class="px-2 py-0.2 rounded text-[9px] font-bold bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/40">
            AUDIT TRAIL ACTIVE
          </span>
        </div>
        <p class="text-xs text-[#8BA1B8] font-sans">
          Immutable mission log, temporal decision reconstruction, and historical incident simulation replay
        </p>
      </div>
    </div>

    <!-- Active Incident Telemetry Badge -->
    {#if $selectedIncident}
      <div class="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs">
        <span class="text-[#8BA1B8]">HISTORICAL BASELINE:</span>
        <span class="text-white font-bold">{$selectedIncident.name}</span>
      </div>
    {/if}
  </div>

  <!-- Main Work Area: Top Replay Engine + Bottom Audit Timeline -->
  <div class="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
    <!-- Top Replay Engine -->
    <div class="shrink-0">
      <IncidentReplayEngine />
    </div>

    <!-- Bottom Audit Timeline -->
    <div class="flex-1 min-h-[380px]">
      <HistoryAuditTimeline />
    </div>
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(139, 92, 246, 0.25);
    border-radius: 3px;
  }
</style>
