<script lang="ts">
  import {
    allResources,
    selectResource,
    isDeployModalOpen,
    isDetailModalOpen
  } from '../../../stores/resourceStore';
  import type { ResourceItem } from '../../../types/resources';

  let filterCategory: string = 'All';
  let searchTerm = '';

  $: assetsList = $allResources.filter((r) => {
    const isEquipment =
      r.category === 'Helicopters' ||
      r.category === 'Boats' ||
      r.category === 'Ground Vehicles' ||
      r.category === 'Communication Equipment' ||
      r.category === 'Search & Rescue Equipment';
    if (!isEquipment) return false;

    if (filterCategory !== 'All' && r.category !== filterCategory) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  function handleDeploy(item: ResourceItem) {
    selectResource(item.id);
    isDeployModalOpen.set(true);
  }

  function handleScheduleMaintenance(item: ResourceItem) {
    allResources.update((items) =>
      items.map((r) => (r.id === item.id ? { ...r, status: 'MAINTENANCE', condition: 'Needs Service' } : r))
    );
  }
</script>

<div class="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 select-none custom-scrollbar">
  <!-- Subview Control Bar -->
  <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#061425]/70 backdrop-blur-xl border border-white/10 shrink-0">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
        ⚙️
      </div>
      <div>
        <h2 class="text-sm font-bold font-mono text-white">ASSETS & FLEET EQUIPMENT DIRECTORY</h2>
        <p class="text-xs text-[#8BA1B8] font-sans">
          Track operating condition, fuel reserves, maintenance schedules and deployment assignments
        </p>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="flex items-center gap-2.5">
      <input
        type="text"
        bind:value={searchTerm}
        placeholder="Filter asset ID, model..."
        class="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#00E5FF]/60 w-44"
      />

      <div class="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/10">
        {#each ['All', 'Helicopters', 'Boats', 'Ground Vehicles'] as cat}
          <button
            on:click={() => filterCategory = cat}
            class="px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer {
              filterCategory === cat
                ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40'
                : 'text-[#8BA1B8] hover:text-white'
            }"
          >
            {cat}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Assets Cards Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
    {#each assetsList as asset (asset.id)}
      <div class="p-4 rounded-2xl bg-[#061425]/60 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
        <div>
          <!-- Header Row -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF] font-mono text-xs font-bold">
                {asset.id}
              </span>
              <span class="text-sm font-bold text-white font-mono truncate max-w-[160px]">
                {asset.name}
              </span>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold {
              asset.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              asset.status === 'DEPLOYED' ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30' :
              asset.status === 'EN ROUTE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-purple-500/20 text-purple-300 border border-purple-500/30'
            }">
              {asset.status}
            </span>
          </div>

          <!-- Location & Type -->
          <div class="text-xs text-[#E6EDF3] font-mono mb-2 flex items-center gap-1.5">
            <span class="text-[#00E5FF]">📍</span>
            <span>{asset.location}</span>
            <span class="text-[#8BA1B8]">({asset.type})</span>
          </div>

          <!-- Specs Badges -->
          <div class="grid grid-cols-2 gap-2 text-[10px] font-mono mb-3 p-2.5 rounded-xl bg-black/30 border border-white/5">
            <div>
              <span class="text-[#8BA1B8]">Condition:</span>
              <div class="text-emerald-400 font-bold">{asset.condition}</div>
            </div>
            <div>
              <span class="text-[#8BA1B8]">Capacity:</span>
              <div class="text-white truncate">{asset.capacity}</div>
            </div>
            <div>
              <span class="text-[#8BA1B8]">Fuel / Battery:</span>
              <div class="text-[#00E5FF] font-bold">{asset.fuelOrStockPct}%</div>
            </div>
            <div>
              <span class="text-[#8BA1B8]">Hours Run:</span>
              <div class="text-white">{asset.hoursOperated || 0} hrs</div>
            </div>
          </div>

          <!-- Fuel Progress Bar -->
          <div class="mb-3">
            <div class="flex justify-between text-[10px] font-mono text-[#8BA1B8] mb-1">
              <span>Fuel / Power Reserve</span>
              <span class="text-[#00E5FF] font-bold">{asset.fuelOrStockPct}%</span>
            </div>
            <div class="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <div
                class="h-full bg-gradient-to-r from-[#00E5FF]/70 to-[#00E5FF] rounded-full"
                style="width: {asset.fuelOrStockPct}%"
              ></div>
            </div>
          </div>
        </div>

        <!-- Action Row -->
        <div class="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 shrink-0">
          <button
            on:click={() => handleDeploy(asset)}
            class="py-1.5 px-2 rounded-xl bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/40 text-[#00E5FF] text-[10px] font-mono font-bold transition-all text-center cursor-pointer"
          >
            Deploy Asset
          </button>
          <button
            on:click={() => handleScheduleMaintenance(asset)}
            class="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-[10px] font-mono transition-all text-center cursor-pointer"
          >
            Service Unit
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
