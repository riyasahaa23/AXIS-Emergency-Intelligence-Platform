<script lang="ts">
  import {
    selectedResource,
    selectedResourceId,
    isDeployModalOpen,
    isDetailModalOpen,
    allResources,
    resourceMetrics,
    deployResource
  } from '../../stores/resourceStore';
  import type { ResourceItem } from '../../types/resources';

  $: r = $selectedResource;

  function closePopup() {
    selectedResourceId.set(null);
  }

  function handleDeploy() {
    if (!r) return;
    deployResource(r.id, r.location, 'Emergency Response Sortie', 'CRITICAL');
  }

  function handleViewDetails() {
    isDetailModalOpen.set(true);
  }

  function handleRecall() {
    if (!r) return;
    allResources.update((items) =>
      items.map((item) =>
        item.id === r!.id
          ? { ...item, status: 'AVAILABLE', assignedTo: '—', lastUpdated: 'Just now' }
          : item
      )
    );
    resourceMetrics.update((m) => ({
      ...m,
      deployed: Math.max(0, m.deployed - 1),
      available: m.available + 1
    }));
  }

  function getResourceIcon(category: string, type: string): string {
    switch (category) {
      case 'Helicopters': return '🚁';
      case 'Boats': return '🚤';
      case 'Ground Vehicles': return '🚛';
      case 'Medical Supplies': return '✚';
      case 'Temporary Shelters': return '⛺';
      case 'Food & Water': return '🍞';
      case 'Fuel & Energy': return '⚡';
      case 'Communication Equipment': return '📡';
      case 'Search & Rescue Equipment': return '🛟';
      default:
        if (type.toLowerCase().includes('heli')) return '🚁';
        if (type.toLowerCase().includes('boat')) return '🚤';
        if (type.toLowerCase().includes('truck')) return '🚛';
        return '📦';
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'AVAILABLE':
        return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/40', dot: 'bg-emerald-400' };
      case 'DEPLOYED':
        return { bg: 'bg-[#00E5FF]/15', text: 'text-[#00E5FF]', border: 'border-[#00E5FF]/40', dot: 'bg-[#00E5FF]' };
      case 'EN ROUTE':
        return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/40', dot: 'bg-amber-400' };
      case 'MAINTENANCE':
        return { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/40', dot: 'bg-rose-400' };
      case 'REQUESTED':
        return { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/40', dot: 'bg-purple-400' };
      default:
        return { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/40', dot: 'bg-slate-400' };
    }
  }
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && closePopup()} />

{#if r}
  {@const badge = getStatusBadge(r.status)}
  {@const icon = getResourceIcon(r.category, r.type)}

  <div
    data-testid="resource-popup"
    class="inspector-card resource-detail-popup absolute top-16 left-4 z-30 w-80 p-4 rounded-2xl bg-[#061425]/95 backdrop-blur-xl border border-[#00E5FF]/50 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_20px_rgba(0,229,255,0.2)] text-xs font-mono space-y-3 select-none animate-in fade-in zoom-in-95 duration-150"
  >
    <!-- Header with Dynamic Icon, ID, Name, and Close Button -->
    <div class="flex items-start justify-between pb-2.5 border-b border-[#00E5FF]/20">
      <div class="flex items-center gap-2.5 min-w-0 pr-2">
        <div class="w-8 h-8 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 flex items-center justify-center text-sm shrink-0 shadow-[0_0_10px_rgba(0,229,255,0.25)]">
          {icon}
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-bold text-[#00E5FF] tracking-wider">{r.id}</span>
            <span class="text-white/30 text-[10px]">/</span>
            <span class="text-[10px] text-[#8BA1B8] uppercase truncate">{r.type}</span>
          </div>
          <h3 class="text-sm font-bold text-white tracking-wide truncate max-w-[190px]" title="{r.name}">
            {r.name}
          </h3>
        </div>
      </div>

      <button
        data-testid="close-popup"
        on:click|stopPropagation={closePopup}
        class="text-[#8BA1B8] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
        title="Close Resource Inspector (Esc)"
        aria-label="Close Resource Inspector"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Status & Location Row -->
    <div class="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#020914]/70 border border-white/5">
      <div class="flex items-center gap-1.5 truncate">
        <span class="text-[#00E5FF] text-xs">📍</span>
        <span class="text-[11px] text-white truncate font-medium" title="{r.location}">{r.location}</span>
      </div>

      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border shrink-0 flex items-center gap-1 {badge.bg} {badge.text} {badge.border}">
        <span class="w-1.5 h-1.5 rounded-full {badge.dot} animate-pulse"></span>
        {r.status}
      </span>
    </div>

    <!-- Adaptive Type-Specific Metric Specifications -->
    <div class="space-y-1.5 text-[11px] text-[#8BA1B8] bg-[#020914]/50 p-2.5 rounded-xl border border-white/5">
      {#if r.category === 'Helicopters'}
        <div class="flex justify-between items-center">
          <span>Personnel Capacity:</span>
          <span class="text-white font-medium">{r.capacity}</span>
        </div>
        <div class="flex justify-between items-center">
          <span>Fuel Reserve:</span>
          <span class="text-emerald-400 font-bold">{r.fuelOrStockPct}%</span>
        </div>
        <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            class="h-full {r.fuelOrStockPct < 30 ? 'bg-rose-500' : r.fuelOrStockPct < 60 ? 'bg-amber-400' : 'bg-emerald-400'}"
            style="width: {r.fuelOrStockPct}%"
          ></div>
        </div>
        <div class="flex justify-between items-center">
          <span>Assigned Operation:</span>
          <span class="text-[#00E5FF] font-medium truncate max-w-[150px]">{r.assignedTo || 'Unassigned / Sortie Ready'}</span>
        </div>
        {#if r.eta}
          <div class="flex justify-between items-center">
            <span>Readiness / ETA:</span>
            <span class="text-white font-medium">{r.eta}</span>
          </div>
        {/if}
        {#if r.depot}
          <div class="flex justify-between items-center">
            <span>Home Hangar:</span>
            <span class="text-white/80 font-medium">{r.depot}</span>
          </div>
        {/if}

      {:else if r.category === 'Boats'}
        <div class="flex justify-between items-center">
          <span>Vessel Type:</span>
          <span class="text-white font-medium">{r.type}</span>
        </div>
        <div class="flex justify-between items-center">
          <span>Passenger Capacity:</span>
          <span class="text-white font-medium">{r.capacity}</span>
        </div>
        <div class="flex justify-between items-center">
          <span>Fuel / Power:</span>
          <span class="text-emerald-400 font-bold">{r.fuelOrStockPct}%</span>
        </div>
        <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            class="h-full {r.fuelOrStockPct < 30 ? 'bg-rose-500' : r.fuelOrStockPct < 60 ? 'bg-amber-400' : 'bg-emerald-400'}"
            style="width: {r.fuelOrStockPct}%"
          ></div>
        </div>
        <div class="flex justify-between items-center">
          <span>Assigned Directive:</span>
          <span class="text-[#00E5FF] font-medium truncate max-w-[150px]">{r.assignedTo || 'Riverine Patrol Standby'}</span>
        </div>
        <div class="flex justify-between items-center">
          <span>Nautical Range:</span>
          <span class="text-white font-medium">{r.range || '45 Nautical Miles'}</span>
        </div>

      {:else if r.category === 'Ground Vehicles'}
        <div class="flex justify-between items-center">
          <span>Vehicle Type:</span>
          <span class="text-white font-medium">{r.type}</span>
        </div>
        <div class="flex justify-between items-center">
          <span>Payload / Cargo:</span>
          <span class="text-white font-medium">{r.capacity}</span>
        </div>
        <div class="flex justify-between items-center">
          <span>Fuel Level:</span>
          <span class="text-emerald-400 font-bold">{r.fuelOrStockPct}%</span>
        </div>
        <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            class="h-full {r.fuelOrStockPct < 30 ? 'bg-rose-500' : r.fuelOrStockPct < 60 ? 'bg-amber-400' : 'bg-emerald-400'}"
            style="width: {r.fuelOrStockPct}%"
          ></div>
        </div>
        <div class="flex justify-between items-center">
          <span>Convoy Assignment:</span>
          <span class="text-[#00E5FF] font-medium truncate max-w-[150px]">{r.assignedTo || 'Unassigned / Staged'}</span>
        </div>
        <div class="flex justify-between items-center">
          <span>Operating Condition:</span>
          <span class="text-white font-medium">{r.condition}</span>
        </div>

      {:else if r.category === 'Medical Supplies'}
        <div class="flex justify-between items-center">
          <span>Unit Class:</span>
          <span class="text-white font-medium">{r.type}</span>
        </div>
        <div class="flex justify-between items-center">
          <span>Treatment Capacity:</span>
          <span class="text-white font-medium">{r.beds ? r.beds + ' beds' : r.capacity}</span>
        </div>
        <div class="flex justify-between items-center">
          <span>Reserve Readiness:</span>
          <span class="text-emerald-400 font-bold">{r.fuelOrStockPct}%</span>
        </div>
        <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            class="h-full {r.fuelOrStockPct < 30 ? 'bg-rose-500' : r.fuelOrStockPct < 60 ? 'bg-amber-400' : 'bg-emerald-400'}"
            style="width: {r.fuelOrStockPct}%"
          ></div>
        </div>
        <div class="flex justify-between items-center">
          <span>Medical Supplies:</span>
          <span class="text-white font-medium truncate max-w-[150px]">{r.supplies || 'IV, Trauma Kits, Antibiotics'}</span>
        </div>
        <div class="flex justify-between items-center">
          <span>Station / Hub:</span>
          <span class="text-[#00E5FF] font-medium truncate max-w-[150px]">{r.assignedTo || 'Triage Staging'}</span>
        </div>

      {:else if r.category === 'Temporary Shelters'}
        <div class="flex justify-between items-center">
          <span>Shelter Class:</span>
          <span class="text-white font-medium">{r.type}</span>
        </div>
        <div class="flex justify-between items-center">
          <span>Shelter Capacity:</span>
          <span class="text-white font-medium">{r.capacity}</span>
        </div>
        <div class="flex justify-between items-center">
          <span>Stock Occupancy:</span>
          <span class="text-emerald-400 font-bold">{r.fuelOrStockPct}%</span>
        </div>
        <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            class="h-full {r.fuelOrStockPct < 30 ? 'bg-rose-500' : r.fuelOrStockPct < 60 ? 'bg-amber-400' : 'bg-emerald-400'}"
            style="width: {r.fuelOrStockPct}%"
          ></div>
        </div>
        <div class="flex justify-between items-center">
          <span>Operational Directive:</span>
          <span class="text-[#00E5FF] font-medium truncate max-w-[150px]">{r.assignedTo || 'Camp Staging'}</span>
        </div>

      {:else}
        <!-- Generic / Food & Water / Fuel & Energy / Comms / SAR -->
        <div class="flex justify-between items-center">
          <span>Category Type:</span>
          <span class="text-white font-medium">{r.type}</span>
        </div>
        <div class="flex justify-between items-center">
          <span>Operational Output:</span>
          <span class="text-white font-medium">{r.capacity}</span>
        </div>
        <div class="flex justify-between items-center">
          <span>Reserves / Battery:</span>
          <span class="text-emerald-400 font-bold">{r.fuelOrStockPct}%</span>
        </div>
        <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            class="h-full {r.fuelOrStockPct < 30 ? 'bg-rose-500' : r.fuelOrStockPct < 60 ? 'bg-amber-400' : 'bg-emerald-400'}"
            style="width: {r.fuelOrStockPct}%"
          ></div>
        </div>
        <div class="flex justify-between items-center">
          <span>Assigned Mission:</span>
          <span class="text-[#00E5FF] font-medium truncate max-w-[150px]">{r.assignedTo || '—'}</span>
        </div>
      {/if}

      <div class="flex justify-between items-center pt-1 border-t border-white/5 text-[10px]">
        <span>Operating Authority:</span>
        <span class="text-white/80 truncate max-w-[150px]">{r.operator || 'Planetary Emergency Services'}</span>
      </div>
      <div class="flex justify-between items-center text-[10px]">
        <span>Telemetry Updated:</span>
        <span class="text-white/60">{r.lastUpdated}</span>
      </div>
    </div>

    <!-- Interactive Action Controls (Follows Selected Resource) -->
    <div class="pt-2 flex items-center gap-2 border-t border-white/10">
      {#if r.status === 'DEPLOYED' || r.status === 'EN ROUTE'}
        <button
          on:click|stopPropagation={handleRecall}
          class="flex-1 py-2 rounded-xl bg-amber-500/20 border border-amber-500/60 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
        >
          <span>↺</span>
          <span>Recall Unit</span>
        </button>
      {:else}
        <button
          on:click|stopPropagation={handleDeploy}
          class="flex-1 py-2 rounded-xl bg-[#00E5FF]/20 border border-[#00E5FF]/60 hover:bg-[#00E5FF]/30 text-[#00E5FF] text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(0,229,255,0.25)]"
        >
          <span>🚀</span>
          <span>Deploy</span>
        </button>
      {/if}

      <button
        on:click|stopPropagation={handleViewDetails}
        class="flex-1 py-2 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 text-white text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
      >
        <span>🔍</span>
        <span>View Details</span>
      </button>
    </div>
  </div>
{/if}
