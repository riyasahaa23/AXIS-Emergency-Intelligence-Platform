<script lang="ts">
  import {
    isDeployTeamModalOpen,
    responseTeams,
    deployTeam
  } from '../../../stores/responseStore';

  let selectedCode = 'R-01';
  let destination = 'Dhaka North Riverfront Enclave';
  let mission = 'Immediate evacuation of flooded lowland communities and distribution of emergency rafts';
  let vehicle = '4x Zodiac Inflatables + 2x Amphibious Trucks';
  let personnel = 48;

  function handleSubmit() {
    deployTeam({
      teamCode: selectedCode,
      destination,
      mission,
      vehicle,
      personnel
    });
  }
</script>

{#if $isDeployTeamModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
    <div class="relative w-full max-w-lg bg-[#061425] border border-[#00E5FF]/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,229,255,0.25)] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-white/10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
            👥
          </div>
          <div>
            <h2 class="text-base font-bold font-mono text-white tracking-wider">
              DISPATCH RESPONSE TEAM
            </h2>
            <p class="text-xs text-[#8BA1B8] font-sans">
              Assign field units to active disaster operational sectors
            </p>
          </div>
        </div>

        <button
          on:click={() => isDeployTeamModalOpen.set(false)}
          class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-[#8BA1B8] hover:text-white flex items-center justify-center font-mono cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Form Inputs -->
      <form on:submit|preventDefault={handleSubmit} class="py-4 space-y-3.5 text-xs font-mono">
        <!-- Team Selection -->
        <div>
          <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
            Select Field Unit
          </label>
          <select
            bind:value={selectedCode}
            class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#00E5FF]"
          >
            {#each $responseTeams as team}
              <option value={team.code} class="bg-[#061425] text-white">
                {team.code} — {team.name} ({team.status})
              </option>
            {/each}
          </select>
        </div>

        <!-- Target Destination -->
        <div>
          <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
            Operational Destination / Sector
          </label>
          <input
            type="text"
            bind:value={destination}
            required
            class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#00E5FF]"
          />
        </div>

        <!-- Mission Objective -->
        <div>
          <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
            Mission Directives
          </label>
          <textarea
            bind:value={mission}
            rows="3"
            required
            class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#00E5FF] font-sans text-xs"
          ></textarea>
        </div>

        <!-- Vehicle Asset & Personnel Grid -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
              Assigned Vehicle
            </label>
            <input
              type="text"
              bind:value={vehicle}
              class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#00E5FF]"
            />
          </div>

          <div>
            <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
              Personnel Count
            </label>
            <input
              type="number"
              bind:value={personnel}
              min="1"
              max="200"
              class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#00E5FF]"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            on:click={() => isDeployTeamModalOpen.set(false)}
            class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8BA1B8] hover:text-white transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-5 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#38BDF8] text-[#020711] font-bold transition-all shadow-[0_0_15px_rgba(0,229,255,0.4)] cursor-pointer"
          >
            Confirm & Dispatch
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
