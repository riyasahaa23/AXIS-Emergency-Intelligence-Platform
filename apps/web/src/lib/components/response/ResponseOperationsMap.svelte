<script lang="ts">
  import { onMount } from 'svelte';
  import {
    activeMapLayers,
    toggleLayer,
    mapCameraFocus,
    selectedMarker,
    selectedTeamId,
    tacticalMarkers,
    evacuationRoutes,
    currentResponsePackage,
    selectTeam,
    isDeployTeamModalOpen,
    isAllocateResourceModalOpen
  } from '../../stores/responseStore';
  import type { TacticalMarker, EvacuationRoute } from '../../types/response';

  let containerEl: HTMLDivElement;
  let isFullscreen = false;
  let zoomLevel = 1.0;
  let panOffset = { x: 0, y: 0 };
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };

  function handleZoomIn() {
    zoomLevel = Math.min(2.5, zoomLevel + 0.2);
  }

  function handleZoomOut() {
    zoomLevel = Math.max(0.7, zoomLevel - 0.2);
  }

  function handleResetView() {
    zoomLevel = 1.0;
    panOffset = { x: 0, y: 0 };
    selectedMarker.set(null);
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

  function handleMarkerClick(m: TacticalMarker) {
    selectedMarker.set(m);
    if (m.type === 'team') {
      const teamId = m.id.replace('m-', '');
      selectTeam(teamId);
    }
  }

  // Geographic projection helper: Map Lng/Lat to Canvas % (for Bangladesh default)
  // Bangladesh bbox: Lng 88.0 -> 92.8, Lat 20.6 -> 26.6
  function projectCoords(coords: [number, number]): { x: number; y: number } {
    const minLng = 88.0;
    const maxLng = 92.8;
    const minLat = 20.6;
    const maxLat = 26.6;

    const lng = coords[0];
    const lat = coords[1];

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;

    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y))
    };
  }

  // Pre-projected city labels for Bangladesh
  const cities = [
    { name: 'Dhaka', coords: [90.41, 23.81], isCapital: true },
    { name: 'Mymensingh', coords: [90.40, 24.75] },
    { name: 'Sylhet', coords: [91.87, 24.89] },
    { name: 'Rajshahi', coords: [88.60, 24.37] },
    { name: 'Khulna', coords: [89.54, 22.84] },
    { name: 'Barisal', coords: [90.35, 22.70] },
    { name: 'Chittagong', coords: [91.83, 22.35] }
  ];
</script>

<div
  bind:this={containerEl}
  on:mousedown={handleMouseDown}
  on:mousemove={handleMouseMove}
  on:mouseup={handleMouseUp}
  class="relative flex-1 flex flex-col bg-[#020914] border border-white/10 rounded-2xl overflow-hidden select-none transition-all duration-300 {
    isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'h-full'
  }"
>
  <!-- Top Map Header Bar (Title, Layer Toggles, Fullscreen) -->
  <div class="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-3 bg-gradient-to-b from-[#020914]/90 to-transparent pointer-events-none">
    <!-- Title -->
    <div class="flex items-center gap-2 pointer-events-auto bg-[#061425]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-lg">
      <div class="w-3.5 h-3.5 rounded-full border border-[#00E5FF] flex items-center justify-center">
        <span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></span>
      </div>
      <span class="text-xs font-mono font-bold tracking-wider text-white uppercase">
        RESPONSE OPERATIONS MAP
      </span>
      <span class="text-[10px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded-md border border-[#00E5FF]/20">
        {$currentResponsePackage.locationName}
      </span>
    </div>

    <!-- Right Map Layer Controls -->
    <div class="flex items-center gap-2 pointer-events-auto map-hud-control">
      <!-- Toggle Team Locations -->
      <button
        on:click={() => toggleLayer('teams')}
        class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer {
          $activeMapLayers.teams
            ? 'bg-[#00E5FF]/15 border border-[#00E5FF] text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.25)]'
            : 'bg-[#061425]/80 border border-white/10 text-[#8BA1B8] hover:text-white'
        }"
      >
        <span>👥</span>
        <span>Team Locations</span>
      </button>

      <!-- Toggle Resource Sites -->
      <button
        on:click={() => toggleLayer('resources')}
        class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer {
          $activeMapLayers.resources
            ? 'bg-[#00E5FF]/15 border border-[#00E5FF] text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.25)]'
            : 'bg-[#061425]/80 border border-white/10 text-[#8BA1B8] hover:text-white'
        }"
      >
        <span>📦</span>
        <span>Resource Sites</span>
      </button>

      <!-- Toggle Evacuation Routes -->
      <button
        on:click={() => toggleLayer('evacuation')}
        class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer {
          $activeMapLayers.evacuation
            ? 'bg-[#00E5FF]/15 border border-[#00E5FF] text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.25)]'
            : 'bg-[#061425]/80 border border-white/10 text-[#8BA1B8] hover:text-white'
        }"
      >
        <span>↗</span>
        <span>Evacuation Routes</span>
      </button>

      <!-- Fullscreen Toggle Button -->
      <button
        on:click={toggleFullscreen}
        class="p-1.5 rounded-xl bg-[#061425]/80 border border-white/10 hover:border-white/30 text-[#8BA1B8] hover:text-white transition-all cursor-pointer"
        title="Toggle Fullscreen Map"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {#if isFullscreen}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          {/if}
        </svg>
      </button>
    </div>
  </div>

  <!-- Main Tactical Viewport Stage -->
  <div
    class="flex-1 w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing"
    style="transform: scale({zoomLevel}) translate({panOffset.x}px, {panOffset.y}px); transform-origin: center center; transition: transform 0.15s ease-out;"
  >
    <!-- Vector Map Grid & Background -->
    <svg class="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 1000 650" preserveAspectRatio="none">
      <defs>
        <!-- SAR Flood Radar Gradient -->
        <radialGradient id="floodGlow" cx="52%" cy="46%" r="42%">
          <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.35" />
          <stop offset="35%" stop-color="#3D7CFF" stop-opacity="0.25" />
          <stop offset="70%" stop-color="#8B5CF6" stop-opacity="0.15" />
          <stop offset="100%" stop-color="#020914" stop-opacity="0" />
        </radialGradient>

        <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F59E0B" />
          <stop offset="100%" stop-color="#00E5FF" />
        </linearGradient>

        <!-- Subtle Topographic Grid Pattern -->
        <pattern id="tacticalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1" />
          <circle cx="0" cy="0" r="1.5" fill="rgba(0,229,255,0.25)" />
        </pattern>
      </defs>

      <!-- Tactical Coordinate Grid -->
      <rect width="1000" height="650" fill="url(#tacticalGrid)" />

      <!-- Surrounding Sovereign Country Labels -->
      <text x="180" y="320" fill="#4B5563" font-family="monospace" font-size="20" font-weight="bold" letter-spacing="4">INDIA</text>
      <text x="750" y="360" fill="#4B5563" font-family="monospace" font-size="18" font-weight="bold" letter-spacing="4">MYANMAR</text>
      <text x="450" y="610" fill="#1F2937" font-family="monospace" font-size="16" letter-spacing="6">BAY OF BENGAL</text>

      <!-- Stylized Bangladesh Geographic Vector Boundary -->
      <path
        d="M 320,80 Q 420,50 560,70 Q 640,110 680,180 Q 750,220 720,320 Q 680,420 740,480 Q 720,550 630,520 Q 520,500 480,560 Q 400,540 360,520 Q 320,440 300,320 Q 280,240 320,80 Z"
        fill="#041224"
        stroke="#00E5FF"
        stroke-opacity="0.3"
        stroke-width="1.5"
      />

      <!-- Inundation / Flood SAR Vector Extent -->
      <path
        d="M 380,160 Q 510,130 620,180 Q 670,260 620,360 Q 580,440 500,460 Q 420,420 380,340 Q 340,240 380,160 Z"
        fill="url(#floodGlow)"
        stroke="#00E5FF"
        stroke-opacity="0.6"
        stroke-width="2"
      />

      <!-- Epicenter Concentric Radar Pulse Rings around Dhaka -->
      <circle cx="520" cy="300" r="30" fill="none" stroke="#EF4444" stroke-opacity="0.6" stroke-width="1.5" />
      <circle cx="520" cy="300" r="60" fill="none" stroke="#EF4444" stroke-opacity="0.4" stroke-width="1" stroke-dasharray="4,4">
        <animate attributeName="r" values="30;90" dur="3s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.7;0" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="520" cy="300" r="90" fill="none" stroke="#EF4444" stroke-opacity="0.2" stroke-width="1" />

      <!-- Major River Systems (Brahmaputra / Padma / Meghna / Surma) -->
      <path d="M 450,60 Q 480,150 490,220 Q 520,300 540,390 Q 560,480 540,550" fill="none" stroke="#00E5FF" stroke-opacity="0.4" stroke-width="2.5" />
      <path d="M 300,280 Q 400,290 490,300" fill="none" stroke="#00E5FF" stroke-opacity="0.4" stroke-width="2" />
      <path d="M 640,160 Q 600,220 540,300" fill="none" stroke="#00E5FF" stroke-opacity="0.4" stroke-width="2" />

      <!-- Evacuation Routes (Vectors connecting zones to shelters) -->
      {#if $activeMapLayers.evacuation}
        {#each $evacuationRoutes as route}
          <g>
            <polyline
              points="{route.path.map((p) => {
                const proj = projectCoords(p);
                return `${proj.x * 10},${proj.y * 6.5}`;
              }).join(' ')}"
              fill="none"
              stroke="#F59E0B"
              stroke-width="3"
              stroke-dasharray="6,4"
              stroke-linecap="round"
            >
              <animate attributeName="stroke-dashoffset" values="20;0" dur="1.5s" repeatCount="indefinite" />
            </polyline>
          </g>
        {/each}
      {/if}
    </svg>

    <!-- Geographic City Labels Overlay -->
    {#each cities as city}
      {@const proj = projectCoords(city.coords)}
      <div
        class="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5"
        style="left: {proj.x}%; top: {proj.y}%;"
      >
        <span class="w-1.5 h-1.5 rounded-full {city.isCapital ? 'bg-[#EF4444] shadow-[0_0_8px_#EF4444]' : 'bg-white/60'}"></span>
        <span class="font-mono text-[10px] font-bold tracking-wider {city.isCapital ? 'text-white text-xs' : 'text-[#8BA1B8]'}">
          {city.name}
        </span>
      </div>
    {/each}

    <!-- Interactive Tactical Markers -->
    {#each $tacticalMarkers as m (m.id)}
      {@const proj = projectCoords(m.coords)}
      {#if ($activeMapLayers.teams && m.type === 'team') || ($activeMapLayers.resources && (m.type === 'medical' || m.type === 'shelter' || m.type === 'helicopter')) || ($activeMapLayers.riskAreas && m.type === 'risk')}
        <button
          on:click|stopPropagation={() => handleMarkerClick(m)}
          class="marker-element absolute z-10 transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer p-1 transition-transform hover:scale-125 focus:outline-none"
          style="left: {proj.x}%; top: {proj.y}%;"
          title="{m.name} ({m.type.toUpperCase()}) - Click to inspect"
        >
          <!-- Outer Pulsing Glow -->
          <span class="absolute inset-0 rounded-full animate-ping opacity-60 {
            m.type === 'team' ? 'bg-[#00E5FF]' :
            m.type === 'medical' ? 'bg-[#EF4444]' :
            m.type === 'shelter' ? 'bg-[#F59E0B]' :
            m.type === 'helicopter' ? 'bg-[#8B5CF6]' : 'bg-[#EF4444]'
          }"></span>

          <!-- Tactical Icon Container -->
          <div class="relative w-7 h-7 rounded-full flex items-center justify-center border shadow-lg transition-all {
            $selectedMarker?.id === m.id
              ? 'ring-2 ring-white scale-110'
              : ''
          } {
            m.type === 'team'
              ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] shadow-[0_0_12px_#00E5FF]'
              : m.type === 'medical'
              ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444] shadow-[0_0_12px_#EF4444]'
              : m.type === 'shelter'
              ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B] shadow-[0_0_12px_#F59E0B]'
              : m.type === 'helicopter'
              ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#8B5CF6] shadow-[0_0_12px_#8B5CF6]'
              : 'bg-[#EF4444]/30 border-[#EF4444] text-[#EF4444]'
          }">
            {#if m.type === 'team'}
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            {:else if m.type === 'medical'}
              <span class="text-xs font-bold leading-none">✚</span>
            {:else if m.type === 'shelter'}
              <span class="text-xs leading-none">⛺</span>
            {:else if m.type === 'helicopter'}
              <span class="text-xs leading-none">🚁</span>
            {:else}
              <span class="text-xs leading-none">⚠</span>
            {/if}
          </div>

          <!-- Micro label tag below marker -->
          <div class="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded bg-[#020914]/90 border border-white/10 text-[9px] font-mono text-white whitespace-nowrap shadow-md">
            {m.name}
          </div>
        </button>
      {/if}
    {/each}
  </div>

  <!-- Embedded Dynamic Legend (Bottom-Left) Matching Reference -->
  <div class="map-hud-control absolute bottom-3.5 left-3.5 z-20 p-2.5 rounded-xl bg-[#061425]/85 backdrop-blur-xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.6)] text-[11px] font-mono">
    <div class="flex flex-col gap-1.5 text-white/90">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></span>
        <span class="text-[#C5D1DE]">Response Teams</span>
      </div>

      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-[#EF4444] shadow-[0_0_6px_#EF4444]"></span>
        <span class="text-[#C5D1DE]">Medical Facilities</span>
      </div>

      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-[0_0_6px_#F59E0B]"></span>
        <span class="text-[#C5D1DE]">Shelters</span>
      </div>

      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] shadow-[0_0_6px_#8B5CF6]"></span>
        <span class="text-[#C5D1DE]">Helicopter Support</span>
      </div>

      <div class="flex items-center gap-2">
        <span class="w-4 h-0.5 border-b-2 border-dashed border-[#F59E0B]"></span>
        <span class="text-[#C5D1DE]">Evacuation Routes</span>
      </div>

      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-sm bg-[#EF4444]"></span>
        <span class="text-[#C5D1DE]">High Risk Areas</span>
      </div>

      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-sm bg-[#00E5FF]/40 border border-[#00E5FF]"></span>
        <span class="text-[#C5D1DE]">Flood Extent</span>
      </div>
    </div>
  </div>

  <!-- Inset Mini Globe (Bottom-Right) Matching Reference -->
  <div class="map-hud-control absolute bottom-3.5 right-3.5 z-20 w-24 h-24 rounded-2xl bg-[#061425]/85 backdrop-blur-xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden">
    <!-- Stylized Holographic Globe -->
    <div class="relative w-18 h-18 rounded-full border border-[#00E5FF]/40 bg-gradient-to-tr from-[#020B18] via-[#05213E] to-[#0A3966] shadow-[inset_0_0_15px_rgba(0,229,255,0.3)] flex items-center justify-center">
      <!-- Latitude/Longitude Rings -->
      <div class="absolute inset-1 rounded-full border border-white/10"></div>
      <div class="absolute w-full h-[1px] bg-[#00E5FF]/20"></div>
      <div class="absolute h-full w-[1px] bg-[#00E5FF]/20"></div>
      
      <!-- Target crosshair marker on South Asia -->
      <div class="absolute top-[40%] right-[35%] w-2 h-2 rounded-full bg-[#EF4444] shadow-[0_0_8px_#EF4444] animate-pulse"></div>
      <div class="absolute top-[38%] right-[33%] w-4 h-4 rounded-full border border-[#EF4444]/60"></div>

      <!-- Live GPS coordinates tag -->
      <div class="absolute bottom-1 inset-x-0 text-center text-[7px] font-mono text-[#00E5FF] tracking-tighter">
        23.8°N 90.4°E
      </div>
    </div>
  </div>

  <!-- Map Action Controls (Right Rail) -->
  <div class="map-hud-control absolute top-16 right-3.5 z-20 flex flex-col gap-1.5 bg-[#061425]/80 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg">
    <button
      on:click={handleZoomIn}
      class="w-7 h-7 rounded-lg hover:bg-white/10 text-white flex items-center justify-center font-bold text-sm transition-all cursor-pointer"
      title="Zoom In"
    >
      +
    </button>
    <button
      on:click={handleZoomOut}
      class="w-7 h-7 rounded-lg hover:bg-white/10 text-white flex items-center justify-center font-bold text-sm transition-all cursor-pointer"
      title="Zoom Out"
    >
      −
    </button>
    <div class="w-full h-[1px] bg-white/10"></div>
    <button
      on:click={handleResetView}
      class="w-7 h-7 rounded-lg hover:bg-white/10 text-[#00E5FF] flex items-center justify-center text-sm transition-all cursor-pointer"
      title="Recenter Map View"
    >
      ⊙
    </button>
  </div>

  <!-- Tactical Marker Inspector Card (When Marker Clicked) -->
  {#if $selectedMarker}
    <div class="inspector-card absolute top-14 left-3.5 z-30 w-72 p-3.5 rounded-2xl bg-[#061425]/95 backdrop-blur-2xl border border-[#00E5FF]/50 shadow-[0_8px_32px_rgba(0,0,0,0.8)] text-left select-none animate-fadeIn">
      <div class="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full {
            $selectedMarker.type === 'team' ? 'bg-[#00E5FF]' : 'bg-[#EF4444]'
          } shadow-[0_0_6px]"></span>
          <span class="text-xs font-mono font-bold text-white uppercase truncate max-w-[190px]">
            {$selectedMarker.name}
          </span>
        </div>
        <button
          on:click={() => selectedMarker.set(null)}
          class="text-[#8BA1B8] hover:text-white text-xs font-mono p-1 rounded hover:bg-white/10 cursor-pointer"
        >
          ✕
        </button>
      </div>

      <div class="space-y-1.5 text-[11px] font-mono mb-3">
        <div class="flex justify-between text-[#8BA1B8]">
          <span>Type:</span>
          <span class="text-white uppercase">{$selectedMarker.type}</span>
        </div>
        <div class="flex justify-between text-[#8BA1B8]">
          <span>Status:</span>
          <span class="text-emerald-400 font-bold">{$selectedMarker.status}</span>
        </div>
        {#if $selectedMarker.meta?.personnel}
          <div class="flex justify-between text-[#8BA1B8]">
            <span>Personnel:</span>
            <span class="text-white">{$selectedMarker.meta.personnel} operators</span>
          </div>
        {/if}
        {#if $selectedMarker.meta?.vehicle}
          <div class="flex justify-between text-[#8BA1B8]">
            <span>Asset:</span>
            <span class="text-[#00E5FF] truncate max-w-[140px]">{$selectedMarker.meta.vehicle}</span>
          </div>
        {/if}
        {#if $selectedMarker.meta?.mission}
          <div class="pt-1 text-[#C5D1DE] text-[10px] font-sans border-t border-white/5">
            {$selectedMarker.meta.mission}
          </div>
        {/if}
      </div>

      <!-- Inspector Action Buttons -->
      <div class="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
        <button
          on:click={() => isDeployTeamModalOpen.set(true)}
          class="py-1 px-2 rounded-lg bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 border border-[#00E5FF]/50 text-[#00E5FF] text-[10px] font-mono font-bold transition-all text-center cursor-pointer"
        >
          Reassign Team
        </button>
        <button
          on:click={() => isAllocateResourceModalOpen.set(true)}
          class="py-1 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white text-[10px] font-mono transition-all text-center cursor-pointer"
        >
          Allocate Stock
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out forwards;
  }
</style>
