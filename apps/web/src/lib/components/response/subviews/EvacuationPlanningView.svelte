<script lang="ts">
  import {
    evacuationRoutes,
    isPlanEvacuationModalOpen,
    isSendAlertModalOpen
  } from '../../../stores/responseStore';
  import type { RouteStatus } from '../../../types/response';

  function getStatusClasses(status: RouteStatus) {
    switch (status) {
      case 'Clear':
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      case 'Congested':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      case 'Flooded':
        return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
      default:
        return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
    }
  }
</script>

<div class="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 select-none custom-scrollbar">
  <!-- Subview Control Bar -->
  <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#061425]/70 backdrop-blur-xl border border-white/10 shrink-0">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
        ↗
      </div>
      <div>
        <h2 class="text-sm font-bold font-mono text-white">CIVILIAN EVACUATION CORRIDOR PLANNER</h2>
        <p class="text-xs text-[#8BA1B8] font-sans">
          Monitor arterial corridors, bottleneck choke points, and clearance transit times
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2">
      <button
        on:click={() => isSendAlertModalOpen.set(true)}
        class="px-3 py-1.5 rounded-xl bg-[#EF4444]/20 hover:bg-[#EF4444]/30 border border-[#EF4444]/50 text-[#EF4444] text-xs font-mono font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.25)]"
      >
        ⚠ Broadcast Evacuation Order
      </button>

      <button
        on:click={() => isPlanEvacuationModalOpen.set(true)}
        class="px-3 py-1.5 rounded-xl bg-[#00E5FF] text-[#020711] text-xs font-mono font-bold hover:bg-[#38BDF8] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.35)]"
      >
        + Designate Corridor
      </button>
    </div>
  </div>

  <!-- Routes List -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
    {#each $evacuationRoutes as route (route.id)}
      <div class="p-4 rounded-2xl bg-[#061425]/60 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
        <div>
          <!-- Header -->
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-bold text-white font-mono">{route.name}</h3>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase {getStatusClasses(route.status)}">
              {route.status}
            </span>
          </div>

          <!-- Origin & Destination -->
          <div class="space-y-1.5 text-xs font-mono mb-3">
            <div class="flex items-center gap-2 text-[#C5D1DE]">
              <span class="text-rose-400">🔴 Origin:</span>
              <span class="truncate">{route.origin}</span>
            </div>
            <div class="flex items-center gap-2 text-[#C5D1DE]">
              <span class="text-emerald-400">🟢 Destination:</span>
              <span class="truncate">{route.destination}</span>
            </div>
          </div>

          <!-- Bottleneck Warning -->
          {#if route.bottleneckWarning}
            <div class="p-2.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#F87171] text-[11px] font-mono mb-3 flex items-start gap-2">
              <span class="text-sm shrink-0">⚠️</span>
              <div>{route.bottleneckWarning}</div>
            </div>
          {/if}

          <!-- Telemetry Badges -->
          <div class="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5 font-mono text-center mb-3">
            <div>
              <div class="text-[10px] text-[#8BA1B8]">Est. Clearance Time</div>
              <div class="text-sm font-bold text-white">{route.clearanceTimeHours} Hours</div>
            </div>
            <div>
              <div class="text-[10px] text-[#8BA1B8]">Throughput</div>
              <div class="text-sm font-bold text-[#00E5FF]">{route.evacueesCount}</div>
            </div>
          </div>
        </div>

        <!-- Quick Action -->
        <div class="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] font-mono">
          <span class="text-[#8BA1B8]">Traffic Control:</span>
          <div class="flex items-center gap-1.5">
            <button
              on:click={() => {
                route.status = route.status === 'Clear' ? 'Congested' : 'Clear';
              }}
              class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 cursor-pointer"
            >
              Toggle Status ({route.status})
            </button>
            <button
              on:click={() => isSendAlertModalOpen.set(true)}
              class="px-2.5 py-1 rounded-lg bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 text-[#00E5FF] border border-[#00E5FF]/40 font-bold cursor-pointer"
            >
              Send Route Alert
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
