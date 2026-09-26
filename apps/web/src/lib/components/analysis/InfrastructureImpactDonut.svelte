<script lang="ts">
  import { activeAnalysisData } from '../../stores/analysisStore';

  $: infra = $activeAnalysisData.infrastructure;

  const radius = 38;
  const strokeWidth = 8;
  const circ = 2 * Math.PI * radius;

  $: pct = infra.networkAffectedPct || 37;
  $: strokeDashoffset = circ - (pct / 100) * circ;
</script>

<div class="flex flex-col justify-between p-3 rounded-2xl bg-[#061425]/90 border border-white/10 hover:border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.6)] font-mono text-xs select-none">
  <!-- Card Header -->
  <div class="flex items-center justify-between pb-2 border-b border-white/10">
    <div class="flex items-center gap-1.5 text-white font-bold text-[11px] tracking-wider uppercase">
      <span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF]"></span>
      <span>{infra.title || 'INFRASTRUCTURE IMPACT'}</span>
    </div>
    <div class="flex items-center gap-1 text-[#8BA1B8] text-[10px]">
      <span class="cursor-pointer hover:text-white">−</span>
      <span class="cursor-pointer hover:text-white">⛶</span>
    </div>
  </div>

  <!-- Radial Donut Gauge & Metrics Breakdown Grid -->
  <div class="flex items-center gap-3 py-2">
    <!-- Radial Gauge -->
    <div class="relative w-24 h-24 shrink-0 flex items-center justify-center">
      <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <!-- Background Track -->
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          stroke-width={strokeWidth}
          fill="none"
        />

        <!-- Active Progress Arc (Orange-Red Gradient) -->
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#F97316"
          stroke-width={strokeWidth}
          stroke-linecap="round"
          stroke-dasharray={circ}
          stroke-dashoffset={strokeDashoffset}
          fill="none"
          class="transition-all duration-700"
          style="filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.6));"
        />
      </svg>

      <!-- Center Radial Text -->
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
        <span class="text-lg font-bold text-white tracking-tight leading-none">
          {pct}%
        </span>
        <span class="text-[7.5px] text-[#8BA1B8] uppercase leading-tight mt-1">
          {infra.networkLabel || 'Road Network Affected'}
        </span>
      </div>
    </div>

    <!-- Infrastructure Breakdown List -->
    <div class="flex-1 grid grid-cols-2 gap-x-1.5 gap-y-1 text-[9px]">
      {#each infra.items || [] as item}
        <div class="flex items-center justify-between p-1 px-1.5 rounded-lg bg-black/30 border border-white/5">
          <span class="text-[#8BA1B8] truncate">{item.label}</span>
          <span class="font-bold text-white shrink-0 ml-1">{item.count}</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Bottom Readout -->
  <div class="flex items-center justify-between pt-1 border-t border-white/5 text-[9px] text-[#8BA1B8]">
    <span>Utility Grid Vulnerability</span>
    <span class="text-amber-400 font-semibold">Priority 1 Substations: Critical</span>
  </div>
</div>
