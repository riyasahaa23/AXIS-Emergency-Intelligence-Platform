<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    selectedScenarioHazard,
    currentHazardConfig,
    scenarioParameters,
    simulationTimelineDay,
    isSimulationPlaying,
    setSimulationTimelineDay,
    toggleSimulationPlayback,
    scenarioSimulationResult,
    isSimulating
  } from '$lib/stores/scenarioStore';
  import type { ScenarioTimelineDay } from '$lib/types/scenario';

  let canvas: HTMLCanvasElement;
  let animFrameId: number;
  let pulsePhase = 0;
  let zoomLevel = 1.0;
  let panOffsetX = 0;
  let panOffsetY = 0;
  let isDragging = false;
  let startDragX = 0;
  let startDragY = 0;
  let showLayersMenu = false;
  let activeLayers = {
    current: true,
    simulated: true,
    highRisk: true,
    infrastructure: true,
    labels: true
  };

  const timelineDays: ScenarioTimelineDay[] = [1, 3, 7, 14, 30];

  function handleMouseDown(e: MouseEvent) {
    isDragging = true;
    startDragX = e.clientX - panOffsetX;
    startDragY = e.clientY - panOffsetY;
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    panOffsetX = e.clientX - startDragX;
    panOffsetY = e.clientY - startDragY;
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function zoomIn() {
    zoomLevel = Math.min(zoomLevel * 1.25, 2.5);
  }

  function zoomOut() {
    zoomLevel = Math.max(zoomLevel / 1.25, 0.7);
  }

  function resetView() {
    zoomLevel = 1.0;
    panOffsetX = 0;
    panOffsetY = 0;
  }

  onMount(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resizeCanvas() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function render() {
      if (!canvas || !ctx) return;
      const width = canvas.width;
      const height = canvas.height;
      const dpr = window.devicePixelRatio || 1;

      pulsePhase += 0.035;

      ctx.clearRect(0, 0, width, height);

      // Deep space / cinematic dark ocean background
      const bgGrad = ctx.createRadialGradient(
        width / 2 + panOffsetX * dpr,
        height / 2 + panOffsetY * dpr,
        50 * zoomLevel,
        width / 2,
        height / 2,
        width * 0.75
      );
      bgGrad.addColorStop(0, '#041122');
      bgGrad.addColorStop(0.6, '#020814');
      bgGrad.addColorStop(1, '#01040a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      // Apply pan and zoom
      ctx.translate(width / 2 + panOffsetX * dpr, height / 2 + panOffsetY * dpr);
      ctx.scale(zoomLevel * dpr, zoomLevel * dpr);

      // Draw subtle geospatial coordinate grid
      drawCoordinateGrid(ctx);

      const hazard = $selectedScenarioHazard;
      const expansion = $scenarioSimulationResult.expansionMultiplier;

      if (hazard === 'flood') {
        renderFloodSimulation(ctx, expansion, pulsePhase);
      } else if (hazard === 'cyclone') {
        renderCycloneSimulation(ctx, expansion, pulsePhase);
      } else if (hazard === 'wildfire') {
        renderWildfireSimulation(ctx, expansion, pulsePhase);
      } else if (hazard === 'earthquake') {
        renderEarthquakeSimulation(ctx, expansion, pulsePhase);
      } else {
        renderMultiHazardSimulation(ctx, expansion, pulsePhase);
      }

      ctx.restore();

      animFrameId = requestAnimationFrame(render);
    }

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  });

  onDestroy(() => {
    if (animFrameId) cancelAnimationFrame(animFrameId);
  });

  // --- DRAWING ROUTINES ---

  function drawCoordinateGrid(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let x = -400; x <= 400; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, -300);
      ctx.lineTo(x, 300);
      ctx.stroke();
    }
    for (let y = -300; y <= 300; y += 100) {
      ctx.beginPath();
      ctx.moveTo(-400, y);
      ctx.lineTo(400, y);
      ctx.stroke();
    }

    // Coordinates tick labels
    ctx.fillStyle = 'rgba(139, 161, 184, 0.2)';
    ctx.font = '8px monospace';
    ctx.fillText('24°N 90°E // CORRIDOR', -360, -260);
  }

  // 1. FLOOD SIMULATION
  function renderFloodSimulation(ctx: CanvasRenderingContext2D, expansion: number, phase: number) {
    // Bangladesh Delta Coastline polygon
    const deltaPoints = [
      { x: -160, y: -180 }, { x: -60, y: -190 }, { x: 50, y: -210 },
      { x: 130, y: -150 }, { x: 170, y: -80 }, { x: 150, y: 30 },
      { x: 110, y: 130 }, { x: 40, y: 160 }, { x: -30, y: 140 },
      { x: -90, y: 110 }, { x: -140, y: 50 }, { x: -180, y: -60 }
    ];

    // Terrain territory fill
    ctx.beginPath();
    deltaPoints.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    ctx.fillStyle = '#06162a';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Major River Arteries (Jamuna, Padma, Meghna, Surma)
    ctx.beginPath();
    ctx.moveTo(-20, -190);
    ctx.bezierCurveTo(-30, -90, -40, -10, 0, 40);
    ctx.bezierCurveTo(40, 70, 70, 110, 80, 150);
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Surma-Meghna Northeast branch
    ctx.beginPath();
    ctx.moveTo(110, -140);
    ctx.bezierCurveTo(90, -70, 40, -20, 0, 40);
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.55)';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // LAYER A: CURRENT REALITY FLOOD EXTENT (Cyan)
    if (activeLayers.current) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(-10, 10, 65, 45, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 229, 255, 0.22)';
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 15;
      ctx.fill();

      // Northeast Sylhet depression
      ctx.beginPath();
      ctx.ellipse(80, -65, 42, 30, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 229, 255, 0.25)';
      ctx.fill();
      ctx.restore();
    }

    // LAYER B: SIMULATED FUTURE EXTENT (Violet / Magenta)
    if (activeLayers.simulated) {
      ctx.save();
      const simScale = Math.max(expansion, 1.15);
      const pulse = Math.sin(phase * 1.5) * 4;

      // Primary expanding inundation zone
      ctx.beginPath();
      ctx.ellipse(-8, 12, 65 * simScale + pulse, 45 * simScale + pulse, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.32)';
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.85)';
      ctx.lineWidth = 2.0;
      ctx.setLineDash([6, 4]);
      ctx.lineDashOffset = -phase * 15;
      ctx.shadowColor = '#A855F7';
      ctx.shadowBlur = 25;
      ctx.fill();
      ctx.stroke();

      // Secondary Sylhet-Surma expanding lake
      ctx.beginPath();
      ctx.ellipse(85, -60, 42 * simScale + pulse * 0.7, 30 * simScale + pulse * 0.7, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.28)';
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.75)';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.fill();

      ctx.restore();
    }

    // LAYER C: HIGH RISK CORE (Red)
    if (activeLayers.highRisk) {
      ctx.save();
      const rPulse = Math.sin(phase * 3) * 3;
      ctx.beginPath();
      ctx.arc(-5, 5, 22 + rPulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Incident Center Beacon (Dhaka / Central Hub)
    drawPulsingBeacon(ctx, -5, 5, '#00E5FF', phase, 'DHAKA (HQ)');

    // Key City Markers
    if (activeLayers.labels) {
      drawCityMarker(ctx, 85, -80, 'Sylhet');
      drawCityMarker(ctx, 120, 110, 'Chittagong');
      drawCityMarker(ctx, -120, -30, 'Rajshahi');
      drawCityMarker(ctx, -60, 80, 'Khulna');
      drawCityMarker(ctx, -80, -150, 'Rangpur');
      drawCityMarker(ctx, 10, -110, 'Mymensingh');
    }
  }

  // 2. CYCLONE SIMULATION
  function renderCycloneSimulation(ctx: CanvasRenderingContext2D, expansion: number, phase: number) {
    const cx = -30 + (expansion - 1) * 35;
    const cy = -20 - (expansion - 1) * 25;

    // Projected Landfall coastline
    ctx.beginPath();
    ctx.moveTo(-220, 100);
    ctx.bezierCurveTo(-100, 40, 80, 20, 220, -30);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Baseline Track (Cyan)
    if (activeLayers.current) {
      ctx.beginPath();
      ctx.moveTo(-160, 160);
      ctx.bezierCurveTo(-90, 80, -30, 20, 20, -50);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = 'rgba(0, 229, 255, 0.7)';
      ctx.font = '9px monospace';
      ctx.fillText('BASELINE TRACK', -150, 140);
    }

    // Simulated Shifted Track (Violet/Magenta)
    if (activeLayers.simulated) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-160, 160);
      ctx.bezierCurveTo(-60, 90, 30, 40, 110, -40);
      ctx.strokeStyle = '#C084FC';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.lineDashOffset = -phase * 12;
      ctx.shadowColor = '#A855F7';
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.fillStyle = '#C084FC';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('SIMULATED TRACK (+100km SHIFT)', 40, 20);
      ctx.restore();
    }

    // Rotating Cyclone Vortex Spiral
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(phase * 0.8);

    for (let r = 25; r <= 110 * expansion; r += 20) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 1.4);
      ctx.strokeStyle = r < 50 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(168, 85, 247, 0.45)';
      ctx.lineWidth = 3.5;
      ctx.stroke();
    }
    ctx.restore();

    // Eyewall core beacon
    drawPulsingBeacon(ctx, cx, cy, '#EF4444', phase, 'EYE OF MAREX');
    drawCityMarker(ctx, 120, -20, 'Chittagong Port');
    drawCityMarker(ctx, -80, 20, 'Mongla Port');
  }

  // 3. WILDFIRE SIMULATION
  function renderWildfireSimulation(ctx: CanvasRenderingContext2D, expansion: number, phase: number) {
    // Current Burn Perimeter (Amber/Orange)
    if (activeLayers.current) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(-20, 10, 50, 35, 0.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(249, 115, 22, 0.35)';
      ctx.strokeStyle = '#F97316';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#F97316';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Simulated Projected Perimeter (Magenta/Violet with flame wave)
    if (activeLayers.simulated) {
      ctx.save();
      const wScale = expansion * 1.25;
      ctx.beginPath();
      ctx.ellipse(10, -10, 50 * wScale, 35 * wScale, 0.45, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.strokeStyle = '#C084FC';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([7, 4]);
      ctx.shadowColor = '#A855F7';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Wind Vector Arrow
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-120, -80);
      ctx.lineTo(-40, -40);
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 3;
      ctx.stroke();
      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(-40, -40);
      ctx.lineTo(-55, -50);
      ctx.lineTo(-50, -35);
      ctx.closePath();
      ctx.fillStyle = '#00E5FF';
      ctx.fill();
      ctx.font = '10px monospace';
      ctx.fillStyle = '#00E5FF';
      ctx.fillText('WIND // 45 KM/H NE', -140, -90);
      ctx.restore();
    }

    drawPulsingBeacon(ctx, -20, 10, '#EF4444', phase, 'FIRE FRONT ALPHA');
    drawCityMarker(ctx, 110, -60, 'Fort Nelson Evac Zone');
    drawCityMarker(ctx, -140, 80, 'Highway 97 Corridor');
  }

  // 4. EARTHQUAKE SIMULATION
  function renderEarthquakeSimulation(ctx: CanvasRenderingContext2D, expansion: number, phase: number) {
    const mag = $scenarioParameters.magnitude || 6.8;
    const aftershocks = $scenarioParameters.aftershockRate || 45;
    const roadAccess = $scenarioParameters.roadAccessibility || 65;
    const ex = 20;
    const ey = -40;

    // Noto Peninsula (Ishikawa Prefecture) terrain landmass polygon
    const notoPoints = [
      { x: -160, y: 150 }, // Kanazawa South
      { x: -130, y: 70 },  // Hakui
      { x: -80, y: 0 },    // Nanao Bay
      { x: -60, y: -70 },  // Anamizu
      { x: -10, y: -130 }, // Wajima Outer Coast
      { x: 50, y: -140 },  // Suzu Cape Rokko
      { x: 90, y: -90 },   // Suzu Bay
      { x: 70, y: -20 },   // Noto Town
      { x: 30, y: 40 },    // Toyama Bay
      { x: -10, y: 110 },  // Takaoka / Toyama
      { x: -100, y: 170 }  // Ishikawa boundary
    ];

    // Landmass fill
    ctx.beginPath();
    notoPoints.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    ctx.fillStyle = '#0a192f';
    ctx.fill();
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Fault line along offshore Noto shelf
    ctx.beginPath();
    ctx.moveTo(-50, -150);
    ctx.bezierCurveTo(10, -155, 60, -120, 110, -80);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Highway 249 & Noto Satoyama Kaido road network
    ctx.beginPath();
    ctx.moveTo(-140, 120);
    ctx.lineTo(-80, 0);
    ctx.lineTo(-60, -70);
    ctx.lineTo(-10, -130);
    ctx.lineTo(50, -140);
    ctx.strokeStyle = roadAccess < 40 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(0, 229, 255, 0.5)';
    ctx.lineWidth = 2;
    if (roadAccess < 40) ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Seismic Waves propagating outwards from offshore epicenter
    const waveCount = Math.round(3 + (mag - 5.0) * 1.5);
    for (let i = 1; i <= waveCount; i++) {
      const radius = (i * 28 * expansion * (mag / 6.0) + (phase * 25) % 45);
      ctx.beginPath();
      ctx.arc(ex, ey, radius, 0, Math.PI * 2);
      ctx.strokeStyle = i <= 2 ? 'rgba(239, 68, 68, 0.75)' : 'rgba(168, 85, 247, 0.45)';
      ctx.lineWidth = Math.max(3.2 - i * 0.5, 1);
      ctx.stroke();
    }

    // Epicenter Beacon with dynamic magnitude
    drawPulsingBeacon(ctx, ex, ey, '#EF4444', phase, `M${mag.toFixed(1)} EPICENTER`);

    // Key Cities & Ports
    drawCityMarker(ctx, 45, -125, 'Suzu (Intense Shaking)');
    drawCityMarker(ctx, -15, -115, 'Wajima Port (Tsunami/Fire Risk)');
    drawCityMarker(ctx, -55, -55, 'Anamizu Staging Area');
    drawCityMarker(ctx, -75, 10, 'Nanao Evac Hub');
    drawCityMarker(ctx, -145, 130, 'Kanazawa Logistics Base');
  }

  // 5. MULTI-HAZARD SIMULATION
  function renderMultiHazardSimulation(ctx: CanvasRenderingContext2D, expansion: number, phase: number) {
    // Render flood baseline
    renderFloodSimulation(ctx, expansion * 1.1, phase);

    // Overlay cyclone spiral over coastal mouth
    ctx.save();
    ctx.translate(60, 90);
    ctx.rotate(-phase * 1.1);
    for (let r = 18; r <= 80 * expansion; r += 18) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 1.5);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    ctx.restore();

    // Compound Failure Label
    ctx.fillStyle = '#EF4444';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('COMPOUND FAILURE // SURGE + DELTA CREST', -110, 180);
  }

  function drawPulsingBeacon(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, phase: number, label: string) {
    const pulse1 = (phase * 22) % 40;
    const pulse2 = ((phase * 22) + 20) % 40;

    // Expanding Rings
    ctx.beginPath();
    ctx.arc(x, y, 8 + pulse1, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.globalAlpha = Math.max(1 - pulse1 / 40, 0);
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 8 + pulse2, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.globalAlpha = Math.max(1 - pulse2 / 40, 0);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Center Core
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fill();

    // Beacon Label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9px monospace';
    ctx.shadowColor = 'transparent';
    ctx.fillText(label, x + 8, y - 6);
  }

  function drawCityMarker(ctx: CanvasRenderingContext2D, x: number, y: number, name: string) {
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#8BA1B8';
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '8px monospace';
    ctx.fillText(name, x + 5, y + 3);
  }
</script>

<div class="relative w-full h-full flex flex-col bg-[#030914] rounded-2xl border border-white/10 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.7)] font-mono select-none">
  
  <!-- Canvas Viewport -->
  <div class="relative flex-1 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing">
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <canvas
      bind:this={canvas}
      on:mousedown={handleMouseDown}
      on:mousemove={handleMouseMove}
      on:mouseup={handleMouseUp}
      on:mouseleave={handleMouseUp}
      class="w-full h-full block"
    ></canvas>

    <!-- Top Left Overlay: Dynamic Simulation Legend -->
    <div class="absolute top-3 left-3 z-10 p-3 rounded-xl bg-[#020711]/85 backdrop-blur-md border border-white/10 flex flex-col gap-2 max-w-[240px] pointer-events-auto">
      <div class="flex items-center gap-1.5 pb-1 border-b border-white/10">
        <span class="w-2 h-2 rounded-full bg-[#8B5CF6] shadow-[0_0_8px_#8B5CF6]"></span>
        <span class="text-[10px] font-bold text-white uppercase tracking-wider">
          {#if $selectedScenarioHazard === 'flood'}
            SCENARIO: +{$scenarioParameters.rainfallIncrease || 50}% RAINFALL
          {:else if $selectedScenarioHazard === 'cyclone'}
            SCENARIO: +{$scenarioParameters.trackShift || 100}KM TRACK SHIFT
          {:else if $selectedScenarioHazard === 'wildfire'}
            SCENARIO: +{$scenarioParameters.windSpeed || 20}KM/H WIND
          {:else if $selectedScenarioHazard === 'earthquake'}
            SCENARIO: {$scenarioParameters.magnitude || 6.8}M // {$scenarioParameters.aftershockRate || 45}% AFTERSHOCK
          {:else}
            SCENARIO: {$scenarioParameters.cascadeCoupling || 1.8}X CASCADE
          {/if}
        </span>
      </div>

      <div class="flex flex-col gap-1.5 text-[9px] text-[#8BA1B8]">
        <div class="flex items-center gap-2">
          <span class="w-3 h-1.5 rounded-sm bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></span>
          <span>CURRENT REALITY EXTENT</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-1.5 rounded-sm bg-[#A855F7] shadow-[0_0_6px_#A855F7]"></span>
          <span class="text-white font-semibold">PROJECTED SIMULATION</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-1.5 rounded-sm bg-[#EF4444] shadow-[0_0_6px_#EF4444]"></span>
          <span>HIGH RISK / IMPACT ZONE</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-0.5 bg-[#00E5FF]"></span>
          <span>MAJOR CHANNELS / ROADS</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
          <span>KEY CITIES & DISPATCH HQ</span>
        </div>
      </div>
    </div>

    <!-- Top Right Overlay: Map Control Toolbar -->
    <div class="absolute top-3 right-3 z-10 flex flex-col gap-1.5 p-1 rounded-xl bg-[#020711]/85 backdrop-blur-md border border-white/10 pointer-events-auto">
      <button
        type="button"
        on:click={zoomIn}
        class="w-7 h-7 flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors text-sm font-bold cursor-pointer"
        title="Zoom In"
      >
        +
      </button>
      <button
        type="button"
        on:click={zoomOut}
        class="w-7 h-7 flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors text-sm font-bold cursor-pointer"
        title="Zoom Out"
      >
        −
      </button>
      <button
        type="button"
        on:click={resetView}
        class="w-7 h-7 flex items-center justify-center rounded-lg text-[#00E5FF] hover:bg-white/10 transition-colors cursor-pointer"
        title="Locate / Reset Center"
      >
        ⊙
      </button>
      <button
        type="button"
        on:click={() => showLayersMenu = !showLayersMenu}
        class="w-7 h-7 flex items-center justify-center rounded-lg text-[#8BA1B8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        title="Toggle Layers"
      >
        ≡
      </button>
    </div>

    <!-- Floating Layers Menu Popover -->
    {#if showLayersMenu}
      <div class="absolute top-36 right-3 z-20 p-2.5 rounded-xl bg-[#061425] border border-white/15 shadow-[0_12px_30px_rgba(0,0,0,0.8)] flex flex-col gap-1.5 text-[10px] w-40 pointer-events-auto">
        <div class="text-[9px] uppercase tracking-wider text-[#8BA1B8] pb-1 border-b border-white/10">Map Layers</div>
        <label class="flex items-center gap-2 cursor-pointer text-white">
          <input type="checkbox" bind:checked={activeLayers.current} class="accent-[#00E5FF]" />
          <span>Current Extent</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer text-white">
          <input type="checkbox" bind:checked={activeLayers.simulated} class="accent-[#A855F7]" />
          <span>Simulated Extent</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer text-white">
          <input type="checkbox" bind:checked={activeLayers.highRisk} class="accent-[#EF4444]" />
          <span>High Risk Zones</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer text-white">
          <input type="checkbox" bind:checked={activeLayers.labels} class="accent-sky-400" />
          <span>City Labels</span>
        </label>
      </div>
    {/if}
  </div>

  <!-- Bottom Timeline Scrubber Strip -->
  <div class="shrink-0 p-3 bg-[#020711]/95 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
    
    <!-- Title & Play/Pause Controls -->
    <div class="flex items-center gap-3">
      <button
        type="button"
        on:click={toggleSimulationPlayback}
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase transition-all duration-200 cursor-pointer border {
          $isSimulationPlaying
            ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444] shadow-[0_0_12px_rgba(239,68,68,0.3)]'
            : 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white hover:bg-[#8B5CF6]/30 shadow-[0_0_12px_rgba(139,92,246,0.25)]'
        }"
      >
        {#if $isSimulationPlaying}
          <span class="w-2.5 h-2.5 bg-[#EF4444] inline-block"></span>
          <span>PAUSE</span>
        {:else}
          <span class="text-xs">▶</span>
          <span>PLAY</span>
        {/if}
      </button>

      <div class="flex flex-col">
        <span class="text-[10px] uppercase font-bold text-white tracking-wider flex items-center gap-1.5">
          <span>{($currentHazardConfig.hazardType).toUpperCase()} PROGRESSION</span>
          <span class="text-[9px] px-1.5 py-0.2 rounded bg-[#8B5CF6]/20 text-[#C084FC] border border-[#8B5CF6]/40">
            SIMULATED
          </span>
        </span>
        <span class="text-[9px] text-[#8BA1B8]">
          Temporal propagation over 30-day projection horizon
        </span>
      </div>
    </div>

    <!-- Timeline Scrubber Day Buttons -->
    <div class="flex items-center gap-1.5 sm:gap-2">
      {#each timelineDays as day}
        <button
          type="button"
          on:click={() => setSimulationTimelineDay(day)}
          class="flex flex-col items-center px-2.5 py-1 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer border {
            $simulationTimelineDay === day
              ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.6)] font-bold scale-105'
              : 'bg-[#061425] text-[#8BA1B8] border-white/10 hover:border-white/20 hover:text-white'
          }"
        >
          <span class="text-[10px]">DAY</span>
          <span class="text-xs">{day}</span>
        </button>
      {/each}
    </div>

  </div>

</div>
