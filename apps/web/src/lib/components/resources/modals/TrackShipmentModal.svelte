<script lang="ts">
  import {
    isTrackShipmentModalOpen,
    activeShipments,
    selectedShipmentId,
    trackShipment
  } from '../../../stores/resourceStore';
  import type { ShipmentItem } from '../../../types/resources';

  function handleFocus(s: ShipmentItem) {
    trackShipment(s.id);
    isTrackShipmentModalOpen.set(false);
  }
</script>

{#if $isTrackShipmentModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
    <div class="relative w-full max-w-xl bg-[#061425] border border-[#00E5FF]/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,229,255,0.25)] flex flex-col max-h-[85vh]">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
            🚚
          </div>
          <div>
            <h2 class="text-base font-bold font-mono text-white tracking-wider">
              IN-TRANSIT LOGISTICS TRACKER
            </h2>
            <p class="text-xs text-[#8BA1B8] font-sans">
              Monitor active convoys, cargo aircraft and maritime freight in real time
            </p>
          </div>
        </div>

        <button
          on:click={() => isTrackShipmentModalOpen.set(false)}
          class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-[#8BA1B8] hover:text-white flex items-center justify-center font-mono cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Shipment List -->
      <div class="flex-1 overflow-y-auto py-4 space-y-3 pr-1 custom-scrollbar">
        {#each $activeShipments as s (s.id)}
          <div class="p-3.5 rounded-xl border transition-all text-xs font-mono {
            $selectedShipmentId === s.id
              ? 'bg-[#091E36] border-[#00E5FF]/70 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
              : 'bg-[#061425]/60 border-white/10 hover:border-white/20'
          }">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] font-bold">
                  {s.id}
                </span>
                <span class="text-white font-bold">{s.contents}</span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[9px] font-bold {
                s.status === 'IN TRANSIT' ? 'bg-[#00E5FF]/20 text-[#00E5FF]' :
                s.status === 'ARRIVED' ? 'bg-emerald-500/20 text-emerald-400' :
                'bg-rose-500/20 text-rose-400'
              }">
                {s.status}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-[#8BA1B8] text-[11px] mb-2.5">
              <div>Origin: <span class="text-white">{s.origin}</span></div>
              <div>Destination: <span class="text-[#00E5FF]">{s.destination}</span></div>
              <div>Carrier: <span class="text-white">{s.assignedVehicle || '—'}</span></div>
              <div>ETA: <span class="text-emerald-400 font-bold">{s.eta}</span></div>
            </div>

            <!-- Progress Bar -->
            <div class="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
              <div class="flex-1">
                <div class="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div
                    class="h-full bg-gradient-to-r from-[#00E5FF] to-emerald-400 rounded-full"
                    style="width: {s.progressPct}%"
                  ></div>
                </div>
              </div>
              <button
                on:click={() => handleFocus(s)}
                class="px-2.5 py-1 rounded-lg bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 text-[#00E5FF] text-[10px] font-bold cursor-pointer"
              >
                Focus Route →
              </button>
            </div>
          </div>
        {/each}
      </div>

      <!-- Footer -->
      <div class="pt-3 border-t border-white/10 flex justify-end shrink-0">
        <button
          on:click={() => isTrackShipmentModalOpen.set(false)}
          class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8BA1B8] hover:text-white text-xs font-mono transition-all cursor-pointer"
        >
          Close
        </button>
      </div>
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
  .custom-scrollbar::-webkit-scrollbar {
    width: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.2);
    border-radius: 4px;
  }
</style>
