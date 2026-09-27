<script lang="ts">
  import { onMount } from 'svelte';
  import ResponseHeader from './ResponseHeader.svelte';
  import ResponseMetricsStrip from './ResponseMetricsStrip.svelte';
  import ResponsePrioritiesPanel from './ResponsePrioritiesPanel.svelte';
  import ResponseOperationsMap from './ResponseOperationsMap.svelte';
  import DeployedTeamsCard from './DeployedTeamsCard.svelte';
  import ResourceAllocationCard from './ResourceAllocationCard.svelte';
  import UpcomingOperationsCard from './UpcomingOperationsCard.svelte';

  // Subviews
  import TeamDeploymentView from './subviews/TeamDeploymentView.svelte';
  import ResourceAllocationView from './subviews/ResourceAllocationView.svelte';
  import EvacuationPlanningView from './subviews/EvacuationPlanningView.svelte';
  import ShelterManagementView from './subviews/ShelterManagementView.svelte';

  // Modals & Drawers
  import AutoOptimizeModal from './modals/AutoOptimizeModal.svelte';
  import DeployTeamModal from './modals/DeployTeamModal.svelte';
  import AllocateResourceModal from './modals/AllocateResourceModal.svelte';
  import PlanEvacuationModal from './modals/PlanEvacuationModal.svelte';
  import SendAlertModal from './modals/SendAlertModal.svelte';
  import CriticalActionsDrawer from './modals/CriticalActionsDrawer.svelte';

  import {
    activeResponseMode,
    activeResponseHazard,
    setResponseHazard
  } from '../../stores/responseStore';
  import { selectedIncident } from '../../stores/incidentStore';

  // Keep hazard synchronized if user selected another incident
  $: if ($selectedIncident && $selectedIncident.type !== $activeResponseHazard) {
    setResponseHazard($selectedIncident.type);
  }
</script>

<div class="flex-1 flex flex-col h-full overflow-hidden p-4 bg-[#020711] text-[#F0F6FC] select-none">
  <!-- Top Command & Control Header -->
  <ResponseHeader />

  <!-- Top 5 KPI Metrics Strip -->
  <ResponseMetricsStrip />

  <!-- Main Operational Stage depending on selected Mode Tab -->
  {#if $activeResponseMode === 'overview'}
    <div class="flex-1 flex flex-col gap-3.5 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
      <!-- Upper Section: Priorities Panel (Left) + Operations Map (Center) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 min-h-[460px] flex-1">
        <!-- Left: Response Priorities (4 Cols) -->
        <div class="lg:col-span-4 h-full min-h-[460px]">
          <ResponsePrioritiesPanel />
        </div>

        <!-- Center: Operations Map (8 Cols) -->
        <div class="lg:col-span-8 h-full min-h-[460px]">
          <ResponseOperationsMap />
        </div>
      </div>

      <!-- Lower Section: 3-Panel Bottom Strip -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5 h-[230px] shrink-0 mb-1">
        <!-- Panel 1: Deployed Teams -->
        <div class="h-full">
          <DeployedTeamsCard />
        </div>

        <!-- Panel 2: Resource Allocation -->
        <div class="h-full">
          <ResourceAllocationCard />
        </div>

        <!-- Panel 3: Upcoming Operations -->
        <div class="h-full">
          <UpcomingOperationsCard />
        </div>
      </div>
    </div>
  {:else if $activeResponseMode === 'teams'}
    <TeamDeploymentView />
  {:else if $activeResponseMode === 'resources'}
    <ResourceAllocationView />
  {:else if $activeResponseMode === 'evacuation'}
    <EvacuationPlanningView />
  {:else if $activeResponseMode === 'shelters'}
    <ShelterManagementView />
  {/if}

  <!-- Operational Modals & Drawers -->
  <AutoOptimizeModal />
  <DeployTeamModal />
  <AllocateResourceModal />
  <PlanEvacuationModal />
  <SendAlertModal />
  <CriticalActionsDrawer />
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.2);
    border-radius: 4px;
  }
</style>
