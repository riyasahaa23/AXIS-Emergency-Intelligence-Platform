<script lang="ts">
  import TopBar from '$components/topbar/TopBar.svelte';
  import NavRail from '$components/navigation/NavRail.svelte';
  import CockpitFrame from '$components/cockpit/CockpitFrame.svelte';
  import QuickTelemetry from '$components/widgets/QuickTelemetry.svelte';
  import MonitoringBadge from '$components/widgets/MonitoringBadge.svelte';
  import GeospatialIntelligencePanel from '$components/widgets/GeospatialIntelligencePanel.svelte';
  import RiskLegend from '$components/widgets/RiskLegend.svelte';
  import AxisOrb from '$components/widgets/AxisOrb.svelte';
  import IncidentDetailCard from '$components/incidents/IncidentDetailCard.svelte';
  import IntelligencePanel from '$components/intelligence/IntelligencePanel.svelte';
  import ScenarioDrawer from '$components/scenarios/ScenarioDrawer.svelte';
  import CommandActionBar from '$components/command/CommandActionBar.svelte';
  import AxisCentralOverlay from '$components/axis/AxisCentralOverlay.svelte';
  import IncidentsView from '$components/incidents/IncidentsView.svelte';
  import AnalysisView from '$components/analysis/AnalysisView.svelte';
  import ScenariosView from '$components/scenarios/ScenariosView.svelte';
  import ResponseView from '$components/response/ResponseView.svelte';
  import ResourcesView from '$components/resources/ResourcesView.svelte';
  import CommunicationsView from '$components/communications/CommunicationsView.svelte';
  import HistoryView from '$components/history/HistoryView.svelte';
  import IncidentAnalyzeModal from '$components/incidents/modals/IncidentAnalyzeModal.svelte';
  import IncidentSimulateModal from '$components/incidents/modals/IncidentSimulateModal.svelte';
  import IncidentPlanModal from '$components/incidents/modals/IncidentPlanModal.svelte';
  import UploadDataModal from '$components/command/UploadDataModal.svelte';
  import { selectedIncident, syncIncidentsFromBackend } from '$stores/incidentStore';
  import { isAxisCentralActive } from '$stores/commandStore';
  import { activeNavSection, syncTelemetryFromBackend } from '$stores/systemStore';
  import { onMount } from 'svelte';

  let GlobeView: typeof import('$three/GlobeView.svelte').default | null = null;

  const VALID_NAV_SECTIONS = ['global', 'incidents', 'analysis', 'scenarios', 'response', 'resources', 'comms', 'history'];

  onMount(() => {
    import('$three/GlobeView.svelte').then((module) => {
      GlobeView = module.default;
    });

    const refreshLiveDashboard = async () => {
      await Promise.all([syncIncidentsFromBackend(), syncTelemetryFromBackend()]);
    };
    refreshLiveDashboard();
    const liveRefreshTimer = window.setInterval(refreshLiveDashboard, 60_000);

    // Bidirectional URL deep-linking: Read initial section from hash or query params
    const parseUrlSection = () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash.replace(/^#/, '').toLowerCase().trim();
      const params = new URLSearchParams(window.location.search);
      const querySection = params.get('section')?.toLowerCase().trim() || params.get('tab')?.toLowerCase().trim();
      const target = hash || querySection;

      if (target) {
        const normalized = target === 'communications' ? 'comms' : target;
        if (VALID_NAV_SECTIONS.includes(normalized)) {
          activeNavSection.set(normalized);
        }
      }
    };

    parseUrlSection();

    const handleLocationChange = () => {
      parseUrlSection();
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    // Sync activeNavSection state changes to URL hash without full page reloading
    const unsubscribe = activeNavSection.subscribe((section) => {
      if (typeof window === 'undefined') return;
      const currentHash = window.location.hash.replace(/^#/, '').toLowerCase().trim();
      const expectedHash = section === 'global' ? '' : section;
      if (currentHash !== expectedHash && !(currentHash === '' && section === 'global')) {
        const newUrl = expectedHash ? `${window.location.pathname}#${expectedHash}` : window.location.pathname;
        window.history.replaceState(null, '', newUrl);
      }
    });

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      unsubscribe();
      window.clearInterval(liveRefreshTimer);
    };
  });
</script>

<div class="flex flex-col w-screen h-screen overflow-hidden bg-[#020711] text-[#F0F6FC]">
  <!-- Top Command & Status Bar -->
  <TopBar />

  <!-- Main Command Center Grid -->
  <div class="flex-1 flex overflow-hidden relative">
    
    <!-- Left Spacecraft Navigation Rail -->
    <NavRail />

    <!-- Center Hero Section: 3D Earth Globe + Cockpit HUD or Incidents/Analysis Workspace -->
    <main class="flex-1 relative overflow-hidden bg-[#020711] flex flex-col justify-between">
      
      {#if $activeNavSection === 'incidents'}
        <!-- Incidents Operational Workstation View -->
        <div class="absolute inset-0 z-10 flex flex-col overflow-hidden">
          <IncidentsView />
        </div>
      {:else if $activeNavSection === 'analysis'}
        <!-- Analysis Multi-Hazard Intelligence Workstation View -->
        <div class="absolute inset-0 z-10 flex flex-col overflow-y-auto overflow-x-hidden">
          <AnalysisView />
        </div>
      {:else if $activeNavSection === 'scenarios'}
        <!-- Scenarios What-If Simulation Workstation View -->
        <div class="absolute inset-0 z-10 flex flex-col overflow-y-auto overflow-x-hidden">
          <ScenariosView />
        </div>
      {:else if $activeNavSection === 'response'}
        <!-- Emergency Response Coordination Workstation View -->
        <div class="absolute inset-0 z-10 flex flex-col overflow-y-auto overflow-x-hidden">
          <ResponseView />
        </div>
      {:else if $activeNavSection === 'resources'}
        <!-- Resource & Logistics Command Workstation View -->
        <div class="absolute inset-0 z-10 flex flex-col overflow-y-auto overflow-x-hidden">
          <ResourcesView />
        </div>
      {:else if $activeNavSection === 'comms'}
        <!-- Communications Command Center Workstation View -->
        <div class="absolute inset-0 z-10 flex flex-col overflow-y-auto overflow-x-hidden">
          <CommunicationsView />
        </div>
      {:else if $activeNavSection === 'history'}
        <!-- Planetary Memory & Incident Replay Workstation View -->
        <div class="absolute inset-0 z-10 flex flex-col overflow-y-auto overflow-x-hidden">
          <HistoryView />
        </div>
      {:else}
        <!-- 3D Interactive WebGL Globe (Hero Element) -->
        <div class="absolute inset-0 z-0">
          {#if GlobeView}
            <svelte:component this={GlobeView} />
          {/if}
        </div>

        <!-- Cockpit HUD Frame Overlay (curved glass viewport frame) -->
        <CockpitFrame />

        {#if !$isAxisCentralActive}
          <!-- Floating HUD Telemetry (Top Left of Globe) -->
          <div class="absolute top-4 left-5 z-20 flex flex-col gap-3 pointer-events-auto">
            <QuickTelemetry />
            {#if $selectedIncident}
              <IncidentDetailCard />
            {/if}
          </div>

        <!-- Floating Real-Time Monitoring Badge (Top Right of Globe) -->
        <div class="absolute top-4 right-5 z-20 pointer-events-auto">
          <MonitoringBadge />
        </div>

        <!-- Live geospatial intelligence graph and recent incident distribution -->
        <div class="absolute top-[205px] right-5 z-20 hidden pointer-events-auto xl:block">
          <GeospatialIntelligencePanel />
        </div>

        <!-- Floating Bottom Section Over Globe (Unobstructed Viewport) -->
        <div class="absolute bottom-5 inset-x-5 z-20 flex items-end justify-between pointer-events-none">
          <!-- Bottom Left: Compact Risk Legend & 3D AI Hologram Orb -->
          <div class="flex flex-col gap-2.5 pointer-events-auto shrink-0 max-w-[220px]">
            <RiskLegend />
            <AxisOrb />
          </div>

          <!-- Bottom Center: Floating Command & Scenario Trigger Dock -->
          <div class="flex-1 flex justify-center pointer-events-auto px-4">
            <CommandActionBar />
          </div>

          <!-- Spacer balancing the bottom left widgets -->
          <div class="w-[220px] shrink-0 pointer-events-none hidden md:block"></div>
        </div>
      {/if}
      {/if}

      <!-- On-Demand Slide-Up Scenario Simulation Drawer -->
      <ScenarioDrawer />

      <!-- Central AXIS Mode Transformation Overlay -->
      <AxisCentralOverlay />

      <!-- Global Incident Workflow Modals -->
      <IncidentAnalyzeModal />
      <IncidentSimulateModal />
      <IncidentPlanModal />
      <UploadDataModal />

    </main>

    <!-- Right Intelligence Panel -->
    <IntelligencePanel />

  </div>
</div>
