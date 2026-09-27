<script lang="ts">
  import CommunicationChannelsSidebar from './CommunicationChannelsSidebar.svelte';
  import CommunicationNetworkMap from './CommunicationNetworkMap.svelte';
  import TransmissionStream from './TransmissionStream.svelte';
  import EmergencyBroadcastModal from './EmergencyBroadcastModal.svelte';
  import { selectedIncident } from '../../stores/incidentStore';
  import { activeCommunicationChannel } from '../../stores/communicationStore';
</script>

<div class="flex-1 flex flex-col h-full bg-[#050b14] overflow-hidden text-slate-100 font-mono p-3 gap-3">
  <!-- Top Title Strip -->
  <div class="flex items-center justify-between p-3 rounded-2xl bg-[#061425]/70 backdrop-blur-xl border border-white/10 shrink-0 select-none">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)]">
        📻
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-sm font-bold tracking-wider text-white uppercase">
            COMMUNICATIONS COMMAND // CONNECT. INFORM. COORDINATE.
          </h1>
          <span class="px-2 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            MESH UPLINK ACTIVE
          </span>
        </div>
        <p class="text-xs text-[#8BA1B8] font-sans">
          Inter-agency tactical mesh network, real-time transmissions, and civil emergency broadcast infrastructure
        </p>
      </div>
    </div>

    <!-- Active Incident Telemetry Badge -->
    {#if $selectedIncident}
      <div class="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs">
        <span class="text-[#8BA1B8]">THEATER CONTEXT:</span>
        <span class="text-white font-bold">{$selectedIncident.name}</span>
        <span class="text-[10px] text-[#00E5FF] bg-[#00E5FF]/10 px-1.5 py-0.2 rounded">
          {$selectedIncident.country}
        </span>
      </div>
    {/if}
  </div>

  <!-- 3-Column Command Grid -->
  <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
    <!-- Left Column: Channel Selector (3 cols) -->
    <div class="lg:col-span-3 h-full min-h-0">
      <CommunicationChannelsSidebar />
    </div>

    <!-- Center Column: Network Topology Map (5 cols) -->
    <div class="lg:col-span-5 h-full min-h-0">
      <CommunicationNetworkMap />
    </div>

    <!-- Right Column: Transmission Feed & Composer (4 cols) -->
    <div class="lg:col-span-4 h-full min-h-0">
      <TransmissionStream />
    </div>
  </div>

  <!-- Modals -->
  <EmergencyBroadcastModal />
</div>
