<script lang="ts">
  import {
    isAllocateResourceModalOpen,
    responseResources,
    allocateResource
  } from '../../../stores/responseStore';

  let selectedResId = 'res-01';
  let quantityDelta = 2;
  let targetDepot = 'Sylhet Advanced Forward Base';

  function handleSubmit() {
    const res = $responseResources.find((r) => r.id === selectedResId);
    if (res) {
      allocateResource(res.id, res.deployed + quantityDelta);
    }
    isAllocateResourceModalOpen.set(false);
  }
</script>

{#if $isAllocateResourceModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
    <div class="relative w-full max-w-md bg-[#061425] border border-[#00E5FF]/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,229,255,0.25)] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-white/10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
            📦
          </div>
          <div>
            <h2 class="text-base font-bold font-mono text-white tracking-wider">
              ALLOCATE EMERGENCY ASSETS
            </h2>
            <p class="text-xs text-[#8BA1B8] font-sans">
              Re-distribute supplies, aircraft, and boats between depots
            </p>
          </div>
        </div>

        <button
          on:click={() => isAllocateResourceModalOpen.set(false)}
          class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-[#8BA1B8] hover:text-white flex items-center justify-center font-mono cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Form Inputs -->
      <form on:submit|preventDefault={handleSubmit} class="py-4 space-y-3.5 text-xs font-mono">
        <div>
          <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
            Target Resource
          </label>
          <select
            bind:value={selectedResId}
            class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#00E5FF]"
          >
            {#each $responseResources as res}
              <option value={res.id} class="bg-[#061425] text-white">
                {res.name} (Currently {res.deployed} of {res.total} {res.unit})
              </option>
            {/each}
          </select>
        </div>

        <div>
          <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
            Quantity to Deploy
          </label>
          <input
            type="number"
            bind:value={quantityDelta}
            min="1"
            max="50"
            class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#00E5FF]"
          />
        </div>

        <div>
          <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
            Destination Staging Base
          </label>
          <input
            type="text"
            bind:value={targetDepot}
            required
            class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#00E5FF]"
          />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            on:click={() => isAllocateResourceModalOpen.set(false)}
            class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8BA1B8] hover:text-white transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-5 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#38BDF8] text-[#020711] font-bold transition-all shadow-[0_0_15px_rgba(0,229,255,0.4)] cursor-pointer"
          >
            Confirm Allocation
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.97); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out forwards;
  }
</style>
