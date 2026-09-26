<script lang="ts">
  import { telemetry } from '../../stores/systemStore';
</script>

<div class="flex flex-col gap-2.5 p-3 rounded-2xl bg-[#061425]/60 backdrop-blur-md border border-[#00E5FF]/20 shadow-[0_4px_24px_rgba(0,0,0,0.5)] select-none">
  <!-- Active Incidents -->
  <div class="flex items-center gap-3">
    <div class="flex items-center justify-center w-8 h-8 rounded-xl bg-[#8B5CFF]/20 border border-[#8B5CFF]/40 text-[#8B5CFF] shadow-[0_0_10px_rgba(139,92,255,0.3)]">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
    <div>
      <div class="text-sm font-bold text-white font-mono leading-none">{$telemetry.activeIncidents}</div>
      <div class="text-[10px] text-[#8BA1B8] font-mono uppercase tracking-wider">Active Incidents</div>
    </div>
  </div>

  <!-- High Risk -->
  <div class="flex items-center gap-3">
    <div class="flex items-center justify-center w-8 h-8 rounded-xl bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] shadow-[0_0_10px_rgba(239,68,68,0.3)]">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <div>
      <div class="text-sm font-bold text-white font-mono leading-none">{$telemetry.highRisk}</div>
      <div class="text-[10px] text-[#8BA1B8] font-mono uppercase tracking-wider">High Risk</div>
    </div>
  </div>

  <!-- Countries Affected -->
  <div class="flex items-center gap-3">
    <div class="flex items-center justify-center w-8 h-8 rounded-xl bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.3)]">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div>
      <div class="text-sm font-bold text-white font-mono leading-none">{$telemetry.countriesAffected}</div>
      <div class="text-[10px] text-[#8BA1B8] font-mono uppercase tracking-wider">Countries</div>
    </div>
  </div>
</div>
