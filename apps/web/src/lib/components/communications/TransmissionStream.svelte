<script lang="ts">
  import {
    filteredCommunicationMessages,
    communicationSearchQuery,
    activeMessageSeverityFilter,
    activeCommunicationChannel,
    sendMessage,
    acknowledgeMessage,
    toggleMessageRead,
    focusCommunicationNode
  } from '../../stores/communicationStore';
  import type { MessageSeverity } from '../../types/communications';

  let inputMessage = '';
  let selectedSeverity: MessageSeverity = 'routine';

  const filterTabs: Array<'ALL' | MessageSeverity> = ['ALL', 'critical', 'warning', 'info', 'routine'];

  function handleSend() {
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage, selectedSeverity);
    inputMessage = '';
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function getSeverityBadge(sev: MessageSeverity) {
    switch (sev) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'warning': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'info': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  }
</script>

<div class="flex flex-col h-full bg-[#061425]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 font-mono select-none overflow-hidden">
  <!-- Header & Search Controls -->
  <div class="pb-3 mb-2.5 border-b border-white/10 shrink-0 space-y-2.5">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-base">📡</span>
        <h2 class="text-xs font-bold uppercase tracking-wider text-white">LIVE TRANSMISSION FEED</h2>
        <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40">
          {$activeCommunicationChannel.name}
        </span>
      </div>
      <span class="text-[10px] text-[#8BA1B8]">{$filteredCommunicationMessages.length} transmissions</span>
    </div>

    <!-- Search Input & Severity Filter Bar -->
    <div class="flex flex-col sm:flex-row gap-2">
      <div class="relative flex-1">
        <input
          type="text"
          bind:value={$communicationSearchQuery}
          placeholder="Search by sender, callsign, keyword..."
          class="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-[#8BA1B8]/60 focus:outline-none focus:border-[#00E5FF]/50"
        />
        {#if $communicationSearchQuery}
          <button
            on:click={() => communicationSearchQuery.set('')}
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8BA1B8] hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        {/if}
      </div>

      <!-- Severity Filter Buttons -->
      <div class="flex items-center gap-1 bg-black/40 p-0.5 rounded-xl border border-white/10 shrink-0 overflow-x-auto">
        {#each filterTabs as tab}
          <button
            on:click={() => activeMessageSeverityFilter.set(tab)}
            class="px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer {
              $activeMessageSeverityFilter === tab
                ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40'
                : 'text-[#8BA1B8] hover:text-white border border-transparent'
            }"
          >
            {tab}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Messages Scroll Area -->
  <div class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
    {#if $filteredCommunicationMessages.length === 0}
      <div class="flex flex-col items-center justify-center h-40 text-center text-[#8BA1B8] text-xs">
        <span class="text-2xl mb-1">📭</span>
        <p>No transmissions match the current channel or search query</p>
      </div>
    {:else}
      {#each $filteredCommunicationMessages as msg (msg.id)}
        <div
          class="p-3 rounded-xl border transition-all flex flex-col gap-2 {
            msg.unread
              ? 'bg-[#00E5FF]/10 border-[#00E5FF]/40 shadow-[0_0_12px_rgba(0,229,255,0.1)]'
              : 'bg-black/30 border-white/5 hover:border-white/15'
          }"
        >
          <!-- Message Top Metadata -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-white tracking-wide">{msg.senderName}</span>
                <span class="text-[9px] text-[#8BA1B8]">({msg.senderRole})</span>
                {#if msg.unread}
                  <span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse"></span>
                {/if}
              </div>
              <span class="text-[10px] text-[#00E5FF] mt-0.5">📍 {msg.senderLocation}</span>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <span class="px-1.5 py-0.2 rounded text-[8px] font-bold uppercase border {getSeverityBadge(msg.severity)}">
                {msg.severity}
              </span>
              <span class="text-[9px] text-[#8BA1B8]">{msg.timestamp}</span>
            </div>
          </div>

          <!-- Message Body Text -->
          <p class="text-xs text-slate-200 font-sans leading-relaxed">
            {msg.content}
          </p>

          <!-- Interactive Message Actions -->
          <div class="flex items-center justify-between pt-2 border-t border-white/5 text-[10px]">
            <div class="flex items-center gap-2">
              {#if !msg.acknowledged}
                <button
                  on:click={() => acknowledgeMessage(msg.id)}
                  class="px-2.5 py-0.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/40 text-[9px] font-bold tracking-wider transition-all cursor-pointer"
                >
                  ✓ ACKNOWLEDGE
                </button>
              {:else}
                <span class="text-emerald-400 text-[9px] flex items-center gap-1 font-bold">
                  ✓ ACKNOWLEDGED
                </span>
              {/if}

              <button
                on:click={() => toggleMessageRead(msg.id)}
                class="text-[#8BA1B8] hover:text-white text-[9px] transition-colors cursor-pointer"
              >
                {msg.unread ? 'Mark Read' : 'Mark Unread'}
              </button>
            </div>

            {#if msg.coords}
              <button
                on:click={() => focusCommunicationNode('node-dhaka')}
                class="text-[#00E5FF] hover:underline text-[9px] cursor-pointer"
              >
                Focus Coordinates →
              </button>
            {/if}
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <!-- Message Composer Dock -->
  <div class="pt-2.5 mt-2 border-t border-white/10 shrink-0 flex flex-col gap-2">
    <div class="flex items-center justify-between text-[10px]">
      <span class="text-[#8BA1B8]">Dispatch Transmission to {$activeCommunicationChannel.name}:</span>
      
      <div class="flex items-center gap-1">
        <span class="text-[#8BA1B8]">Priority:</span>
        <select
          bind:value={selectedSeverity}
          class="bg-black/60 border border-white/10 text-white rounded px-1.5 py-0.5 text-[9px] focus:outline-none focus:border-[#00E5FF]"
        >
          <option value="routine">Routine</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <input
        type="text"
        bind:value={inputMessage}
        on:keydown={handleKeyDown}
        placeholder="Type emergency radio transmission or directive (Press Enter)..."
        class="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-[#8BA1B8]/60 focus:outline-none focus:border-[#00E5FF]/60 font-mono"
      />

      <button
        on:click={handleSend}
        class="px-4 py-2 rounded-xl bg-[#00E5FF]/20 hover:bg-[#00E5FF] text-[#00E5FF] hover:text-black border border-[#00E5FF]/50 text-xs font-bold tracking-wider transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)] cursor-pointer shrink-0"
      >
        TRANSMIT ✈
      </button>
    </div>
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.2);
    border-radius: 2px;
  }
</style>
