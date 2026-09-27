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
  import {
    activeSimulatedScenarioForResponse,
    clearSimulatedScenarioForResponse
  } from '$lib/stores/scenarioStore';
  import { activeNavSection } from '$lib/stores/systemStore';

  // Keep hazard synchronized if user selected another incident
  $: if ($selectedIncident && $selectedIncident.type !== $activeResponseHazard) {
    setResponseHazard($selectedIncident.type);
  }
</script>

<div class="flex-1 flex flex-col h-full overflow-hidden p-4 bg-[#020711] text-[#F0F6FC] select-none">
  <!-- Simulated Scenario Mode Banner -->
  {#if $activeSimulatedScenarioForResponse}
    <div class="mb-3 p-3.5 rounded-2xl bg-[#1E112A] border border-[#A855F7] shadow-[0_0_24px_rgba(168,85,247,0.3)] flex flex-wrap items-center justify-between gap-3 font-mono shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl bg-[#A855F7]/20 border border-[#A855F7]/50 flex items-center justify-center text-[#D8B4FE] text-base animate-pulse">
          ⚠️
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-[#A855F7]/30 text-[#F3E8FF] border border-[#C084FC]">
              SIMULATED SCENARIO MODE
            </span>
            <span class="text-xs font-bold text-white">
              {$activeSimulatedScenarioForResponse.scenarioName}
            </span>
            <span class="text-[10px] text-amber-300 font-semibold">
              (NOT REAL-WORLD LIVE INCIDENT)
            </span>
          </div>
          <div class="text-[11px] text-[#D8B4FE] mt-0.5">
            Incident: <span class="text-white font-semibold">{$activeSimulatedScenarioForResponse.incidentName}</span> •
            Projected Risk: <span class="text-[#EF4444] font-bold">{$activeSimulatedScenarioForResponse.riskScore}/100</span>
            ({$activeSimulatedScenarioForResponse.riskDelta > 0 ? `+${$activeSimulatedScenarioForResponse.riskDelta}` : $activeSimulatedScenarioForResponse.riskDelta} vs baseline) •
            Est. Exposed: <span class="text-white font-semibold">{$activeSimulatedScenarioForResponse.affectedPopulation}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          on:click={() => activeNavSection.set('scenarios')}
          class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-[#E9D5FF] border border-white/20 transition-colors cursor-pointer"
        >
          ← Edit Scenario
        </button>
        <button
          type="button"
          on:click={clearSimulatedScenarioForResponse}
          class="px-3 py-1.5 rounded-lg bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-xs text-[#FCA5A5] border border-[#EF4444]/40 transition-colors cursor-pointer"
        >
          Exit Simulation Mode ✕
        </button>
      </div>
    </div>
  {/if}

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
