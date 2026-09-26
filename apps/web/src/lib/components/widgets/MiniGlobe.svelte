<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { createDayTexture, createNightTexture, createAtmosphereMaterial } from '../../three/earthTextures';

  let container: HTMLDivElement;
  let animId: number;
  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let globeMesh: THREE.Mesh;

  onMount(() => {
    if (!container) return;
    const w = container.clientWidth || 72;
    const h = container.clientHeight || 72;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0x0e2444, 2.0);
    scene.add(amb);

    const sun = new THREE.DirectionalLight(0xffffff, 3.5);
    sun.position.set(5, 4, 4);
    scene.add(sun);

    // Mini Globe geometry & textures
    const geo = new THREE.SphereGeometry(1.6, 32, 32);
    const dayTex = createDayTexture();
    const nightTex = createNightTexture();

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayTex },
        nightTexture: { value: nightTex },
        sunDirection: { value: new THREE.Vector3(1, 0.4, 0.9).normalize() },
        dimFactor: { value: 1.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform vec3 sunDirection;
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          float sunDot = dot(normalize(vNormal), normalize(sunDirection));
          float dayIntensity = smoothstep(-0.1, 0.25, sunDot);
          vec3 dayColor = texture2D(dayTexture, vUv).rgb * 1.5;
          vec3 nightColor = texture2D(nightTexture, vUv).rgb * 4.0;
          gl_FragColor = vec4(mix(nightColor, dayColor, dayIntensity), 1.0);
        }
      `
    });

    globeMesh = new THREE.Mesh(geo, mat);
    scene.add(globeMesh);

    // Glowing cyan atmosphere
    const atmoGeo = new THREE.SphereGeometry(1.75, 32, 32);
    const atmoMat = createAtmosphereMaterial();
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    scene.add(atmoMesh);

    function animate() {
      animId = requestAnimationFrame(animate);
      if (globeMesh) globeMesh.rotation.y += 0.008;
      renderer.render(scene, camera);
    }
    animate();
  });

  onDestroy(() => {
    if (animId) cancelAnimationFrame(animId);
    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
    }
  });
</script>

<div bind:this={container} class="w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center select-none overflow-visible"></div>
