<script lang="ts">
  import {
    responseResources,
    activeResponseMode,
    isAllocateResourceModalOpen
  } from '../../stores/responseStore';
</script>

<div class="flex flex-col h-full bg-[#061425]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-3 select-none">
  <!-- Header with View All -->
  <div class="flex items-center justify-between pb-2 mb-2 border-b border-white/10 shrink-0">
    <div class="flex items-center gap-2">
      <div class="w-3.5 h-3.5 rounded-full border border-[#00E5FF] flex items-center justify-center">
        <span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></span>
      </div>
      <h3 class="text-xs font-mono font-bold tracking-wider text-white uppercase">
        RESOURCE ALLOCATION
      </h3>
    </div>

    <button
      on:click={() => activeResponseMode.set('resources')}
      class="text-[10px] font-mono text-[#00E5FF] hover:underline cursor-pointer bg-transparent border-0 p-0"
    >
      View all →
    </button>
  </div>

  <!-- Resource Utilization Progress Rows -->
  <div class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
    {#each $responseResources as res (res.id)}
      <button
        on:click={() => isAllocateResourceModalOpen.set(true)}
        class="w-full text-left p-2 rounded-xl bg-[#061425]/40 hover:bg-[#061425]/80 border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
        title="Click to adjust {res.name} allocation"
      >
        <div class="flex items-center justify-between text-xs font-mono mb-1.5">
          <div class="flex items-center gap-2 text-white">
            <span class="text-sm">
              {#if res.name.includes('Heli')}
                🚁
              {:else if res.name.includes('Boat')}
                🚤
              {:else if res.name.includes('Medical')}
                ✚
              {:else if res.name.includes('Food')}
                🍞
              {:else if res.name.includes('Shelter')}
                ⛺
              {:else}
                📦
              {/if}
            </span>
            <span class="text-[11px] font-medium text-[#E6EDF3] group-hover:text-[#00E5FF] transition-colors">
              {res.name}
            </span>
          </div>

          <!-- Counter Numbers & Percentage -->
          <div class="flex items-center gap-2 text-[11px]">
            <span class="text-white font-bold">
              {res.deployed} / {res.total}
            </span>
            <span
              class="px-1.5 py-0.2 rounded text-[10px] font-bold {
                res.percentage >= 80 ? 'text-[#00E5FF] bg-[#00E5FF]/10' :
                res.percentage >= 70 ? 'text-emerald-400 bg-emerald-500/10' :
                'text-amber-400 bg-amber-500/10'
              }"
            >
              {res.percentage}%
            </span>
          </div>
        </div>

        <!-- Animated Progress Bar -->
        <div class="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
          <div
            class="h-full rounded-full transition-all duration-500 {
              res.color === '#10B981'
                ? 'bg-gradient-to-r from-emerald-500/70 to-emerald-400 shadow-[0_0_8px_#10B981]'
                : res.color === '#F59E0B'
                ? 'bg-gradient-to-r from-amber-500/70 to-amber-400 shadow-[0_0_8px_#F59E0B]'
                : 'bg-gradient-to-r from-[#00E5FF]/70 to-[#00E5FF] shadow-[0_0_8px_#00E5FF]'
            }"
            style="width: {res.percentage}%"
          ></div>
        </div>
      </button>
    {/each}
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.2);
    border-radius: 4px;
  }
</style>
