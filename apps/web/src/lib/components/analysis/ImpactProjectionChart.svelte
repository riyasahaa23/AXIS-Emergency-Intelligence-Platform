<script lang="ts">
  import { activeAnalysisData } from '../../stores/analysisStore';

  $: proj = $activeAnalysisData.projection;

  let hoveredIndex: number | null = null;

  // Chart coordinates mapping (Width 340, Height 100)
  const chartW = 340;
  const chartH = 100;
  const padLeft = 32;
  const padBottom = 22;
  const plotW = chartW - padLeft - 10;
  const plotH = chartH - padBottom;

  $: points = proj.timeline || [];
  $: maxDataVal = points.length ? Math.max(...points.map((p) => Math.max(p.affected || 0, p.displaced || 0))) : 4.0;
  $: maxVal = Math.max(4.0, Math.ceil(maxDataVal * 1.15));

  $: gridStep = maxVal > 15 ? Math.ceil(maxVal / 4) : maxVal > 6 ? 2.0 : 1.0;
  $: gridVals = [gridStep, gridStep * 2, gridStep * 3, gridStep * 4].filter((v) => v <= maxVal);

  function getX(idx: number, total: number): number {
    return padLeft + (idx / Math.max(1, total - 1)) * plotW;
  }

  function getY(val: number): number {
    const clamped = Math.max(0, Math.min(val, maxVal));
    return plotH - (clamped / maxVal) * plotH + 5;
  }

  $: pathAffected = points.length
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i, points.length)} ${getY(p.affected)}`).join(' ')
    : '';
  $: areaAffected = points.length
    ? `${pathAffected} L ${getX(points.length - 1, points.length)} ${plotH + 5} L ${padLeft} ${plotH + 5} Z`
    : '';

  $: pathDisplaced = points.length
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i, points.length)} ${getY(p.displaced)}`).join(' ')
    : '';
  $: areaDisplaced = points.length
    ? `${pathDisplaced} L ${getX(points.length - 1, points.length)} ${plotH + 5} L ${padLeft} ${plotH + 5} Z`
    : '';
</script>

<div class="flex flex-col justify-between p-3 rounded-2xl bg-[#061425]/90 border border-white/10 hover:border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.6)] font-mono text-xs select-none">
  <!-- Card Header -->
  <div class="flex items-center justify-between pb-2 border-b border-white/10">
    <div class="flex items-center gap-1.5 text-white font-bold text-[11px] tracking-wider uppercase">
      <span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF]"></span>
      <span>{proj.title || 'IMPACT PROJECTION'}</span>
    </div>
    <div class="flex items-center gap-1 text-[#8BA1B8] text-[10px]">
      <span class="cursor-pointer hover:text-white">−</span>
      <span class="cursor-pointer hover:text-white">⛶</span>
    </div>
  </div>

  <!-- Key Metrics Row -->
  <div class="flex items-center justify-between flex-wrap gap-2 py-2 border-b border-white/5">
    <div class="flex items-center gap-2">
      <span class="text-base font-bold text-white tracking-tight">{proj.estimatedAffected}</span>
      <span class="text-[9px] text-[#8BA1B8] leading-tight">
        {#if proj.estimatedAffectedLabel}
          {proj.estimatedAffectedLabel}
        {:else}
          Estimated<br/>Affected
        {/if}
      </span>
    </div>

    <div class="flex items-center gap-1.5">
      <span class="text-xs font-bold text-red-400">{proj.increasePct}</span>
      <span class="text-[8px] text-[#8BA1B8] leading-tight">
        {#if proj.increaseLabel}
          {proj.increaseLabel}
        {:else}
          Increase vs<br/>Current
        {/if}
      </span>
    </div>

    <div>
      <span class="px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider {
        proj.riskTrend === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
      }">
        {proj.riskTrend} Risk
      </span>
    </div>
  </div>

  <!-- Interactive Dual-Line SVG Chart -->
  <div class="relative w-full pt-2">
    <svg viewBox="0 0 {chartW} {chartH}" class="w-full h-24 overflow-visible">
      <defs>
        <!-- Cyan gradient for Affected -->
        <linearGradient id="gradAff" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#00E5FF" stop-opacity="0.0" />
        </linearGradient>
        <!-- Purple gradient for Displaced -->
        <linearGradient id="gradDisp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#A855F7" stop-opacity="0.30" />
          <stop offset="100%" stop-color="#A855F7" stop-opacity="0.0" />
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
          {Number.isInteger(gVal) ? gVal : gVal.toFixed(1)}M
        </text>
      {/each}

      <!-- Bottom baseline -->
      <line x1={padLeft} y1={plotH + 5} x2={chartW - 5} y2={plotH + 5} stroke="rgba(255,255,255,0.12)" />

      <!-- Gradient Area Fills -->
      <path d={areaAffected} fill="url(#gradAff)" />
      <path d={areaDisplaced} fill="url(#gradDisp)" />

      <!-- Line Strokes -->
      <path d={pathAffected} fill="none" stroke="#00E5FF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
      <path d={pathDisplaced} fill="none" stroke="#C084FC" stroke-width="2.0" stroke-linecap="round" stroke-linejoin="round" />

      <!-- Interactive Data Points -->
      {#each points as pt, i}
        {@const px = getX(i, points.length)}
        {@const pyAff = getY(pt.affected)}
        {@const pyDisp = getY(pt.displaced)}

        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <g
          on:mouseenter={() => (hoveredIndex = i)}
          on:mouseleave={() => (hoveredIndex = null)}
          class="cursor-pointer"
        >
          <!-- Hover guide line -->
          {#if hoveredIndex === i}
            <line x1={px} y1={5} x2={px} y2={plotH + 5} stroke="rgba(255,255,255,0.25)" stroke-dasharray="2,2" />
          {/if}

          <!-- Circle for Affected -->
          <circle cx={px} cy={pyAff} r={hoveredIndex === i ? 4.5 : 2.5} fill="#00E5FF" stroke="#061425" stroke-width="1.5" />
          <!-- Circle for Displaced -->
          <circle cx={px} cy={pyDisp} r={hoveredIndex === i ? 4.5 : 2.5} fill="#C084FC" stroke="#061425" stroke-width="1.5" />

          <!-- X-axis Label -->
          <text
            x={px}
            y={plotH + 18}
            fill={hoveredIndex === i ? '#00E5FF' : 'rgba(139,161,184,0.7)'}
            font-size="8"
            font-weight={hoveredIndex === i ? 'bold' : 'normal'}
            text-anchor="middle"
            font-family="monospace"
          >
            {pt.label}
          </text>
        </g>
      {/each}
    </svg>
  </div>

  <!-- Bottom Legend & Hover Readout -->
  <div class="flex items-center justify-between pt-1 border-t border-white/5 text-[9px] text-[#8BA1B8]">
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-[#00E5FF]"></span>
        <span class="text-white">{proj.legendSeries1 || 'Primary Affected'}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-[#C084FC]"></span>
        <span class="text-white">{proj.legendSeries2 || 'Secondary Displaced'}</span>
      </div>
    </div>

    {#if hoveredIndex !== null && points[hoveredIndex]}
      <div class="text-[#00E5FF] font-bold">
        {points[hoveredIndex].affected}M / {points[hoveredIndex].displaced}M
      </div>
    {/if}
  </div>
</div>
