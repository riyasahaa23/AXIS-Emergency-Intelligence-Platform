<script lang="ts">
  import {
    activeShipments,
    trackShipment,
    activeResourcesMode
  } from '../../../stores/resourceStore';
  import type { ShipmentItem, ShipmentStatus } from '../../../types/resources';

  function getStatusClasses(status: ShipmentStatus) {
    switch (status) {
      case 'IN TRANSIT':
        return 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30';
      case 'ARRIVED':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'DELAYED':
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      case 'PREPARING':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
    }
  }

  function handleTrack(shipment: ShipmentItem) {
    trackShipment(shipment.id);
    activeResourcesMode.set('overview');
  }
</script>

<div class="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 select-none custom-scrollbar">
  <!-- Pipeline Flow Visual Banner -->
  <div class="p-4 rounded-2xl bg-[#061425]/80 backdrop-blur-xl border border-white/10 shrink-0">
    <div class="text-[10px] font-mono text-[#8BA1B8] uppercase tracking-wider mb-3">
      SUPPLY CHAIN LOGISTICS PIPELINE FLOW
    </div>

    <!-- Stepper Pipeline -->
    <div class="grid grid-cols-5 gap-2 items-center text-center font-mono">
      <!-- 1. Supplier -->
      <div class="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center">
        <span class="text-xl mb-1">🏭</span>
        <span class="text-xs font-bold text-white">SUPPLIERS</span>
        <span class="text-[9px] text-[#8BA1B8]">Domestic & UN</span>
      </div>

      <div class="text-[#00E5FF] text-lg font-bold">→</div>

      <!-- 2. Depot -->
      <div class="p-3 rounded-xl bg-black/40 border border-[#00E5FF]/30 flex flex-col items-center">
        <span class="text-xl mb-1">🏢</span>
        <span class="text-xs font-bold text-[#00E5FF]">DEPOTS</span>
        <span class="text-[9px] text-[#8BA1B8]">Central Stockpiles</span>
      </div>

      <div class="text-[#00E5FF] text-lg font-bold">→</div>

      <!-- 3. Transport -->
      <div class="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center">
        <span class="text-xl mb-1">✈️</span>
        <span class="text-xs font-bold text-white">TRANSPORT</span>
        <span class="text-[9px] text-[#8BA1B8]">Air / Sea / Road</span>
      </div>
    </div>
  </div>

  <!-- Active Shipments Header -->
  <div class="flex items-center justify-between px-1">
    <h3 class="text-xs font-mono font-bold tracking-wider text-white uppercase">
      ACTIVE CONVOYS & FREIGHT MANIFESTS ({$activeShipments.length})
    </h3>
  </div>

  <!-- Shipments Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
    {#each $activeShipments as shipment (shipment.id)}
      <div class="p-4 rounded-2xl bg-[#061425]/60 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
        <div>
          <!-- Header -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF] font-mono text-xs font-bold">
                {shipment.id}
              </span>
              <span class="text-xs font-mono text-[#8BA1B8]">
                Mode: {shipment.transportMode}
              </span>
            </div>

            <span class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase {getStatusClasses(shipment.status)}">
              {shipment.status}
            </span>
          </div>

          <!-- Manifest Contents -->
          <h4 class="text-sm font-bold text-white font-mono mb-2">
            {shipment.contents} ({shipment.quantity})
          </h4>

          <!-- Origin to Destination -->
          <div class="space-y-1 text-xs font-mono mb-3 p-2.5 rounded-xl bg-black/30 border border-white/5">
            <div class="flex items-center gap-2 text-[#C5D1DE]">
              <span class="text-amber-400">Origin:</span>
              <span class="truncate">{shipment.origin}</span>
            </div>
            <div class="flex items-center gap-2 text-[#C5D1DE]">
              <span class="text-emerald-400">Destination:</span>
              <span class="truncate">{shipment.destination}</span>
            </div>
            <div class="flex justify-between text-[#8BA1B8] pt-1 border-t border-white/5">
              <span>ETA:</span>
              <span class="text-[#00E5FF] font-bold">{shipment.eta}</span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mb-3">
            <div class="flex justify-between text-[10px] font-mono text-[#8BA1B8] mb-1">
              <span>Transit Completion</span>
              <span class="text-white font-bold">{shipment.progressPct}%</span>
            </div>
            <div class="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <div
                class="h-full bg-gradient-to-r from-[#00E5FF] to-emerald-400 rounded-full"
                style="width: {shipment.progressPct}%"
              ></div>
            </div>
          </div>
        </div>

        <!-- Action Row -->
        <div class="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] font-mono">
          <span class="text-[#8BA1B8]">Carrier: {shipment.assignedVehicle || '—'}</span>
          <button
            on:click={() => handleTrack(shipment)}
            class="px-3 py-1 rounded-xl bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 text-[#00E5FF] border border-[#00E5FF]/40 font-bold transition-all cursor-pointer"
          >
            Track Route on Map →
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
