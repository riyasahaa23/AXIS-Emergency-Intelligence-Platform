<script lang="ts">
  import {
    shelterLocations,
    isAllocateResourceModalOpen
  } from '../../../stores/responseStore';
  import type { ShelterStatus, ShelterLocation } from '../../../types/response';

  function getStatusClasses(status: ShelterStatus) {
    switch (status) {
      case 'Accepting':
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      case 'Near Capacity':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      case 'Full':
        return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border border-slate-500/30';
    }
  }

  function admitEvacuees(shelter: ShelterLocation, count: number) {
    shelterLocations.update((list) => {
      return list.map((s) => {
        if (s.id === shelter.id) {
          const nextOcc = Math.min(s.capacity, s.currentOccupancy + count);
          const pct = Math.round((nextOcc / s.capacity) * 100);
          return {
            ...s,
            currentOccupancy: nextOcc,
            occupancyPct: pct,
            status: pct >= 95 ? 'Full' : pct >= 80 ? 'Near Capacity' : 'Accepting'
          };
        }
        return s;
      });
    });
  }
</script>

<div class="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 select-none custom-scrollbar">
  <!-- Subview Control Bar -->
  <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#061425]/70 backdrop-blur-xl border border-white/10 shrink-0">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
        ⛺
      </div>
      <div>
        <h2 class="text-sm font-bold font-mono text-white">EMERGENCY SHELTER & RELIEF HUB NETWORK</h2>
        <p class="text-xs text-[#8BA1B8] font-sans">
          Track real-time shelter bed occupancy, food/water days on hand, and power grid status
        </p>
      </div>
    </div>

    <!-- Quick Action -->
    <div class="flex items-center gap-2">
      <button
        on:click={() => isAllocateResourceModalOpen.set(true)}
        class="px-3 py-1.5 rounded-xl bg-[#00E5FF] text-[#020711] text-xs font-mono font-bold hover:bg-[#38BDF8] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.35)]"
      >
        + Dispatch Relief Convoy
      </button>
    </div>
  </div>

  <!-- Shelters Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
    {#each $shelterLocations as sh (sh.id)}
      <div class="p-4 rounded-2xl bg-[#061425]/60 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
        <div>
          <!-- Header -->
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-bold text-white font-mono">{sh.name}</h3>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase {getStatusClasses(sh.status)}">
              {sh.status}
            </span>
          </div>

          <div class="text-xs text-[#C5D1DE] font-mono mb-3 flex items-center gap-1.5">
            <span>📍</span>
            <span>{sh.location}</span>
          </div>

          <!-- Occupancy Bar -->
          <div class="mb-3">
            <div class="flex justify-between text-xs font-mono mb-1">
              <span class="text-[#8BA1B8]">Bed Occupancy:</span>
              <span class="text-white font-bold">
                {sh.currentOccupancy.toLocaleString()} / {sh.capacity.toLocaleString()} ({sh.occupancyPct}%)
              </span>
            </div>
            <div class="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <div
                class="h-full rounded-full transition-all duration-500 {
                  sh.occupancyPct >= 90
                    ? 'bg-gradient-to-r from-red-500 to-rose-400'
                    : sh.occupancyPct >= 75
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                }"
                style="width: {sh.occupancyPct}%"
              ></div>
            </div>
          </div>

          <!-- Supplies Status Strip -->
          <div class="grid grid-cols-4 gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5 font-mono text-center text-xs mb-3">
            <div>
              <div class="text-[9px] text-[#8BA1B8]">Food</div>
              <div class="font-bold text-emerald-400">{sh.foodDays} Days</div>
            </div>
            <div>
              <div class="text-[9px] text-[#8BA1B8]">Water</div>
              <div class="font-bold text-emerald-400">{sh.waterDays} Days</div>
            </div>
            <div>
              <div class="text-[9px] text-[#8BA1B8]">Medical</div>
              <div class="font-bold text-[#00E5FF]">{sh.medSuppliesPct}%</div>
            </div>
            <div>
              <div class="text-[9px] text-[#8BA1B8]">Power</div>
              <div class="font-bold {sh.powerStatus === 'Grid' ? 'text-emerald-400' : 'text-amber-400'}">
                {sh.powerStatus}
              </div>
            </div>
          </div>
        </div>

        <!-- Action Row -->
        <div class="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] font-mono">
          <span class="text-[#8BA1B8]">Admit Evacuees:</span>
          <div class="flex items-center gap-1.5">
            <button
              on:click={() => admitEvacuees(sh, 100)}
              class="px-2.5 py-1 rounded-lg bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 text-[#00E5FF] border border-[#00E5FF]/40 font-bold cursor-pointer"
            >
              +100 Persons
            </button>
            <button
              on:click={() => admitEvacuees(sh, 500)}
              class="px-2.5 py-1 rounded-lg bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 text-[#00E5FF] border border-[#00E5FF]/40 font-bold cursor-pointer"
            >
              +500 Persons
            </button>
            <button
              on:click={() => isAllocateResourceModalOpen.set(true)}
              class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/15 cursor-pointer"
            >
              Send Rations
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
