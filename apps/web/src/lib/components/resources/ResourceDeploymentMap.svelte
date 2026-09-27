<script lang="ts">
  import {
    resourceMapContext,
    resourceMapFocus,
    selectedResourceId,
    selectedFacilityId,
    selectedShipmentId,
    selectResource,
    selectFacility,
    trackShipment,
    isDeployModalOpen,
    isDetailModalOpen,
    isAllocateModalOpen,
    activeResourceMapLayer
  } from '../../stores/resourceStore';
  import type { ResourceMapMarker } from '../../types/resources';

  let containerEl: HTMLDivElement;
  let isFullscreen = false;
  let zoomLevel = 1.0;
  let panOffset = { x: 0, y: 0 };
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  let hoveredMarker: ResourceMapMarker | null = null;

  $: mapContext = $resourceMapContext;

  // React to focus changes from store
  $: if ($resourceMapFocus) {
    zoomLevel = $resourceMapFocus.zoom;
  }

  const mapLayerTabs: Array<
    'ALL RESOURCES' | 'HELICOPTERS' | 'BOATS' | 'VEHICLES' | 'SUPPLIES' | 'FACILITIES'
  > = ['ALL RESOURCES', 'HELICOPTERS', 'BOATS', 'VEHICLES', 'SUPPLIES', 'FACILITIES'];

  function handleZoomIn() {
    zoomLevel = Math.min(2.5, zoomLevel + 0.2);
  }

  function handleZoomOut() {
    zoomLevel = Math.max(0.7, zoomLevel - 0.2);
  }

  function handleResetView() {
    zoomLevel = mapContext.defaultZoom;
    panOffset = { x: 0, y: 0 };
    resourceMapFocus.set({
      center: mapContext.center,
      zoom: mapContext.defaultZoom
    });
  }

  function handleLocateSelected() {
    if (mapContext.selectedResource) {
      resourceMapFocus.set({
        center: mapContext.selectedResource.coords,
        zoom: 1.4,
        highlightId: mapContext.selectedResource.id
      });
      zoomLevel = 1.4;
      panOffset = { x: 0, y: 0 };
    }
  }

  function toggleFullscreen() {
    isFullscreen = !isFullscreen;
  }

  function handleMouseDown(e: MouseEvent) {
    if ((e.target as HTMLElement).closest('.map-hud-control, .marker-element, .inspector-card')) return;
    isDragging = true;
    dragStart = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    panOffset = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
  }

  function handleMouseUp() {
    isDragging = false;
  }

  // Geographic projection helper: Map Lng/Lat to Canvas % dynamically based on the current incident's BBOX
  function projectCoords(coords: [number, number]): { x: number; y: number } {
    const bbox = mapContext.bbox;
    const lng = coords[0];
    const lat = coords[1];

    const x = ((lng - bbox.minLng) / (bbox.maxLng - bbox.minLng)) * 100;
    const y = ((bbox.maxLat - lat) / (bbox.maxLat - bbox.minLat)) * 100;

    return {
      x: Math.max(4, Math.min(96, x)),
      y: Math.max(4, Math.min(96, y))
    };
  }

  function onMarkerClick(marker: ResourceMapMarker) {
    if (marker.entityType === 'resource') {
      selectResource(marker.id);
    } else if (marker.entityType === 'facility') {
      selectFacility(marker.id);
    } else if (marker.entityType === 'shipment') {
      trackShipment(marker.id);
    } else if (marker.entityType === 'request') {
      selectedResourceId.set(null);
      selectedFacilityId.set(null);
      selectedShipmentId.set(marker.id);
    }
  }
</script>

<div
  bind:this={containerEl}
  on:mousedown={handleMouseDown}
  on:mousemove={handleMouseMove}
  on:mouseup={handleMouseUp}
  role="region"
  aria-label="Geographic resource deployment map viewport"
  class="relative flex-1 flex flex-col bg-[#020914] border border-white/10 rounded-2xl overflow-hidden select-none transition-all duration-300 {
    isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'h-full min-h-[460px]'
  }"
>
  <!-- Top Map Header Bar (Title, Layer Toggles, Controls) -->
  <div class="absolute top-0 inset-x-0 z-20 flex flex-wrap items-center justify-between p-3 bg-gradient-to-b from-[#020914]/90 to-transparent pointer-events-none gap-2">
    <!-- Title & Location Badge -->
    <div class="flex items-center gap-2 pointer-events-auto bg-[#061425]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-lg">
      <div class="w-3.5 h-3.5 rounded-full border border-[#00E5FF] flex items-center justify-center">
        <span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></span>
      </div>
      <span class="text-xs font-mono font-bold tracking-wider text-white uppercase">
        {mapContext.mapTitle}
      </span>
      <span class="text-[10px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded-md border border-[#00E5FF]/20">
        {mapContext.mapSubtitle}
      </span>
    </div>

    <!-- Center/Right Map Layer Buttons (available in overview mode) -->
    <div class="flex items-center gap-1.5 pointer-events-auto map-hud-control overflow-x-auto bg-[#061425]/85 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg">
      {#if mapContext.activeTab === 'overview'}
        {#each mapLayerTabs as layer}
          <button
            on:click={() => activeResourceMapLayer.set(layer)}
            class="px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium transition-all cursor-pointer whitespace-nowrap {
              $activeResourceMapLayer === layer
                ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50 shadow-[0_0_10px_rgba(0,229,255,0.25)]'
                : 'text-[#8BA1B8] hover:text-white hover:bg-white/5 border border-transparent'
            }"
          >
            {layer}
          </button>
        {/each}
      {/if}

      <!-- Fullscreen Toggle Button -->
      <button
        on:click={toggleFullscreen}
        class="p-1 rounded-lg text-[#8BA1B8] hover:text-white hover:bg-white/10 transition-all cursor-pointer ml-1"
        title="Toggle Fullscreen Map"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {#if isFullscreen}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          {/if}
        </svg>
      </button>
    </div>
  </div>

  <!-- Main Viewport Canvas Stage -->
  <div
    class="flex-1 w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing"
    style="transform: scale({zoomLevel}) translate({panOffset.x}px, {panOffset.y}px); transform-origin: center center; transition: transform 0.15s ease-out;"
  >
    <!-- Vector Map Grid & Geographic Background -->
    <svg class="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 1000 650" preserveAspectRatio="none">
      <defs>
        <!-- Topographic Coordinate Grid -->
        <pattern id="resGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
          <circle cx="0" cy="0" r="1.5" fill="rgba(0,229,255,0.2)" />
        </pattern>

        <linearGradient id="shipmentRouteGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00E5FF" />
          <stop offset="100%" stop-color="#8B5CF6" />
        </linearGradient>
      </defs>

      <!-- Grid Background -->
      <rect width="1000" height="650" fill="url(#resGrid)" />

      <!-- Incident-Specific Geographic Territory Outline (Genuine Shape) -->
      <path
        d="{mapContext.territoryPath}"
        fill="#031124"
        stroke="#00E5FF"
        stroke-opacity="0.35"
        stroke-width="1.8"
      />

      <!-- River / Coastal Waterway Contours -->
      {#if mapContext.waterwayPaths}
        {#each mapContext.waterwayPaths as wPath}
          <path d="{wPath}" fill="none" stroke="#00E5FF" stroke-opacity="0.3" stroke-width="2" />
        {/each}
      {/if}

      <!-- Dynamic Geographic Surrounding Labels -->
      {#each mapContext.surroundingLabels as label}
        <text
          x="{label.x}"
          y="{label.y}"
          fill="#374151"
          font-family="monospace"
          font-size="{label.size || 18}"
          font-weight="bold"
          letter-spacing="{label.tracking || 4}"
        >
          {label.text}
        </text>
      {/each}

      <!-- Dynamic Active Routes -->
      {#each mapContext.routes as route}
        <g>
          <polyline
            points="{route.path.map((p) => {
              const proj = projectCoords(p);
              return `${proj.x * 10},${proj.y * 6.5}`;
            }).join(' ')}"
            fill="none"
            stroke="{route.color}"
            stroke-width="2.5"
            stroke-dasharray="6,4"
            stroke-linecap="round"
          >
            <animate attributeName="stroke-dashoffset" values="20;0" dur="1.8s" repeatCount="indefinite" />
          </polyline>
        </g>
      {/each}
    </svg>

    <!-- Geographic City / Hub Nodes -->
    {#each mapContext.cities as city}
      {@const proj = projectCoords(city.coords)}
      <div
        class="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5"
        style="left: {proj.x}%; top: {proj.y}%;"
      >
        <span class="w-1.5 h-1.5 rounded-full {city.isCapital ? 'bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]' : 'bg-white/40'}"></span>
        <span class="font-mono text-[10px] font-bold tracking-wider {city.isCapital ? 'text-white text-xs' : 'text-[#8BA1B8]'}">
          {city.name}
        </span>
      </div>
    {/each}

    <!-- Dynamic Context-Driven Entity Markers -->
    {#each mapContext.markers as marker (marker.id)}
      {@const proj = projectCoords(marker.coords)}
      {@const isSelected = $selectedResourceId === marker.id || $selectedFacilityId === marker.id || $selectedShipmentId === marker.id}
      <button
        on:click|stopPropagation={() => onMarkerClick(marker)}
        on:mouseenter={() => (hoveredMarker = marker)}
        on:mouseleave={() => (hoveredMarker = null)}
        class="marker-element absolute z-20 transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer p-1 transition-transform focus:outline-none {
          isSelected ? 'scale-130 z-30' : 'hover:scale-120'
        }"
        style="left: {proj.x}%; top: {proj.y}%;"
        title="{marker.name} // {marker.metricLabel}"
      >
        <!-- Marker Outer Beacon Ring -->
        <div class="relative w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-300 shadow-lg {marker.bgColor} {marker.borderColor} {
          isSelected ? 'shadow-[0_0_20px_#00E5FF] ring-2 ring-[#00E5FF]' : ''
        }">
          <span class="text-xs">{marker.icon}</span>

          <!-- Status Dot Badge -->
          <span
            class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-slate-900 {
              marker.status === 'AVAILABLE' || marker.status === 'OPERATIONAL' || marker.status === 'ARRIVED'
                ? 'bg-emerald-400'
                : marker.status === 'DEPLOYED' || marker.status === 'IN TRANSIT'
                ? 'bg-[#00E5FF]'
                : marker.status === 'MAINTENANCE' || marker.status === 'CRITICAL'
                ? 'bg-rose-500 animate-ping'
                : 'bg-amber-400'
            }"
          ></span>
        </div>

        <!-- Metric Label Floating Tag -->
        <div class="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded bg-[#020914]/95 border border-white/10 text-[9px] font-mono text-white whitespace-nowrap shadow-md pointer-events-none">
          {marker.id}
        </div>
      </button>
    {/each}

    <!-- Interactive Selected Entity Inspector Overlay Card -->
    {#if mapContext.selectedResource}
      {@const r = mapContext.selectedResource}
      <div
        class="inspector-card absolute top-16 left-4 z-30 w-72 p-3.5 rounded-2xl bg-[#061425]/90 backdrop-blur-xl border border-[#00E5FF]/40 shadow-2xl text-xs font-mono space-y-2.5"
      >
        <div class="flex items-center justify-between pb-1.5 border-b border-white/10">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]"></span>
            <span class="font-bold text-white uppercase tracking-wider truncate">{r.id} — {r.name}</span>
          </div>
          <button
            on:click|stopPropagation={() => selectedResourceId.set(null)}
            class="text-[#8BA1B8] hover:text-white text-xs cursor-pointer"
            title="Dismiss Inspector"
          >
            ✕
          </button>
        </div>

        <div class="space-y-1 text-[11px] text-[#8BA1B8]">
          <div class="flex justify-between">
            <span>Type:</span>
            <span class="text-white font-medium">{r.type}</span>
          </div>
          <div class="flex justify-between">
            <span>Location:</span>
            <span class="text-[#00E5FF] font-medium">{r.location}</span>
          </div>
          <div class="flex justify-between">
            <span>Status:</span>
            <span class="font-bold {
              r.status === 'AVAILABLE' ? 'text-emerald-400' :
              r.status === 'DEPLOYED' ? 'text-[#00E5FF]' :
              r.status === 'EN ROUTE' ? 'text-amber-400' : 'text-rose-400'
            }">{r.status}</span>
          </div>
          <div class="flex justify-between">
            <span>Capacity:</span>
            <span class="text-white font-medium">{r.capacity}</span>
          </div>
          <div class="flex justify-between">
            <span>Fuel / Power:</span>
            <span class="text-emerald-400 font-bold">{r.fuelOrStockPct}%</span>
          </div>
          {#if r.assignedTo}
            <div class="flex justify-between">
              <span>Assigned:</span>
              <span class="text-white font-medium">{r.assignedTo}</span>
            </div>
          {/if}
        </div>

        <div class="pt-1.5 flex items-center gap-2 border-t border-white/10">
          <button
            on:click|stopPropagation={() => isDeployModalOpen.set(true)}
            class="flex-1 py-1.5 rounded-lg bg-[#00E5FF]/20 border border-[#00E5FF]/60 hover:bg-[#00E5FF]/30 text-[#00E5FF] text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            [Deploy]
          </button>
          <button
            on:click|stopPropagation={() => isDetailModalOpen.set(true)}
            class="flex-1 py-1.5 rounded-lg bg-white/5 border border-white/15 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            [View Details]
          </button>
        </div>
      </div>
    {:else if mapContext.selectedFacility}
      {@const f = mapContext.selectedFacility}
      <div
        class="inspector-card absolute top-16 left-4 z-30 w-72 p-3.5 rounded-2xl bg-[#061425]/90 backdrop-blur-xl border border-cyan-400/40 shadow-2xl text-xs font-mono space-y-2.5"
      >
        <div class="flex items-center justify-between pb-1.5 border-b border-white/10">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span class="font-bold text-white uppercase tracking-wider truncate">{f.name}</span>
          </div>
          <button
            on:click|stopPropagation={() => selectedFacilityId.set(null)}
            class="text-[#8BA1B8] hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div class="space-y-1 text-[11px] text-[#8BA1B8]">
          <div class="flex justify-between">
            <span>Type:</span>
            <span class="text-white font-medium">{f.type}</span>
          </div>
          <div class="flex justify-between">
            <span>Location:</span>
            <span class="text-cyan-300 font-medium">{f.location}</span>
          </div>
          <div class="flex justify-between">
            <span>Capacity:</span>
            <span class="text-emerald-400 font-bold">{f.capacityPct}%</span>
          </div>
          <div class="flex justify-between">
            <span>Active Transits:</span>
            <span class="text-white font-medium">{f.incomingShipments} In / {f.outgoingShipments} Out</span>
          </div>
        </div>
      </div>
    {/if}

    <!-- Dynamic Bottom-Left Legend -->
    <div class="absolute bottom-4 left-4 z-20 p-2.5 rounded-xl bg-[#061425]/85 backdrop-blur-md border border-white/10 text-xs font-mono shadow-lg pointer-events-auto">
      <div class="text-[9px] uppercase tracking-wider text-[#8BA1B8] font-bold mb-1.5">
        Map Legend // {mapContext.activeTab.toUpperCase()}
      </div>
      <div class="space-y-1">
        {#each mapContext.legend as item}
          <div class="flex items-center gap-2 text-[10px] text-[#8BA1B8]">
            <span class="w-3 text-center text-xs">{item.icon}</span>
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: {item.color};"></span>
            <span>{item.label}</span>
          </div>
        {/each}
        {#if mapContext.routes.length > 0}
          <div class="flex items-center gap-2 text-[10px] text-[#8BA1B8] pt-0.5 border-t border-white/5">
            <span class="w-3 text-center">┅</span>
            <span class="w-4 h-0.5 bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6]"></span>
            <span>Active Supply Routes</span>
          </div>
        {/if}
      </div>
    </div>

    <!-- Bottom-Right Interactive HUD Navigation Controls -->
    <div class="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 pointer-events-auto map-hud-control">
      <button
        on:click={handleZoomIn}
        class="w-8 h-8 rounded-xl bg-[#061425]/85 backdrop-blur-md border border-white/10 hover:border-[#00E5FF]/60 text-white flex items-center justify-center text-sm font-mono shadow-md transition-all hover:bg-[#00E5FF]/20 cursor-pointer"
        title="Zoom In"
      >
        +
      </button>

      <button
        on:click={handleZoomOut}
        class="w-8 h-8 rounded-xl bg-[#061425]/85 backdrop-blur-md border border-white/10 hover:border-[#00E5FF]/60 text-white flex items-center justify-center text-sm font-mono shadow-md transition-all hover:bg-[#00E5FF]/20 cursor-pointer"
        title="Zoom Out"
      >
        −
      </button>

      <button
        on:click={handleResetView}
        class="w-8 h-8 rounded-xl bg-[#061425]/85 backdrop-blur-md border border-white/10 hover:border-[#00E5FF]/60 text-white flex items-center justify-center text-xs font-mono shadow-md transition-all hover:bg-[#00E5FF]/20 cursor-pointer"
        title="Reset Map Camera View"
      >
        ↺
      </button>

      <button
        on:click={handleLocateSelected}
        class="w-8 h-8 rounded-xl bg-[#061425]/85 backdrop-blur-md border border-white/10 hover:border-[#00E5FF]/60 text-[#00E5FF] flex items-center justify-center text-xs font-mono shadow-md transition-all hover:bg-[#00E5FF]/20 cursor-pointer"
        title="Locate Selected Resource"
      >
        ⊙
      </button>
    </div>
  </div>
</div>
