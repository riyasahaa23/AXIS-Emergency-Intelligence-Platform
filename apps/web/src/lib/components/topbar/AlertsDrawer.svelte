<script lang="ts">
  import { isAlertsDrawerOpen, activeNavSection } from '../../stores/systemStore';
  import { selectIncident, incidents } from '../../stores/incidentStore';

  interface AlertItem {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    severity: 'critical' | 'warning' | 'info';
    read: boolean;
    incidentId?: string;
  }

  let alerts: AlertItem[] = [
    {
      id: 'alt-01',
      title: 'Embankment Overtopping Imminent',
      message: 'Surma River Basin gauge reading 14.8m (+2.4m above red threshold). Sector 4 defenses stressed.',
      timestamp: '2m ago',
      severity: 'critical',
      read: false,
      incidentId: 'inc-01'
    },
    {
      id: 'alt-02',
      title: 'Aviation Asset Relocated',
      message: 'Rotary Wing H-001 deployed to Sylhet Forward Airhead for emergency medical extraction.',
      timestamp: '14m ago',
      severity: 'info',
      read: false,
      incidentId: 'inc-01'
    },
    {
      id: 'alt-03',
      title: 'Precipitation Spike Detected',
      message: 'NASA GPM constellation flagged 120mm/hr localized cell over Sylhet upstream catchment.',
      timestamp: '28m ago',
      severity: 'warning',
      read: false,
      incidentId: 'inc-01'
    },
    {
      id: 'alt-04',
      title: 'Satellite Swath Acquired',
      message: 'Copernicus Sentinel-1A SAR radar flood extent layer synchronized into Analysis engine.',
      timestamp: '45m ago',
      severity: 'info',
      read: true,
      incidentId: 'inc-01'
    },
    {
      id: 'alt-05',
      title: 'Global Telemetry Sync',
      message: 'All 8 planetary hazard monitoring links reporting 99.8% sensor health.',
      timestamp: '1h ago',
      severity: 'info',
      read: true
    }
  ];

  let activeFilter: 'ALL' | 'CRITICAL' | 'UNREAD' = 'ALL';

  $: filteredAlerts = alerts.filter((a) => {
    if (activeFilter === 'CRITICAL') return a.severity === 'critical';
    if (activeFilter === 'UNREAD') return !a.read;
    return true;
  });

  $: unreadCount = alerts.filter((a) => !a.read).length;

  function markAllRead() {
    alerts = alerts.map((a) => ({ ...a, read: true }));
  }

  function toggleAlertRead(id: string) {
    alerts = alerts.map((a) => (a.id === id ? { ...a, read: !a.read } : a));
  }

  function clearAlert(id: string) {
    alerts = alerts.filter((a) => a.id !== id);
  }

  function handleAlertClick(alert: AlertItem) {
    toggleAlertRead(alert.id);
    if (alert.incidentId) {
      const inc = $incidents.find((i) => i.id === alert.incidentId);
      if (inc) {
        selectIncident(inc);
      }
    }
  }

  function closeDrawer() {
    isAlertsDrawerOpen.set(false);
  }
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && closeDrawer()} />

{#if $isAlertsDrawerOpen}
  <div class="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
    <!-- Click backdrop to close -->
    <div
      class="flex-1 cursor-pointer"
      on:click={closeDrawer}
      on:keydown={(e) => e.key === 'Enter' && closeDrawer()}
      role="button"
      tabindex="0"
      aria-label="Close alerts drawer backdrop"
    ></div>

    <!-- Drawer Panel -->
    <div class="w-full max-w-md h-full bg-[#030914] border-l border-[#00E5FF]/20 shadow-[0_0_50px_rgba(0,229,255,0.15)] flex flex-col font-mono">
      <!-- Header -->
      <div class="p-5 border-b border-white/10 flex items-center justify-between bg-[#061425]/80">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-bold tracking-wider text-white uppercase">System Telemetry Alerts</h2>
              {#if unreadCount > 0}
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EF4444] text-white">
                  {unreadCount} NEW
                </span>
              {/if}
            </div>
            <p class="text-[10px] text-[#8BA1B8] tracking-widest uppercase">Real-time Emergency Feeds</p>
          </div>
        </div>

        <button
          on:click={closeDrawer}
          class="p-1.5 rounded-lg text-[#8BA1B8] hover:text-white hover:bg-white/10 transition-colors"
          title="Close drawer (Esc)"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Controls & Filter Toolbar -->
      <div class="px-5 py-3 border-b border-white/5 bg-[#020711]/60 flex items-center justify-between text-xs">
        <div class="flex items-center gap-1.5">
          <button
            on:click={() => (activeFilter = 'ALL')}
            class="px-2.5 py-1 rounded text-[10px] font-semibold tracking-wider transition-all {activeFilter === 'ALL' ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50' : 'text-[#8BA1B8] hover:text-white'}"
          >
            ALL ({alerts.length})
          </button>
          <button
            on:click={() => (activeFilter = 'CRITICAL')}
            class="px-2.5 py-1 rounded text-[10px] font-semibold tracking-wider transition-all {activeFilter === 'CRITICAL' ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/50' : 'text-[#8BA1B8] hover:text-white'}"
          >
            CRITICAL
          </button>
          <button
            on:click={() => (activeFilter = 'UNREAD')}
            class="px-2.5 py-1 rounded text-[10px] font-semibold tracking-wider transition-all {activeFilter === 'UNREAD' ? 'bg-[#3D7CFF]/20 text-[#3D7CFF] border border-[#3D7CFF]/50' : 'text-[#8BA1B8] hover:text-white'}"
          >
            UNREAD ({unreadCount})
          </button>
        </div>

        <button
          on:click={markAllRead}
          class="text-[10px] text-[#00E5FF] hover:underline cursor-pointer"
        >
          Mark all read
        </button>
      </div>

      <!-- Alerts Stream -->
      <div class="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
        {#if filteredAlerts.length === 0}
          <div class="py-16 text-center text-[#8BA1B8] text-xs">
            <div class="w-10 h-10 mx-auto mb-2 rounded-full border border-white/10 flex items-center justify-center text-white/40">✓</div>
            No active alerts matching criteria
          </div>
        {:else}
          {#each filteredAlerts as alert (alert.id)}
            <div
              class="group relative p-3 rounded-lg border transition-all cursor-pointer {alert.read ? 'bg-[#061425]/40 border-white/5 opacity-75' : 'bg-[#081b33]/70 border-[#00E5FF]/30 shadow-[0_0_15px_rgba(0,229,255,0.08)]'}"
              on:click={() => handleAlertClick(alert)}
              on:keydown={(e) => e.key === 'Enter' && handleAlertClick(alert)}
              role="button"
              tabindex="0"
            >
              <div class="flex items-start justify-between gap-2 mb-1">
                <div class="flex items-center gap-2">
                  <span
                    class="w-2 h-2 rounded-full {alert.severity === 'critical' ? 'bg-[#EF4444] shadow-[0_0_8px_#EF4444]' : alert.severity === 'warning' ? 'bg-[#F59E0B]' : 'bg-[#00E5FF]'}"
                  ></span>
                  <span class="text-xs font-bold text-white tracking-wide">{alert.title}</span>
                </div>
                <span class="text-[10px] text-[#8BA1B8]">{alert.timestamp}</span>
              </div>

              <p class="text-[11px] text-[#8BA1B8] leading-relaxed pl-4">
                {alert.message}
              </p>

              <div class="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] pl-4">
                <span class="uppercase tracking-wider {alert.severity === 'critical' ? 'text-[#EF4444]' : alert.severity === 'warning' ? 'text-[#F59E0B]' : 'text-[#00E5FF]'}">
                  ● {alert.severity}
                </span>

                <button
                  on:click|stopPropagation={() => clearAlert(alert.id)}
                  class="opacity-0 group-hover:opacity-100 text-[#8BA1B8] hover:text-[#EF4444] transition-opacity"
                  title="Dismiss alert"
                >
                  Dismiss
                </button>
              </div>
            </div>
          {/each}
        {/if}
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-white/10 bg-[#061425]/60 flex items-center justify-between text-[11px] text-[#8BA1B8]">
        <span>Telemetric Status: Optimal</span>
        <span class="text-[#00E5FF]">AXIS C2 Node v2.4</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.2);
    border-radius: 4px;
  }
</style>
