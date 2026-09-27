<script lang="ts">
  import { isRequestModalOpen, isAllocateModalOpen } from '../../../stores/resourceStore';

  interface SupplyItem {
    id: string;
    category: string;
    name: string;
    depot: string;
    currentStock: number;
    unit: string;
    reserved: number;
    inTransit: number;
    required: number;
    threshold: number;
  }

  let supplies: SupplyItem[] = [
    {
      id: 'SUP-01',
      category: 'Medical',
      name: 'IV Fluids & Cholera Rehydration Packs',
      depot: 'Dhaka Central Medical Stores',
      currentStock: 4200,
      unit: 'Liters',
      reserved: 1200,
      inTransit: 800,
      required: 6000,
      threshold: 3000
    },
    {
      id: 'SUP-02',
      category: 'Medical',
      name: 'Trauma Surgical Kits & Antiseptics',
      depot: 'Sylhet Relief Hub',
      currentStock: 350,
      unit: 'Kits',
      reserved: 180,
      inTransit: 50,
      required: 800,
      threshold: 400 // LOW STOCK
    },
    {
      id: 'SUP-03',
      category: 'Food',
      name: 'WFP High Energy Biscuits & Dry Rations',
      depot: 'Tongi Central Warehouse',
      currentStock: 45000,
      unit: 'Rations',
      reserved: 12000,
      inTransit: 8000,
      required: 50000,
      threshold: 20000
    },
    {
      id: 'SUP-04',
      category: 'Water',
      name: 'Potable Water Jerrycans (20L)',
      depot: 'Chittagong Port Supply Hub',
      currentStock: 1800,
      unit: 'Cans',
      reserved: 800,
      inTransit: 600,
      required: 4000,
      threshold: 2500 // LOW STOCK
    },
    {
      id: 'SUP-05',
      category: 'Fuel',
      name: 'Aviation Kerosene Jet A-1',
      depot: 'Tejgaon Airfield Reserve',
      currentStock: 32000,
      unit: 'Liters',
      reserved: 8000,
      inTransit: 10000,
      required: 35000,
      threshold: 15000
    },
    {
      id: 'SUP-06',
      category: 'Shelter',
      name: 'Heavy Tarpaulins & Bamboo Truss Kits',
      depot: 'Cox’s Bazar Cluster Depot',
      currentStock: 1200,
      unit: 'Packs',
      reserved: 300,
      inTransit: 400,
      required: 2000,
      threshold: 800
    }
  ];
</script>

<div class="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 select-none custom-scrollbar">
  <!-- Control Bar -->
  <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#061425]/70 backdrop-blur-xl border border-white/10 shrink-0">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
        📦
      </div>
      <div>
        <h2 class="text-sm font-bold font-mono text-white">SUPPLIES & EMERGENCY CONSUMABLES LEDGER</h2>
        <p class="text-xs text-[#8BA1B8] font-sans">
          Monitor current stock reserves, in-transit manifests, burn rates, and projected shortages
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2">
      <button
        on:click={() => isRequestModalOpen.set(true)}
        class="px-3 py-1.5 rounded-xl bg-[#00E5FF] text-[#020711] text-xs font-mono font-bold hover:bg-[#38BDF8] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.35)]"
      >
        + Requisition Stock
      </button>
    </div>
  </div>

  <!-- Supplies Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
    {#each supplies as sup (sup.id)}
      {@const isLowStock = sup.currentStock < sup.threshold}
      {@const shortage = Math.max(0, sup.required - (sup.currentStock + sup.inTransit))}
      <div class="p-4 rounded-2xl bg-[#061425]/60 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between {
        isLowStock ? 'ring-1 ring-amber-500/30 bg-[#1c1308]/40' : ''
      }">
        <div>
          <!-- Header -->
          <div class="flex items-center justify-between mb-2">
            <div>
              <span class="text-[10px] font-mono text-[#00E5FF] uppercase font-bold tracking-wider">
                {sup.category} // {sup.id}
              </span>
              <h3 class="text-sm font-bold text-white font-mono">{sup.name}</h3>
              <span class="text-[11px] text-[#8BA1B8] font-sans">{sup.depot}</span>
            </div>

            {#if isLowStock}
              <span class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                LOW STOCK ALERT
              </span>
            {:else}
              <span class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                SUFFICIENT
              </span>
            {/if}
          </div>

          <!-- Stock Numbers Grid -->
          <div class="grid grid-cols-5 gap-1.5 p-2 rounded-xl bg-black/30 border border-white/5 font-mono text-center text-xs mb-3">
            <div>
              <div class="text-[9px] text-[#8BA1B8]">Current</div>
              <div class="font-bold text-white">{sup.currentStock.toLocaleString()}</div>
            </div>
            <div>
              <div class="text-[9px] text-[#8BA1B8]">Reserved</div>
              <div class="font-bold text-amber-400">{sup.reserved.toLocaleString()}</div>
            </div>
            <div>
              <div class="text-[9px] text-[#8BA1B8]">In Transit</div>
              <div class="font-bold text-[#00E5FF]">{sup.inTransit.toLocaleString()}</div>
            </div>
            <div>
              <div class="text-[9px] text-[#8BA1B8]">Required</div>
              <div class="font-bold text-white">{sup.required.toLocaleString()}</div>
            </div>
            <div>
              <div class="text-[9px] text-[#8BA1B8]">Shortage</div>
              <div class="font-bold {shortage > 0 ? 'text-red-400' : 'text-emerald-400'}">
                {shortage > 0 ? `-${shortage.toLocaleString()}` : '0'}
              </div>
            </div>
          </div>
        </div>

        <!-- Action Row -->
        <div class="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] font-mono">
          <span class="text-[#8BA1B8]">Unit: {sup.unit}</span>
          <div class="flex items-center gap-1.5">
            <button
              on:click={() => isAllocateModalOpen.set(true)}
              class="px-2.5 py-1 rounded-lg bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 text-[#00E5FF] border border-[#00E5FF]/40 font-bold cursor-pointer"
            >
              Allocate
            </button>
            <button
              on:click={() => isRequestModalOpen.set(true)}
              class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/15 cursor-pointer"
            >
              Reorder
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
