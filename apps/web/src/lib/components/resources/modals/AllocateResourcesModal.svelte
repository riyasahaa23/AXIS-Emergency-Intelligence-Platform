<script lang="ts">
  import {
    isAllocateModalOpen,
    allResources,
    directAllocateResource
  } from '../../../stores/resourceStore';

  let selectedId = 'H-001';
  let quantity = 1;
  let destination = 'Sylhet Sector 3 Evacuation Hub';
  let operation = 'Trauma Evacuation Mission';

  $: selectedItem = $allResources.find((r) => r.id === selectedId);
  $: availableStock = selectedItem?.capacityNum || (selectedItem?.status === 'AVAILABLE' ? 1 : 0);
  $: isInsufficient = quantity > (availableStock > 0 ? availableStock : 1);

  function handleSubmit() {
    if (isInsufficient) return;
    directAllocateResource({
      resourceId: selectedId,
      quantity,
      destination,
      operation
    });
  }
</script>

{#if $isAllocateModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
    <div class="relative w-full max-w-md bg-[#061425] border border-[#00E5FF]/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,229,255,0.25)] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-white/10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
            ⚖️
          </div>
          <div>
            <h2 class="text-base font-bold font-mono text-white tracking-wider">
              ALLOCATE EMERGENCY ASSETS
            </h2>
            <p class="text-xs text-[#8BA1B8] font-sans">
              Assign and balance verified stock to field staging bases
            </p>
          </div>
        </div>

        <button
          on:click={() => isAllocateModalOpen.set(false)}
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
            bind:value={selectedId}
            class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#00E5FF]"
          >
            {#each $allResources as res}
              <option value={res.id} class="bg-[#061425] text-white">
                {res.id} — {res.name} ({res.status} at {res.location})
              </option>
            {/each}
          </select>
        </div>

        <!-- Stock Availability Check Box -->
        <div class="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
          <div class="flex justify-between">
            <span class="text-[#8BA1B8]">Current Status:</span>
            <span class="text-white font-bold">{selectedItem?.status}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#8BA1B8]">Location:</span>
            <span class="text-[#00E5FF]">{selectedItem?.location}</span>
          </div>
        </div>

        <div>
          <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
            Allocation Quantity
          </label>
          <input
            type="number"
            bind:value={quantity}
            min="1"
            max="100"
            class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#00E5FF]"
          />
        </div>

        <!-- Insufficient Stock Warning per Requirements -->
        {#if isInsufficient}
          <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-400 text-xs">
            <div class="font-bold uppercase tracking-wider text-[10px] mb-1">
              ⚠️ INSUFFICIENT RESOURCE
            </div>
            <div>
              Requested quantity exceeds available stock units. Reduce quantity or select another staging depot.
            </div>
          </div>
        {/if}

        <div>
          <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
            Destination Staging Base
          </label>
          <input
            type="text"
            bind:value={destination}
            required
            class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#00E5FF]"
          />
        </div>

        <div>
          <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
            Mission / Directive Name
          </label>
          <input
            type="text"
            bind:value={operation}
            required
            class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#00E5FF]"
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            on:click={() => isAllocateModalOpen.set(false)}
            class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8BA1B8] hover:text-white transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isInsufficient}
            class="px-5 py-2 rounded-xl font-bold transition-all cursor-pointer {
              isInsufficient
                ? 'bg-white/10 text-[#8BA1B8] cursor-not-allowed border border-white/5'
                : 'bg-[#00E5FF] hover:bg-[#38BDF8] text-[#020711] shadow-[0_0_15px_rgba(0,229,255,0.4)]'
            }"
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
