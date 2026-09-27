<script lang="ts">
  import {
    allFacilities,
    activeResourcesMode,
    resourceMapFocus
  } from '../../../stores/resourceStore';
  import type { FacilityItem } from '../../../types/resources';

  function focusFacilityOnMap(fac: FacilityItem) {
    activeResourcesMode.set('overview');
    resourceMapFocus.set({
      center: fac.coords,
      zoom: 1.45,
      highlightId: fac.id
    });
  }
</script>

<div class="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 select-none custom-scrollbar">
  <!-- Control Bar -->
  <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#061425]/70 backdrop-blur-xl border border-white/10 shrink-0">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-xl bg-[#06B6D4]/15 border border-[#06B6D4]/30 flex items-center justify-center text-[#06B6D4]">
        🏭
      </div>
      <div>
        <h2 class="text-sm font-bold font-mono text-white">STRATEGIC DISASTER LOGISTICS FACILITIES</h2>
        <p class="text-xs text-[#8BA1B8] font-sans">
          Monitor regional supply depots, sea ports, military airheads, and emergency trauma hubs
        </p>
      </div>
    </div>
  </div>

  <!-- Facilities Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
    {#each $allFacilities as fac (fac.id)}
      <div class="p-4 rounded-2xl bg-[#061425]/60 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
        <div>
          <!-- Header -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="text-xl">
                {#if fac.type === 'Air Base'}
                  🛫
                {:else if fac.type === 'Port'}
                  ⚓
                {:else if fac.type === 'Hospital'}
                  🏥
                {:else}
                  🏭
                {/if}
              </span>
              <div>
                <h3 class="text-sm font-bold text-white font-mono">{fac.name}</h3>
                <div class="text-[11px] text-[#8BA1B8] font-sans">{fac.location} ({fac.type})</div>
              </div>
            </div>

            <span class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase {
              fac.status === 'OPERATIONAL'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }">
              {fac.status}
            </span>
          </div>

          <!-- Capacity Bar -->
          <div class="mb-3">
            <div class="flex justify-between text-xs font-mono mb-1">
              <span class="text-[#8BA1B8]">Depot Utilization:</span>
              <span class="text-white font-bold">{fac.capacityPct}%</span>
            </div>
            <div class="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <div
                class="h-full rounded-full {
                  fac.capacityPct > 90 ? 'bg-gradient-to-r from-red-500 to-rose-400' :
                  fac.capacityPct > 75 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                  'bg-gradient-to-r from-[#00E5FF] to-emerald-400'
                }"
                style="width: {fac.capacityPct}%"
              ></div>
            </div>
          </div>

          <!-- Details & Alerts -->
          <div class="space-y-1.5 p-2.5 rounded-xl bg-black/30 border border-white/5 font-mono text-xs mb-3">
            <div class="flex justify-between text-[#8BA1B8]">
              <span>Stored Supplies:</span>
              <span class="text-white truncate max-w-[200px]">{fac.currentStock}</span>
            </div>
            <div class="flex justify-between text-[#8BA1B8]">
              <span>Incoming Manifests:</span>
              <span class="text-emerald-400 font-bold">{fac.incomingShipments} Transits</span>
            </div>
            <div class="flex justify-between text-[#8BA1B8]">
              <span>Outgoing Dispatches:</span>
              <span class="text-[#00E5FF] font-bold">{fac.outgoingShipments} Convoys</span>
            </div>
            {#if fac.alerts}
              <div class="text-[10px] text-amber-300 pt-1 border-t border-white/5">
                ⚠️ {fac.alerts}
              </div>
            {/if}
          </div>
        </div>

        <!-- Action Row -->
        <div class="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] font-mono">
          <span class="text-[#8BA1B8]">GPS: {fac.coords[1]}°N, {fac.coords[0]}°E</span>
          <button
            on:click={() => focusFacilityOnMap(fac)}
            class="px-3 py-1 rounded-xl bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 text-[#00E5FF] border border-[#00E5FF]/40 font-bold transition-all cursor-pointer"
          >
            Locate on Map →
          </button>
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
