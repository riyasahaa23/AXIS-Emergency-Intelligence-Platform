<script lang="ts">
  import {
    isSendAlertModalOpen,
    broadcastEmergencyAlert
  } from '../../../stores/responseStore';

  let title = 'CRITICAL FLASH FLOOD & SURGE EVACUATION ORDER';
  let severity = 'CRITICAL';
  let targetRegion = 'Dhaka Division & Surma Basin Riparian Sectors';
  let channels = ['Cell Broadcast (WEA)', 'Civil Defense Sirens', 'Emergency FM 102.4'];
  let instructions = 'Immediate mandatory evacuation to nearest designated multistoried relief facility. Move to upper floors immediately if evacuation routes are inundated.';

  const channelOptions = [
    'Cell Broadcast (WEA)',
    'Civil Defense Sirens',
    'Emergency FM 102.4',
    'Mobile Push Alerts',
    'VHF Maritime Channel 16'
  ];

  function toggleChannel(ch: string) {
    if (channels.includes(ch)) {
      channels = channels.filter((c) => c !== ch);
    } else {
      channels = [...channels, ch];
    }
  }

  function handleSubmit() {
    broadcastEmergencyAlert({
      title,
      channels,
      severity,
      targetRegion,
      instructions
    });
  }
</script>

{#if $isSendAlertModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
    <div class="relative w-full max-w-lg bg-[#061425] border border-[#EF4444]/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.25)] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-white/10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444] shadow-[0_0_15px_#EF4444]">
            ((•))
          </div>
          <div>
            <h2 class="text-base font-bold font-mono text-white tracking-wider">
              EMERGENCY ALERT BROADCASTER
            </h2>
            <p class="text-xs text-[#8BA1B8] font-sans">
              Issue Common Alerting Protocol (CAP) emergency warning
            </p>
          </div>
        </div>

        <button
          on:click={() => isSendAlertModalOpen.set(false)}
          class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-[#8BA1B8] hover:text-white flex items-center justify-center font-mono cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Form Inputs -->
      <form on:submit|preventDefault={handleSubmit} class="py-4 space-y-3.5 text-xs font-mono">
        <div>
          <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
            Alert Headline
          </label>
          <input
            type="text"
            bind:value={title}
            required
            class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#EF4444]"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
              Severity Level
            </label>
            <select
              bind:value={severity}
              class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#EF4444]"
            >
              <option value="CRITICAL" class="bg-[#061425] text-red-400">CRITICAL</option>
              <option value="HIGH" class="bg-[#061425] text-amber-400">HIGH</option>
              <option value="MODERATE" class="bg-[#061425] text-yellow-400">MODERATE</option>
            </select>
          </div>

          <div>
            <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
              Geographic Scope
            </label>
            <input
              type="text"
              bind:value={targetRegion}
              required
              class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#EF4444]"
            />
          </div>
        </div>

        <!-- Channels selection -->
        <div>
          <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
            Broadcast Distribution Channels
          </label>
          <div class="flex flex-wrap gap-1.5">
            {#each channelOptions as ch}
              <button
                type="button"
                on:click={() => toggleChannel(ch)}
                class="px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer {
                  channels.includes(ch)
                    ? 'bg-[#EF4444]/20 border border-[#EF4444] text-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                    : 'bg-white/5 border border-white/10 text-[#8BA1B8] hover:text-white'
                }"
              >
                {ch}
              </button>
            {/each}
          </div>
        </div>

        <div>
          <label class="block text-[#8BA1B8] mb-1.5 uppercase tracking-wider text-[10px]">
            Broadcast Message Instructions
          </label>
          <textarea
            bind:value={instructions}
            rows="3"
            required
            class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#EF4444] font-sans text-xs"
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            on:click={() => isSendAlertModalOpen.set(false)}
            class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8BA1B8] hover:text-white transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-5 py-2 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer"
          >
            Transmit Warning
          </button>
        </div>
      </form>
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
</style>
