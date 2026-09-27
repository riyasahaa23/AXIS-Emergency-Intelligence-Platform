<script lang="ts">
  import {
    isPlanEvacuationModalOpen,
    evacuationRoutes,
    shelterLocations
  } from '../../../stores/responseStore';

  let routeName = 'North River Corridor Beta';
  let origin = 'Surma Basin Lowlands';
  let destination = 'Sylhet MC College Relief Camp';
  let clearanceTime = 2.5;

  function handleSubmit() {
    evacuationRoutes.update((routes) => [
      ...routes,
      {
        id: `rt-${Date.now()}`,
        name: routeName,
        origin,
        destination,
        status: 'Clear',
        clearanceTimeHours: clearanceTime,
        evacueesCount: '15,000 in transit',
        path: [
          [91.86, 24.89],
          [91.95, 24.95]
        ]
      }
    ]);
    isPlanEvacuationModalOpen.set(false);
  }
</script>

{#if $isPlanEvacuationModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
    <div class="relative w-full max-w-lg bg-[#061425] border border-[#00E5FF]/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,229,255,0.25)] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-white/10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
            ↗
          </div>
          <div>
            <h2 class="text-base font-bold font-mono text-white tracking-wider">
              DESIGNATE EVACUATION CORRIDOR
            </h2>
            <p class="text-xs text-[#8BA1B8] font-sans">
              Establish safe routing corridors from inundation zones to shelters
            </p>
          </div>
        </div>

        <button
          on:click={() => isPlanEvacuationModalOpen.set(false)}
          class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-[#8BA1B8] hover:text-white flex items-center justify-center font-mono cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Form Inputs -->
      <form on:submit|preventDefault={handleSubmit} class="py-4 space-y-3.5 text-xs font-mono">
        <div>
          <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
            Corridor Designation
          </label>
          <input
            type="text"
            bind:value={routeName}
            required
            class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#00E5FF]"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
              Origin (Vulnerable Sector)
            </label>
            <input
              type="text"
              bind:value={origin}
              required
              class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#00E5FF]"
            />
          </div>

          <div>
            <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
              Destination Shelter Hub
            </label>
            <input
              type="text"
              bind:value={destination}
              required
              class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#00E5FF]"
            />
          </div>
        </div>

        <div>
          <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
            Target Clearance Time (Hours)
          </label>
          <input
            type="number"
            step="0.5"
            bind:value={clearanceTime}
            min="0.5"
            max="24"
            class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#00E5FF]"
          />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            on:click={() => isPlanEvacuationModalOpen.set(false)}
            class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8BA1B8] hover:text-white transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-5 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#38BDF8] text-[#020711] font-bold transition-all shadow-[0_0_15px_rgba(0,229,255,0.4)] cursor-pointer"
          >
            Authorize Route
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
