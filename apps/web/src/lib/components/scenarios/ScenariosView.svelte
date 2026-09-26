<script lang="ts">
  import ScenariosHeader from './ScenariosHeader.svelte';
  import ScenarioBuilderPanel from './ScenarioBuilderPanel.svelte';
  import ScenarioSimulationMap from './ScenarioSimulationMap.svelte';
  import ScenarioComparisonSection from './ScenarioComparisonSection.svelte';
  import ScenarioLibraryView from './ScenarioLibraryView.svelte';
  import ScenarioComparisonView from './ScenarioComparisonView.svelte';
  import ScenarioResultsView from './ScenarioResultsView.svelte';
  import SaveScenarioModal from './SaveScenarioModal.svelte';
  import ExportResultsModal from './ExportResultsModal.svelte';
  import { activeScenarioView } from '$lib/stores/scenarioStore';
</script>

<div class="scenarios-workspace relative w-full min-h-full flex flex-col p-3 sm:p-5 gap-3.5 bg-[#020711]/60 backdrop-blur-[2px] font-mono select-none">
  
  <!-- 1. Top Scenarios Workstation Header & Nav -->
  <header class="shrink-0 w-full">
    <ScenariosHeader />
  </header>

  <!-- 2. Conditional Sub-views -->
  {#if $activeScenarioView === 'builder'}
    
    <!-- Hero Simulation Stage: Scenario Builder Configuration (Left) + Hero Simulation Map (Right) -->
    <section class="w-full grid grid-cols-1 lg:grid-cols-[330px_1fr] gap-3.5 items-stretch min-h-[520px]">
      <!-- Left: Scenario Builder Parameter Sliders & Toggles -->
      <div class="w-full h-full min-h-[460px]">
        <ScenarioBuilderPanel />
      </div>

      <!-- Center/Right: Hero Geospatial Canvas Simulation Map -->
      <div class="w-full h-full min-h-[460px]">
        <ScenarioSimulationMap />
      </div>
    </section>

    <!-- Bottom: Current vs Simulated Comparison Cards & 5 Detailed Scenario Tabs -->
    <section class="w-full pt-1 pb-6">
      <ScenarioComparisonSection />
    </section>

  {:else if $activeScenarioView === 'library'}
    <section class="w-full flex-1 min-h-[500px]">
      <ScenarioLibraryView />
    </section>

  {:else if $activeScenarioView === 'comparison'}
    <section class="w-full flex-1 min-h-[500px]">
      <ScenarioComparisonView />
    </section>

  {:else if $activeScenarioView === 'results'}
    <section class="w-full flex-1 min-h-[500px]">
      <ScenarioResultsView />
    </section>
  {/if}

  <!-- Modals -->
  <SaveScenarioModal />
  <ExportResultsModal />

</div>
