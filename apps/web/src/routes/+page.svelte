<script lang="ts">
  import TopBar from '$components/topbar/TopBar.svelte';
  import NavRail from '$components/navigation/NavRail.svelte';
  import GlobeView from '$three/GlobeView.svelte';
  import CockpitFrame from '$components/cockpit/CockpitFrame.svelte';
  import QuickTelemetry from '$components/widgets/QuickTelemetry.svelte';
  import MonitoringBadge from '$components/widgets/MonitoringBadge.svelte';
  import RiskLegend from '$components/widgets/RiskLegend.svelte';
  import JarvisOrb from '$components/widgets/JarvisOrb.svelte';
  import IncidentDetailCard from '$components/incidents/IncidentDetailCard.svelte';
  import IntelligencePanel from '$components/intelligence/IntelligencePanel.svelte';
  import ScenarioDrawer from '$components/scenarios/ScenarioDrawer.svelte';
  import CommandActionBar from '$components/command/CommandActionBar.svelte';
  import JarvisCentralOverlay from '$components/jarvis/JarvisCentralOverlay.svelte';
  import IncidentsView from '$components/incidents/IncidentsView.svelte';
  import AnalysisView from '$components/analysis/AnalysisView.svelte';
  import ScenariosView from '$components/scenarios/ScenariosView.svelte';
  import ResponseView from '$components/response/ResponseView.svelte';
  import ResourcesView from '$components/resources/ResourcesView.svelte';
  import CommunicationsView from '$components/communications/CommunicationsView.svelte';
  import HistoryView from '$components/history/HistoryView.svelte';
  import { selectedIncident } from '$stores/incidentStore';
  import { isJarvisCentralActive } from '$stores/commandStore';
  import { activeNavSection } from '$stores/systemStore';
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
          <GlobeView />
        </div>

        <!-- Cockpit HUD Frame Overlay (curved glass viewport frame) -->
        <CockpitFrame />

        {#if !$isJarvisCentralActive}
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

        <!-- Floating Bottom Section Over Globe (Unobstructed Viewport) -->
        <div class="absolute bottom-5 inset-x-5 z-20 flex items-end justify-between pointer-events-none">
          <!-- Bottom Left: Compact Risk Legend & 3D AI Hologram Orb -->
          <div class="flex flex-col gap-2.5 pointer-events-auto shrink-0 max-w-[220px]">
            <RiskLegend />
            <JarvisOrb />
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

      <!-- Central JARVIS Mode Transformation Overlay -->
      <JarvisCentralOverlay />

    </main>

    <!-- Right Intelligence Panel -->
    <IntelligencePanel />

  </div>
</div>