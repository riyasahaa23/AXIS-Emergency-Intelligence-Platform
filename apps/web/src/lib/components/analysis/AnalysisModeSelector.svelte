<script lang="ts">
  import { activeAnalysisMode } from '../../stores/analysisStore';
  import type { AnalysisMode } from '../../types';

  const modes: Array<{ id: AnalysisMode; label: string; sub: string; icon: string }> = [
    { id: 'current', label: 'Current Impact', sub: 'What is happening now', icon: '🛡️' },
    { id: 'short_term', label: 'Short-term Forecast', sub: 'Next 7 days', icon: '📉' },
    { id: 'long_term', label: 'Long-term Projection', sub: 'Next 30 days', icon: '📈' },
    { id: 'comparative', label: 'Comparative Analysis', sub: 'With historical events', icon: '⚖️' }
  ];

  function setMode(id: AnalysisMode) {
    activeAnalysisMode.set(id);
  }
</script>

<div class="flex flex-col font-mono text-xs select-none">
  <div class="text-[9px] uppercase tracking-wider text-[#8BA1B8] font-bold mb-1">
    ANALYSIS MODE
  </div>

  <div class="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
    {#each modes as m}
      {@const isActive = $activeAnalysisMode === m.id}
      <button
        on:click={() => setMode(m.id)}
        class="flex-1 min-w-[130px] flex items-center gap-2 px-2.5 py-1.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border shrink-0 {
          isActive
            ? 'bg-[#081e36]/90 border-[#00E5FF] text-white shadow-[0_0_20px_rgba(0,229,255,0.35)]'
            : 'bg-[#061425]/75 hover:bg-[#061425] border-white/10 hover:border-white/30 text-[#8BA1B8] hover:text-white'
        }"
        title="{m.label}: {m.sub}"
      >
        <span class="text-xs shrink-0 {isActive ? 'scale-110' : ''} transition-transform">
          {m.icon}
        </span>
        <div class="flex flex-col min-w-0">
          <span class="text-[10px] font-bold truncate leading-tight {isActive ? 'text-[#00E5FF]' : 'text-white'}">
            {m.label}
          </span>
          <span class="text-[8.5px] text-[#8BA1B8] truncate leading-tight mt-0.5">
            {m.sub}
          </span>
        </div>
      </button>
    {/each}
  </div>
</div>
