<script lang="ts">
  import {
    allResources,
    selectedResourceId,
    selectedResourceCategory,
    selectResource,
    inventorySearchQuery,
    inventoryTypeFilter,
    inventoryStatusFilter,
    inventoryLocationFilter,
    isDeployModalOpen,
    isAllocateModalOpen,
    isDetailModalOpen,
    resourceMapFocus
  } from '../../stores/resourceStore';
  import type { ResourceItem, ResourceStatus } from '../../types/resources';

  const typeOptions = [
    'All Types',
    'Helicopter',
    'Rescue Boat',
    'Supply Truck',
    'Amphibious APC',
    'Mobile Medical Unit',
    'Water Purification Unit',
    'Shelter Tent Pods',
    'Mobile Diesel Generator',
    'Satellite Uplink Pod',
    'Thermal Drone Recon Squad'
  ];

  const statusOptions: Array<'All Status' | ResourceStatus> = [
    'All Status',
    'AVAILABLE',
    'DEPLOYED',
    'EN ROUTE',
    'MAINTENANCE',
    'REQUESTED',
    'UNAVAILABLE'
  ];

  const locationOptions = [
    'All Locations',
    'Dhaka Air Base',
    'Dhaka Central Depot',
    'Chittagong Base',
    'Sylhet Air Base',
    'Sylhet Relief Hub',
    'Barisal Naval Pier',
    'Rajshahi Depot',
    'Cox’s Bazar Depot',
    'Mymensingh Field Center'
  ];

  $: filteredInventory = $allResources.filter((item) => {
    // 1. Category Filter from left panel
    if ($selectedResourceCategory !== 'All Resources' && item.category !== $selectedResourceCategory) {
      return false;
    }

    // 2. Type Filter
    if ($inventoryTypeFilter !== 'All Types' && !item.type.includes($inventoryTypeFilter)) {
      return false;
    }

    // 3. Status Filter
    if ($inventoryStatusFilter !== 'All Status' && item.status !== $inventoryStatusFilter) {
      return false;
    }

    // 4. Location Filter
    if ($inventoryLocationFilter !== 'All Locations' && !item.location.includes($inventoryLocationFilter)) {
      return false;
    }

    // 5. Search Query
    if ($inventorySearchQuery.trim()) {
      const q = $inventorySearchQuery.toLowerCase();
      const match =
        item.id.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        item.assignedTo.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  function getStatusClasses(status: ResourceStatus) {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      case 'DEPLOYED':
        return 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30';
      case 'EN ROUTE':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      case 'MAINTENANCE':
        return 'bg-purple-500/15 text-purple-400 border border-purple-500/30';
      case 'REQUESTED':
        return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border border-slate-500/30';
    }
  }

  function handleAction(item: ResourceItem, action: string) {
    selectResource(item.id);
    if (action === 'DEPLOY') {
      isDeployModalOpen.set(true);
    } else if (action === 'TRACK') {
      resourceMapFocus.set({
        center: item.coords,
        zoom: 1.45,
        highlightId: item.id
      });
    } else if (action === 'VIEW') {
      isDetailModalOpen.set(true);
    } else if (action === 'ALLOCATE') {
      isAllocateModalOpen.set(true);
    }
  }
</script>

<div class="flex flex-col h-full bg-[#061425]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 select-none overflow-hidden">
  <!-- Table Header & Controls Bar -->
  <div class="flex flex-wrap items-center justify-between gap-3 pb-3 mb-2 border-b border-white/10 shrink-0">
    <div class="flex items-center gap-2">
      <div class="w-3.5 h-3.5 rounded-full border border-[#00E5FF] flex items-center justify-center">
        <span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></span>
      </div>
      <h3 class="text-xs font-mono font-bold tracking-wider text-white uppercase">
        RESOURCE INVENTORY
      </h3>
      <span class="text-[10px] font-mono text-[#8BA1B8] bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
        {filteredInventory.length} Assets Found
      </span>
    </div>

    <!-- Search & Filters -->
    <div class="flex flex-wrap items-center gap-2">
      <!-- Search Input -->
      <div class="relative">
        <input
          type="text"
          bind:value={$inventorySearchQuery}
          placeholder="Search resources, ID, name, location..."
          class="px-3 py-1.5 pl-8 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#00E5FF]/60 w-56"
        />
        <svg class="w-3.5 h-3.5 text-[#8BA1B8] absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <!-- Type Filter Dropdown -->
      <select
        bind:value={$inventoryTypeFilter}
        class="px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-[#8BA1B8] hover:text-white focus:outline-none focus:border-[#00E5FF]/60 cursor-pointer"
      >
        {#each typeOptions as opt}
          <option value={opt} class="bg-[#061425] text-white">{opt}</option>
        {/each}
      </select>

      <!-- Status Filter Dropdown -->
      <select
        bind:value={$inventoryStatusFilter}
        class="px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-[#8BA1B8] hover:text-white focus:outline-none focus:border-[#00E5FF]/60 cursor-pointer"
      >
        {#each statusOptions as opt}
          <option value={opt} class="bg-[#061425] text-white">{opt}</option>
        {/each}
      </select>

      <!-- Location Filter Dropdown -->
      <select
        bind:value={$inventoryLocationFilter}
        class="px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-[#8BA1B8] hover:text-white focus:outline-none focus:border-[#00E5FF]/60 cursor-pointer"
      >
        {#each locationOptions as opt}
          <option value={opt} class="bg-[#061425] text-white">{opt}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Table Column Header -->
  <div class="grid grid-cols-12 gap-2 text-[10px] font-mono text-[#8BA1B8] uppercase px-2 py-1.5 border-b border-white/5 shrink-0">
    <div class="col-span-1">ID</div>
    <div class="col-span-2">TYPE</div>
    <div class="col-span-2">NAME</div>
    <div class="col-span-2">LOCATION</div>
    <div class="col-span-2 text-center">STATUS</div>
    <div class="col-span-1">CAPACITY</div>
    <div class="col-span-1">ASSIGNED</div>
    <div class="col-span-1 text-right">ACTION</div>
  </div>

  <!-- Table Body Rows -->
  <div class="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
    {#if filteredInventory.length === 0}
      <div class="py-8 text-center text-xs font-mono text-[#8BA1B8]">
        No resources match the current filters.
      </div>
    {:else}
      {#each filteredInventory as item (item.id)}
        <div
          data-resource-id={item.id}
          on:click={() => selectResource(item.id)}
          on:keydown={(e) => e.key === 'Enter' && selectResource(item.id)}
          tabindex="0"
          role="button"
          class="grid grid-cols-12 gap-2 items-center px-2 py-2 rounded-xl border text-xs font-mono transition-all cursor-pointer {
            $selectedResourceId === item.id
              ? 'bg-[#091E36] border-[#00E5FF]/70 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
              : 'bg-[#061425]/40 border-white/5 hover:border-white/20 hover:bg-[#061425]/80'
          }"
        >
          <!-- ID -->
          <div class="col-span-1 font-bold text-white">
            {item.id}
          </div>

          <!-- Type -->
          <div class="col-span-2 text-[#C5D1DE] text-[11px] truncate" title={item.type}>
            {item.type}
          </div>

          <!-- Name -->
          <div class="col-span-2 text-white font-medium truncate" title={item.name}>
            {item.name}
          </div>

          <!-- Location -->
          <div class="col-span-2 text-[#8BA1B8] text-[11px] truncate" title={item.location}>
            {item.location}
          </div>

          <!-- Status Badge -->
          <div class="col-span-2 flex justify-center">
            <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold tracking-wide {getStatusClasses(item.status)}">
              {item.status}
            </span>
          </div>

          <!-- Capacity -->
          <div class="col-span-1 text-[#8BA1B8] text-[10px] truncate" title={item.capacity}>
            {item.capacity}
          </div>

          <!-- Assigned To -->
          <div class="col-span-1 text-[#C5D1DE] text-[10px] truncate" title={item.assignedTo}>
            {item.assignedTo}
          </div>

          <!-- Action Button Matching Requirements -->
          <div class="col-span-1 flex justify-end">
            {#if item.status === 'AVAILABLE'}
              <button
                on:click|stopPropagation={() => handleAction(item, 'DEPLOY')}
                class="px-2 py-1 rounded-lg bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 border border-[#00E5FF]/40 text-[#00E5FF] text-[9px] font-mono font-bold transition-all cursor-pointer"
              >
                DEPLOY
              </button>
            {:else if item.status === 'DEPLOYED' || item.status === 'EN ROUTE'}
              <button
                on:click|stopPropagation={() => handleAction(item, 'TRACK')}
                class="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white text-[9px] font-mono font-bold transition-all cursor-pointer"
              >
                TRACK
              </button>
            {:else if item.status === 'MAINTENANCE'}
              <button
                on:click|stopPropagation={() => handleAction(item, 'VIEW')}
                class="px-2 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-[9px] font-mono font-bold transition-all cursor-pointer"
              >
                VIEW
              </button>
            {:else if item.status === 'REQUESTED'}
              <button
                on:click|stopPropagation={() => handleAction(item, 'ALLOCATE')}
                class="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[9px] font-mono font-bold transition-all cursor-pointer"
              >
                ALLOCATE
              </button>
            {:else}
              <button
                on:click|stopPropagation={() => handleAction(item, 'VIEW')}
                class="px-2 py-1 rounded-lg bg-white/5 text-[#8BA1B8] text-[9px] font-mono cursor-pointer"
              >
                VIEW
              </button>
            {/if}
          </div>
        </div>
      {/each}
    {/if}
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
