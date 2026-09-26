<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { selectedIncident, timelineStep, selectIncident } from '../../stores/incidentStore';
  import type { HazardIncident } from '../../types';

  let canvasEl: HTMLCanvasElement;
  let containerEl: HTMLDivElement;
  let animId: number;

  // Pan & Zoom interactive state
  let zoom = 1.0;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  // Layer toggles
  let showFloodExtent = true;
  let showHighRisk = true;
  let showDistricts = true;
  let showRivers = true;
  let showCities = true;
  let showLayersMenu = false;

  // Pulse animation phase
  let animTime = 0;

  const timelineSteps = ['-24h', '-12h', 'NOW', '+24h', '+48h', '+72h'];

  function resetView() {
    zoom = 1.0;
    panX = 0;
    panY = 0;
  }

  function zoomIn() {
    zoom = Math.min(2.8, zoom + 0.25);
  }

  function zoomOut() {
    zoom = Math.max(0.6, zoom - 0.25);
  }

  function handleMouseDown(e: MouseEvent) {
    isDragging = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    zoom = Math.max(0.5, Math.min(3.0, zoom * zoomFactor));
  }

  onMount(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    drawLoop();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animId) cancelAnimationFrame(animId);
    };
  });

  onDestroy(() => {
    if (animId) cancelAnimationFrame(animId);
  });

  function handleResize() {
    if (!containerEl || !canvasEl) return;
    const rect = containerEl.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasEl.width = rect.width * dpr;
    canvasEl.height = rect.height * dpr;
  }

  function drawLoop() {
    animId = requestAnimationFrame(drawLoop);
    animTime += 0.025;
    renderMap();
  }

  function renderMap() {
    if (!canvasEl || !containerEl || !$selectedIncident) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    const w = canvasEl.width;
    const h = canvasEl.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    ctx.save();
    ctx.scale(dpr, dpr);
    const cssW = w / dpr;
    const cssH = h / dpr;

    // 1. Dark Satellite / Geospatial Command Backdrop
    const bgGrad = ctx.createRadialGradient(cssW * 0.5, cssH * 0.5, 50, cssW * 0.5, cssH * 0.5, cssW * 0.8);
    bgGrad.addColorStop(0, '#041326');
    bgGrad.addColorStop(0.7, '#020914');
    bgGrad.addColorStop(1, '#01050d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, cssW, cssH);

    // Apply User Pan & Zoom Transform
    ctx.save();
    ctx.translate(cssW * 0.5 + panX, cssH * 0.5 + panY);
    ctx.scale(zoom, zoom);

    // 2. Geospatial Latitude / Longitude Coordinate Grid
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
    ctx.lineWidth = 1;
    const gridSize = 60;
    const halfW = cssW * 1.5;
    const halfH = cssH * 1.5;

    for (let x = -halfW; x <= halfW; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, -halfH);
      ctx.lineTo(x, halfH);
      ctx.stroke();
    }
    for (let y = -halfH; y <= halfH; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(-halfW, y);
      ctx.lineTo(halfW, y);
      ctx.stroke();
    }

    // 3. Geographic Projection Transformation for Selected Incident
    const geom = $selectedIncident.geometry;
    const centerLng = geom?.center ? geom.center[0] : $selectedIncident.coords.lng;
    const centerLat = geom?.center ? geom.center[1] : $selectedIncident.coords.lat;

    // Scale factor to map degrees to pixels
    const geoScale = 140;

    function project(lng: number, lat: number): [number, number] {
      const px = (lng - centerLng) * geoScale;
      const py = -(lat - centerLat) * geoScale; // invert latitude for y
      return [px, py];
    }

    // Timeline-driven expansion multiplier (Swelling flood/hazard over time)
    const timeIndex = timelineSteps.indexOf($timelineStep);
    const timeScale = 0.85 + (timeIndex >= 0 ? timeIndex * 0.08 : 0.2);

    // 4. Affected Districts Layer (Purple Shaded Regions)
    if (showDistricts && geom?.affectedDistricts) {
      geom.affectedDistricts.forEach((dist) => {
        const [dx, dy] = project(dist.coords[0], dist.coords[1]);
        const distRad = 36 * timeScale;

        // Subtle purple polygonal aura
        const dGrad = ctx.createRadialGradient(dx, dy, 5, dx, dy, distRad);
        dGrad.addColorStop(0, 'rgba(139, 92, 246, 0.35)');
        dGrad.addColorStop(0.8, 'rgba(139, 92, 246, 0.10)');
        dGrad.addColorStop(1, 'rgba(139, 92, 246, 0.0)');

        ctx.fillStyle = dGrad;
        ctx.beginPath();
        ctx.arc(dx, dy, distRad, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // District Label
        ctx.font = '9px monospace';
        ctx.fillStyle = '#C084FC';
        ctx.fillText(dist.name, dx - 18, dy - distRad - 4);
      });
    }

    // 5. Active Flood / Hazard Extent Layer (Cyan Luminous Animated Water Polygon)
    if (showFloodExtent && geom?.floodExtent && geom.floodExtent.length > 2) {
      ctx.beginPath();
      const firstPt = project(geom.floodExtent[0][0], geom.floodExtent[0][1]);
      ctx.moveTo(firstPt[0] * timeScale, firstPt[1] * timeScale);

      for (let i = 1; i < geom.floodExtent.length; i++) {
        const pt = project(geom.floodExtent[i][0], geom.floodExtent[i][1]);
        ctx.lineTo(pt[0] * timeScale, pt[1] * timeScale);
      }
      ctx.closePath();

      // Pulsing water caustics fill
      const waveAlpha = 0.35 + 0.08 * Math.sin(animTime * 2);
      ctx.fillStyle = `rgba(0, 229, 255, ${waveAlpha})`;
      ctx.fill();

      // Glowing outer fringe line
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    }

    // 6. River Network Vectors (Glowing Neon Cyan Channels)
    if (showRivers && geom?.rivers) {
      geom.rivers.forEach((river) => {
        if (river.path.length > 1) {
          ctx.beginPath();
          const start = project(river.path[0][0], river.path[0][1]);
          ctx.moveTo(start[0], start[1]);

          for (let p = 1; p < river.path.length; p++) {
            const next = project(river.path[p][0], river.path[p][1]);
            ctx.lineTo(next[0], next[1]);
          }

          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 3.0;
          ctx.stroke();

          // River core highlight
          ctx.strokeStyle = '#E0F2FE';
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }
      });
    }

    // 7. High-Risk Zones (Red / Orange Pulsing Radar Hotspots)
    if (showHighRisk && geom?.highRiskZones) {
      geom.highRiskZones.forEach((zone, idx) => {
        const [zx, zy] = project(zone.coords[0], zone.coords[1]);
        const pulse = (animTime + idx * 0.8) % 2.5;
        const pulseRad = 15 + pulse * 22;
        const pulseAlpha = Math.max(0, 1 - pulse / 2.5);

        // Radar Expanding Ring
        ctx.beginPath();
        ctx.arc(zx, zy, pulseRad, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(239, 68, 68, ${pulseAlpha * 0.8})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Solid Center Beacon
        ctx.beginPath();
        ctx.arc(zx, zy, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = '#EF4444';
        ctx.shadowColor = '#EF4444';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Hotspot Label
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#FCA5A5';
        ctx.fillText(zone.name, zx + 10, zy + 4);
      });
    }

    // 8. Key Cities Pins & Typography
    if (showCities && geom?.cities) {
      geom.cities.forEach((city) => {
        const [cx, cy] = project(city.coords[0], city.coords[1]);

        ctx.beginPath();
        ctx.arc(cx, cy, city.isCapital ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = city.isCapital ? '#00E5FF' : '#FFFFFF';
        ctx.fill();

        ctx.strokeStyle = '#020711';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // City Label with dark backdrop box
        ctx.font = city.isCapital ? 'bold 11px monospace' : '10px monospace';
        const text = city.name + (city.isCapital ? ' (CAPITAL)' : '');
        const metrics = ctx.measureText(text);

        ctx.fillStyle = 'rgba(2, 7, 17, 0.8)';
        ctx.fillRect(cx + 8, cy - 8, metrics.width + 6, 14);

        ctx.fillStyle = city.isCapital ? '#00E5FF' : '#E2E8F0';
        ctx.fillText(text, cx + 11, cy + 3);
      });
    }

    ctx.restore(); // restore zoom/pan
    ctx.restore(); // restore DPR scale
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  bind:this={containerEl}
  on:mousedown={handleMouseDown}
  on:mousemove={handleMouseMove}
  on:mouseup={handleMouseUp}
  on:mouseleave={handleMouseUp}
  on:wheel={handleWheel}
  class="relative flex-1 w-full h-full min-h-[360px] rounded-2xl bg-[#020711] border border-white/10 overflow-hidden select-none cursor-grab active:cursor-grabbing shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]"
>
  <!-- Main Interactive Canvas -->
  <canvas bind:this={canvasEl} class="absolute inset-0 w-full h-full block"></canvas>

  <!-- Top-Left Geospatial Header Tag -->
  <div class="absolute top-3.5 left-3.5 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#030a16]/85 backdrop-blur-md border border-[#00E5FF]/30 text-[11px] font-mono text-white shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
    <span class="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse"></span>
    <span class="text-[#00E5FF] font-bold">GEOSPATIAL INTELLIGENCE //</span>
    <span>{$selectedIncident?.country.toUpperCase()} SECTOR</span>
    <span class="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-[#8BA1B8]">
      {Math.round(zoom * 100)}% ZOOM
    </span>
  </div>

  <!-- Top-Right Compact Map Legend -->
  <div class="absolute top-3.5 right-3.5 z-20 p-2.5 rounded-xl bg-[#030a16]/90 backdrop-blur-md border border-white/10 font-mono text-[10px] space-y-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.7)]">
    <div class="text-[9px] text-[#8BA1B8] uppercase tracking-wider font-bold pb-1 border-b border-white/10">
      Map Legend
    </div>
    <div class="flex items-center gap-2">
      <span class="w-3 h-2 rounded bg-[#00E5FF]/60 border border-[#00E5FF]"></span>
      <span class="text-white">
        {$selectedIncident?.type === 'flood' ? 'Flood Extent' : $selectedIncident?.type === 'wildfire' ? 'Burn Perimeter' : $selectedIncident?.type === 'cyclone' ? 'Storm Extent' : 'Hazard Extent'}
      </span>
    </div>
    <div class="flex items-center gap-2">
      <span class="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_#EF4444]"></span>
      <span class="text-white">High Risk Zones</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="w-3 h-2 rounded bg-purple-500/30 border border-purple-400"></span>
      <span class="text-white">Affected Districts</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="w-3.5 h-0.5 bg-[#38BDF8]"></span>
      <span class="text-white">Rivers / Arterials</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-white"></span>
      <span class="text-white">Key Cities</span>
    </div>
  </div>

  <!-- Floating Right Map Controls (Zoom, Layers, Recenter) -->
  <div class="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5 p-1 rounded-xl bg-[#030a16]/90 backdrop-blur-md border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.7)]">
    <button
      on:click={zoomIn}
      class="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#00E5FF]/20 hover:text-[#00E5FF] text-white flex items-center justify-center text-sm font-mono transition-all cursor-pointer"
      title="Zoom In"
    >
      +
    </button>
    <button
      on:click={zoomOut}
      class="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#00E5FF]/20 hover:text-[#00E5FF] text-white flex items-center justify-center text-sm font-mono transition-all cursor-pointer"
      title="Zoom Out"
    >
      −
    </button>
    <button
      on:click={resetView}
      class="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#00E5FF]/20 hover:text-[#00E5FF] text-white flex items-center justify-center text-xs font-mono transition-all cursor-pointer"
      title="Recenter Map"
    >
      ⊙
    </button>
    <button
      on:click={() => (showLayersMenu = !showLayersMenu)}
      class="w-7 h-7 rounded-lg {showLayersMenu ? 'bg-[#00E5FF]/30 text-[#00E5FF]' : 'bg-white/5 text-white'} hover:bg-[#00E5FF]/20 flex items-center justify-center text-xs transition-all cursor-pointer"
      title="Toggle Layers"
    >
      ≡
    </button>
  </div>

  <!-- Layers Toggle Dropdown Modal -->
  {#if showLayersMenu}
    <div class="absolute right-12 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-xl bg-[#030a16]/95 backdrop-blur-md border border-[#00E5FF]/40 shadow-[0_8px_32px_rgba(0,0,0,0.8)] font-mono text-[10px] space-y-1.5 min-w-[150px]">
      <div class="font-bold text-[#00E5FF] pb-1 border-b border-white/10 uppercase">
        Active Overlays
      </div>
      <label class="flex items-center gap-2 cursor-pointer text-white">
        <input type="checkbox" bind:checked={showFloodExtent} class="accent-[#00E5FF]" />
        <span>Flood Extent</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer text-white">
        <input type="checkbox" bind:checked={showHighRisk} class="accent-red-500" />
        <span>High Risk</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer text-white">
        <input type="checkbox" bind:checked={showDistricts} class="accent-purple-500" />
        <span>Districts</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer text-white">
        <input type="checkbox" bind:checked={showRivers} class="accent-[#38BDF8]" />
        <span>Rivers</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer text-white">
        <input type="checkbox" bind:checked={showCities} class="accent-white" />
        <span>Key Cities</span>
      </label>
    </div>
  {/if}

  <!-- Lower-Right Mini-Map (Global Reticle Locator) -->
  <div class="absolute bottom-16 right-3.5 z-20 w-24 h-24 rounded-2xl bg-[#020711]/90 backdrop-blur-md border border-[#00E5FF]/40 shadow-[0_4px_24px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col items-center justify-center group pointer-events-auto">
    <!-- Simplified SVG World Map with Target Marker -->
    <svg viewBox="0 0 100 60" class="w-full h-full opacity-60">
      <!-- Continental blobs -->
      <path d="M15 15 Q25 10 35 25 Q30 45 20 50 Z" fill="#1E293B" />
      <path d="M45 10 Q70 8 85 22 Q75 40 55 35 Z" fill="#1E293B" />
      <path d="M50 32 Q62 30 65 48 Q55 52 48 40 Z" fill="#1E293B" />
      <path d="M72 38 Q85 36 86 48 Q76 52 72 44 Z" fill="#1E293B" />

      <!-- Target reticle based on coordinates -->
      {#if $selectedIncident}
        {@const markerX = 50 + ($selectedIncident.coords.lng / 180) * 45}
        {@const markerY = 30 - ($selectedIncident.coords.lat / 90) * 25}
        <circle cx={markerX} cy={markerY} r="3" fill="#00E5FF" class="animate-ping" />
        <circle cx={markerX} cy={markerY} r="2" fill="#FFFFFF" />
        <circle cx={markerX} cy={markerY} r="6" stroke="#00E5FF" stroke-width="0.8" fill="none" />
      {/if}
    </svg>
    <div class="absolute bottom-1 text-[8px] font-mono text-[#00E5FF] tracking-widest uppercase font-bold">
      GLOBAL LOC
    </div>
  </div>

  <!-- Bottom Temporal Timeline Scrubber Bar -->
  <div class="absolute bottom-2.5 inset-x-3.5 z-20 flex items-center justify-between gap-3 px-4 py-2 rounded-2xl bg-[#030a16]/95 backdrop-blur-xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.8)] font-mono text-xs">
    
    <!-- Live Status Indicator -->
    <div class="flex items-center gap-2 shrink-0">
      <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
      <span class="text-white font-bold tracking-wider text-[11px]">TIMELINE</span>
      <span class="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">LIVE</span>
    </div>

    <!-- Scrubber Steps -->
    <div class="flex-1 flex items-center justify-between max-w-xl mx-auto relative px-2">
      <!-- Connecting track line -->
      <div class="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-white/20 z-0"></div>

      {#each timelineSteps as step}
        <button
          on:click={() => timelineStep.set(step)}
          class="relative z-10 flex flex-col items-center gap-1 group cursor-pointer"
        >
          <!-- Scrubber Node Circle -->
          <span class="w-3.5 h-3.5 rounded-full border-2 transition-all {
            $timelineStep === step
              ? 'bg-[#00E5FF] border-white shadow-[0_0_12px_#00E5FF] scale-125'
              : 'bg-[#030a16] border-white/40 group-hover:border-[#00E5FF] group-hover:bg-[#00E5FF]/40'
          }"></span>

          <!-- Time Label -->
          <span class="text-[10px] font-bold tracking-wider {
            $timelineStep === step ? 'text-[#00E5FF]' : 'text-[#8BA1B8] group-hover:text-white'
          }">
            {step}
          </span>
        </button>
      {/each}
    </div>

    <!-- Forecast Active Stat -->
    <div class="shrink-0 text-right hidden sm:block">
      <span class="text-[9px] text-[#8BA1B8] uppercase block">Modeled Inundation</span>
      <span class="text-xs font-bold text-white">
        {$timelineStep === 'NOW' ? '1,420 km²' : $timelineStep === '+24h' ? '1,750 km²' : $timelineStep === '+48h' ? '1,980 km²' : '1,820 km²'}
      </span>
    </div>

  </div>

</div>
