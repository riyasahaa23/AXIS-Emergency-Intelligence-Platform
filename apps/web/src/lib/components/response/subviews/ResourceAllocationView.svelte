<script lang="ts">
  import {
    responseResources,
    allocateResource,
    isAllocateResourceModalOpen
  } from '../../../stores/responseStore';

  function handleSliderChange(id: string, event: Event) {
    const target = event.target as HTMLInputElement;
    allocateResource(id, parseInt(target.value, 10));
  }

  function autoBalanceAll() {
    responseResources.update((resList) => {
      return resList.map((r) => {
        const balanced = Math.round(r.total * 0.75);
        return {
          ...r,
          deployed: balanced,
          percentage: 75,
          status: 'optimal'
        };
      });
    });
  }
</script>

<div class="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 select-none custom-scrollbar">
  <!-- Subview Control Bar -->
  <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#061425]/70 backdrop-blur-xl border border-white/10 shrink-0">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
        📦
      </div>
      <div>
        <h2 class="text-sm font-bold font-mono text-white">LOGISTICS & RESOURCE ALLOCATION LEDGER</h2>
        <p class="text-xs text-[#8BA1B8] font-sans">
          Deploy, balance, and re-stock critical planetary emergency reserves
        </p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="flex items-center gap-2">
      <button
        on:click={autoBalanceAll}
        class="px-3 py-1.5 rounded-xl bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-mono font-bold transition-all cursor-pointer"
      >
        ⚡ Auto-Balance Depots
      </button>

      <button
        on:click={() => isAllocateResourceModalOpen.set(true)}
        class="px-3 py-1.5 rounded-xl bg-[#00E5FF] text-[#020711] text-xs font-mono font-bold hover:bg-[#38BDF8] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.35)]"
      >
        + Requisition Stock
      </button>
    </div>
  </div>

  <!-- Resource Ledger Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
    {#each $responseResources as res (res.id)}
      <div class="p-4 rounded-2xl bg-[#061425]/60 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
        <div>
          <!-- Header -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <span class="text-2xl">
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
                  🏗️
                {/if}
              </span>
              <div>
                <h3 class="text-sm font-bold text-white font-mono">{res.name}</h3>
                <span class="text-[11px] text-[#8BA1B8] font-sans">{res.depot}</span>
              </div>
            </div>

            <!-- Status Pill -->
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase {
              res.status === 'optimal'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }">
              {res.status}
            </span>
          </div>

          <!-- Counters & Utilization -->
          <div class="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5 font-mono text-center mb-3">
            <div>
              <div class="text-[10px] text-[#8BA1B8]">Deployed</div>
              <div class="text-base font-bold text-[#00E5FF]">{res.deployed} {res.unit}</div>
            </div>
            <div>
              <div class="text-[10px] text-[#8BA1B8]">In Reserve</div>
              <div class="text-base font-bold text-white">{res.total - res.deployed} {res.unit}</div>
            </div>
            <div>
              <div class="text-[10px] text-[#8BA1B8]">Utilization</div>
              <div class="text-base font-bold text-emerald-400">{res.percentage}%</div>
            </div>
          </div>

          <!-- Interactive Slider -->
          <div class="mb-3">
            <div class="flex justify-between text-[11px] font-mono text-[#8BA1B8] mb-1.5">
              <span>Adjust Field Deployment:</span>
              <span class="text-white font-bold">{res.deployed} of {res.total}</span>
            </div>
            <input
              type="range"
              min="0"
              max={res.total}
              value={res.deployed}
              on:input={(e) => handleSliderChange(res.id, e)}
              class="w-full accent-[#00E5FF] cursor-pointer"
            />
          </div>
        </div>

        <!-- Quick Deploy Delta Buttons -->
        <div class="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] font-mono">
          <span class="text-[#8BA1B8]">Quick Actions:</span>
          <div class="flex items-center gap-1.5">
            <button
              on:click={() => allocateResource(res.id, res.deployed - 1)}
              class="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white border border-white/10 cursor-pointer"
            >
              -1 {res.unit}
            </button>
            <button
              on:click={() => allocateResource(res.id, res.deployed + 1)}
              class="px-2 py-1 rounded bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 text-[#00E5FF] border border-[#00E5FF]/40 font-bold cursor-pointer"
            >
              +1 {res.unit}
            </button>
            <button
              on:click={() => allocateResource(res.id, res.total)}
              class="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 cursor-pointer"
            >
              Max All
            </button>
          </div>
        </div>
      </div>
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
