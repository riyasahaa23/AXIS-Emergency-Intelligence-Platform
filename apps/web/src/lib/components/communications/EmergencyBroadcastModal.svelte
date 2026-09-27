<script lang="ts">
  import {
    isBroadcastModalOpen,
    dispatchEmergencyBroadcast
  } from '../../stores/communicationStore';
  import type { MessageSeverity } from '../../types/communications';

  let step: 'form' | 'preview' = 'form';
  let severity: MessageSeverity = 'critical';
  let targetSector = 'Sylhet & Dhaka Lowland Basins';
  let broadcastText = 'IMMEDIATE EVACUATION ORDER: Severe flash surge breach at Surma Embankment. Move all personnel to designated shelters at high ground immediately.';

  function handlePreview() {
    if (!broadcastText.trim()) return;
    step = 'preview';
  }

  function handleDispatch() {
    dispatchEmergencyBroadcast({
      severity,
      targetSector,
      message: broadcastText
    });
    step = 'form';
  }

  function close() {
    isBroadcastModalOpen.set(false);
    step = 'form';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $isBroadcastModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none font-mono">
    <div class="relative w-full max-w-xl bg-[#061425] border border-red-500/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.25)] flex flex-col gap-4">
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 border-b border-white/10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 text-lg shadow-[0_0_15px_rgba(239,68,68,0.4)]">
            🚨
          </div>
          <div>
            <h2 class="text-sm font-bold uppercase tracking-wider text-white">EMERGENCY BROADCAST SYSTEM (EBS)</h2>
            <p class="text-xs text-[#8BA1B8] font-sans">Multi-network critical civil protection override</p>
          </div>
        </div>

        <button on:click={close} class="text-[#8BA1B8] hover:text-white p-1 text-sm cursor-pointer">
          ✕
        </button>
      </div>

      <!-- Step 1: Configuration Form -->
      {#if step === 'form'}
        <div class="space-y-3.5 text-xs">
          <!-- Severity Tier -->
          <div>
            <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
              Alert Severity Level
            </label>
            <select
              bind:value={severity}
              class="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-red-500/50"
            >
              <option value="critical">CRITICAL // IMMEDIATE CIVIL SAFETY THREAT</option>
              <option value="warning">WARNING // HAZARD ADVISORY & CONTINGENCY</option>
              <option value="info">INFO // GENERAL OPERATIONAL ADVISORY</option>
            </select>
          </div>

          <!-- Target Sector -->
          <div>
            <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
              Target Geographical Sector
            </label>
            <input
              type="text"
              bind:value={targetSector}
              class="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-red-500/50"
            />
          </div>

          <!-- Message Body -->
          <div>
            <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
              Broadcast Directive Message
            </label>
            <textarea
              bind:value={broadcastText}
              rows="3"
              class="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-red-500/50 resize-none font-sans"
            ></textarea>
          </div>

          <!-- Network Override Notice -->
          <div class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-300 space-y-1">
            <div class="font-bold flex items-center gap-1.5 text-red-400">
              ⚠️ CIVIL DEFENSE CARRIER OVERRIDE
            </div>
            <p class="font-sans leading-normal">
              This will trigger WEA (Wireless Emergency Alerts), coastal warning sirens, VHF tactical frequencies, and satellite radio transponders.
            </p>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            on:click={close}
            class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8BA1B8] hover:text-white transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Cancel
          </button>
          <button
            on:click={handlePreview}
            class="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold uppercase tracking-wider text-xs transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer"
          >
            Preview Broadcast →
          </button>
        </div>

      <!-- Step 2: Confirmation & Transmission Preview -->
      {:else}
        <div class="space-y-4 text-xs">
          <div class="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 space-y-2">
            <div class="flex items-center justify-between text-[10px] font-bold tracking-widest text-red-400 uppercase">
              <span>BROADCAST PREVIEW</span>
              <span>EST. REACH: 2.4M CITIZENS</span>
            </div>
            <p class="text-sm font-bold text-white font-sans">
              "{broadcastText}"
            </p>
            <div class="pt-2 border-t border-red-500/20 text-[10px] flex justify-between text-[#8BA1B8]">
              <span>TARGET: {targetSector}</span>
              <span>CARRIER CHANNELS: 14 NETWORKS</span>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div class="p-2 rounded-lg bg-black/40 border border-white/10">
              <div class="text-[#8BA1B8]">Siren Arrays</div>
              <div class="text-emerald-400 font-bold mt-0.5">82 Active</div>
            </div>
            <div class="p-2 rounded-lg bg-black/40 border border-white/10">
              <div class="text-[#8BA1B8]">Cell Broadcast</div>
              <div class="text-[#00E5FF] font-bold mt-0.5">Armed</div>
            </div>
            <div class="p-2 rounded-lg bg-black/40 border border-white/10">
              <div class="text-[#8BA1B8]">Satellite Uplink</div>
              <div class="text-white font-bold mt-0.5">Priority 1</div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between pt-3 border-t border-white/10">
          <button
            on:click={() => step = 'form'}
            class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#8BA1B8] hover:text-white transition-all text-xs font-bold cursor-pointer"
          >
            ← Back to Edit
          </button>

          <div class="flex items-center gap-2">
            <button
              on:click={close}
              class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#8BA1B8] hover:text-white transition-all text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              on:click={handleDispatch}
              class="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider text-xs transition-all shadow-[0_0_25px_rgba(239,68,68,0.6)] cursor-pointer"
            >
              Confirm & Dispatch Broadcast 🚨
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.97); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.15s ease-out forwards;
  }
</style>
