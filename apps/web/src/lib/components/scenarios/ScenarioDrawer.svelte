<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { isScenarioDrawerOpen, closeScenarioDrawer } from '../../stores/systemStore';
  import { submitCommand } from '../../stores/commandStore';
  import { MOCK_SCENARIOS } from '../../mock/scenarios';
  import type { ScenarioItem } from '../../types';

  let scrollContainer: HTMLDivElement;
  let canScrollLeft = false;
  let canScrollRight = true;

  function updateScrollState() {
    if (!scrollContainer) return;
    canScrollLeft = scrollContainer.scrollLeft > 10;
    canScrollRight = scrollContainer.scrollLeft < (scrollContainer.scrollWidth - scrollContainer.clientWidth - 10);
  }

  function scroll(direction: 'left' | 'right') {
    if (!scrollContainer) return;
    const amount = direction === 'left' ? -320 : 320;
    scrollContainer.scrollBy({ left: amount, behavior: 'smooth' });
  }

  function handleWheel(e: WheelEvent) {
    if (!scrollContainer) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      scrollContainer.scrollLeft += e.deltaY;
      updateScrollState();
    }
  }

  function runSimulation(scen: ScenarioItem) {
    submitCommand(`Simulate scenario: ${scen.title} (${scen.delta})`);
    closeScenarioDrawer();
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && $isScenarioDrawerOpen) {
      closeScenarioDrawer();
    }
  }
</script>

<svelte:window on:keydown={onKeyDown} />

{#if $isScenarioDrawerOpen}
  <!-- Backdrop Click Area to dismiss -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    transition:fade={{ duration: 200 }}
    on:click={closeScenarioDrawer}
    class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm cursor-pointer"
    aria-label="Close scenario drawer backdrop"
  />

  <!-- Floating Bottom Slide-up Drawer -->
  <aside
    transition:fly={{ y: 280, duration: 320 }}
    class="fixed bottom-0 inset-x-0 z-50 flex justify-center pointer-events-none px-4"
    role="region"
    aria-label="Scenario Simulation Engine Drawer"
  >
    <div class="w-full max-w-6xl pointer-events-auto bg-[#040a18]/95 backdrop-blur-2xl rounded-t-3xl border-t-2 border-x border-[#00E5FF]/40 shadow-[0_-15px_40px_rgba(0,229,255,0.25),0_-25px_60px_rgba(0,0,0,0.85)] flex flex-col p-4 pb-5 overflow-hidden">
      
      <!-- Drawer Top Bar & Navigation Controls -->
      <div class="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
        <!-- Title and Status Indicator -->
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.3)]">
            <span class="text-sm font-bold">◈</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-xs font-mono font-bold tracking-wider text-white uppercase">
                EXPLORE SCENARIOS — WHAT-IF SIMULATION ENGINE
              </h3>
              <span class="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/40 font-bold">
                5 Active Models
              </span>
            </div>
            <p class="text-[10px] text-[#8BA1B8] font-mono">
              Select any disaster scenario to simulate planetary cascade propagation
            </p>
          </div>
        </div>

        <!-- Scroll Controls & Close Button -->
        <div class="flex items-center gap-2">
          <!-- Scroll Left -->
          <button
            on:click={() => scroll('left')}
            disabled={!canScrollLeft}
            class="w-8 h-8 rounded-xl flex items-center justify-center bg-[#061425] border border-[#00E5FF]/30 text-[#00E5FF] hover:border-[#00E5FF] hover:bg-[#00E5FF]/15 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-[0_0_10px_rgba(0,0,0,0.4)]"
            title="Scroll left"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Scroll Right -->
          <button
            on:click={() => scroll('right')}
            disabled={!canScrollRight}
            class="w-8 h-8 rounded-xl flex items-center justify-center bg-[#061425] border border-[#00E5FF]/30 text-[#00E5FF] hover:border-[#00E5FF] hover:bg-[#00E5FF]/15 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-[0_0_10px_rgba(0,0,0,0.4)]"
            title="Scroll right"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- Close Drawer Button -->
          <button
            on:click={closeScenarioDrawer}
            class="w-8 h-8 ml-2 rounded-xl flex items-center justify-center bg-[#152336]/80 border border-white/20 text-white hover:text-[#00E5FF] hover:border-[#00E5FF] hover:bg-[#00E5FF]/15 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            title="Close Drawer"
          >
            <span class="text-sm font-bold font-mono">✕</span>
          </button>
        </div>
      </div>

      <!-- Horizontal Scrollable Cards Track -->
      <div
        bind:this={scrollContainer}
        on:scroll={updateScrollState}
        on:wheel|preventDefault={handleWheel}
        class="flex items-stretch gap-4 overflow-x-auto pb-2 pt-1 px-1 custom-scrollbar scroll-smooth snap-x snap-mandatory"
      >
        {#each MOCK_SCENARIOS as scen}
          <div
            class="shrink-0 w-[290px] snap-start p-3.5 rounded-2xl bg-gradient-to-b from-[#08182b] to-[#040e1d] border border-[#00E5FF]/25 hover:border-[#00E5FF] transition-all duration-300 group shadow-[0_6px_20px_rgba(0,0,0,0.6)] hover:shadow-[0_0_25px_rgba(0,229,255,0.3)] flex flex-col justify-between"
          >
            <!-- Card Upper Section -->
            <div>
              <!-- Category Badge & Delta -->
              <div class="flex items-center justify-between mb-2">
                <span class="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/40 font-bold tracking-wider">
                  {scen.tag}
                </span>
                <span class="text-[10px] text-[#3D7CFF] font-mono font-bold bg-[#3D7CFF]/10 px-2 py-0.5 rounded border border-[#3D7CFF]/30">
                  {scen.delta}
                </span>
              </div>

              <!-- Title -->
              <h4 class="text-sm font-bold text-white font-mono leading-tight group-hover:text-[#00E5FF] transition-colors">
                {scen.title}
              </h4>

              <!-- Location -->
              {#if scen.location}
                <div class="flex items-center gap-1.5 mt-1.5 text-[11px] text-[#8BA1B8] font-mono">
                  <svg class="w-3 h-3 text-[#00E5FF] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span class="truncate">{scen.location}</span>
                </div>
              {/if}

              <!-- Description / Subtitle -->
              <p class="text-[10px] text-[#A2B8CC] font-mono leading-relaxed mt-2 line-clamp-2">
                {scen.subtitle}
              </p>
            </div>

            <!-- Card Bottom Metrics & Action Button -->
            <div class="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
              <div class="flex flex-col min-w-0">
                <span class="text-[9px] uppercase tracking-wider text-[#8BA1B8] font-mono">Impact Factor</span>
                <span class="text-[11px] font-mono font-bold text-white truncate">
                  {scen.impactStats || scen.projectedMetric}
                </span>
              </div>

              <button
                on:click={() => runSimulation(scen)}
                class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#3D7CFF] text-[#020711] font-mono font-bold text-xs shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:shadow-[0_0_25px_rgba(0,229,255,0.7)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <span>Simulate</span>
                <span class="text-sm font-bold">→</span>
              </button>
            </div>
          </div>
        {/each}
      </div>

    </div>
  </aside>
{/if}

<style>
  .custom-scrollbar::-webkit-scrollbar {
    height: 5px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(2, 7, 17, 0.5);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.35);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 229, 255, 0.7);
  }
</style>
