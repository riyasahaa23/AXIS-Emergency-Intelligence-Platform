<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { jarvisState } from '../../stores/commandStore';
  import { masterHeartbeat } from '../../three/jarvisHeartbeat';

  export let size: 'sm' | 'md' | 'lg' = 'lg';
  export let interactive: boolean = true;
  export let animateActivation: boolean = true;

  let canvasContainer: HTMLDivElement;
  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let animId: number;

  // Root container for mouse parallax
  let coreRoot: THREE.Group;
  let reactorCoreGroup: THREE.Group;
  let latticeGroup: THREE.Group;
  let ringsGroup: THREE.Group;
  let tickMeshes: THREE.Mesh[] = [];
  let particlesMesh: THREE.Points;
  let shockwaveMesh: THREE.Mesh;
  let shockwaveVioletMesh: THREE.Mesh;
  let coreLight: THREE.PointLight;
  let secondaryLight: THREE.PointLight;
  let violetPointLight: THREE.PointLight;

  // Geometries and materials for memory cleanup
  const disposables: { dispose: () => void }[] = [];

  // Ring controllers for controlled planar axial rotation with heartbeat wave excitation
  interface RingController {
    mesh: THREE.Object3D;
    localAxis: THREE.Vector3;
    baseSpeed: number;
    radius: number;
    accelFactor: number;
  }
  const ringControllers: RingController[] = [];

  // Particle data for orbital accretion disc stream
  interface ParticleData {
    theta: number;
    radius: number;
    speed: number;
    y: number;
    vy: number;
    initialY: number;
  }
  let particleDataList: ParticleData[] = [];

  // Mouse parallax interpolation
  let targetTiltX = 0;
  let targetTiltY = 0;

  // Activation & clock
  let activationProgress = animateActivation ? 0.0 : 1.0;
  let clock = new THREE.Clock();

  // State-driven multipliers
  $: isBusy = $jarvisState === 'THINKING' || $jarvisState === 'ANALYSING';
  $: isListening = $jarvisState === 'LISTENING';
  $: isSimulating = $jarvisState === 'SIMULATING';
  $: isResponding = $jarvisState === 'RESPONDING';

  $: speedMultiplier = isBusy ? 2.5 : isListening ? 1.3 : isSimulating ? 2.0 : isResponding ? 1.6 : 1.0;

  onMount(() => {
    initThree();
    window.addEventListener('resize', handleResize);
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize);
    }
    if (animId) cancelAnimationFrame(animId);
    disposables.forEach((d) => d.dispose && d.dispose());
    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
    }
  });

  function initThree() {
    if (!canvasContainer) return;
    const width = canvasContainer.clientWidth || (size === 'sm' ? 56 : size === 'md' ? 180 : 540);
    const height = canvasContainer.clientHeight || (size === 'sm' ? 56 : size === 'md' ? 180 : 540);

    scene = new THREE.Scene();

    const cameraZ = size === 'sm' ? 5.2 : size === 'md' ? 7.6 : 8.8;
    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, cameraZ);

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    canvasContainer.appendChild(renderer.domElement);

    // Subtle dark ambient illumination
    const amb = new THREE.AmbientLight(0x04142a, 1.8);
    scene.add(amb);
    disposables.push(amb);

    // Bright directional key light for metallic chrome specular reflections
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 4.5);
    dirLight1.position.set(6, 8, 6);
    scene.add(dirLight1);
    disposables.push(dirLight1);

    // Cyan fill light from upper-left
    const dirLight2 = new THREE.DirectionalLight(0x00e5ff, 3.2);
    dirLight2.position.set(-6, 5, 4);
    scene.add(dirLight2);
    disposables.push(dirLight2);

    // Deep violet rim back-light
    const rimLight = new THREE.DirectionalLight(0x8b5cf6, 3.0);
    rimLight.position.set(-4, -6, -4);
    scene.add(rimLight);
    disposables.push(rimLight);

    coreRoot = new THREE.Group();
    scene.add(coreRoot);

    // ========================================================
    // 1. AI REACTOR CORE (Blazing Geodesic Neural Plasma Reactor)
    // Matching Master Reference: Intricate Geometric Facets + Blazing Core
    // ========================================================
    reactorCoreGroup = new THREE.Group();
    coreRoot.add(reactorCoreGroup);

    // A. Pinpoint Brilliant White-Hot Center Star
    const sparkGeo = new THREE.SphereGeometry(0.18, 20, 20);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sparkMesh = new THREE.Mesh(sparkGeo, sparkMat);
    reactorCoreGroup.add(sparkMesh);
    disposables.push(sparkGeo, sparkMat);

    // B. Intense Electric Cyan Inner Glow Aura
    const glowGeo = new THREE.SphereGeometry(0.38, 20, 20);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.70,
      blending: THREE.AdditiveBlending
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    reactorCoreGroup.add(glowMesh);
    disposables.push(glowGeo, glowMat);

    // C. Deep Electric Violet Mid-Glow
    const violetGlowGeo = new THREE.SphereGeometry(0.68, 20, 20);
    const violetGlowMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const violetGlowMesh = new THREE.Mesh(violetGlowGeo, violetGlowMat);
    reactorCoreGroup.add(violetGlowMesh);
    disposables.push(violetGlowGeo, violetGlowMat);

    // D. Intricate Geodesic Neural Lattice (Multi-Frequency LineSegments)
    latticeGroup = new THREE.Group();
    reactorCoreGroup.add(latticeGroup);

    // Lattice Layer 1: High-Frequency Cyan Icosahedron Cage
    const icoBaseGeo = new THREE.IcosahedronGeometry(1.48, 2);
    const icoWireGeo = new THREE.WireframeGeometry(icoBaseGeo);
    const icoLineMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const icoLineMesh = new THREE.LineSegments(icoWireGeo, icoLineMat);
    latticeGroup.add(icoLineMesh);
    disposables.push(icoBaseGeo, icoWireGeo, icoLineMat);

    // Lattice Layer 2: Secondary Outer Magenta/Violet Geodesic Cage
    const octBaseGeo = new THREE.IcosahedronGeometry(1.64, 1);
    const octWireGeo = new THREE.WireframeGeometry(octBaseGeo);
    const octLineMat = new THREE.LineBasicMaterial({
      color: 0xc084fc,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const octLineMesh = new THREE.LineSegments(octWireGeo, octLineMat);
    latticeGroup.add(octLineMesh);
    disposables.push(octBaseGeo, octWireGeo, octLineMat);

    // Lattice Layer 3: Inner Fast-Rotating Sky Blue Core Cage
    const innerBaseGeo = new THREE.IcosahedronGeometry(1.05, 1);
    const innerWireGeo = new THREE.WireframeGeometry(innerBaseGeo);
    const innerLineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending
    });
    const innerLineMesh = new THREE.LineSegments(innerWireGeo, innerLineMat);
    latticeGroup.add(innerLineMesh);
    disposables.push(innerBaseGeo, innerWireGeo, innerLineMat);

    // Glowing Vertex Node Beacons on Primary Lattice
    const nodeGeo = new THREE.SphereGeometry(0.048, 10, 10);
    const nodeMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      blending: THREE.AdditiveBlending
    });
    disposables.push(nodeGeo, nodeMat);

    const phi = (1 + Math.sqrt(5)) / 2;
    const norm = 1.48 / Math.sqrt(1 + phi * phi);
    const a = norm;
    const b = norm * phi;
    const icosahedronVertices = [
      [-a, b, 0], [a, b, 0], [-a, -b, 0], [a, -b, 0],
      [0, -a, b], [0, a, b], [0, -a, -b], [0, a, -b],
      [b, 0, -a], [b, 0, a], [-b, 0, -a], [-b, 0, a]
    ];

    icosahedronVertices.forEach(([x, y, z]) => {
      const beacon = new THREE.Mesh(nodeGeo, nodeMat);
      beacon.position.set(x, y, z);
      latticeGroup.add(beacon);
    });

    // Radial Laser Energy Beams from center to geodesic vertices
    const linesMat = new THREE.LineBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    disposables.push(linesMat);

    icosahedronVertices.forEach(([x, y, z]) => {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, z)
      ]);
      const line = new THREE.Line(lineGeo, linesMat);
      latticeGroup.add(line);
      disposables.push(lineGeo);
    });

    // E. Soft Glowing Corona Shell (BackSide Additive, 100% Clear Center)
    const coronaGeo = new THREE.SphereGeometry(1.76, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    reactorCoreGroup.add(coronaMesh);
    disposables.push(coronaGeo, coronaMat);

    // Equator containment seal rim on the vessel
    const rimGeo = new THREE.TorusGeometry(1.74, 0.026, 16, 90);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.85,
      metalness: 0.98,
      roughness: 0.12
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    reactorCoreGroup.add(rimMesh);
    disposables.push(rimGeo, rimMat);


    // G. Core High-Intensity Point Lights (Illuminating the Metallic Gimbals from within)
    coreLight = new THREE.PointLight(0x00e5ff, 6.5, 22, 1.2);
    reactorCoreGroup.add(coreLight);
    disposables.push(coreLight);

    secondaryLight = new THREE.PointLight(0xffffff, 4.8, 16, 1.3);
    reactorCoreGroup.add(secondaryLight);
    disposables.push(secondaryLight);

    violetPointLight = new THREE.PointLight(0x8b5cf6, 4.0, 14, 1.4);
    reactorCoreGroup.add(violetPointLight);
    disposables.push(violetPointLight);

    // ========================================================
    // 2. CHUNKY METALLIC GIMBALS & GLOWING CYAN TRACKS
    // Solid Titanium / Chrome mechanical rings matching reference
    // ========================================================
    ringsGroup = new THREE.Group();
    coreRoot.add(ringsGroup);

    // Gleaming metallic chrome material for heavy gimbals
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.98,
      roughness: 0.12,
      emissive: 0x051a30,
      emissiveIntensity: 0.25
    });
    disposables.push(chromeMat);

    const cyanTrackMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.98,
      blending: THREE.AdditiveBlending
    });
    disposables.push(cyanTrackMat);

    const violetTrackMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending
    });
    disposables.push(violetTrackMat);

    // Ring A: Wide Equatorial Saturn-like Mechanical Ring (Tilted at ~24°)
    const saturnGroup = new THREE.Group();
    saturnGroup.rotation.set(0.42, 0.15, 0);

    // Chunky solid metallic ring body (0.15 tube thickness)
    const saturnBodyGeo = new THREE.TorusGeometry(3.18, 0.15, 24, 120);
    const saturnBodyMesh = new THREE.Mesh(saturnBodyGeo, chromeMat);
    saturnGroup.add(saturnBodyMesh);
    disposables.push(saturnBodyGeo);

    // Glowing cyan neon runner track embedded in ring
    const saturnTrackGeo = new THREE.TorusGeometry(3.18, 0.038, 16, 120);
    const saturnTrackMesh = new THREE.Mesh(saturnTrackGeo, cyanTrackMat);
    saturnGroup.add(saturnTrackMesh);
    disposables.push(saturnTrackGeo);

    // 8 Chunky Mechanical Armor Clamps on Saturn Ring (Chrome brackets)
    const clampGeo = new THREE.BoxGeometry(0.32, 0.42, 0.22);
    disposables.push(clampGeo);
    for (let c = 0; c < 8; c++) {
      const angle = (c / 8) * Math.PI * 2;
      const clampMesh = new THREE.Mesh(clampGeo, chromeMat);
      clampMesh.position.set(Math.cos(angle) * 3.18, Math.sin(angle) * 3.18, 0);
      clampMesh.rotation.z = angle;
      saturnGroup.add(clampMesh);

      // Embedded glowing status beacon on each clamp
      const bNode = new THREE.Mesh(nodeGeo, cyanTrackMat);
      bNode.position.set(Math.cos(angle) * 3.25, Math.sin(angle) * 3.25, 0.12);
      saturnGroup.add(bNode);
    }

    ringsGroup.add(saturnGroup);
    ringControllers.push({
      mesh: saturnGroup,
      localAxis: new THREE.Vector3(0, 0, 1),
      baseSpeed: 0.007,
      radius: 3.18,
      accelFactor: 0.6
    });

    // Ring B: Interlocking Heavy Gimbal Ring 1 (Tilted at ~38° with 16 Telemetry Ticks)
    const gimbal1Group = new THREE.Group();
    gimbal1Group.rotation.set(0.68, -0.28, 0.15);

    // Heavy gimbal body (0.13 tube thickness)
    const g1BodyGeo = new THREE.TorusGeometry(2.72, 0.13, 24, 100);
    const g1BodyMesh = new THREE.Mesh(g1BodyGeo, chromeMat);
    gimbal1Group.add(g1BodyMesh);
    disposables.push(g1BodyGeo);

    // Cyan inner light track
    const g1TrackGeo = new THREE.TorusGeometry(2.72, 0.032, 16, 100);
    const g1TrackMesh = new THREE.Mesh(g1TrackGeo, cyanTrackMat);
    gimbal1Group.add(g1TrackMesh);
    disposables.push(g1TrackGeo);

    // 16 Sequential Telemetry Ticks on Gimbal 1
    tickMeshes = [];
    const tickBarGeo = new THREE.BoxGeometry(0.10, 0.03, 0.03);
    disposables.push(tickBarGeo);

    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const tickMat = new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      });
      const tick = new THREE.Mesh(tickBarGeo, tickMat);
      tick.position.set(Math.cos(angle) * 2.72, Math.sin(angle) * 2.72, 0);
      tick.rotation.z = angle;
      gimbal1Group.add(tick);
      tickMeshes.push(tick);
      disposables.push(tickMat);
    }

    ringsGroup.add(gimbal1Group);
    ringControllers.push({
      mesh: gimbal1Group,
      localAxis: new THREE.Vector3(0, 0, 1),
      baseSpeed: -0.011,
      radius: 2.72,
      accelFactor: 1.2
    });

    // Ring C: Interlocking Heavy Gimbal Ring 2 (Tilted at ~ -32° with Violet Inlay)
    const gimbal2Group = new THREE.Group();
    gimbal2Group.rotation.set(-0.52, 0.32, -0.15);

    // Heavy gimbal body (0.11 tube thickness)
    const g2BodyGeo = new THREE.TorusGeometry(2.28, 0.11, 20, 90);
    const g2BodyMesh = new THREE.Mesh(g2BodyGeo, chromeMat);
    gimbal2Group.add(g2BodyMesh);
    disposables.push(g2BodyGeo);

    // Violet light strip
    const g2TrackGeo = new THREE.TorusGeometry(2.28, 0.028, 16, 90);
    const g2TrackMesh = new THREE.Mesh(g2TrackGeo, violetTrackMat);
    gimbal2Group.add(g2TrackMesh);
    disposables.push(g2TrackGeo);

    ringsGroup.add(gimbal2Group);
    ringControllers.push({
      mesh: gimbal2Group,
      localAxis: new THREE.Vector3(0, 0, 1),
      baseSpeed: 0.013,
      radius: 2.28,
      accelFactor: 1.8
    });

    // Energy Arc Ribbons (Deep Violet and Cyan looping around gimbals)
    const arcGroup = new THREE.Group();
    arcGroup.rotation.set(0.52, 0.12, 0.22);

    const arcGeo = new THREE.TorusGeometry(3.60, 0.036, 16, 100, Math.PI * 1.55);
    const arcMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x8b5cf6,
      emissiveIntensity: 2.2,
      metalness: 0.92,
      roughness: 0.12
    });
    const arcMesh = new THREE.Mesh(arcGeo, arcMat);
    arcMesh.scale.set(1.08, 0.94, 1.0);
    arcGroup.add(arcMesh);
    ringsGroup.add(arcGroup);
    disposables.push(arcGeo, arcMat);
    ringControllers.push({
      mesh: arcGroup,
      localAxis: new THREE.Vector3(0, 0, 1),
      baseSpeed: 0.006,
      radius: 3.60,
      accelFactor: 0.5
    });

    // Outer Celestial Ring with 4 Cardinal Beacon Nodes
    const outerRingGroup = new THREE.Group();
    outerRingGroup.rotation.x = 0.14;

    const outerGeo = new THREE.TorusGeometry(4.05, 0.016, 16, 120);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.50,
      blending: THREE.AdditiveBlending
    });
    outerRingGroup.add(new THREE.Mesh(outerGeo, outerMat));
    disposables.push(outerGeo, outerMat);

    [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].forEach((angle, idx) => {
      const bGeo = new THREE.SphereGeometry(0.065, 12, 12);
      const bMat = new THREE.MeshBasicMaterial({ color: idx % 2 === 0 ? 0x00ffff : 0x8b5cf6 });
      const beacon = new THREE.Mesh(bGeo, bMat);
      beacon.position.set(Math.cos(angle) * 4.05, Math.sin(angle) * 4.05, 0);
      outerRingGroup.add(beacon);
      disposables.push(bGeo, bMat);
    });

    ringsGroup.add(outerRingGroup);
    ringControllers.push({
      mesh: outerRingGroup,
      localAxis: new THREE.Vector3(0, 0, 1),
      baseSpeed: -0.0035,
      radius: 4.05,
      accelFactor: 0.3
    });

    // (Contextual holographic projections are handled contextually upon user query / analysis)

    // ========================================================
    // 4. STREAMLINED ORBITAL ACCRETION DISC PARTICLES
    // ========================================================
    const particleCount = size === 'sm' ? 50 : 180;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    particleDataList = [];
    for (let i = 0; i < particleCount; i++) {
      const radius = 1.65 + Math.random() * 1.85;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 0.22;
      const speed = (0.008 + Math.random() * 0.012) * (Math.random() > 0.3 ? 1 : -1);

      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * radius;

      // Color distribution: 55% electric cyan, 25% deep blue, 15% violet, 5% white spark
      const pColor = new THREE.Color();
      const rand = Math.random();
      if (rand < 0.55) pColor.setHex(0x00e5ff);
      else if (rand < 0.80) pColor.setHex(0x3b82f6);
      else if (rand < 0.95) pColor.setHex(0x7c3aed);
      else pColor.setHex(0xffffff);

      colors[i * 3] = pColor.r;
      colors[i * 3 + 1] = pColor.g;
      colors[i * 3 + 2] = pColor.b;

      particleDataList.push({
        theta,
        radius,
        speed,
        y,
        vy: (Math.random() - 0.5) * 0.002,
        initialY: y
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: size === 'sm' ? 0.05 : 0.065,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    particlesMesh = new THREE.Points(particleGeo, particleMat);
    coreRoot.add(particlesMesh);
    disposables.push(particleGeo, particleMat);

    // ========================================================
    // 5. SHOCKWAVE ENERGY RINGS (Outward Propagating Heartbeat Waves)
    // ========================================================
    // Primary Cyan Wave Ring
    const shockGeo = new THREE.RingGeometry(0.95, 1.0, 64);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    shockwaveMesh = new THREE.Mesh(shockGeo, shockMat);
    coreRoot.add(shockwaveMesh);
    disposables.push(shockGeo, shockMat);

    // Secondary Violet Wave Ring
    const shockVioletGeo = new THREE.RingGeometry(0.88, 0.94, 64);
    const shockVioletMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    shockwaveVioletMesh = new THREE.Mesh(shockVioletGeo, shockVioletMat);
    coreRoot.add(shockwaveVioletMesh);
    disposables.push(shockVioletGeo, shockVioletMat);

    // Begin Animation Loop
    animate();
  }

  function animate() {
    animId = requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // 1. Advance Master Heartbeat
    const hb = masterHeartbeat.update(delta, $jarvisState);

    // 2. Activation sequence progression
    if (activationProgress < 1.0) {
      activationProgress = Math.min(1.0, activationProgress + delta * 1.5);
    }
    const actScale = Math.sin(activationProgress * (Math.PI / 2));

    // 3. Mouse Parallax interpolation
    coreRoot.rotation.x += (targetTiltX - coreRoot.rotation.x) * 0.08;
    coreRoot.rotation.y += (targetTiltY - coreRoot.rotation.y) * 0.08;

    // 4. AI Reactor Core Breathing & Internal Lattice Kinetics driven by Heartbeat
    // Pulse scale governed by organic double-beat physiological envelope
    const corePulse = 1.0 + 0.038 * hb.pulse;
    const listeningScale = isListening ? 1.04 : 1.0;
    reactorCoreGroup.scale.setScalar(corePulse * listeningScale * actScale);

    // Geodesic neural cage facets/beacons & rotation
    if (latticeGroup) {
      const latticeBaseSpeed = isBusy ? 0.035 : 0.007;
      const latticeSpeed = latticeBaseSpeed * (1.0 + 0.8 * hb.pulse);
      latticeGroup.rotation.y += latticeSpeed;
      latticeGroup.rotation.z += latticeSpeed * 0.7;
      latticeGroup.scale.setScalar(1.0 + 0.018 * hb.pulse);
    }

    // Dynamic light pulsing synchronized with heartbeat
    if (coreLight) {
      coreLight.intensity = (5.2 + 3.8 * hb.pulse) * (isListening ? 1.25 : 1.0) * actScale;
    }
    if (secondaryLight) {
      secondaryLight.intensity = (3.4 + 2.5 * hb.pulse) * actScale;
    }
    if (violetPointLight) {
      violetPointLight.intensity = (2.8 + 2.2 * hb.pulse) * actScale;
    }

    // 5. Planar Gimbal and Framing Rings Kinetics - Wave Propagation Sequence
    ringControllers.forEach((rc) => {
      // Calculate wave excitation as the radial heartbeat shockwave reaches this ring's radius
      const excitation = masterHeartbeat.getWaveExcitation(rc.radius, 0.6);
      
      // Angular acceleration surge as the wave washes through the gimbal
      const speed = rc.baseSpeed * (1.0 + rc.accelFactor * excitation * hb.strength) * speedMultiplier;
      rc.mesh.rotateOnAxis(rc.localAxis, speed);

      // Subtle radial heave/dilation when wave passes
      const ringScale = (1.0 + 0.015 * excitation) * listeningScale * actScale;
      rc.mesh.scale.setScalar(ringScale);
    });

    // Sequential tick illumination on Primary Gimbal during THINKING / ANALYSING or Heartbeat
    if (tickMeshes.length > 0) {
      if (isBusy) {
        const activeIdx = Math.floor(elapsedTime * 14) % tickMeshes.length;
        tickMeshes.forEach((tick, idx) => {
          const mat = tick.material as THREE.MeshBasicMaterial;
          if (idx === activeIdx || idx === (activeIdx + 1) % tickMeshes.length) {
            mat.opacity = 1.0;
            mat.color.setHex(0xffffff);
          } else {
            mat.opacity = 0.35 + 0.25 * hb.pulse;
            mat.color.setHex(0x00e5ff);
          }
        });
      } else {
        tickMeshes.forEach((tick) => {
          const mat = tick.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.55 + 0.40 * hb.pulse;
          mat.color.setHex(0x00e5ff);
        });
      }
    }

    // 6. Streamlined Accretion Disc Particle Swarm
    if (particlesMesh) {
      const posAttr = particlesMesh.geometry.attributes.position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;

      const pSpeedMult = isBusy ? 2.8 : isListening ? 1.4 : isResponding ? 1.8 : 1.0;
      for (let i = 0; i < particleDataList.length; i++) {
        const p = particleDataList[i];
        // Excitation when the radial shockwave passes through this particle's radius
        const pExcitation = masterHeartbeat.getWaveExcitation(p.radius, 0.45);
        const pSpeed = p.speed * (1.0 + 1.2 * pExcitation * hb.strength) * pSpeedMult;
        p.theta += pSpeed;
        p.y += p.vy;
        if (Math.abs(p.y - p.initialY) > 0.14) {
          p.vy = -p.vy;
        }

        // Slight vortex inward suction during THINKING / ANALYSING + slight radial wave heave
        const rad = (p.radius + 0.08 * pExcitation) * (isBusy ? 0.94 : 1.0);
        array[i * 3] = Math.cos(p.theta) * rad * actScale;
        array[i * 3 + 1] = p.y * actScale;
        array[i * 3 + 2] = Math.sin(p.theta) * rad * actScale;
      }
      posAttr.needsUpdate = true;
    }

    // 7. Outward Energy Wave Shockwave (Continuous heartbeat-driven wave propagation)
    if (shockwaveMesh) {
      shockwaveMesh.scale.set(hb.waveRadius, hb.waveRadius, hb.waveRadius);
      const shockMat = shockwaveMesh.material as THREE.MeshBasicMaterial;
      shockMat.opacity = hb.waveOpacity * 0.50 * actScale;
    }
    if (shockwaveVioletMesh) {
      const vRadius = Math.max(0.3, hb.waveRadius * 0.88);
      shockwaveVioletMesh.scale.set(vRadius, vRadius, vRadius);
      const vMat = shockwaveVioletMesh.material as THREE.MeshBasicMaterial;
      vMat.opacity = hb.waveOpacity * 0.35 * actScale;
    }

    renderer.render(scene, camera);
  }

  function handleMouseMove(e: MouseEvent) {
    if (!interactive || !canvasContainer) return;
    const rect = canvasContainer.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    targetTiltX = -y * 0.28;
    targetTiltY = x * 0.28;
  }

  function handleMouseLeave() {
    targetTiltX = 0;
    targetTiltY = 0;
  }

  function handleResize() {
    if (!canvasContainer || !renderer || !camera) return;
    const width = canvasContainer.clientWidth;
    const height = canvasContainer.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  bind:this={canvasContainer}
  on:mousemove={handleMouseMove}
  on:mouseleave={handleMouseLeave}
  class="relative flex items-center justify-center select-none overflow-visible {
    size === 'sm' ? 'w-14 h-14' : size === 'md' ? 'w-48 h-48' : 'w-full h-full max-w-[780px] max-h-[560px] aspect-[4/3]'
  }"
>
</div>
