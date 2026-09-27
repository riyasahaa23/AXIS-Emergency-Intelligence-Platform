<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import {
    latLngToVector3,
    createDayTexture,
    createNightTexture,
    createCloudsTexture,
    createAtmosphereMaterial
  } from './earthTextures';
  import { incidents, selectedIncident, selectIncident, globeFocusTarget } from '../stores/incidentStore';
  import { isJarvisCentralActive } from '../stores/commandStore';
  import type { HazardIncident } from '../types';

  let container: HTMLDivElement;
  let animationFrameId: number;
  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let earthGroup: THREE.Group;
  let earthMaterial: THREE.ShaderMaterial;
  let cloudsMesh: THREE.Mesh;
  let satellitesGroup: THREE.Group;
  let hazardsGroup: THREE.Group;
  let raycaster = new THREE.Raycaster();
  let mouse = new THREE.Vector2();

  // Dimming transition for central JARVIS activation
  let currentDimFactor = 1.0;
  let targetDimFactor = 1.0;

  // Camera animation / interaction state
  const DEFAULT_CAMERA_DISTANCE = 16.2;
  const DEFAULT_ROTATION = { x: 0.15, y: -1.2 };

  let isDragging = false;
  let prevMousePos = { x: 0, y: 0 };
  let cameraTargetDistance = DEFAULT_CAMERA_DISTANCE; // Perfectly frames Earth without dominating or clipping
  let cameraDistance = DEFAULT_CAMERA_DISTANCE;
  let rotationVelocity = { x: 0, y: 0.0008 };
  let targetRotation = { ...DEFAULT_ROTATION };
  let currentRotation = { ...DEFAULT_ROTATION };

  // Target camera fly-to interpolation
  let flyToTarget: { x: number; y: number; distance: number; progress: number } | null = null;

  const interactiveMarkers: { mesh: THREE.Object3D; incident: HazardIncident }[] = [];
  const cycloneMeshes: THREE.Object3D[] = [];
  const rippleMeshes: { mesh: THREE.Mesh; baseScale: number; speed: number }[] = [];

  onMount(() => {
    initScene();
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('wheel', onWheel, { passive: true });

    const unsubscribeFocus = globeFocusTarget.subscribe((target) => {
      if (!target) return;
      focusOnCoords(target.lat, target.lng, target.zoom);
    });

    const unsubscribeJarvis = isJarvisCentralActive.subscribe((active) => {
      targetDimFactor = active ? 0.88 : 1.0;
      cameraTargetDistance = active ? 14.5 : DEFAULT_CAMERA_DISTANCE;
    });

    return () => {
      unsubscribeFocus();
      unsubscribeJarvis();
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(animationFrameId);
      if (renderer) renderer.dispose();
    };
  });

  function initScene() {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera (FOV 45 gives natural wide-angle planetary perspective)
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, cameraDistance);

    // 2. High-dynamic-range WebGL Renderer
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);

    // 3. Cinematic Space Lighting
    const ambientLight = new THREE.AmbientLight(0x0e2444, 2.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffbf0, 4.8);
    sunLight.position.set(22, 10, 20);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 2.0);
    rimLight.position.set(-20, -5, -16);
    scene.add(rimLight);

    createStarfield();

    // 4. Earth Parent Group
    earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // 5. Earth Mesh with High-Res NASA Blue Marble Textures
    const earthRadius = 5.2;
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);

    const textureLoader = new THREE.TextureLoader();
    const dayTex = textureLoader.load('/earth_day.jpg', undefined, undefined, () => createDayTexture());
    const nightTex = textureLoader.load('/earth_night.png', undefined, undefined, () => createNightTexture());
    const cloudsTex = textureLoader.load('/earth_clouds.png', undefined, undefined, () => createCloudsTexture());

    dayTex.colorSpace = THREE.SRGBColorSpace;
    nightTex.colorSpace = THREE.SRGBColorSpace;

    earthMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayTex },
        nightTexture: { value: nightTex },
        sunDirection: { value: new THREE.Vector3(1, 0.45, 0.9).normalize() },
        dimFactor: { value: 1.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform vec3 sunDirection;
        uniform float dimFactor;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec3 norm = normalize(vNormal);
          vec3 sunDir = normalize(sunDirection);
          float sunDot = dot(norm, sunDir);
          float dayIntensity = smoothstep(-0.15, 0.30, sunDot);

          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);

          // Vivid night city lights with golden radiance
          vec3 nightGlow = nightColor.rgb * 5.2;
          vec3 dayGlow = dayColor.rgb * 1.75;

          vec3 finalColor = mix(nightGlow, dayGlow, dayIntensity);

          // Specular sun glint over ocean water
          if (dayColor.b > dayColor.r && dayColor.b > dayColor.g) {
            vec3 viewDir = normalize(-vWorldPosition);
            vec3 halfVector = normalize(sunDir + viewDir);
            float spec = pow(max(dot(norm, halfVector), 0.0), 22.0);
            finalColor += vec3(0.1, 0.95, 1.0) * spec * dayIntensity * 1.5;
          }

          gl_FragColor = vec4(finalColor * dimFactor, 1.0);
        }
      `
    });

    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earthMesh);

    // 6. Photorealistic Atmospheric Clouds Layer
    const cloudsRadius = earthRadius + 0.055;
    const cloudsGeometry = new THREE.SphereGeometry(cloudsRadius, 48, 48);
    const cloudsMaterial = new THREE.MeshStandardMaterial({
      map: cloudsTex,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    earthGroup.add(cloudsMesh);

    // 7. Multi-layer Atmospheric Rayleigh Glow Shell
    const atmosphereRadius = earthRadius + 0.42;
    const atmosphereGeometry = new THREE.SphereGeometry(atmosphereRadius, 48, 48);
    const atmosphereMaterial = createAtmosphereMaterial();
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphereMesh);

    // 8. Satellites and Orbital Tracks
    satellitesGroup = new THREE.Group();
    scene.add(satellitesGroup);
    createSatellites(earthRadius);

    // 9. Hazard Visualizations Group
    hazardsGroup = new THREE.Group();
    earthGroup.add(hazardsGroup);
    createHazardOverlays(earthRadius);

    animate();
  }

  function createStarfield() {
    const starCount = 1400;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const radius = 65 + Math.random() * 55;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const sinPhi = Math.sin(phi);

      const px = radius * sinPhi * Math.cos(theta);
      const py = radius * sinPhi * Math.sin(theta);
      const pz = radius * Math.cos(phi);

      positions[i * 3] = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;

      // Warm golden nebula bokeh in lower space regions matching reference
      if (py < -5 && Math.random() > 0.45) {
        colors[i * 3] = 0.95 + Math.random() * 0.05;
        colors[i * 3 + 1] = 0.65 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.15;
      } else if (Math.random() > 0.6) {
        colors[i * 3] = 0.0; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 1.0;
      } else if (Math.random() > 0.35) {
        colors[i * 3] = 0.35; colors[i * 3 + 1] = 0.6; colors[i * 3 + 2] = 1.0;
      } else {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 1.0; colors[i * 3 + 2] = 1.0;
      }
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending
    });

    const starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);
  }

  function createSatellites(earthRadius: number) {
    const orbits = [
      { radius: earthRadius + 1.6, inclination: 0.35, speed: 0.007, color: 0x00e5ff },
      { radius: earthRadius + 2.2, inclination: -0.65, speed: 0.005, color: 0x3d7cff },
      { radius: earthRadius + 2.8, inclination: 1.15, speed: 0.0035, color: 0x8b5cff },
      { radius: earthRadius + 1.9, inclination: -0.22, speed: 0.006, color: 0x00e5ff }
    ];

    orbits.forEach((orbit, idx) => {
      const ringGeo = new THREE.BufferGeometry();
      const segments = 90;
      const points: THREE.Vector3[] = [];

      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = Math.cos(theta) * orbit.radius;
        const z = Math.sin(theta) * orbit.radius;
        const pt = new THREE.Vector3(x, 0, z);
        pt.applyAxisAngle(new THREE.Vector3(1, 0, 0), orbit.inclination);
        points.push(pt);
      }
      ringGeo.setFromPoints(points);

      const ringMat = new THREE.LineBasicMaterial({
        color: orbit.color,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
      });
      satellitesGroup.add(new THREE.Line(ringGeo, ringMat));

      const satMesh = new THREE.Group();
      const bodyGeo = new THREE.BoxGeometry(0.14, 0.14, 0.22);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.9, roughness: 0.1 });
      satMesh.add(new THREE.Mesh(bodyGeo, bodyMat));

      const panelGeo = new THREE.BoxGeometry(0.55, 0.015, 0.16);
      const panelMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
      satMesh.add(new THREE.Mesh(panelGeo, panelMat));

      const beaconGeo = new THREE.SphereGeometry(0.07, 8, 8);
      const beaconMat = new THREE.MeshBasicMaterial({ color: orbit.color });
      satMesh.add(new THREE.Mesh(beaconGeo, beaconMat));

      satMesh.userData = {
        orbitRadius: orbit.radius,
        inclination: orbit.inclination,
        speed: orbit.speed,
        angle: (idx * Math.PI) / 2
      };

      satellitesGroup.add(satMesh);
    });
  }

  function createHazardOverlays(earthRadius: number) {
    interactiveMarkers.length = 0;

    $incidents.forEach((inc) => {
      const pos = latLngToVector3(inc.coords.lat, inc.coords.lng, earthRadius + 0.03);
      const surfaceNormal = pos.clone().normalize();

      if (inc.type === 'flood') {
        const discGeo = new THREE.CircleGeometry(0.55, 32);
        const discMat = new THREE.MeshBasicMaterial({
          color: 0x00e5ff,
          transparent: true,
          opacity: 0.55,
          side: THREE.DoubleSide
        });
        const disc = new THREE.Mesh(discGeo, discMat);
        disc.position.copy(pos);
        disc.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), surfaceNormal);
        hazardsGroup.add(disc);

        const ringGeo = new THREE.RingGeometry(0.4, 0.65, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x3d7cff,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide
        });
        const ripple = new THREE.Mesh(ringGeo, ringMat);
        ripple.position.copy(pos);
        ripple.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), surfaceNormal);
        hazardsGroup.add(ripple);
        rippleMeshes.push({ mesh: ripple, baseScale: 1.0, speed: 0.02 });
      } else if (inc.type === 'wildfire') {
        const fireDiscGeo = new THREE.RingGeometry(0.35, 0.7, 32);
        const fireDiscMat = new THREE.MeshBasicMaterial({
          color: 0xff6600,
          transparent: true,
          opacity: 0.75,
          side: THREE.DoubleSide
        });
        const fireMesh = new THREE.Mesh(fireDiscGeo, fireDiscMat);
        fireMesh.position.copy(pos);
        fireMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), surfaceNormal);
        hazardsGroup.add(fireMesh);
        rippleMeshes.push({ mesh: fireMesh, baseScale: 1.0, speed: 0.016 });
      } else if (inc.type === 'cyclone') {
        const spiralGroup = new THREE.Group();
        spiralGroup.position.copy(pos);
        spiralGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), surfaceNormal);

        const spiralDiscGeo = new THREE.RingGeometry(0.18, 0.85, 32);
        const spiralDiscMat = new THREE.MeshBasicMaterial({
          color: 0xe0f2fe,
          transparent: true,
          opacity: 0.65,
          side: THREE.DoubleSide
        });
        const spiralMesh = new THREE.Mesh(spiralDiscGeo, spiralDiscMat);
        spiralGroup.add(spiralMesh);

        hazardsGroup.add(spiralGroup);
        cycloneMeshes.push(spiralGroup);
      }

      // 3D Beacon Pin
      const pinGroup = new THREE.Group();
      pinGroup.position.copy(pos);

      const stemGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.5, 8);
      const stemColor = inc.severity === 'critical' ? 0xef4444 : inc.severity === 'high' ? 0xf59e0b : 0x00e5ff;
      const stemMat = new THREE.MeshBasicMaterial({ color: stemColor });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.copy(surfaceNormal.clone().multiplyScalar(0.25));
      stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), surfaceNormal);
      pinGroup.add(stem);

      const headGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const headMat = new THREE.MeshBasicMaterial({ color: stemColor });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.copy(surfaceNormal.clone().multiplyScalar(0.5));
      pinGroup.add(head);

      const pulseGeo = new THREE.RingGeometry(0.13, 0.18, 16);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: stemColor,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      });
      const pulse = new THREE.Mesh(pulseGeo, pulseMat);
      pulse.position.copy(surfaceNormal.clone().multiplyScalar(0.5));
      pulse.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), surfaceNormal);
      pinGroup.add(pulse);

      hazardsGroup.add(pinGroup);
      interactiveMarkers.push({ mesh: head, incident: inc });
    });
  }

  function focusOnCoords(lat: number, lng: number, zoomLevel: number = 1.0) {
    const targetY = -(lng * Math.PI) / 180 - Math.PI / 2;
    const targetX = (lat * Math.PI) / 180;
    const targetDist = 13.0 / Math.max(0.7, zoomLevel);

    flyToTarget = {
      x: targetX,
      y: targetY,
      distance: targetDist,
      progress: 0
    };
  }

  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    currentDimFactor = THREE.MathUtils.lerp(currentDimFactor, targetDimFactor, 0.08);
    if (earthMaterial && earthMaterial.uniforms.dimFactor) {
      earthMaterial.uniforms.dimFactor.value = currentDimFactor;
    }

    if (!isDragging && !flyToTarget) {
      currentRotation.y += rotationVelocity.y;
    }

    if (flyToTarget) {
      flyToTarget.progress += 0.035;
      const t = Math.min(1.0, flyToTarget.progress);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      currentRotation.x = THREE.MathUtils.lerp(currentRotation.x, flyToTarget.x, ease * 0.2);
      currentRotation.y = THREE.MathUtils.lerp(currentRotation.y, flyToTarget.y, ease * 0.2);
      cameraDistance = THREE.MathUtils.lerp(cameraDistance, flyToTarget.distance, ease * 0.2);

      if (t >= 1.0) flyToTarget = null;
    } else {
      cameraDistance = THREE.MathUtils.lerp(cameraDistance, cameraTargetDistance, 0.1);
    }

    currentDimFactor = THREE.MathUtils.lerp(currentDimFactor, targetDimFactor, 0.06);
    if (earthMaterial && earthMaterial.uniforms && earthMaterial.uniforms.dimFactor) {
      earthMaterial.uniforms.dimFactor.value = currentDimFactor;
    }

    if (earthGroup) {
      earthGroup.rotation.x = currentRotation.x;
      earthGroup.rotation.y = currentRotation.y;
    }

    if (cloudsMesh) {
      cloudsMesh.rotation.y += 0.0003;
    }

    cycloneMeshes.forEach((mesh) => {
      mesh.rotation.z += 0.018;
    });

    rippleMeshes.forEach((item) => {
      item.baseScale += item.speed;
      if (item.baseScale > 1.45) item.baseScale = 1.0;
      item.mesh.scale.set(item.baseScale, item.baseScale, item.baseScale);
      (item.mesh.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1.5 - item.baseScale);
    });

    if (satellitesGroup) {
      satellitesGroup.children.forEach((child) => {
        if (child.userData && child.userData.orbitRadius) {
          child.userData.angle += child.userData.speed;
          const theta = child.userData.angle;
          const r = child.userData.orbitRadius;
          const inc = child.userData.inclination;

          const x = Math.cos(theta) * r;
          const z = Math.sin(theta) * r;
          const pos = new THREE.Vector3(x, 0, z);
          pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), inc);
          child.position.copy(pos);
          child.lookAt(new THREE.Vector3(0, 0, 0));
        }
      });
    }

    if (camera) {
      camera.position.set(0, 0, cameraDistance);
    }

    renderer.render(scene, camera);
  }

  function onPointerDown(e: PointerEvent) {
    if ((e.target as HTMLElement).tagName !== 'CANVAS') return;
    isDragging = true;
    prevMousePos = { x: e.clientX, y: e.clientY };
    flyToTarget = null;
  }

  function onPointerMove(e: PointerEvent) {
    if (!isDragging) return;
    const deltaX = e.clientX - prevMousePos.x;
    const deltaY = e.clientY - prevMousePos.y;

    currentRotation.y += deltaX * 0.005;
    currentRotation.x += deltaY * 0.005;
    currentRotation.x = Math.max(-Math.PI * 0.42, Math.min(Math.PI * 0.42, currentRotation.x));
    prevMousePos = { x: e.clientX, y: e.clientY };
  }

  function onPointerUp(e: PointerEvent) {
    if (!isDragging) return;
    isDragging = false;

    if (container && camera) {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const pickables = interactiveMarkers.map((m) => m.mesh);
      const intersects = raycaster.intersectObjects(pickables, true);

      if (intersects.length > 0) {
        const hit = interactiveMarkers.find((m) => m.mesh === intersects[0].object);
        if (hit) {
          selectIncident(hit.incident);
        }
      }
    }
  }

  function onWheel(e: WheelEvent) {
    cameraTargetDistance += e.deltaY * 0.008;
    cameraTargetDistance = Math.max(9.0, Math.min(24.0, cameraTargetDistance));
  }

  function handleZoomIn() {
    cameraTargetDistance = Math.max(9.0, cameraTargetDistance - 1.8);
  }

  function handleZoomOut() {
    cameraTargetDistance = Math.min(24.0, cameraTargetDistance + 1.8);
  }

  function handleResetView() {
    flyToTarget = null;
    cameraTargetDistance = DEFAULT_CAMERA_DISTANCE;
    currentRotation = { ...DEFAULT_ROTATION };
    targetRotation = { ...DEFAULT_ROTATION };
  }

  function onWindowResize() {
    if (!container || !renderer || !camera) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
</script>

<div class="relative w-full h-full overflow-hidden select-none">
  <div bind:this={container} class="w-full h-full cursor-grab active:cursor-grabbing"></div>
  <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.08)_0%,rgba(2,7,17,0.55)_65%,rgba(2,7,17,0.92)_100%)]"></div>

  <!-- Earth Globe Interactive Camera Controls (Zoom In, Zoom Out, Reset) -->
  <div class="absolute bottom-24 right-5 z-20 flex flex-col items-center gap-1.5 p-1 rounded-xl bg-[#061425]/85 backdrop-blur-md border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)] pointer-events-auto font-mono">
    <button
      on:click={handleZoomIn}
      class="w-7 h-7 rounded-lg bg-black/40 hover:bg-[#00E5FF]/20 text-[#8BA1B8] hover:text-[#00E5FF] border border-white/5 hover:border-[#00E5FF]/40 flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
      title="Zoom In Earth (+)"
    >
      +
    </button>
    <button
      on:click={handleZoomOut}
      class="w-7 h-7 rounded-lg bg-black/40 hover:bg-[#00E5FF]/20 text-[#8BA1B8] hover:text-[#00E5FF] border border-white/5 hover:border-[#00E5FF]/40 flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
      title="Zoom Out Earth (−)"
    >
      −
    </button>
    <button
      on:click={handleResetView}
      class="px-2 py-1 rounded-lg bg-black/40 hover:bg-[#00E5FF]/20 text-[#8BA1B8] hover:text-[#00E5FF] border border-white/5 hover:border-[#00E5FF]/40 flex items-center justify-center text-[9px] font-bold tracking-wider transition-all cursor-pointer"
      title="Reset Earth View to Starting Perspective"
    >
      RESET
    </button>
  </div>
</div>