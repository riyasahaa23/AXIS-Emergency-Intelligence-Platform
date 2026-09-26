<script lang="ts">
  import { onMount } from 'svelte';
  import { MOCK_SCENARIOS } from '../../mock/scenarios';
  import { submitCommand } from '../../stores/commandStore';
  import type { ScenarioItem } from '../../types';

  let scrollContainer: HTMLDivElement;
  let canScrollLeft = false;
  let canScrollRight = true;
  let activeIndex = 0;

  function updateScrollState() {
    if (!scrollContainer) return;
    canScrollLeft = scrollContainer.scrollLeft > 10;
    canScrollRight = scrollContainer.scrollLeft < (scrollContainer.scrollWidth - scrollContainer.clientWidth - 10);
    activeIndex = Math.round(scrollContainer.scrollLeft / 270);
  }

  function scroll(direction: 'left' | 'right') {
    if (!scrollContainer) return;
    const amount = direction === 'left' ? -280 : 280;
    scrollContainer.scrollBy({ left: amount, behavior: 'smooth' });
  }

  function handleWheel(e: WheelEvent) {
    if (!scrollContainer) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      scrollContainer.scrollLeft += e.deltaY;
      updateScrollState();
    }
  }

  onMount(() => {
    updateScrollState();
  });

  function onSelectScenario(scen: ScenarioItem) {
    submitCommand(`Simulate scenario: ${scen.title} (${scen.delta})`);
  }
</script>

<div class="w-full select-none">
  <!-- Carousel Header with Navigation Arrows -->
  <div class="flex items-center justify-between mb-2 px-3">
    <div class="flex items-center gap-2">
      <span class="text-xs font-bold font-mono tracking-wider text-white">Explore Scenarios</span>
      <span class="text-[10px] text-[#00E5FF] font-mono px-1.5 py-0.2 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30">
        5 MODELS
      </span>
    </div>

    <!-- Scroll Arrows Controls (< and >) -->
    <div class="flex items-center gap-1.5">
      <button
        on:click={() => scroll('left')}
        disabled={!canScrollLeft}
        class="w-7 h-7 rounded-lg flex items-center justify-center bg-[#061425] border border-[#00E5FF]/20 text-[#00E5FF] hover:border-[#00E5FF] hover:bg-[#00E5FF]/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
        title="Scroll left"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        on:click={() => scroll('right')}
        disabled={!canScrollRight}
        class="w-7 h-7 rounded-lg flex items-center justify-center bg-[#061425] border border-[#00E5FF]/20 text-[#00E5FF] hover:border-[#00E5FF] hover:bg-[#00E5FF]/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
        title="Scroll right"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Horizontal Scroll Container with No Clipping -->
  <div
    bind:this={scrollContainer}
    on:scroll={updateScrollState}
    on:wheel|preventDefault={handleWheel}
    class="flex items-stretch gap-3 overflow-x-auto px-2 pb-2 custom-scrollbar scroll-smooth snap-x snap-mandatory"
  >
    {#each MOCK_SCENARIOS as scen, idx}
      <button
        on:click={() => onSelectScenario(scen)}
        class="shrink-0 w-[260px] snap-start p-3 rounded-xl bg-[#061425]/75 hover:bg-[#061425] border border-[#00E5FF]/20 hover:border-[#00E5FF]/70 backdrop-blur-md text-left transition-all duration-200 group shadow-[0_4px_16px_rgba(0,0,0,0.5)] flex flex-col justify-between"
      >
        <div>
          <!-- Thumbnail Graphic & Tag -->
          <div class="relative w-full h-20 rounded-lg overflow-hidden mb-2.5 border border-white/10 bg-slate-900">
            {#if scen.id === 'scen-01'}
              <div class="w-full h-full bg-gradient-to-tr from-cyan-950 via-blue-900 to-sky-800 flex items-center justify-center">
                <svg class="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
            {:else if scen.id === 'scen-02'}
              <div class="w-full h-full bg-gradient-to-tr from-slate-950 via-indigo-950 to-blue-900 flex items-center justify-center">
                <div class="w-10 h-10 rounded-full border-2 border-dashed border-sky-300 animate-spin group-hover:scale-110 transition-transform" style="animation-duration: 6s;"></div>
              </div>
            {:else if scen.id === 'scen-03'}
              <div class="w-full h-full bg-gradient-to-tr from-slate-950 via-teal-950 to-cyan-900 flex items-center justify-center">
                <svg class="w-8 h-8 text-teal-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
            {:else if scen.id === 'scen-04'}
              <div class="w-full h-full bg-gradient-to-tr from-slate-950 via-amber-950 to-yellow-950 flex items-center justify-center">
                <svg class="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
            {:else}
              <div class="w-full h-full bg-gradient-to-tr from-purple-950 via-slate-950 to-indigo-900 flex items-center justify-center">
                <svg class="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            {/if}

            <span class="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-[#020711]/90 text-[#00E5FF] border border-[#00E5FF]/40 font-bold">
              {scen.tag}
            </span>
          </div>

          <h4 class="text-xs font-bold text-white font-mono leading-snug group-hover:text-[#00E5FF] transition-colors">
            {scen.title}
          </h4>
          <p class="text-[10px] text-[#8BA1B8] font-mono leading-normal mt-0.5">
            {scen.subtitle}
          </p>
        </div>

        <!-- Metric Delta Box -->
        <div class="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
          <span class="text-[#8BA1B8]">{scen.baselineMetric}</span>
          <span class="text-[#00E5FF] font-bold bg-[#00E5FF]/10 px-1.5 py-0.5 rounded border border-[#00E5FF]/30">
            {scen.delta}
          </span>
        </div>
      </button>
    {/each}
  </div>

  <!-- Carousel Progress Track Indicators -->
  <div class="flex justify-center items-center gap-1.5 mt-1">
    {#each MOCK_SCENARIOS as _, i}
      <span class="w-1.5 h-1.5 rounded-full transition-all duration-300 {activeIndex === i ? 'bg-[#00E5FF] w-4' : 'bg-white/20'}"></span>
    {/each}
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    height: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(2, 7, 17, 0.4);
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.3);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 229, 255, 0.6);
  }
</style>