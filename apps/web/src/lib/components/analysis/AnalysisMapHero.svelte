<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { selectedIncident } from '../../stores/incidentStore';
  import {
    activeAnalysisMode,
    activeHazardType,
    activeScenario,
    isTransitioningHazard,
    hazardTransitionStage
  } from '../../stores/analysisStore';

  let canvasEl: HTMLCanvasElement;
  let containerEl: HTMLDivElement;
  let animId: number;
  let resizeObserver: ResizeObserver | null = null;

  // Pan & Zoom
  let zoom = 1.0;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  // Camera Interpolation State (smooth cinematic glide across geography)
  let camLng = 90.35;
  let camLat = 23.65;
  let camSpanLng = 8.6;
  let camSpanLat = 7.2;

  // Layers Visibility Controls
  let showRiskHeat = true;
  let showHazardPolygons = true;
  let showRiversOrFeatures = true;
  let showCities = true;
  let showInfrastructure = true;
  let showLayersMenu = false;

  let animTime = 0;

  function zoomIn() {
    zoom = Math.min(3.2, zoom + 0.2);
  }

  function zoomOut() {
    zoom = Math.max(0.4, zoom - 0.2);
  }

  function resetView() {
    zoom = 1.0;
    panX = 0;
    panY = 0;
    if ($activeScenario) {
      camLng = $activeScenario.camera.centerLng;
      camLat = $activeScenario.camera.centerLat;
      camSpanLng = $activeScenario.camera.targetLngSpan;
      camSpanLat = $activeScenario.camera.targetLatSpan;
    }
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
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    zoom = Math.max(0.4, Math.min(3.6, zoom * factor));
  }

  onMount(() => {
    if ($activeScenario) {
      camLng = $activeScenario.camera.centerLng;
      camLat = $activeScenario.camera.centerLat;
      camSpanLng = $activeScenario.camera.targetLngSpan;
      camSpanLat = $activeScenario.camera.targetLatSpan;
    }
    handleResize();
    drawLoop();

    if (containerEl && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(containerEl);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
      if (animId) cancelAnimationFrame(animId);
    };
  });

  onDestroy(() => {
    if (resizeObserver) resizeObserver.disconnect();
    if (animId) cancelAnimationFrame(animId);
  });

  function handleResize() {
    if (!containerEl || !canvasEl) return;
    const rect = containerEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasEl.width = Math.floor(rect.width * dpr);
    canvasEl.height = Math.floor(rect.height * dpr);
  }

  function drawLoop() {
    animId = requestAnimationFrame(drawLoop);
    animTime += 0.022;

    // Smooth camera interpolation towards active scenario target
    if ($activeScenario) {
      const target = $activeScenario.camera;
      camLng += (target.centerLng - camLng) * 0.08;
      camLat += (target.centerLat - camLat) * 0.08;
      camSpanLng += (target.targetLngSpan - camSpanLng) * 0.08;
      camSpanLat += (target.targetLatSpan - camSpanLat) * 0.08;
    }

    render();
  }

  function render() {
    if (!canvasEl || !containerEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    const width = canvasEl.width;
    const height = canvasEl.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. Dark cartographic deep-space/satellite background
    const bgGrad = ctx.createRadialGradient(
      width * 0.5, height * 0.46, 60 * dpr,
      width * 0.5, height * 0.5, width * 0.72
    );
    bgGrad.addColorStop(0, '#061a33');
    bgGrad.addColorStop(0.45, '#041224');
    bgGrad.addColorStop(0.85, '#020914');
    bgGrad.addColorStop(1, '#01050a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Screen Center & Scale Projection
    const cx = width / 2 + panX * dpr;
    const cy = height / 2 + panY * dpr;

    const scaleX = width / Math.max(1, camSpanLng);
    const scaleY = height / Math.max(1, camSpanLat * 1.12);
    const autoScale = Math.min(scaleX, scaleY);
    const s = autoScale * zoom;

    function proj(lng: number, lat: number): [number, number] {
      const px = cx + (lng - camLng) * s;
      const py = cy - (lat - camLat) * s * 1.08;
      return [px, py];
    }

    const scenario = $activeScenario;
    if (!scenario) {
      ctx.restore();
      return;
    }

    // 2. Subtle Coordinate Lat/Lng Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.032)';
    ctx.lineWidth = 1;
    const step = camSpanLng > 10 ? 2.5 : camSpanLng > 5 ? 1.5 : 0.8;
    const minLng = Math.floor(camLng - camSpanLng);
    const maxLng = Math.ceil(camLng + camSpanLng);
    for (let lng = minLng; lng <= maxLng; lng += step) {
      const [gx] = proj(lng, camLat);
      if (gx >= -10 && gx <= width + 10) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
    }
    const minLat = Math.floor(camLat - camSpanLat);
    const maxLat = Math.ceil(camLat + camSpanLat);
    for (let lat = minLat; lat <= maxLat; lat += step) {
      const [, gy] = proj(camLng, lat);
      if (gy >= -10 && gy <= height + 10) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }
    }

    // 3. National / Coastline Territorial Boundaries
    if (scenario.borders && scenario.borders.length) {
      scenario.borders.forEach((poly) => {
        if (!poly.length) return;
        ctx.beginPath();
        const [p0x, p0y] = proj(poly[0][0], poly[0][1]);
        ctx.moveTo(p0x, p0y);
        for (let i = 1; i < poly.length; i++) {
          const [px, py] = proj(poly[i][0], poly[i][1]);
          ctx.lineTo(px, py);
        }
        if (poly.length > 5) ctx.closePath();

        // Dark terrain fill & cyan perimeter stroke
        ctx.fillStyle = 'rgba(7, 24, 46, 0.65)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.40)';
        ctx.lineWidth = 1.6 * dpr;
        ctx.stroke();
      });
    }

    // 4. Geographic Context Labels (Neighboring territories, maritime bays)
    if (scenario.contextLabels && scenario.contextLabels.length) {
      scenario.contextLabels.forEach((lbl) => {
        const [lx, ly] = proj(lbl.lng, lbl.lat);
        if (lx < -100 || lx > width + 100 || ly < -100 || ly > height + 100) return;
        ctx.font = `${lbl.font || 'bold'} ${10 * dpr}px monospace`;
        ctx.fillStyle = lbl.color || 'rgba(139, 161, 184, 0.45)';
        ctx.textAlign = (lbl.align || 'center') as CanvasTextAlign;
        ctx.fillText(lbl.text, lx, ly);
      });
    }

    // 5. Waterways / Corridors / River Networks
    if (showRiversOrFeatures && scenario.riversOrWater && scenario.riversOrWater.length) {
      scenario.riversOrWater.forEach((path) => {
        if (!path.length) return;
        ctx.beginPath();
        const [rx0, ry0] = proj(path[0][0], path[0][1]);
        ctx.moveTo(rx0, ry0);
        for (let p = 1; p < path.length; p++) {
          const [rx, ry] = proj(path[p][0], path[p][1]);
          ctx.lineTo(rx, ry);
        }

        // River glow & core
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 2.4 * dpr;
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 8 * dpr;
        ctx.stroke();

        ctx.strokeStyle = '#E0F2FE';
        ctx.lineWidth = 0.9 * dpr;
        ctx.shadowBlur = 0;
        ctx.stroke();
      });
    }

    // =========================================================================
    // 6. MODULAR HAZARD-SPECIFIC VISUALIZATION LAYERS
    // =========================================================================
    if (scenario.hazardType === 'flood') {
      renderFloodLayer(ctx, proj, animTime, dpr, width, height);
    } else if (scenario.hazardType === 'cyclone') {
      renderCycloneLayer(ctx, proj, animTime, dpr, width, height);
    } else if (scenario.hazardType === 'wildfire') {
      renderWildfireLayer(ctx, proj, animTime, dpr, width, height);
    } else if (scenario.hazardType === 'earthquake') {
      renderEarthquakeLayer(ctx, proj, animTime, dpr, width, height);
    } else if (scenario.hazardType === 'multi_hazard') {
      renderMultiHazardLayer(ctx, proj, animTime, dpr, width, height);
    }

    // 7. Cities & Pins
    if (showCities && scenario.cities && scenario.cities.length) {
      scenario.cities.forEach((city) => {
        const [cxPos, cyPos] = proj(city.lng, city.lat);
        if (cxPos < -50 || cxPos > width + 50 || cyPos < -50 || cyPos > height + 50) return;

        if (city.isHQ) {
          // Pulsing Command Beacon
          const pulse = (animTime * 1.5) % 2.5;
          const rad = (6 + pulse * 12) * dpr;
          const alpha = Math.max(0, 1 - pulse / 2.5);

          ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
          ctx.lineWidth = 2 * dpr;
          ctx.beginPath();
          ctx.arc(cxPos, cyPos, rad, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#00E5FF';
          ctx.beginPath();
          ctx.arc(cxPos, cyPos, 4 * dpr, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(cxPos, cyPos, 2 * dpr, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = `bold ${10 * dpr}px monospace`;
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'left';
          ctx.fillText(`● ${city.name} (HQ)`, cxPos + 8 * dpr, cyPos + 3 * dpr);
        } else if (city.isEpicenter) {
          // Pulsing Warning Beacon
          const pulse = ((animTime + 0.4) * 1.8) % 2.2;
          const rad = (5 + pulse * 11) * dpr;
          const alpha = Math.max(0, 1 - pulse / 2.2);

          ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
          ctx.lineWidth = 1.8 * dpr;
          ctx.beginPath();
          ctx.arc(cxPos, cyPos, rad, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.arc(cxPos, cyPos, 3.5 * dpr, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = `bold ${9.5 * dpr}px monospace`;
          ctx.fillStyle = '#FF8A8A';
          ctx.textAlign = 'left';
          ctx.fillText(`● ${city.name}`, cxPos + 7 * dpr, cyPos + 3 * dpr);
        } else {
          // Standard city pin
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(cxPos, cyPos, 2.5 * dpr, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = `${9 * dpr}px monospace`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.textAlign = 'left';
          ctx.fillText(`● ${city.name}`, cxPos + 6 * dpr, cyPos + 3 * dpr);
        }

        // Subtitle status callout if present
        if (city.statusText) {
          ctx.font = `bold ${7.5 * dpr}px monospace`;
          ctx.fillStyle = city.isEpicenter ? '#EF4444' : '#38BDF8';
          ctx.fillText(city.statusText, cxPos + 8 * dpr, cyPos + 12 * dpr);
        }
      });
    }

    // 8. Infrastructure Diamond Points
    if (showInfrastructure && scenario.infrastructure && scenario.infrastructure.length) {
      scenario.infrastructure.forEach((pt) => {
        const [ix, iy] = proj(pt.lng, pt.lat);
        if (ix < -30 || ix > width + 30 || iy < -30 || iy > height + 30) return;
        const dSize = 3.8 * dpr;

        const color = pt.status === 'critical' ? '#EF4444' : pt.status === 'warning' ? '#F97316' : '#00E5FF';
        ctx.strokeStyle = color;
        ctx.fillStyle = pt.status === 'critical' ? 'rgba(239, 68, 68, 0.45)' : 'rgba(0, 229, 255, 0.35)';
        ctx.lineWidth = 1.3 * dpr;
        ctx.beginPath();
        ctx.moveTo(ix, iy - dSize);
        ctx.lineTo(ix + dSize, iy);
        ctx.lineTo(ix, iy + dSize);
        ctx.lineTo(ix - dSize, iy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.font = `${8 * dpr}px monospace`;
        ctx.fillStyle = 'rgba(203, 213, 225, 0.8)';
        ctx.textAlign = 'left';
        ctx.fillText(pt.name, ix + 6 * dpr, iy + 3 * dpr);
      });
    }

    // 9. Region Title Header
    const [regX, regY] = proj(camLng, camLat + camSpanLat * 0.44);
    if (regY > 20 && regY < height - 20) {
      ctx.font = `bold ${12 * dpr}px monospace`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.textAlign = 'center';
      ctx.fillText(scenario.regionTitle, regX, regY);
    }

    ctx.restore();
  }

  // =========================================================================
  // HAZARD LAYER 1: FLOOD
  // =========================================================================
  function renderFloodLayer(
    ctx: CanvasRenderingContext2D,
    proj: (lng: number, lat: number) => [number, number],
    time: number,
    dpr: number,
    w: number,
    h: number
  ) {
    if (showHazardPolygons) {
      // Haor & Surma-Meghna Inundated Basin
      const haorBasin: Array<[number, number]> = [
        [91.10, 25.15], [91.70, 25.12], [92.35, 25.02],
        [92.45, 24.60], [92.10, 24.25], [91.55, 24.30], [91.05, 24.65]
      ];
      ctx.beginPath();
      const [h0x, h0y] = proj(haorBasin[0][0], haorBasin[0][1]);
      ctx.moveTo(h0x, h0y);
      for (let i = 1; i < haorBasin.length; i++) {
        const [hx, hy] = proj(haorBasin[i][0], haorBasin[i][1]);
        ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      const floodAlpha = 0.25 + Math.sin(time * 2.0) * 0.06;
      ctx.fillStyle = `rgba(0, 229, 255, ${floodAlpha})`;
      ctx.fill();
      ctx.strokeStyle = '#00E5FF';
      ctx.setLineDash([4 * dpr, 3 * dpr]);
      ctx.lineWidth = 1.4 * dpr;
      ctx.stroke();
      ctx.setLineDash([]);

      // Jamuna / Brahmaputra River Corridor Flood Wash
      const jamunaWash: Array<[number, number]> = [
        [89.65, 25.85], [89.92, 25.70], [89.85, 24.60],
        [89.95, 23.90], [89.55, 24.00], [89.45, 24.75], [89.40, 25.50]
      ];
      ctx.beginPath();
      const [j0x, j0y] = proj(jamunaWash[0][0], jamunaWash[0][1]);
      ctx.moveTo(j0x, j0y);
      for (let i = 1; i < jamunaWash.length; i++) {
        const [jx, jy] = proj(jamunaWash[i][0], jamunaWash[i][1]);
        ctx.lineTo(jx, jy);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(14, 165, 233, 0.22)';
      ctx.fill();
    }

    if (showRiskHeat) {
      const riskHotspots = [
        { name: 'Dhaka', lng: 90.41, lat: 23.81, rad: 55, color: 'rgba(239, 68, 68, 0.85)', stop2: 'rgba(220, 38, 38, 0.45)' },
        { name: 'Sylhet', lng: 91.87, lat: 24.89, rad: 65, color: 'rgba(239, 68, 68, 0.80)', stop2: 'rgba(244, 63, 94, 0.40)' },
        { name: 'Chittagong', lng: 91.83, lat: 22.36, rad: 50, color: 'rgba(249, 115, 22, 0.75)', stop2: 'rgba(234, 88, 12, 0.35)' },
        { name: 'Mymensingh', lng: 90.40, lat: 24.75, rad: 45, color: 'rgba(239, 68, 68, 0.65)', stop2: 'rgba(244, 63, 94, 0.30)' }
      ];

      riskHotspots.forEach((h) => {
        const [hx, hy] = proj(h.lng, h.lat);
        const currentRad = (h.rad + Math.sin(time * 1.5) * 3) * (zoom * 0.95);
        const rGrad = ctx.createRadialGradient(hx, hy, 2, hx, hy, currentRad * dpr);
        rGrad.addColorStop(0, h.color);
        rGrad.addColorStop(0.5, h.stop2);
        rGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = rGrad;
        ctx.beginPath();
        ctx.arc(hx, hy, currentRad * dpr, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Callout above Sylhet
    const [sylX, sylY] = proj(91.87, 25.18);
    ctx.font = `bold ${8.5 * dpr}px monospace`;
    ctx.fillStyle = '#EF4444';
    ctx.textAlign = 'center';
    ctx.fillText('▲ SECTOR ALPHA // CRITICAL INUNDATION', sylX, sylY);
  }

  // =========================================================================
  // HAZARD LAYER 2: CYCLONE
  // =========================================================================
  function renderCycloneLayer(
    ctx: CanvasRenderingContext2D,
    proj: (lng: number, lat: number) => [number, number],
    time: number,
    dpr: number,
    w: number,
    h: number
  ) {
    const stormCenterLng = 88.0;
    const stormCenterLat = 17.2;
    const [scX, scY] = proj(stormCenterLng, stormCenterLat);

    // 1. Concentric Wind Field Speed Rings
    const rings = [
      { rKm: 65, color: 'rgba(239, 68, 68, 0.85)', label: 'EYEWALL CAT 4 (>215 km/h)', dash: [6 * dpr, 4 * dpr] },
      { rKm: 140, color: 'rgba(249, 115, 22, 0.70)', label: 'CAT 3 GUSTS (185 km/h)', dash: [4 * dpr, 4 * dpr] },
      { rKm: 260, color: 'rgba(0, 229, 255, 0.55)', label: 'GALE-FORCE WINDS (>90 km/h)', dash: [] }
    ];

    // Compute pixel radius from approximate km (1 deg lat ~ 111km)
    const [p0x] = proj(stormCenterLng, stormCenterLat);
    const [p1x] = proj(stormCenterLng + 1.0, stormCenterLat);
    const pxPerKm = Math.abs(p1x - p0x) / 105;

    rings.forEach((ring) => {
      const rPx = ring.rKm * pxPerKm;
      ctx.beginPath();
      ctx.arc(scX, scY, rPx, 0, Math.PI * 2);
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = 1.8 * dpr;
      ctx.setLineDash(ring.dash);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ring label on top
      ctx.font = `bold ${8 * dpr}px monospace`;
      ctx.fillStyle = ring.color;
      ctx.textAlign = 'center';
      ctx.fillText(ring.label, scX, scY - rPx - 3 * dpr);
    });

    // 2. Rotating Logarithmic Spiral Cloud Bands
    const numArms = 5;
    const rot = time * 1.4;
    for (let a = 0; a < numArms; a++) {
      const armOffset = (a * (Math.PI * 2)) / numArms;
      ctx.beginPath();
      let started = false;

      for (let t = 0.2; t <= 2.8; t += 0.08) {
        const theta = t * 2.8 + armOffset - rot;
        const rad = 18 * Math.exp(0.52 * t) * pxPerKm;
        const px = scX + rad * Math.cos(theta);
        const py = scY + rad * Math.sin(theta);

        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      }

      ctx.strokeStyle = `rgba(0, 229, 255, ${0.45 + (a % 2) * 0.15})`;
      ctx.lineWidth = 2.2 * dpr;
      ctx.stroke();
    }

    // 3. Calm Storm Eye & Core
    const eyeRad = 16 * pxPerKm;
    ctx.beginPath();
    ctx.arc(scX, scY, eyeRad, 0, Math.PI * 2);
    ctx.fillStyle = '#020914';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.8 * dpr;
    ctx.stroke();

    ctx.font = `bold ${8.5 * dpr}px monospace`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('STORM EYE (958 hPa)', scX, scY + 3 * dpr);

    // 4. Forecast Trajectory Path & Widening Cone of Uncertainty
    const trackPoints: Array<{ label: string; lng: number; lat: number; isForecast?: boolean }> = [
      { label: '-24h', lng: 85.5, lat: 14.0 },
      { label: '-12h', lng: 86.8, lat: 15.5 },
      { label: 'NOW (CAT 3)', lng: 88.0, lat: 17.2 },
      { label: '+12h (CAT 4)', lng: 89.3, lat: 18.8, isForecast: true },
      { label: '+24h (CAT 4)', lng: 90.5, lat: 20.4, isForecast: true },
      { label: '+36h LANDFALL', lng: 91.6, lat: 21.9, isForecast: true }
    ];

    // Widening Cone polygon
    const [c0x, c0y] = proj(88.0, 17.2);
    const [c1lx, c1ly] = proj(90.2, 22.3);
    const [c1rx, c1ry] = proj(92.8, 21.5);
    ctx.beginPath();
    ctx.moveTo(c0x, c0y);
    ctx.lineTo(c1lx, c1ly);
    ctx.lineTo(c1rx, c1ry);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 229, 255, 0.12)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
    ctx.setLineDash([4 * dpr, 4 * dpr]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Trajectory Line
    ctx.beginPath();
    const [t0x, t0y] = proj(trackPoints[0].lng, trackPoints[0].lat);
    ctx.moveTo(t0x, t0y);
    for (let i = 1; i < trackPoints.length; i++) {
      const [tx, ty] = proj(trackPoints[i].lng, trackPoints[i].lat);
      ctx.lineTo(tx, ty);
    }
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2.2 * dpr;
    ctx.stroke();

    // Track Waypoints
    trackPoints.forEach((pt) => {
      const [tx, ty] = proj(pt.lng, pt.lat);
      ctx.fillStyle = pt.isForecast ? '#EF4444' : '#00E5FF';
      ctx.beginPath();
      ctx.arc(tx, ty, 3.5 * dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1 * dpr;
      ctx.stroke();

      ctx.font = `bold ${8 * dpr}px monospace`;
      ctx.fillStyle = pt.isForecast ? '#FF8A8A' : '#E0F2FE';
      ctx.textAlign = 'left';
      ctx.fillText(pt.label, tx + 6 * dpr, ty + 3 * dpr);
    });

    // 5. Coastal Surge Alert Ribbon
    const surgeCoast: Array<[number, number]> = [
      [89.5, 21.6], [90.5, 21.9], [91.5, 22.2], [92.0, 21.3]
    ];
    ctx.beginPath();
    const [s0x, s0y] = proj(surgeCoast[0][0], surgeCoast[0][1]);
    ctx.moveTo(s0x, s0y);
    for (let i = 1; i < surgeCoast.length; i++) {
      const [sx, sy] = proj(surgeCoast[i][0], surgeCoast[i][1]);
      ctx.lineTo(sx, sy);
    }
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 4 * dpr;
    ctx.shadowColor = '#EF4444';
    ctx.shadowBlur = 12 * dpr;
    ctx.stroke();
    ctx.shadowBlur = 0;

    const [alertX, alertY] = proj(91.0, 22.4);
    ctx.font = `bold ${8.5 * dpr}px monospace`;
    ctx.fillStyle = '#EF4444';
    ctx.textAlign = 'center';
    ctx.fillText('▲ +4.5m COASTAL SURGE OVERWASH THREAT', alertX, alertY);
  }

  // =========================================================================
  // HAZARD LAYER 3: WILDFIRE
  // =========================================================================
  function renderWildfireLayer(
    ctx: CanvasRenderingContext2D,
    proj: (lng: number, lat: number) => [number, number],
    time: number,
    dpr: number,
    w: number,
    h: number
  ) {
    // 1. Drifting Smoke Plume (Downwind to North-East)
    const plumePoly: Array<[number, number]> = [
      [-123.5, 53.2], [-121.2, 54.8], [-119.5, 55.6],
      [-118.8, 54.6], [-121.0, 53.4], [-122.8, 52.6]
    ];
    ctx.beginPath();
    const [sm0x, sm0y] = proj(plumePoly[0][0], plumePoly[0][1]);
    ctx.moveTo(sm0x, sm0y);
    for (let i = 1; i < plumePoly.length; i++) {
      const [px, py] = proj(plumePoly[i][0], plumePoly[i][1]);
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(203, 213, 225, 0.18)';
    ctx.fill();

    // 2. Active Glowing Firefront Jagged Perimeters
    const fireComplexes = [
      // Complex North (Nechako / Prince George Outbreak)
      [
        [-123.6, 53.9], [-123.2, 54.1], [-122.9, 54.0], [-123.1, 53.7],
        [-123.5, 53.6], [-123.8, 53.75]
      ],
      // Complex South (Cariboo Outbreak)
      [
        [-122.8, 52.8], [-122.4, 52.95], [-122.2, 52.6], [-122.6, 52.4],
        [-122.9, 52.55]
      ]
    ];

    fireComplexes.forEach((poly) => {
      ctx.beginPath();
      const [p0x, p0y] = proj(poly[0][0], poly[0][1]);
      ctx.moveTo(p0x, p0y);
      for (let i = 1; i < poly.length; i++) {
        const [px, py] = proj(poly[i][0], poly[i][1]);
        ctx.lineTo(px, py);
      }
      ctx.closePath();

      // Jagged perimeter interior glow
      const emberAlpha = 0.35 + Math.sin(time * 3.0) * 0.08;
      ctx.fillStyle = `rgba(239, 68, 68, ${emberAlpha})`;
      ctx.fill();

      // Glowing flame edge
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2.4 * dpr;
      ctx.shadowColor = '#F97316';
      ctx.shadowBlur = 14 * dpr;
      ctx.stroke();

      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 1.0 * dpr;
      ctx.shadowBlur = 0;
      ctx.stroke();
    });

    // 3. Thermal IR Satellite Hotspot Detections (MODIS/VIIRS)
    const hotspots: Array<[number, number]> = [
      [-123.4, 53.95], [-123.3, 54.05], [-123.1, 53.85], [-123.5, 53.8],
      [-123.0, 53.98], [-123.65, 53.88], [-122.7, 52.85], [-122.5, 52.9],
      [-122.3, 52.75], [-122.6, 52.5], [-122.45, 52.68], [-123.3, 53.65]
    ];

    hotspots.forEach(([lng, lat], idx) => {
      const [hx, hy] = proj(lng, lat);
      const twinkle = 0.6 + Math.sin(time * 4.0 + idx) * 0.4;
      ctx.fillStyle = `rgba(253, 224, 71, ${twinkle})`;
      ctx.beginPath();
      ctx.arc(hx, hy, 2.5 * dpr, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Wind Vector Arrow (42 km/h WSW heading ENE)
    const [wvx, wvy] = proj(-124.2, 53.4);
    ctx.strokeStyle = '#F97316';
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    ctx.moveTo(wvx - 20 * dpr, wvy + 12 * dpr);
    ctx.lineTo(wvx + 20 * dpr, wvy - 12 * dpr);
    ctx.stroke();

    // Arrowhead
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.moveTo(wvx + 20 * dpr, wvy - 12 * dpr);
    ctx.lineTo(wvx + 12 * dpr, wvy - 15 * dpr);
    ctx.lineTo(wvx + 15 * dpr, wvy - 6 * dpr);
    ctx.closePath();
    ctx.fill();

    ctx.font = `bold ${8 * dpr}px monospace`;
    ctx.fillStyle = '#F97316';
    ctx.fillText('WIND: 42 km/h (WSW -> ENE)', wvx + 24 * dpr, wvy - 10 * dpr);

    // 5. Evacuation Zone Perimeter Ribbon
    const [evx, evy] = proj(-123.0, 54.3);
    ctx.font = `bold ${8.5 * dpr}px monospace`;
    ctx.fillStyle = '#EF4444';
    ctx.textAlign = 'center';
    ctx.fillText('▲ MANDATORY EVACUATION ZONE // HIGHWAY 16 CLOSED', evx, evy);
  }

  // =========================================================================
  // HAZARD LAYER 4: EARTHQUAKE
  // =========================================================================
  function renderEarthquakeLayer(
    ctx: CanvasRenderingContext2D,
    proj: (lng: number, lat: number) => [number, number],
    time: number,
    dpr: number,
    w: number,
    h: number
  ) {
    const epiLng = 137.25;
    const epiLat = 37.49;
    const [ex, ey] = proj(epiLng, epiLat);

    // 1. Shindo Intensity Ground Motion Concentric Auras
    const shindoZones = [
      { rKm: 28, color: 'rgba(239, 68, 68, 0.45)', label: 'SHINDO 7 (VIOLENT)' },
      { rKm: 60, color: 'rgba(249, 115, 22, 0.32)', label: 'SHINDO 6+ (VERY STRONG)' },
      { rKm: 110, color: 'rgba(168, 85, 247, 0.22)', label: 'SHINDO 5+ (STRONG)' },
      { rKm: 175, color: 'rgba(6, 182, 212, 0.15)', label: 'SHINDO 4 (MODERATE)' }
    ];

    const [p0x] = proj(epiLng, epiLat);
    const [p1x] = proj(epiLng + 1.0, epiLat);
    const pxPerKm = Math.abs(p1x - p0x) / 92;

    shindoZones.forEach((zone) => {
      const rad = zone.rKm * pxPerKm;
      ctx.beginPath();
      ctx.arc(ex, ey, rad, 0, Math.PI * 2);
      ctx.fillStyle = zone.color;
      ctx.fill();
      ctx.strokeStyle = zone.color.replace('0.', '0.8');
      ctx.lineWidth = 1.2 * dpr;
      ctx.stroke();

      ctx.font = `bold ${7.5 * dpr}px monospace`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.textAlign = 'center';
      ctx.fillText(zone.label, ex, ey - rad - 2 * dpr);
    });

    // 2. Concentric Expanding Seismic Shockwaves (P-waves & S-waves)
    // S-waves (Slower, heavy, red)
    for (let wIdx = 0; wIdx < 3; wIdx++) {
      const sProgress = ((time * 0.8 + wIdx * 0.7) % 2.2) / 2.2;
      const sRad = sProgress * 160 * pxPerKm;
      const sAlpha = Math.max(0, 1 - sProgress);
      ctx.beginPath();
      ctx.arc(ex, ey, sRad, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(239, 68, 68, ${sAlpha * 0.8})`;
      ctx.lineWidth = 2.5 * dpr;
      ctx.stroke();
    }

    // P-waves (Faster, lighter, cyan)
    for (let pIdx = 0; pIdx < 2; pIdx++) {
      const pProgress = ((time * 1.6 + pIdx * 0.9) % 2.0) / 2.0;
      const pRad = pProgress * 230 * pxPerKm;
      const pAlpha = Math.max(0, 1 - pProgress);
      ctx.beginPath();
      ctx.arc(ex, ey, pRad, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 229, 255, ${pAlpha * 0.5})`;
      ctx.lineWidth = 1.4 * dpr;
      ctx.stroke();
    }

    // 3. Active Crustal Fault Line Rupture Trace
    const faultTrace: Array<[number, number]> = [
      [136.75, 37.35], [137.00, 37.42], [137.25, 37.49], [137.45, 37.55], [137.70, 37.60]
    ];
    ctx.beginPath();
    const [f0x, f0y] = proj(faultTrace[0][0], faultTrace[0][1]);
    ctx.moveTo(f0x, f0y);
    for (let i = 1; i < faultTrace.length; i++) {
      const [fx, fy] = proj(faultTrace[i][0], faultTrace[i][1]);
      ctx.lineTo(fx, fy);
    }
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2.8 * dpr;
    ctx.shadowColor = '#EF4444';
    ctx.shadowBlur = 10 * dpr;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 4. Aftershock Scatter Cluster
    const aftershocks: Array<{ lng: number; lat: number; mag: number }> = [
      { lng: 137.10, lat: 37.45, mag: 4.8 },
      { lng: 137.30, lat: 37.52, mag: 5.4 },
      { lng: 136.95, lat: 37.40, mag: 4.2 },
      { lng: 137.40, lat: 37.48, mag: 5.1 },
      { lng: 137.18, lat: 37.46, mag: 3.9 },
      { lng: 137.50, lat: 37.56, mag: 4.6 }
    ];

    aftershocks.forEach((as) => {
      const [ax, ay] = proj(as.lng, as.lat);
      ctx.fillStyle = '#F97316';
      ctx.beginPath();
      ctx.arc(ax, ay, (as.mag - 2.5) * dpr, 0, Math.PI * 2);
      ctx.fill();
    });

    // 5. Epicenter Marker
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex, ey, 5 * dpr, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2 * dpr;
    ctx.stroke();

    ctx.font = `bold ${9 * dpr}px monospace`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('EPICENTER // M 7.4 (18km DEPTH)', ex, ey + 15 * dpr);

    // 6. Coastal Tsunami Advisory Ribbon
    const [tsuX, tsuY] = proj(137.15, 37.68);
    ctx.font = `bold ${8.5 * dpr}px monospace`;
    ctx.fillStyle = '#FDE047';
    ctx.fillText('▲ TSUNAMI ADVISORY // 1.2m - 2.8m WAVE TRAIN', tsuX, tsuY);
  }

  // =========================================================================
  // HAZARD LAYER 5: MULTI-HAZARD (COMPOUND CASCADE)
  // =========================================================================
  function renderMultiHazardLayer(
    ctx: CanvasRenderingContext2D,
    proj: (lng: number, lat: number) => [number, number],
    time: number,
    dpr: number,
    w: number,
    h: number
  ) {
    // 1. Approaching Cyclone Vortex from the South
    const stormX = 89.8;
    const stormY = 20.8;
    const [svx, svy] = proj(stormX, stormY);

    for (let a = 0; a < 4; a++) {
      const angle = (a * Math.PI) / 2 - time * 1.5;
      ctx.beginPath();
      ctx.arc(svx, svy, (35 + a * 15) * dpr, angle, angle + Math.PI * 0.85);
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.7)';
      ctx.lineWidth = 2 * dpr;
      ctx.stroke();
    }
    ctx.font = `bold ${8.5 * dpr}px monospace`;
    ctx.fillStyle = '#F97316';
    ctx.textAlign = 'center';
    ctx.fillText('CYCLONE VORTEX (+165 km/h GUSTS)', svx, svy + 5 * dpr);

    // 2. Upstream River Deluge Rush (Surma + Jamuna heading south)
    const [upX, upY] = proj(90.3, 24.1);
    ctx.font = `bold ${8.5 * dpr}px monospace`;
    ctx.fillStyle = '#00E5FF';
    ctx.fillText('▼ TRANSBOUNDARY RIVER RUNOFF (+1.84m CREST)', upX, upY);

    // 3. Estuary Confluence Choke Point (Chandpur / Meghna Estuary)
    const chokeLng = 90.65;
    const chokeLat = 22.55;
    const [ckX, ckY] = proj(chokeLng, chokeLat);

    const chokePulse = (Math.sin(time * 3.0) + 1) * 0.5;
    const cRad = (28 + chokePulse * 16) * dpr;

    const cGrad = ctx.createRadialGradient(ckX, ckY, 2, ckX, ckY, cRad);
    cGrad.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
    cGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.45)');
    cGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.arc(ckX, ckY, cRad, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = `bold ${9 * dpr}px monospace`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('▲ ESTUARY CONFLUENCE CHOKE POINT', ckX, ckY - cRad - 12 * dpr);
    ctx.font = `bold ${8 * dpr}px monospace`;
    ctx.fillStyle = '#FF8A8A';
    ctx.fillText('DISCHARGE DAMMED BY +4.2m MARINE SURGE', ckX, ckY - cRad - 2 * dpr);

    // 4. Cascade Power Grid Trip Failure Markers
    const failNodes = [
      { name: 'Meghna Transmission Hub', lng: 90.60, lat: 23.60, sub: 'TRIPPED OFFLINE' },
      { name: 'Barisal Coastal Polder 32', lng: 90.32, lat: 22.65, sub: 'BREACHED' }
    ];

    failNodes.forEach((node) => {
      const [nx, ny] = proj(node.lng, node.lat);
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(nx, ny, 4 * dpr, 0, Math.PI * 2);
      ctx.fill();

      // Electrical flash stroke
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();

      ctx.font = `bold ${8 * dpr}px monospace`;
      ctx.fillStyle = '#EF4444';
      ctx.textAlign = 'left';
      ctx.fillText(`⚡ ${node.name}: ${node.sub}`, nx + 8 * dpr, ny + 3 * dpr);
    });
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
  class="relative w-full h-full rounded-2xl bg-[#030914] overflow-hidden select-none cursor-grab active:cursor-grabbing border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.7)]"
>
  <canvas bind:this={canvasEl} class="w-full h-full block" />

  <!-- Fast Tactical Intelligence Transition HUD Pill -->
  {#if $isTransitioningHazard}
    <div class="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#030a16]/95 border border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.6)] font-mono text-[10px] tracking-wider text-[#00E5FF] animate-pulse">
      <span class="w-2 h-2 rounded-full bg-[#00E5FF] animate-ping"></span>
      <span class="font-bold">INTELLIGENCE SYSTEM:</span>
      <span class="text-white">{$hazardTransitionStage}</span>
    </div>
  {/if}

  <!-- Embedded Map Controls (Top-Right) -->
  <div class="absolute top-4 right-4 z-20 flex flex-col gap-1 p-1 rounded-xl bg-[#030a16]/92 backdrop-blur-md border border-white/10 shadow-[0_6px_24px_rgba(0,0,0,0.85)] pointer-events-auto">
    <button
      on:click={zoomIn}
      class="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#00E5FF]/20 hover:text-[#00E5FF] text-white flex items-center justify-center text-sm font-mono transition-all cursor-pointer"
      title="Zoom In (+)"
    >
      +
    </button>
    <button
      on:click={zoomOut}
      class="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#00E5FF]/20 hover:text-[#00E5FF] text-white flex items-center justify-center text-sm font-mono transition-all cursor-pointer"
      title="Zoom Out (−)"
    >
      −
    </button>
    <button
      on:click={resetView}
      class="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#00E5FF]/20 hover:text-[#00E5FF] text-white flex items-center justify-center text-xs font-mono transition-all cursor-pointer"
      title="Recenter Map (⊙)"
    >
      ⊙
    </button>
    <button
      on:click={() => (showLayersMenu = !showLayersMenu)}
      class="w-7 h-7 rounded-lg {showLayersMenu ? 'bg-[#00E5FF]/30 text-[#00E5FF]' : 'bg-white/5 text-white'} hover:bg-[#00E5FF]/20 flex items-center justify-center text-xs transition-all cursor-pointer"
      title="Toggle Overlays (≡)"
    >
      ≡
    </button>
  </div>

  <!-- Layers Toggle Dropdown Menu -->
  {#if showLayersMenu}
    <div class="absolute right-14 top-4 z-30 p-3 rounded-xl bg-[#030a16]/95 backdrop-blur-md border border-[#00E5FF]/40 shadow-[0_8px_32px_rgba(0,0,0,0.85)] font-mono text-[10px] space-y-2 min-w-[150px] pointer-events-auto">
      <div class="font-bold text-[#00E5FF] pb-1 border-b border-white/10 uppercase tracking-wider">
        Map Layers
      </div>
      <label class="flex items-center gap-2 cursor-pointer text-white">
        <input type="checkbox" bind:checked={showHazardPolygons} class="accent-[#00E5FF]" />
        <span>Hazard Extents</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer text-white">
        <input type="checkbox" bind:checked={showRiskHeat} class="accent-[#EF4444]" />
        <span>Risk Gradient</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer text-white">
        <input type="checkbox" bind:checked={showRiversOrFeatures} class="accent-[#00E5FF]" />
        <span>Water & Channels</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer text-white">
        <input type="checkbox" bind:checked={showCities} class="accent-white" />
        <span>Locations & Pins</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer text-white">
        <input type="checkbox" bind:checked={showInfrastructure} class="accent-[#00E5FF]" />
        <span>Infrastructure</span>
      </label>
    </div>
  {/if}

  <!-- Dynamic Embedded Map Legend (Bottom-Left) driven by activeScenario -->
  {#if $activeScenario && $activeScenario.legend}
    {@const leg = $activeScenario.legend}
    <div class="absolute bottom-4 left-4 z-20 p-3 rounded-xl bg-[#030a16]/92 backdrop-blur-md border border-white/10 font-mono text-[9px] space-y-1.5 shadow-[0_6px_24px_rgba(0,0,0,0.85)] pointer-events-auto max-w-[280px]">
      <div class="text-[#8BA1B8] uppercase tracking-wider font-bold pb-1 border-b border-white/10 flex items-center justify-between gap-4">
        <span>{leg.title}</span>
        <span class="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
      </div>

      <!-- Severity Levels Grid -->
      <div class="grid grid-cols-2 gap-x-3 gap-y-1 text-white">
        {#each leg.levels as lvl}
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full shrink-0" style="background-color: {lvl.color};"></span>
            <span class="truncate">{lvl.label}</span>
          </div>
        {/each}
      </div>

      <!-- Feature Layers List -->
      <div class="pt-1.5 border-t border-white/10 space-y-1 text-[#CAD6E2]">
        {#each leg.layers as layer}
          <div class="flex items-center gap-1.5">
            {#if layer.type === 'line'}
              <span class="w-3 h-0.5 shrink-0" style="background-color: {layer.color};"></span>
            {:else if layer.type === 'fill'}
              <span class="w-2 h-2 rounded-sm shrink-0 border" style="border-color: {layer.color}; background-color: {layer.color};"></span>
            {:else if layer.type === 'diamond'}
              <span class="w-2 h-2 rotate-45 shrink-0 border" style="border-color: {layer.color}; background-color: {layer.color};"></span>
            {:else}
              <span class="w-1.5 h-1.5 rounded-full shrink-0" style="background-color: {layer.color};"></span>
            {/if}
            <span class="truncate">{layer.label}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
