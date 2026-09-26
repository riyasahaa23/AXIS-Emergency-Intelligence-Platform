<script lang="ts">
  import { isRiskLegendExpanded } from '../../stores/systemStore';

  const tiers = [
    { label: 'Extreme', color: 'bg-[#EF4444]', shadow: 'shadow-[0_0_8px_#EF4444]' },
    { label: 'High', color: 'bg-[#F59E0B]', shadow: 'shadow-[0_0_8px_#F59E0B]' },
    { label: 'Moderate', color: 'bg-yellow-400', shadow: 'shadow-[0_0_8px_#facc15]' },
    { label: 'Low', color: 'bg-[#00E5FF]', shadow: 'shadow-[0_0_8px_#00E5FF]' }
  ];

  function toggleExpand() {
    isRiskLegendExpanded.update((v) => !v);
  }
</script>

<div class="rounded-2xl bg-[#061425]/75 hover:bg-[#061425] backdrop-blur-xl border border-white/10 hover:border-[#00E5FF]/40 shadow-[0_4px_24px_rgba(0,0,0,0.5)] select-none transition-all duration-200">
  <!-- Header / Compact Toggle Bar -->
  <button
    on:click={toggleExpand}
    class="flex items-center justify-between w-full p-2.5 gap-3 cursor-pointer text-left"
    title="Toggle Risk Map Legend"
  >
    <div class="flex items-center gap-2">
      <span class="w-2 h-2 rounded-sm bg-[#EF4444] shadow-[0_0_6px_#EF4444]"></span>
      <span class="text-[10px] uppercase font-mono tracking-widest text-[#00E5FF] font-bold">Global Risk Map</span>
    </div>

    <svg class="w-3.5 h-3.5 text-[#8BA1B8] transition-transform duration-200 {$isRiskLegendExpanded ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  <!-- Expanded Tiers List -->
  {#if $isRiskLegendExpanded}
    <div class="px-3 pb-2.5 pt-1 space-y-1.5 text-xs font-mono border-t border-white/5 animate-in fade-in duration-150">
      {#each tiers as tier}
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-sm {tier.color} {tier.shadow}"></span>
          <span class="text-[#8BA1B8] text-[10px]">{tier.label}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>