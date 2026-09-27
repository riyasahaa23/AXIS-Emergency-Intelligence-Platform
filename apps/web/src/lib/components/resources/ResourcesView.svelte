<script lang="ts">
  import { activeResourcesMode } from '$lib/stores/resourceStore';

  // Core Overview Components
  import ResourceHeader from './ResourceHeader.svelte';
  import ResourceMetricsStrip from './ResourceMetricsStrip.svelte';
  import ResourceCategoriesPanel from './ResourceCategoriesPanel.svelte';
  import ResourceDeploymentMap from './ResourceDeploymentMap.svelte';
  import ResourceInventoryTable from './ResourceInventoryTable.svelte';
  import UpcomingOperationsCard from './UpcomingOperationsCard.svelte';

  // Subviews
  import AssetsEquipmentView from './subviews/AssetsEquipmentView.svelte';
  import SuppliesLogisticsView from './subviews/SuppliesLogisticsView.svelte';
  import PersonnelView from './subviews/PersonnelView.svelte';
  import FacilitiesView from './subviews/FacilitiesView.svelte';
  import SupplyChainView from './subviews/SupplyChainView.svelte';
  import ResourceRequestsView from './subviews/ResourceRequestsView.svelte';

  // Modals
  import DeployResourceModal from './modals/DeployResourceModal.svelte';
  import RequestResourcesModal from './modals/RequestResourcesModal.svelte';
  import AllocateResourcesModal from './modals/AllocateResourcesModal.svelte';
  import TrackShipmentModal from './modals/TrackShipmentModal.svelte';
  import ResourceReportModal from './modals/ResourceReportModal.svelte';
  import OptimizeResourcesModal from './modals/OptimizeResourcesModal.svelte';
  import ResourceDetailModal from './modals/ResourceDetailModal.svelte';
</script>

<div class="flex-1 flex flex-col h-full bg-[#050b14] overflow-hidden text-slate-100 font-mono">
  <!-- Top Navigation & Title Header -->
  <ResourceHeader />

  <!-- Global Metrics KPI Strip -->
  <ResourceMetricsStrip />

  <!-- Main Work Area -->
  <div class="flex-1 overflow-y-auto overflow-x-hidden p-3 min-h-0 custom-scrollbar">
    {#if $activeResourcesMode === 'overview'}
      <div class="flex flex-col gap-3">
        <!-- Top Workspace: Left Categories Panel + Center Interactive GIS Asset Map -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[460px]">
          <!-- Left Categories Sidebar -->
          <div class="lg:col-span-3 xl:col-span-2">
            <ResourceCategoriesPanel />
          </div>

          <!-- Main GIS Asset Tracking Map -->
          <div class="lg:col-span-9 xl:col-span-10 min-h-[460px]">
            <ResourceDeploymentMap />
          </div>
        </div>

        <!-- Bottom Workspace: Resource Inventory Table (8 cols) + Upcoming Operations (4 cols) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[360px]">
          <!-- Interactive Resource Inventory Table -->
          <div class="lg:col-span-8">
            <ResourceInventoryTable />
          </div>

          <!-- Scheduled Sorties & Upcoming Operations -->
          <div class="lg:col-span-4">
            <UpcomingOperationsCard />
          </div>
        </div>
      </div>
    {:else}
      <div class="flex flex-col gap-3">
        <!-- Operational Layer Geographic Map (Specific to Active Tab & Hazard Theatre) -->
        <div class="w-full h-[420px] min-h-[420px] shrink-0">
          <ResourceDeploymentMap />
        </div>

        <!-- Tab Subview Content -->
        <div class="flex-1 min-h-0">
          {#if $activeResourcesMode === 'assets'}
            <AssetsEquipmentView />
          {:else if $activeResourcesMode === 'supplies'}
            <SuppliesLogisticsView />
          {:else if $activeResourcesMode === 'personnel'}
            <PersonnelView />
          {:else if $activeResourcesMode === 'facilities'}
            <FacilitiesView />
          {:else if $activeResourcesMode === 'supply_chain'}
            <SupplyChainView />
          {:else if $activeResourcesMode === 'requests'}
            <ResourceRequestsView />
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <!-- Global Modals -->
  <DeployResourceModal />
  <RequestResourcesModal />
  <AllocateResourcesModal />
  <TrackShipmentModal />
  <ResourceReportModal />
  <OptimizeResourcesModal />
  <ResourceDetailModal />
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.6);
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(6, 182, 212, 0.25);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(6, 182, 212, 0.5);
  }
</style>
