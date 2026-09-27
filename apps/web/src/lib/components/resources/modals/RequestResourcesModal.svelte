<script lang="ts">
  import {
    isRequestModalOpen,
    submitResourceRequest
  } from '../../../stores/resourceStore';
  import type { ResourceCategory } from '../../../types/resources';

  let resourceType = 'Zodiac Shallow Draft Inflatables';
  let category: ResourceCategory = 'Boats';
  let quantity = 6;
  let requestedBy = 'Emergency Commander Dhaka North';
  let destination = 'Mirpur Embankment Inundation Sector';
  let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
  let requiredBy = 'Today 17:00 UTC';
  let reason = 'Overflow of Turag River breached local sand barriers; immediate civilian transit required.';
  let isReviewStep = false;

  const categories: ResourceCategory[] = [
    'Helicopters',
    'Boats',
    'Ground Vehicles',
    'Medical Supplies',
    'Food & Water',
    'Temporary Shelters',
    'Fuel & Energy',
    'Communication Equipment',
    'Search & Rescue Equipment'
  ];

  function handleSubmit() {
    submitResourceRequest({
      resourceType,
      category,
      quantity,
      requestedBy,
      destination,
      priority,
      requiredBy,
      reason
    });
    isReviewStep = false;
  }
</script>

{#if $isRequestModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
    <div class="relative w-full max-w-lg bg-[#061425] border border-[#8B5CF6]/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(139,92,246,0.25)] flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/40 flex items-center justify-center text-[#8B5CF6]">
            📥
          </div>
          <div>
            <h2 class="text-base font-bold font-mono text-white tracking-wider">
              {isReviewStep ? 'REVIEW RESOURCE REQUISITION' : 'REQUEST EMERGENCY RESOURCES'}
            </h2>
            <p class="text-xs text-[#8BA1B8] font-sans">
              Requisition critical equipment, boats, medical kits or consumables from Central Logistics
            </p>
          </div>
        </div>

        <button
          on:click={() => {
            isRequestModalOpen.set(false);
            isReviewStep = false;
          }}
          class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-[#8BA1B8] hover:text-white flex items-center justify-center font-mono cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Form Body or Review Screen -->
      <div class="flex-1 overflow-y-auto py-4 space-y-3.5 text-xs font-mono pr-1 custom-scrollbar">
        {#if !isReviewStep}
          <div class="space-y-3.5">
            <div>
              <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
                Resource Category
              </label>
              <select
                bind:value={category}
                class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#8B5CF6]"
              >
                {#each categories as cat}
                  <option value={cat} class="bg-[#061425] text-white">{cat}</option>
                {/each}
              </select>
            </div>

            <div>
              <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
                Resource Specification / Model
              </label>
              <input
                type="text"
                bind:value={resourceType}
                required
                class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
                  Quantity
                </label>
                <input
                  type="number"
                  bind:value={quantity}
                  min="1"
                  max="5000"
                  class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div>
                <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
                  Priority
                </label>
                <select
                  bind:value={priority}
                  class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#8B5CF6]"
                >
                  <option value="CRITICAL" class="bg-[#061425] text-rose-400">CRITICAL</option>
                  <option value="HIGH" class="bg-[#061425] text-amber-400">HIGH</option>
                  <option value="MEDIUM" class="bg-[#061425] text-blue-400">MEDIUM</option>
                  <option value="LOW" class="bg-[#061425] text-slate-400">LOW</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
                Target Destination / Delivery Hub
              </label>
              <input
                type="text"
                bind:value={destination}
                required
                class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
                  Requested By
                </label>
                <input
                  type="text"
                  bind:value={requestedBy}
                  class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
              <div>
                <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
                  Required By (Window)
                </label>
                <input
                  type="text"
                  bind:value={requiredBy}
                  class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>

            <div>
              <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
                Operational Justification
              </label>
              <textarea
                bind:value={reason}
                rows="2"
                class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#8B5CF6] font-sans text-xs"
              ></textarea>
            </div>
          </div>
        {:else}
          <!-- Review Step Summary Card -->
          <div class="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
            <div class="flex justify-between text-[#8BA1B8]">
              <span>Resource:</span>
              <span class="text-white font-bold">{quantity}x {resourceType}</span>
            </div>
            <div class="flex justify-between text-[#8BA1B8]">
              <span>Category:</span>
              <span class="text-white">{category}</span>
            </div>
            <div class="flex justify-between text-[#8BA1B8]">
              <span>Destination:</span>
              <span class="text-[#00E5FF]">{destination}</span>
            </div>
            <div class="flex justify-between text-[#8BA1B8]">
              <span>Priority:</span>
              <span class="text-rose-400 font-bold">{priority}</span>
            </div>
            <div class="flex justify-between text-[#8BA1B8]">
              <span>Required Window:</span>
              <span class="text-white">{requiredBy}</span>
            </div>
            <div class="pt-2 border-t border-white/10 text-[#C5D1DE] text-[11px] font-sans">
              <span class="font-bold text-white">Reason:</span> {reason}
            </div>
          </div>
        {/if}
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-3 pt-4 border-t border-white/10 shrink-0">
        {#if !isReviewStep}
          <button
            type="button"
            on:click={() => isRequestModalOpen.set(false)}
            class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8BA1B8] hover:text-white transition-all cursor-pointer font-mono"
          >
            Cancel
          </button>
          <button
            type="button"
            on:click={() => isReviewStep = true}
            class="px-5 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)] cursor-pointer font-mono"
          >
            Review Request →
          </button>
        {:else}
          <button
            type="button"
            on:click={() => isReviewStep = false}
            class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8BA1B8] hover:text-white transition-all cursor-pointer font-mono"
          >
            ← Back to Edit
          </button>
          <button
            type="button"
            on:click={handleSubmit}
            class="px-5 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#38BDF8] text-[#020711] font-bold transition-all shadow-[0_0_15px_rgba(0,229,255,0.4)] cursor-pointer font-mono"
          >
            Submit Request
          </button>
        {/if}
      </div>
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
  .custom-scrollbar::-webkit-scrollbar {
    width: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.2);
    border-radius: 4px;
  }
</style>
