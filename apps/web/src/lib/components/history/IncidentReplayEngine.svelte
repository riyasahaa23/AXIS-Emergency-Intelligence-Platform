<script lang="ts">
  import {
    activeReplayPackage,
    currentReplayState,
    currentReplayTimeIndex,
    setReplayTimeIndex,
    isReplayPlaying,
    toggleReplayPlayback
  } from '../../stores/historyStore';

  function getRiskColor(score: number): string {
    if (score >= 80) return '#EF4444';
    if (score >= 60) return '#F59E0B';
    return '#00E5FF';
  }

  function projectCoords(coords: [number, number]): { x: number; y: number } {
    const [lon, lat] = coords;
    const x = Math.max(50, Math.min(450, ((lon - 90.0) / 2.5) * 320 + 80));
    const y = Math.max(30, Math.min(210, 200 - ((lat - 23.4) / 2.0) * 150));
    return { x, y };
  }
</script>

<div class="flex flex-col bg-[#061425]/85 backdrop-blur-xl border border-white/10 rounded-2xl p-4 font-mono select-none overflow-hidden gap-3.5">
  <!-- Top Replay Header -->
  <div class="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
    <div class="flex items-center gap-2.5">
      <div class="w-8 h-8 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/50 flex items-center justify-center text-[#8B5CF6]">
        ⏱
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-xs font-bold uppercase tracking-wider text-white">
            HISTORICAL INCIDENT REPLAY ENGINE
          </h2>
          <span class="px-2 py-0.2 rounded text-[9px] font-bold bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/40">
            {$activeReplayPackage.incidentName}
          </span>
        </div>
        <p class="text-[11px] text-[#8BA1B8] font-sans">
          Four-dimensional tactical state reconstruction across time, geography, and response operations
        </p>
      </div>
    </div>

    <!-- Play/Pause Control Button -->
    <button
      on:click={toggleReplayPlayback}
      class="px-3.5 py-1.5 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center gap-2 cursor-pointer {
        $isReplayPlaying
          ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
          : 'bg-[#00E5FF] hover:bg-cyan-300 text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]'
      }"
    >
      <span>{$isReplayPlaying ? '⏸' : '▶'}</span>
      <span>{$isReplayPlaying ? 'PAUSE' : 'PLAY REPLAY'}</span>
    </button>
  </div>

  <!-- Interactive Timeline Scrubber Strip -->
  <div class="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2 shrink-0">
    <div class="flex items-center justify-between text-[10px] text-[#8BA1B8]">
      <span class="font-bold uppercase tracking-wider text-white">MISSION TIMELINE STEP:</span>
      <span class="text-[#00E5FF] font-bold">CURRENT OFFSET: {$currentReplayState.timeOffset} UTC ({$currentReplayState.label})</span>
    </div>

    <!-- Timeline Stepper Buttons -->
    <div class="grid grid-cols-6 gap-2">
      {#each $activeReplayPackage.states as state, idx}
        <button
          on:click={() => setReplayTimeIndex(idx)}
          class="py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 {
            $currentReplayTimeIndex === idx
              ? 'bg-[#00E5FF]/20 border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.25)] text-white'
              : 'bg-black/30 border-white/5 text-[#8BA1B8] hover:text-white hover:border-white/20'
          }"
        >
          <span class="text-[11px] font-bold font-mono">{state.timeOffset}</span>
          <span class="text-[8px] truncate max-w-full font-sans opacity-75">{state.label}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Dynamic State Metrics Strip (Reflects Scrubbed Time State) -->
  <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 shrink-0">
    <!-- 1. Water Level Surge -->
    <div class="p-2.5 rounded-xl bg-black/30 border border-white/5">
      <span class="text-[9px] text-[#8BA1B8] uppercase block">Water Surge Delta</span>
      <span class="text-sm font-bold text-[#00E5FF]">{$currentReplayState.waterLevelDelta}</span>
    </div>

    <!-- 2. Exposed Population -->
    <div class="p-2.5 rounded-xl bg-black/30 border border-white/5">
      <span class="text-[9px] text-[#8BA1B8] uppercase block">Exposed Citizens</span>
      <span class="text-sm font-bold text-white">{$currentReplayState.exposedPopulation}</span>
    </div>

    <!-- 3. Risk Score Index -->
    <div class="p-2.5 rounded-xl bg-black/30 border border-white/5">
      <span class="text-[9px] text-[#8BA1B8] uppercase block">Risk Index</span>
      <span class="text-sm font-bold" style="color: {getRiskColor($currentReplayState.riskScore)}">
        {$currentReplayState.riskScore}/100
      </span>
    </div>

    <!-- 4. Active Teams -->
    <div class="p-2.5 rounded-xl bg-black/30 border border-white/5">
      <span class="text-[9px] text-[#8BA1B8] uppercase block">Deployed Teams</span>
      <span class="text-sm font-bold text-emerald-400">{$currentReplayState.activeTeamsCount} Teams</span>
    </div>

    <!-- 5. Evacuated Count -->
    <div class="p-2.5 rounded-xl bg-black/30 border border-white/5">
      <span class="text-[9px] text-[#8BA1B8] uppercase block">Evacuated Citizens</span>
      <span class="text-sm font-bold text-[#F59E0B]">{$currentReplayState.evacuatedCount}</span>
    </div>
  </div>

  <!-- Replay Geographic Visualization & Tactical Stage Summary -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[260px] flex-1">
    <!-- SVG Tactical Map Reconstruction (7 cols) -->
    <div class="lg:col-span-7 h-full min-h-[220px] rounded-xl bg-[#020914] border border-white/10 relative overflow-hidden flex flex-col">
      <svg class="w-full h-full" viewBox="0 0 500 240" preserveAspectRatio="xMidYMid meet">
        <!-- Grid -->
        <defs>
          <pattern id="replay-grid" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(0, 229, 255, 0.04)" stroke-width="1" />
          </pattern>
        </defs>
        <rect width="500" height="240" fill="url(#replay-grid)" />

        <!-- River Delta Contours -->
        <path
          d="M 60 20 Q 140 40 200 90 T 290 140 Q 360 200 420 220"
          fill="none"
          stroke="rgba(0, 229, 255, 0.4)"
          stroke-width="4"
        />

        <!-- Inundation Area (Expands based on time index) -->
        <ellipse
          cx="280"
          cy="120"
          rx="{60 + $currentReplayTimeIndex * 24}"
          ry="{35 + $currentReplayTimeIndex * 15}"
          fill="rgba(0, 229, 255, {0.12 + $currentReplayTimeIndex * 0.04})"
          stroke="rgba(0, 229, 255, 0.6)"
          stroke-width="1.5"
          stroke-dasharray="4 2"
        />

        <!-- Replay Historical Markers -->
        {#each $currentReplayState.markerCoords as m}
          {@const pt = projectCoords(m.coords)}
          <g transform="translate({pt.x}, {pt.y})">
            <circle r="5" fill="#00E5FF" filter="drop-shadow(0 0 6px #00E5FF)" />
            <text x="9" y="4" fill="#FFFFFF" font-family="monospace" font-size="9" font-weight="bold">
              {m.name}
            </text>
            <text x="9" y="14" fill="#8BA1B8" font-family="monospace" font-size="8">
              [{m.status}]
            </text>
          </g>
        {/each}
      </svg>

      <div class="absolute bottom-2 left-2 text-[9px] text-[#8BA1B8] bg-black/60 px-2 py-0.5 rounded border border-white/5 font-mono">
        RECONSTRUCTION GEOSPATIAL VECTOR // {$currentReplayState.timeOffset} UTC
      </div>
    </div>

    <!-- Historical Stage Log & Directives (5 cols) -->
    <div class="lg:col-span-5 h-full flex flex-col justify-between p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs">
      <div class="space-y-2">
        <div class="text-[10px] font-bold text-[#8BA1B8] uppercase tracking-wider">
          TACTICAL DIRECTIVE AT {$currentReplayState.timeOffset} UTC:
        </div>
        <p class="text-sm font-bold text-white font-sans leading-snug">
          "{$currentReplayState.operationalDirective}"
        </p>

        <div class="pt-2 border-t border-white/5 text-[11px] text-slate-300 font-sans leading-relaxed">
          {$currentReplayState.stageSummary}
        </div>
      </div>

      <div class="p-2 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[10px] text-[#00E5FF] flex items-center justify-between mt-2">
        <span>AXIS NEURAL DECISION LOG:</span>
        <span class="font-bold">VERIFIED RECONSTRUCTION ✓</span>
      </div>
    </div>
  </div>
</div>
