import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { Compass, RotateCw } from 'lucide-react';

interface HotspotBeacon {
  name: string;
  lat: number;
  lon: number;
  color: string;
  frp: string;
}

// Indonesian Active Wildfire & Peatland Beacons
const INDONESIA_HOTSPOTS: HotspotBeacon[] = [
  { name: 'Riau Gambut', lat: 1.48, lon: 101.85, color: '#EF4444', frp: '1,240 MW' },
  { name: 'OKI Sumsel', lat: -3.45, lon: 104.9, color: '#F97316', frp: '2,890 MW' },
  { name: 'Ketapang Kalbar', lat: -1.58, lon: 109.95, color: '#EF4444', frp: '1,780 MW' },
  { name: 'Palangka Raya Kalteng', lat: -2.4, lon: 114.1, color: '#EF4444', frp: '3,120 MW' },
  { name: 'Kalsel Banjar', lat: -3.32, lon: 114.6, color: '#F97316', frp: '940 MW' },
  { name: 'Merauke Papua', lat: -7.95, lon: 139.8, color: '#EAB308', frp: '1,150 MW' },
  { name: 'Jambi Muaro', lat: -1.6, lon: 103.6, color: '#F97316', frp: '820 MW' },
];

// Helper: Convert Lat/Lon to 3D Cartesian Coordinate
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Generate Procedural High-Contrast Earth Night Texture
function createProceduralEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const w = canvas.width;
  const h = canvas.height;

  // 1. Deep Space Black-Blue Ocean
  const oceanGrad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w / 2);
  oceanGrad.addColorStop(0, '#0a1428');
  oceanGrad.addColorStop(0.6, '#060b18');
  oceanGrad.addColorStop(1, '#03060d');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Lat/Lon Graticule Lines (Equator, Tropics, Coordinates)
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
  ctx.lineWidth = 1;
  // Parallels (Latitudes)
  for (let lat = -80; lat <= 80; lat += 20) {
    const y = ((90 - lat) / 180) * h;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  // Meridians (Longitudes)
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * w;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  // Equator Highlight
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();

  // 3. Draw Simplified High-Contrast Continents
  ctx.fillStyle = '#0f2038';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 1.2;

  // Coordinate mapper helper
  const mapPt = (lon: number, lat: number): [number, number] => [
    ((lon + 180) / 360) * w,
    ((90 - lat) / 180) * h,
  ];

  const drawPoly = (pts: [number, number][], fill = true) => {
    if (!pts.length) return;
    ctx.beginPath();
    const [startX, startY] = mapPt(pts[0][0], pts[0][1]);
    ctx.moveTo(startX, startY);
    for (let i = 1; i < pts.length; i++) {
      const [px, py] = mapPt(pts[i][0], pts[i][1]);
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    if (fill) ctx.fill();
    ctx.stroke();
  };

  // Eurasia & Africa (Simplified Landmass Poly)
  drawPoly([
    [-10, 36], [0, 44], [15, 55], [30, 70], [60, 72], [100, 75], [140, 70], [170, 65],
    [145, 40], [120, 22], [105, 10], [90, 22], [75, 10], [60, 25], [45, 12],
    [50, -10], [40, -30], [20, -35], [10, -5], [-15, 15], [-10, 36]
  ]);

  // Americas (Simplified)
  drawPoly([
    [-130, 65], [-90, 70], [-60, 50], [-75, 30], [-80, 10], [-50, -5],
    [-40, -20], [-65, -55], [-75, -45], [-80, 0], [-105, 20], [-125, 35], [-130, 65]
  ]);

  // Australia
  drawPoly([
    [115, -22], [130, -12], [145, -15], [152, -28], [148, -38], [135, -35], [115, -34], [115, -22]
  ]);

  // 4. HIGHLIGHT INDONESIAN ARCHIPELAGO IN ULTRA-CRISP HIGH RESOLUTION
  ctx.fillStyle = '#16365c';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.8;

  // Sumatra
  drawPoly([[95, 5.5], [98, 3.0], [103, -1.0], [106, -5.8], [103, -4.5], [99, -0.5], [95, 5.5]]);

  // Java
  drawPoly([[105.5, -6.0], [109.0, -7.0], [114.5, -8.0], [114.0, -8.8], [108.5, -7.6], [105.5, -6.0]]);

  // Kalimantan / Borneo
  drawPoly([[109.0, 1.0], [112.5, 7.0], [118.0, 4.5], [117.5, -2.5], [114.5, -4.0], [110.5, -3.0], [109.0, 1.0]]);

  // Sulawesi
  drawPoly([[119.5, 1.5], [121.0, 1.0], [125.0, 1.5], [123.0, -0.5], [122.5, -5.5], [119.5, -5.5], [119.5, 1.5]]);

  // Papua
  drawPoly([[131.0, -1.0], [135.0, -3.0], [141.0, -2.5], [141.0, -9.0], [138.0, -7.5], [135.0, -4.5], [131.0, -1.0]]);

  // 5. City Night Lights & Human Habitation Stars
  ctx.fillStyle = 'rgba(253, 224, 71, 0.75)'; // Warm Golden Yellow
  for (let i = 0; i < 450; i++) {
    const rx = Math.random() * w;
    const ry = (0.2 + Math.random() * 0.6) * h;
    const size = Math.random() * 1.8 + 0.5;
    ctx.beginPath();
    ctx.arc(rx, ry, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Indonesian Night Lights Cluster
  ctx.fillStyle = 'rgba(6, 182, 212, 0.9)'; // Cyan Tropical Glowing Nodes
  const indoCities: [number, number][] = [
    [106.8, -6.2], // Jakarta
    [112.7, -7.2], // Surabaya
    [104.7, -2.9], // Palembang
    [98.6, 3.5],   // Medan
    [119.4, -5.1], // Makassar
    [116.8, -1.2], // Balikpapan / IKN
    [117.1, -0.5], // Samarinda
    [114.6, -3.3], // Banjarmasin
    [110.4, -7.0], // Semarang
    [110.3, -7.8], // Yogyakarta
  ];

  indoCities.forEach(([lon, lat]) => {
    const [cx, cy] = mapPt(lon, lat);
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // Pulse glow ring
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.stroke();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export interface Earth3DGlobeRef {
  resetToIndonesia: () => void;
}

export const Earth3DGlobe = forwardRef<Earth3DGlobeRef>((_props, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<HotspotBeacon | null>(null);
  const [hoveredBeacon, setHoveredBeacon] = useState<{
    name: string;
    frp: string;
    x: number;
    y: number;
  } | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const targetRotationRef = useRef<{ x: number; y: number } | null>(null);
  const isPausedRef = useRef<boolean>(false);

  // Quick reset view to Indonesia (lon 118° E, lat 0°: rotation.y = 2.6529 radians = 152 degrees)
  const handleResetToIndonesia = () => {
    targetRotationRef.current = {
      x: 0,
      y: 2.6529,
    };
  };

  useImperativeHandle(ref, () => ({
    resetToIndonesia: handleResetToIndonesia,
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 420;
    const height = container.clientHeight || 420;

    // 1. Scene & Camera Setup (Distance 6.2 ensures outermost satellite orbits never get clipped)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 6.2);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3. Master Globe Group (Rotated 23.5° axial tilt)
    const masterGroup = new THREE.Group();
    masterGroup.rotation.z = (23.5 * Math.PI) / 180;
    scene.add(masterGroup);
    globeGroupRef.current = masterGroup;

    // Center initial view directly onto Indonesia (152° = 2.6529 radians)
    masterGroup.rotation.y = 2.6529;
    masterGroup.rotation.x = 0;

    // 4. Earth Sphere Mesh
    const earthRadius = 1.68;
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthTexture = createProceduralEarthTexture();

    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.65,
      metalness: 0.2,
      emissive: new THREE.Color('#030814'),
      emissiveIntensity: 0.6,
    });

    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    masterGroup.add(earthMesh);

    // 5. Atmospheric Outer Glow (Fresnel Inverted Rim)
    const atmosphereGeometry = new THREE.SphereGeometry(earthRadius * 1.12, 48, 48);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.02, 0.75, 0.95, 1.0) * intensity * 0.9;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });

    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphereMesh);

    // 6. Indonesian Wildfire 3D Beacons (Light Spikes & Expanding Rings)
    const beaconMeshes: {
      core: THREE.Mesh;
      spike: THREE.Line;
      ring: THREE.Mesh;
      hit: THREE.Mesh;
      beaconData: HotspotBeacon;
      pos: THREE.Vector3;
    }[] = [];

    INDONESIA_HOTSPOTS.forEach((spot) => {
      const pos = latLonToVector3(spot.lat, spot.lon, earthRadius);
      const normal = pos.clone().normalize();

      // Beacon Glowing Core
      const coreGeo = new THREE.SphereGeometry(0.035, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({ color: spot.color });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.copy(pos);
      masterGroup.add(coreMesh);

      // Vertical Thermal Spike Line
      const spikeEnd = pos.clone().add(normal.clone().multiplyScalar(0.22));
      const spikeGeo = new THREE.BufferGeometry().setFromPoints([pos, spikeEnd]);
      const spikeMat = new THREE.LineBasicMaterial({
        color: spot.color,
        linewidth: 2,
        transparent: true,
        opacity: 0.85,
      });
      const spikeLine = new THREE.Line(spikeGeo, spikeMat);
      masterGroup.add(spikeLine);

      // Ground Expanding Wave Ring
      const ringGeo = new THREE.RingGeometry(0.02, 0.07, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: spot.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.005)));
      ringMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      masterGroup.add(ringMesh);

      // Invisible Hover Hitbox
      const hitGeo = new THREE.SphereGeometry(0.12, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.copy(pos);
      masterGroup.add(hitMesh);

      beaconMeshes.push({ core: coreMesh, spike: spikeLine, ring: ringMesh, hit: hitMesh, beaconData: spot, pos });
    });

    // 7. Satellite Orbital Constellations (Terra/Aqua Cyan & Suomi NPP Violet)
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    // Orbit Ring 1: MODIS (Terra/Aqua) - Polar Sun-Sync 98°
    const orbit1Radius = earthRadius * 1.25;
    const orbit1Curve = new THREE.EllipseCurve(0, 0, orbit1Radius, orbit1Radius * 0.96, 0, 2 * Math.PI, false, 0);
    const orbit1Points = orbit1Curve.getPoints(90).map((p) => new THREE.Vector3(p.x, p.y, 0));
    const orbit1Geo = new THREE.BufferGeometry().setFromPoints(orbit1Points);
    const orbit1Mat = new THREE.LineBasicMaterial({
      color: '#06B6D4',
      transparent: true,
      opacity: 0.35,
    });
    const orbit1Line = new THREE.Line(orbit1Geo, orbit1Mat);
    orbit1Line.rotation.x = Math.PI / 2.3;
    orbit1Line.rotation.y = Math.PI / 6;
    orbitGroup.add(orbit1Line);

    // Orbit 1 Satellite Mesh
    const sat1Geo = new THREE.BoxGeometry(0.05, 0.03, 0.03);
    const sat1Mat = new THREE.MeshBasicMaterial({ color: '#38BDF8' });
    const sat1Mesh = new THREE.Mesh(sat1Geo, sat1Mat);
    orbit1Line.add(sat1Mesh);

    // Orbit Ring 2: VIIRS (Suomi NPP)
    const orbit2Radius = earthRadius * 1.38;
    const orbit2Curve = new THREE.EllipseCurve(0, 0, orbit2Radius, orbit2Radius * 0.94, 0, 2 * Math.PI, false, 0);
    const orbit2Points = orbit2Curve.getPoints(90).map((p) => new THREE.Vector3(p.x, p.y, 0));
    const orbit2Geo = new THREE.BufferGeometry().setFromPoints(orbit2Points);
    const orbit2Mat = new THREE.LineBasicMaterial({
      color: '#A855F7',
      transparent: true,
      opacity: 0.3,
    });
    const orbit2Line = new THREE.Line(orbit2Geo, orbit2Mat);
    orbit2Line.rotation.x = -Math.PI / 2.5;
    orbit2Line.rotation.y = -Math.PI / 5;
    orbitGroup.add(orbit2Line);

    // Orbit 2 Satellite Mesh
    const sat2Geo = new THREE.BoxGeometry(0.05, 0.03, 0.03);
    const sat2Mat = new THREE.MeshBasicMaterial({ color: '#C084FC' });
    const sat2Mesh = new THREE.Mesh(sat2Geo, sat2Mat);
    orbit2Line.add(sat2Mesh);

    // 8. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xf97316, 1.2);
    rimLight.position.set(-5, -2, -3);
    scene.add(rimLight);

    // 9. Interactive Mouse / Touch Drag Handlers
    const handlePointerDown = (clientX: number, clientY: number) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (clientX: number, clientY: number) => {
      if (!isDraggingRef.current || !globeGroupRef.current) return;

      const deltaX = clientX - previousMousePositionRef.current.x;
      const deltaY = clientY - previousMousePositionRef.current.y;

      globeGroupRef.current.rotation.y += deltaX * 0.006;
      globeGroupRef.current.rotation.x += deltaY * 0.004;

      // Restrict pitch to avoid flipping upside down
      globeGroupRef.current.rotation.x = Math.max(-0.6, Math.min(0.6, globeGroupRef.current.rotation.x));

      previousMousePositionRef.current = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const checkBeaconHover = (clientX: number, clientY: number) => {
      if (isDraggingRef.current || !containerRef.current) {
        setHoveredBeacon(null);
        return;
      }
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const targets = beaconMeshes.map((b) => b.hit);
      const intersects = raycaster.intersectObjects(targets, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const match = beaconMeshes.find((b) => b.hit === hit);
        if (match) {
          setHoveredBeacon({
            name: match.beaconData.name,
            frp: match.beaconData.frp,
            x: clientX - rect.left,
            y: clientY - rect.top,
          });
          return;
        }
      }
      setHoveredBeacon(null);
    };

    const onMouseDown = (e: MouseEvent) => {
      setHoveredBeacon(null);
      handlePointerDown(e.clientX, e.clientY);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        setHoveredBeacon(null);
        handlePointerMove(e.clientX, e.clientY);
      } else {
        checkBeaconHover(e.clientX, e.clientY);
      }
    };
    const onMouseUp = () => handlePointerUp();
    const onMouseLeave = () => setHoveredBeacon(null);

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        setHoveredBeacon(null);
        handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handlePointerUp();

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('mouseleave', onMouseLeave);

    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // 10. Animation Loop (60 FPS with Idle Rotation & Beacon Pulses)
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (isPausedRef.current) return;

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth animated orientation transition to Indonesia when requested, or gentle idle spin
      if (targetRotationRef.current && globeGroupRef.current) {
        const target = targetRotationRef.current;
        globeGroupRef.current.rotation.y += (target.y - globeGroupRef.current.rotation.y) * 0.08;
        globeGroupRef.current.rotation.x += (target.x - globeGroupRef.current.rotation.x) * 0.08;
        if (
          Math.abs(target.y - globeGroupRef.current.rotation.y) < 0.003 &&
          Math.abs(target.x - globeGroupRef.current.rotation.x) < 0.003
        ) {
          globeGroupRef.current.rotation.y = target.y;
          globeGroupRef.current.rotation.x = target.x;
          targetRotationRef.current = null;
        }
      } else if (!isDraggingRef.current && globeGroupRef.current) {
        globeGroupRef.current.rotation.y += 0.0018;
      }

      // Orbit satellites around their paths
      const sat1Angle = elapsed * 0.55;
      sat1Mesh.position.set(
        Math.cos(sat1Angle) * orbit1Radius,
        Math.sin(sat1Angle) * (orbit1Radius * 0.96),
        0
      );

      const sat2Angle = -elapsed * 0.45;
      sat2Mesh.position.set(
        Math.cos(sat2Angle) * orbit2Radius,
        Math.sin(sat2Angle) * (orbit2Radius * 0.94),
        0
      );

      // Pulse beacon ground rings
      beaconMeshes.forEach((item, idx) => {
        const pulse = 1.0 + Math.sin(elapsed * 4 + idx * 0.8) * 0.35;
        item.ring.scale.set(pulse, pulse, 1);
      });

      renderer.render(scene, camera);
    };

    animate();

    // 11. Intersection Observer to Pause Rendering When Scrolled Out of View
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isPausedRef.current = !entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // 12. Responsive Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      domElement.removeEventListener('mouseleave', onMouseLeave);

      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
      earthTexture.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
    };
  }, []);

  return (
    <div className="relative w-full aspect-square flex items-center justify-center select-none">
      {/* Outer Atmospheric Haze Glow */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-cyan-500/25 via-blue-600/15 to-rose-500/15 blur-3xl -z-10 animate-pulse pointer-events-none" />

      {/* Hover Tooltip for Hotspot Beacon */}
      {hoveredBeacon && (
        <div
          style={{ left: hoveredBeacon.x, top: hoveredBeacon.y - 38 }}
          className="absolute z-30 -translate-x-1/2 pointer-events-none px-3 py-1.5 rounded-xl bg-slate-950/95 border border-cyan-400/60 shadow-xl shadow-cyan-950/80 text-[10px] font-mono whitespace-nowrap backdrop-blur-md animate-in fade-in zoom-in-95 flex items-center gap-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="font-bold text-white">📍 {hoveredBeacon.name}</span>
          <span className="text-slate-500">•</span>
          <span className="text-amber-400 font-bold">{hoveredBeacon.frp}</span>
        </div>
      )}

      {/* 3D WebGL Canvas Container - 100% Clean Zero-Float with Mobile Touch Pass-through */}
      <div
        ref={containerRef}
        style={{ touchAction: 'pan-y' }}
        className="w-full h-full cursor-grab active:cursor-grabbing relative z-10 flex items-center justify-center"
      />
    </div>
  );
});

Earth3DGlobe.displayName = 'Earth3DGlobe';
