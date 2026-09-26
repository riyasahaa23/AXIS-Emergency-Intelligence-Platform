<script lang="ts">
  import { activeAnalysisData } from '../../stores/analysisStore';

  $: rain = $activeAnalysisData.rainfall;

  let hoveredBar: number | null = null;

  const chartW = 340;
  const chartH = 100;
  const padLeft = 32;
  const padBottom = 22;
  const plotW = chartW - padLeft - 10;
  const plotH = chartH - padBottom;

  $: bars = rain.bars || [];
  $: maxBarAmount = bars.length ? Math.max(...bars.map((b) => b.amountMm || 0)) : 500;
  $: maxVal = Math.max(60, Math.ceil(maxBarAmount * 1.15));
  $: gridVals = [Math.round(maxVal * 0.33), Math.round(maxVal * 0.66), maxVal];
  $: colWidth = (plotW / (bars.length || 1)) * 0.45;

  function getY(mm: number): number {
    return plotH - (Math.min(mm, maxVal) / maxVal) * plotH + 5;
  }
</script>

<div class="flex flex-col justify-between p-3 rounded-2xl bg-[#061425]/90 border border-white/10 hover:border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.6)] font-mono text-xs select-none">
  <!-- Card Header -->
  <div class="flex items-center justify-between pb-2 border-b border-white/10">
    <div class="flex items-center gap-1.5 text-white font-bold text-[11px] tracking-wider uppercase">
      <span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF]"></span>
      <span>{rain.title || 'RAINFALL FORECAST'}</span>
    </div>
    <div class="flex items-center gap-1 text-[#8BA1B8] text-[10px]">
      <span class="cursor-pointer hover:text-white">−</span>
      <span class="cursor-pointer hover:text-white">⛶</span>
    </div>
  </div>

  <!-- Key Metrics Row -->
  <div class="flex items-center justify-between py-2 border-b border-white/5">
    <div class="flex items-center gap-2">
      <span class="text-base font-bold text-white tracking-tight">{rain.cumulativeMm} {rain.cumulativeUnit || 'mm'}</span>
      <span class="text-[9px] text-[#8BA1B8] leading-tight">{rain.timeframe || 'Next 7 days'}</span>
    </div>

    <div class="flex items-center gap-1.5">
      <span class="text-xs font-bold text-[#00E5FF]">+{rain.aboveAveragePct}%</span>
      <span class="text-[8px] text-[#8BA1B8] leading-tight">
        {#if rain.anomalyLabel}
          {rain.anomalyLabel}
        {:else}
          Above<br/>average
        {/if}
      </span>
    </div>

    <div>
      <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider {
        rain.floodRiskLevel === 'HIGH' || rain.floodRiskLevel === 'CRITICAL' || rain.floodRiskLevel === 'EXTREME' || rain.floodRiskLevel === 'CATASTROPHIC'
          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
      }">
        {rain.floodRiskLevel} {rain.riskBadgeLabel || 'Threat'}
      </span>
    </div>
  </div>

  <!-- Column Bar Chart -->
  <div class="relative w-full pt-2">
    <svg viewBox="0 0 {chartW} {chartH}" class="w-full h-24 overflow-visible">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.9" />
          <stop offset="50%" stop-color="#38BDF8" stop-opacity="0.75" />
          <stop offset="100%" stop-color="#1E3A8A" stop-opacity="0.4" />
        </linearGradient>
        <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1" />
          <stop offset="30%" stop-color="#00E5FF" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#2563EB" stop-opacity="0.6" />
        </linearGradient>
      </defs>

      <!-- Horizontal gridlines -->
      {#each gridVals as gVal}
        <line
          x1={padLeft}
          y1={getY(gVal)}
          x2={chartW - 5}
          y2={getY(gVal)}
          stroke="rgba(255,255,255,0.06)"
          stroke-dasharray="2,3"
        />
        <text
          x={padLeft - 6}
          y={getY(gVal) + 3}
          fill="rgba(139,161,184,0.5)"
          font-size="8"
          text-anchor="end"
          font-family="monospace"
        >
          {gVal}
        </text>
      {/each}

      <!-- Bottom baseline -->
      <line x1={padLeft} y1={plotH + 5} x2={chartW - 5} y2={plotH + 5} stroke="rgba(255,255,255,0.12)" />

      <!-- Render Bars -->
      {#each bars as bar, i}
        {@const cx = padLeft + ((i + 0.5) / bars.length) * plotW}
        {@const bX = cx - colWidth / 2}
        {@const bY = getY(bar.amountMm)}
        {@const bH = plotH + 5 - bY}
        {@const isHovered = hoveredBar === i}

        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <g
          on:mouseenter={() => (hoveredBar = i)}
          on:mouseleave={() => (hoveredBar = null)}
          class="cursor-pointer"
        >
          <!-- Bar rectangle with top rounded corners -->
          <rect
            x={bX}
            y={bY}
            width={colWidth}
            height={Math.max(2, bH)}
            rx="3"
            fill={isHovered ? 'url(#barGradHover)' : 'url(#barGrad)'}
            stroke={isHovered ? '#00E5FF' : 'rgba(0,229,255,0.3)'}
            stroke-width="1"
            class="transition-all duration-200"
          />

          <!-- Value on top of bar when hovered -->
          {#if isHovered}
            <text
              x={cx}
              y={bY - 4}
              fill="#00E5FF"
              font-size="8"
              font-weight="bold"
              text-anchor="middle"
              font-family="monospace"
            >
              {bar.amountMm}mm
            </text>
          {/if}

          <!-- Day Label -->
          <text
            x={cx}
            y={plotH + 18}
            fill={isHovered ? '#00E5FF' : 'rgba(139,161,184,0.7)'}
            font-size="8"
            font-weight={isHovered ? 'bold' : 'normal'}
            text-anchor="middle"
            font-family="monospace"
          >
            {bar.day}
          </text>
        </g>
      {/each}
    </svg>
  </div>

  <!-- Bottom Readout -->
  <div class="flex items-center justify-between pt-1 border-t border-white/5 text-[9px] text-[#8BA1B8]">
    <span>Hydrologic Basin Index</span>
    <span class="text-[#00E5FF] font-semibold">Surma-Meghna Crest: +1.84m</span>
  </div>
</div>
