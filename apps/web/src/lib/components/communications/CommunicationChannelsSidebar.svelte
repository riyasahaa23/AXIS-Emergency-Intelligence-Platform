<script lang="ts">
  import {
    communicationChannels,
    activeCommunicationChannelId,
    selectCommunicationChannel,
    toggleMuteChannel,
    isBroadcastModalOpen
  } from '../../stores/communicationStore';

  function getStatusBadge(status: string) {
    if (status === 'CONNECTED') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    if (status === 'DEGRADED') return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
  }
</script>

<div class="flex flex-col h-full bg-[#061425]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 font-mono select-none overflow-hidden">
  <!-- Header -->
  <div class="flex items-center justify-between pb-3 mb-3 border-b border-white/10 shrink-0">
    <div class="flex items-center gap-2">
      <span class="text-base">📻</span>
      <h2 class="text-xs font-bold uppercase tracking-wider text-white">COMMUNICATION CHANNELS</h2>
    </div>
    <button
      on:click={() => isBroadcastModalOpen.set(true)}
      class="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/40 text-[10px] font-bold tracking-wider transition-all shadow-[0_0_12px_rgba(239,68,68,0.3)] cursor-pointer flex items-center gap-1.5"
      title="Open Emergency Broadcast Confirmation Workflow"
    >
      <span class="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
      BROADCAST
    </button>
  </div>

  <!-- Channel List -->
  <div class="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
    {#each $communicationChannels as channel}
      <div
        on:click={() => selectCommunicationChannel(channel.id)}
        class="p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 {
          $activeCommunicationChannelId === channel.id
            ? 'bg-[#00E5FF]/15 border-[#00E5FF]/60 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
            : 'bg-black/30 border-white/5 hover:border-white/20 hover:bg-white/5'
        }"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm">{channel.icon}</span>
            <span class="text-xs font-bold text-white tracking-wide">{channel.name}</span>
          </div>

          <div class="flex items-center gap-1.5">
            {#if channel.unreadCount > 0}
              <span class="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#EF4444] text-white">
                {channel.unreadCount}
              </span>
            {/if}

            <button
              on:click|stopPropagation={() => toggleMuteChannel(channel.id)}
              class="p-1 rounded text-xs transition-colors hover:text-white {channel.isMuted ? 'text-amber-400' : 'text-[#8BA1B8]'}"
              title={channel.isMuted ? 'Unmute Channel' : 'Mute Channel'}
            >
              {channel.isMuted ? '🔇' : '🔔'}
            </button>
          </div>
        </div>

        <p class="text-[10px] text-[#8BA1B8] leading-tight font-sans line-clamp-1">
          {channel.description}
        </p>

        <div class="flex items-center justify-between pt-1 border-t border-white/5 text-[9px]">
          <span class="px-1.5 py-0.2 rounded border {getStatusBadge(channel.status)}">
            {channel.status}
          </span>
          <span class="text-[#8BA1B8]">{channel.unitCount} Connected Units</span>
        </div>
      </div>
    {/each}
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
