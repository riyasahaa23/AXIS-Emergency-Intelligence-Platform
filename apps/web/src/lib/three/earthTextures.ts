import * as THREE from 'three';

export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export function createDayTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Deep sapphire to tropical azure ocean gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#041630');
  oceanGrad.addColorStop(0.2, '#062650');
  oceanGrad.addColorStop(0.5, '#0a3568');
  oceanGrad.addColorStop(0.8, '#062650');
  oceanGrad.addColorStop(1, '#041630');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  function toX(lng: number) { return ((lng + 180) / 360) * width; }
  function toY(lat: number) { return ((90 - lat) / 180) * height; }

  // Detailed global continental coordinates (fine-grained resolution)
  const continents: [number, number][][] = [
    // Eurasia & Africa (connected landmass with Mediterranean & Red Sea detail)
    [
      [-9, 36], [-6, 36], [-2, 37], [3, 42], [8, 44], [13, 45], [19, 40], [24, 38], [28, 41],
      [31, 30], [35, 32], [35, 28], [44, 12], [50, 11], [53, 16], [59, 22], [57, 26], [50, 30],
      [48, 38], [51, 48], [60, 56], [70, 68], [90, 74], [130, 72], [160, 70], [175, 65],
      [162, 55], [142, 48], [132, 42], [128, 38], [122, 30], [119, 25], [108, 18], [103, 10],
      [104, 1], [98, 8], [91, 22], [88, 22], [85, 16], [80, 8], [77, 8], [73, 15], [68, 24],
      [63, 25], [56, 26], [48, 30], [42, 38], [35, 36], [28, 36], [24, 38], [16, 40], [12, 44],
      [2, 43], [-1, 46], [-5, 48], [4, 52], [9, 54], [10, 58], [18, 55], [25, 60], [28, 70],
      [20, 71], [15, 68], [5, 62], [-4, 58], [-5, 50], [-9, 43], [-9, 36]
    ],
    // Africa (Sub-Saharan & Horn)
    [
      [-17, 21], [-17, 14], [-12, 9], [-7, 4], [3, 6], [9, 4], [9, 1], [12, -5],
      [12, -17], [18, -34], [28, -34], [33, -26], [36, -18], [40, -10], [42, -2],
      [51, 10], [43, 12], [37, 22], [32, 31], [25, 32], [12, 33], [0, 35], [-6, 36],
      [-11, 28], [-17, 21]
    ],
    // North America
    [
      [-168, 65], [-150, 70], [-130, 70], [-100, 73], [-80, 70], [-60, 50], [-66, 44],
      [-71, 42], [-76, 35], [-81, 25], [-82, 23], [-88, 30], [-95, 29], [-97, 26],
      [-104, 21], [-90, 15], [-83, 9], [-78, 8], [-83, 10], [-92, 16], [-105, 20],
      [-110, 24], [-117, 32], [-123, 38], [-124, 48], [-130, 54], [-140, 60], [-162, 60],
      [-168, 65]
    ],
    // South America
    [
      [-77, 8], [-72, 11], [-62, 10], [-50, -1], [-35, -5], [-35, -8], [-40, -22],
      [-50, -30], [-57, -38], [-65, -45], [-68, -54], [-75, -50], [-72, -40], [-71, -30],
      [-76, -15], [-81, -5], [-80, 2], [-77, 8]
    ],
    // Australia
    [
      [114, -22], [118, -20], [124, -16], [130, -13], [136, -12], [142, -11], [146, -16],
      [152, -25], [153, -29], [150, -37], [144, -38], [137, -35], [128, -32], [116, -34],
      [113, -26], [114, -22]
    ],
    // Madagascar
    [[44, -12], [50, -13], [47, -25], [44, -25], [44, -12]],
    // Japan
    [[130, 32], [132, 34], [139, 35], [141, 42], [145, 44], [141, 45], [139, 41], [135, 35], [130, 32]],
    // British Isles
    [[-5, 50], [1, 51], [0, 53], [-1, 58], [-5, 58], [-4, 55], [-5, 50]],
    [[-10, 51], [-6, 52], [-6, 55], [-10, 54], [-10, 51]],
    // Indonesia & Philippines
    [[95, 5], [105, -6], [108, -7], [115, -8], [115, -4], [105, 0], [95, 5]],
    [[110, 2], [117, 4], [118, -4], [111, -3], [110, 2]],
    [[120, 14], [125, 12], [124, 7], [121, 6], [120, 14]]
  ];

  // 2. Cyan/Turquoise Shallow Continental Shelf Glow
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
  ctx.lineWidth = 14;
  ctx.lineJoin = 'round';
  continents.forEach(poly => {
    ctx.beginPath();
    ctx.moveTo(toX(poly[0][0]), toY(poly[0][1]));
    for (let i = 1; i < poly.length; i++) ctx.lineTo(toX(poly[i][0]), toY(poly[i][1]));
    ctx.closePath();
    ctx.stroke();
  });

  ctx.strokeStyle = 'rgba(30, 144, 255, 0.65)';
  ctx.lineWidth = 6;
  continents.forEach(poly => {
    ctx.beginPath();
    ctx.moveTo(toX(poly[0][0]), toY(poly[0][1]));
    for (let i = 1; i < poly.length; i++) ctx.lineTo(toX(poly[i][0]), toY(poly[i][1]));
    ctx.closePath();
    ctx.stroke();
  });

  // 3. Rich Natural Vegetation Landmass Fill
  ctx.fillStyle = '#1c5e38';
  ctx.strokeStyle = '#2b7a4b';
  ctx.lineWidth = 1.5;
  continents.forEach(poly => {
    ctx.beginPath();
    ctx.moveTo(toX(poly[0][0]), toY(poly[0][1]));
    for (let i = 1; i < poly.length; i++) ctx.lineTo(toX(poly[i][0]), toY(poly[i][1]));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  // 4. Highlands / Mountain Ridges (Subtle elevation gradients)
  ctx.fillStyle = '#2d6d45';
  continents.forEach(poly => {
    ctx.beginPath();
    // Inner scaled path for mountain relief
    const cx = poly.reduce((acc, p) => acc + toX(p[0]), 0) / poly.length;
    const cy = poly.reduce((acc, p) => acc + toY(p[1]), 0) / poly.length;
    ctx.moveTo(cx + (toX(poly[0][0]) - cx) * 0.7, cy + (toY(poly[0][1]) - cy) * 0.7);
    for (let i = 1; i < poly.length; i++) {
      ctx.lineTo(cx + (toX(poly[i][0]) - cx) * 0.7, cy + (toY(poly[i][1]) - cy) * 0.7);
    }
    ctx.closePath();
    ctx.fill();
  });

  // 5. Desert Regions (Sahara, Arabia, Australia interior, Gobi)
  ctx.fillStyle = '#bd9552';
  const deserts = [
    [[-14, 28], [32, 28], [34, 16], [12, 14], [-14, 18]],
    [[38, 28], [56, 26], [58, 18], [44, 14], [38, 28]],
    [[82, 44], [112, 44], [116, 38], [90, 36]],
    [[118, -22], [140, -22], [138, -32], [120, -30]]
  ];
  deserts.forEach(poly => {
    ctx.beginPath();
    ctx.moveTo(toX(poly[0][0]), toY(poly[0][1]));
    for (let i = 1; i < poly.length; i++) ctx.lineTo(toX(poly[i][0]), toY(poly[i][1]));
    ctx.closePath();
    ctx.fill();
  });

  // 6. Polar Ice Caps (Gleaming white with arctic cyan shading)
  const northGrad = ctx.createLinearGradient(0, 0, 0, toY(70));
  northGrad.addColorStop(0, '#ffffff');
  northGrad.addColorStop(0.8, '#f0f8ff');
  northGrad.addColorStop(1, 'rgba(210, 235, 255, 0.75)');
  ctx.fillStyle = northGrad;
  ctx.fillRect(0, 0, width, toY(70));

  const southGrad = ctx.createLinearGradient(0, toY(-65), 0, height);
  southGrad.addColorStop(0, 'rgba(210, 235, 255, 0.75)');
  southGrad.addColorStop(0.2, '#f0f8ff');
  southGrad.addColorStop(1, '#ffffff');
  ctx.fillStyle = southGrad;
  ctx.fillRect(0, toY(-65), width, height - toY(-65));

  // 7. Subtle terrain noise for tactile digital-twin realism
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    // Only apply subtle relief to land (where not pure ocean blue)
    if (data[i+1] > 60 || data[i] > 100) {
      const n = (Math.random() - 0.5) * 14;
      data[i] = Math.min(255, Math.max(0, data[i] + n));
      data[i+1] = Math.min(255, Math.max(0, data[i+1] + n));
      data[i+2] = Math.min(255, Math.max(0, data[i+2] + n));
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createNightTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#02050f';
  ctx.fillRect(0, 0, width, height);

  function toX(lng: number) { return ((lng + 180) / 360) * width; }
  function toY(lat: number) { return ((90 - lat) / 180) * height; }

  const cityClusters: [number, number, number, number][] = [
    [-74, 40.7, 24, 1.0], [-87.6, 41.8, 18, 0.95], [-118.2, 34, 22, 1.0], [-122.4, 37.7, 16, 0.95],
    [-95.3, 29.7, 16, 0.9], [-84.3, 33.7, 14, 0.85], [-71, 42.3, 14, 0.9], [-75.6, 45.4, 12, 0.85],
    [-123.1, 49.2, 12, 0.85], [0.1, 51.5, 22, 1.0], [2.3, 48.8, 20, 1.0], [13.4, 52.5, 16, 0.9],
    [12.5, 41.9, 14, 0.85], [-3.7, 40.4, 14, 0.85], [4.9, 52.3, 20, 1.0], [37.6, 55.7, 18, 0.95],
    [72.8, 18.9, 26, 1.0], [77.2, 28.6, 28, 1.0], [88.3, 22.5, 24, 1.0], [80.2, 13.0, 22, 0.95],
    [77.5, 12.9, 22, 1.0], [78.4, 17.3, 18, 0.9], [90.4, 23.8, 24, 1.0], [139.6, 35.6, 32, 1.0],
    [126.9, 37.5, 24, 1.0], [121.4, 31.2, 30, 1.0], [116.4, 39.9, 28, 1.0], [113.2, 23.1, 30, 1.0],
    [100.5, 13.7, 18, 0.9], [103.8, 1.3, 16, 0.95], [106.8, -6.2, 20, 0.9], [55.3, 25.2, 20, 1.0],
    [31.2, 30.0, 22, 1.0], [28.0, -26.2, 16, 0.85], [-46.6, -23.5, 24, 1.0], [-43.1, -22.9, 18, 0.95],
    [-58.3, -34.6, 20, 0.9], [151.2, -33.8, 18, 0.9], [144.9, -37.8, 16, 0.85]
  ];

  cityClusters.forEach(([lng, lat, radius, intensity]) => {
    const x = toX(lng);
    const y = toY(lat);

    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.2);
    grad.addColorStop(0, `rgba(255, 245, 200, ${intensity * 1.0})`);
    grad.addColorStop(0.2, `rgba(255, 195, 75, ${intensity * 0.9})`);
    grad.addColorStop(0.5, `rgba(255, 140, 20, ${intensity * 0.55})`);
    grad.addColorStop(0.8, `rgba(255, 80, 0, ${intensity * 0.2})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    for (let j = 0; j < 5; j++) {
      const angle = (j * Math.PI * 2) / 5 + Math.random() * 0.4;
      const dist = radius * (1.4 + Math.random() * 2.2);
      ctx.strokeStyle = `rgba(255, 200, 90, ${intensity * 0.45})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist);
      ctx.stroke();
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createCloudsTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 450; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = 25 + Math.random() * 95;
    const alpha = 0.08 + Math.random() * 0.32;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    grad.addColorStop(0.5, `rgba(230, 245, 255, ${alpha * 0.5})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const eqY = height * 0.5;
  for (let x = 0; x < width; x += 12) {
    const yOffset = Math.sin(x * 0.015) * 45 + (Math.random() - 0.5) * 25;
    const r = 35 + Math.random() * 50;
    const grad = ctx.createRadialGradient(x, eqY + yOffset, 0, x, eqY + yOffset, r);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    grad.addColorStop(0.6, 'rgba(235, 245, 255, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, eqY + yOffset, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createAtmosphereMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPositionNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPositionNormal;
      void main() {
        // High-luminance limb / Rayleigh atmosphere calculation
        float viewDot = dot(vNormal, vec3(0.0, 0.0, 1.0));
        float innerRim = pow(max(0.0, 0.78 - viewDot), 1.8);
        float outerHalo = pow(max(0.0, 0.68 - viewDot), 2.6);

        // Radiant electric cyan and sapphire plasma palette matching reference
        vec3 cyanElectric = vec3(0.0, 0.95, 1.0);
        vec3 deepAzure = vec3(0.08, 0.45, 1.0);
        vec3 violetAccent = vec3(0.48, 0.28, 1.0);

        vec3 atmosphere = mix(deepAzure, cyanElectric, innerRim * 1.4);
        atmosphere = mix(atmosphere, violetAccent, outerHalo * 0.35);

        float alpha = clamp(innerRim * 1.25 + outerHalo * 0.85, 0.0, 1.0);
        gl_FragColor = vec4(atmosphere * 1.4, alpha * 0.96);
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false
  });
}