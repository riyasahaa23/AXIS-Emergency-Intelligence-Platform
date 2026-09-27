<script lang="ts">
  import {
    isDetailModalOpen,
    isDeployModalOpen,
    selectedResource,
    allResources,
    resourceMetrics
  } from '$lib/stores/resourceStore';

  $: item = $selectedResource;

  function close() {
    isDetailModalOpen.set(false);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }

  function openDeploy() {
    isDetailModalOpen.set(false);
    isDeployModalOpen.set(true);
  }

  function toggleMaintenance() {
    if (!item) return;
    const isMaint = item.status === 'MAINTENANCE';
    const nextStatus = isMaint ? 'AVAILABLE' : 'MAINTENANCE';

    allResources.update((list) =>
      list.map((r) => (r.id === item.id ? { ...r, status: nextStatus, lastUpdated: 'Just now' } : r))
    );

    resourceMetrics.update((m) => ({
      ...m,
      inMaintenance: isMaint ? Math.max(0, m.inMaintenance - 1) : m.inMaintenance + 1,
      available: isMaint ? m.available + 1 : Math.max(0, m.available - 1)
    }));
  }

  function recallAsset() {
    if (!item) return;
    allResources.update((list) =>
      list.map((r) =>
        r.id === item.id
          ? { ...r, status: 'AVAILABLE', assignedTo: undefined, lastUpdated: 'Just now' }
          : r
      )
    );

    resourceMetrics.update((m) => ({
      ...m,
      deployed: Math.max(0, m.deployed - 1),
      available: m.available + 1
    }));
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $isDetailModalOpen && item}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
    <div
      class="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg border border-cyan-500/40 bg-[#060c14] shadow-2xl shadow-cyan-950/40 text-slate-100 overflow-hidden font-mono"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-cyan-900/40 bg-cyan-950/20">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded border border-cyan-400/40 bg-cyan-950/60 flex items-center justify-center text-cyan-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-cyan-400">{item.id}</span>
              <span class="text-slate-500">//</span>
              <h2 class="text-sm font-bold tracking-wider text-slate-100">{item.name}</h2>
            </div>
            <p class="text-[11px] text-slate-400">
              Category: <span class="text-cyan-300">{item.category}</span> ({item.subtype})
            </p>
          </div>
        </div>

        <button
          on:click={close}
          class="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          title="Close modal"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Scrollable Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6 text-xs custom-scrollbar">
        <!-- Status & Readiness Banner -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3 rounded border border-slate-800 bg-[#070e17]">
            <div class="text-[10px] text-slate-400 uppercase tracking-wider">Status</div>
            <div class="mt-1">
              <span
                class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border {item.status === 'AVAILABLE'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : item.status === 'DEPLOYED' || item.status === 'EN ROUTE'
                  ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                  : 'border-rose-500/40 bg-rose-500/10 text-rose-300'}"
              >
                {item.status}
              </span>
            </div>
          </div>

          <div class="p-3 rounded border border-slate-800 bg-[#070e17]">
            <div class="text-[10px] text-slate-400 uppercase tracking-wider">Condition</div>
            <div class="text-xs font-bold text-slate-200 mt-1 capitalize">{item.condition}</div>
          </div>

          <div class="p-3 rounded border border-slate-800 bg-[#070e17]">
            <div class="text-[10px] text-slate-400 uppercase tracking-wider">Fuel / Battery</div>
            <div class="flex items-center gap-2 mt-1">
              <div class="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300 {item.fuelBattery && item.fuelBattery > 40 ? 'bg-emerald-500' : 'bg-amber-500'}"
                  style="width: {item.fuelBattery ?? 100}%"
                ></div>
              </div>
              <span class="text-xs font-bold text-cyan-300">{item.fuelBattery ?? 100}%</span>
            </div>
          </div>

          <div class="p-3 rounded border border-slate-800 bg-[#070e17]">
            <div class="text-[10px] text-slate-400 uppercase tracking-wider">Base Station</div>
            <div class="text-xs font-bold text-slate-200 mt-1 truncate">{item.location}</div>
          </div>
        </div>

        <!-- Specifications Matrix -->
        <div class="rounded border border-slate-800 bg-[#070e17] p-4 space-y-3">
          <div class="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            Technical Specifications
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
            <div>
              <span class="text-slate-400">Assigned Unit:</span>
              <div class="font-bold text-white mt-0.5">{item.assignedTo || 'Unassigned / Standby'}</div>
            </div>
            <div>
              <span class="text-slate-400">Payload / Capacity:</span>
              <div class="font-bold text-white mt-0.5">{item.capacity || 'Standard Operational'}</div>
            </div>
            <div>
              <span class="text-slate-400">Effective Range:</span>
              <div class="font-bold text-white mt-0.5">{item.range || '550 km'}</div>
            </div>
            <div>
              <span class="text-slate-400">Current GPS Coords:</span>
              <div class="font-bold text-cyan-300 mt-0.5">{item.coords[1].toFixed(4)}°N, {item.coords[0].toFixed(4)}°E</div>
            </div>
            <div>
              <span class="text-slate-400">Crew / Operator:</span>
              <div class="font-bold text-white mt-0.5">{item.operator || 'JARVIS Autonomous Support'}</div>
            </div>
            <div>
              <span class="text-slate-400">Telemetry Last Ping:</span>
              <div class="font-bold text-emerald-400 mt-0.5">{item.lastUpdated}</div>
            </div>
          </div>
        </div>

        <!-- Service & Maintenance Log -->
        <div class="rounded border border-slate-800 bg-[#070e17] p-4 space-y-2">
          <div class="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            Asset Maintenance & Telemetry Record
          </div>

          <div class="space-y-2 text-[11px]">
            <div class="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
              <span class="text-slate-300">Pre-flight system integrity check passed</span>
              <span class="text-[10px] text-slate-500">Today, 06:00 UTC</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
              <span class="text-slate-300">Navigation calibration & satellite telemetry link validated</span>
              <span class="text-[10px] text-slate-500">Yesterday, 18:40 UTC</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
              <span class="text-slate-300">Scheduled 100-hour airframe inspection completed</span>
              <span class="text-[10px] text-slate-500">3 days ago</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex items-center justify-between px-6 py-4 border-t border-cyan-900/40 bg-slate-950/60">
        <button
          type="button"
          on:click={close}
          class="px-4 py-2 rounded text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          Close
        </button>

        <div class="flex items-center gap-2.5">
          {#if item.status === 'DEPLOYED' || item.status === 'EN ROUTE'}
            <button
              type="button"
              on:click={recallAsset}
              class="px-4 py-2 rounded text-xs font-bold uppercase tracking-wider border border-amber-500/50 bg-amber-500/20 text-amber-200 hover:bg-amber-500 hover:text-slate-950 transition-colors"
            >
              Recall Asset
            </button>
          {:else}
            <button
              type="button"
              on:click={toggleMaintenance}
              class="px-4 py-2 rounded text-xs font-bold uppercase tracking-wider border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              {item.status === 'MAINTENANCE' ? 'Mark Available' : 'Schedule Maintenance'}
            </button>
            <button
              type="button"
              on:click={openDeploy}
              class="px-4 py-2 rounded text-xs font-bold uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>Deploy Now</span>
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.6);
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(6, 182, 212, 0.25);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(6, 182, 212, 0.5);
  }
</style>
