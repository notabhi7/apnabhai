import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, Eye, Sparkles, Layers, Sliders, ChevronDown, ChevronUp } from 'lucide-react';

interface StudyBrainSceneProps {
  heightClass?: string;
  showFullControls?: boolean;
}

export const StudyBrainScene: React.FC<StudyBrainSceneProps> = ({
  heightClass = 'h-[500px] sm:h-[600px]',
  showFullControls = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animFrameId = useRef<number | null>(null);

  // Scene state controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [glowIntensity, setGlowIntensity] = useState(1.2);
  const [particleDensity, setParticleDensity] = useState<'high' | 'medium' | 'low'>('high');
  const [cameraView, setCameraView] = useState<'perspective' | 'isometric' | 'top'>('perspective');
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  // Live animation refs
  const isPlayingRef = useRef(true);
  const speedRef = useRef(1.0);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = speedMultiplier; }, [speedMultiplier]);

  // References to animate in render loop
  const sceneElementsRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    coreGroup: THREE.Group;
    nucleusMesh: THREE.Mesh;
    ring1: THREE.Mesh;
    ring2: THREE.Mesh;
    ring3: THREE.Mesh;
    nodesGroup: THREE.Group;
    particles: THREE.Points;
    grid: THREE.GridHelper;
    materials: THREE.Material[];
  } | null>(null);

  // Mouse interaction state for camera drag/orbit
  const isDraggingRef = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });
  const cameraRotationRef = useRef({ theta: 0.3, phi: 1.1, radius: 8.5 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // transparent to blend with dark/light container

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(
      cameraRotationRef.current.radius * Math.sin(cameraRotationRef.current.phi) * Math.sin(cameraRotationRef.current.theta),
      cameraRotationRef.current.radius * Math.cos(cameraRotationRef.current.phi),
      cameraRotationRef.current.radius * Math.sin(cameraRotationRef.current.phi) * Math.cos(cameraRotationRef.current.theta)
    );
    camera.lookAt(0, 0, 0);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.replaceChildren(renderer.domElement);

    const materialsToDispose: THREE.Material[] = [];

    // 4. Lighting setup (Studio 3-Point PBR)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x6366f1, 3.2); // Indigo key
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 2.5); // Sky blue fill
    fillLight.position.set(-6, -2, -4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 2.8); // Purple rim
    rimLight.position.set(0, 5, -8);
    scene.add(rimLight);

    // 5. Composite Procedural Model (3-12 parts grouped under THREE.Group)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Part 1: Central Glowing Nucleus (Knowledge Singularity)
    const nucleusGeo = new THREE.IcosahedronGeometry(1.2, 3);
    const nucleusMat = new THREE.MeshPhysicalMaterial({
      color: 0x4f46e5,
      emissive: 0x4338ca,
      emissiveIntensity: 0.85,
      roughness: 0.15,
      metalness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
    });
    materialsToDispose.push(nucleusMat);
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    coreGroup.add(nucleusMesh);

    // Part 2: Inner Gyroscopic Ring (Torus)
    const ring1Geo = new THREE.TorusGeometry(1.85, 0.055, 24, 80);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
    });
    materialsToDispose.push(ring1Mat);
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    coreGroup.add(ring1);

    // Part 3: Middle Orbital Latitude Ring
    const ring2Geo = new THREE.TorusGeometry(2.4, 0.045, 24, 90);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      metalness: 0.9,
      roughness: 0.25,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.4,
    });
    materialsToDispose.push(ring2Mat);
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    coreGroup.add(ring2);

    // Part 4: Outer Gimbal Ring with counter angle
    const ring3Geo = new THREE.TorusGeometry(2.95, 0.04, 24, 100);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x0891b2,
      emissiveIntensity: 0.45,
    });
    materialsToDispose.push(ring3Mat);
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.y = Math.PI / 4;
    ring3.rotation.z = Math.PI / 6;
    coreGroup.add(ring3);

    // Part 5: Floating Knowledge Satellite Nodes (6 procedural orbital nodes)
    const nodesGroup = new THREE.Group();
    coreGroup.add(nodesGroup);

    const nodeColors = [0x60a5fa, 0x818cf8, 0xc084fc, 0x34d399, 0xf472b6, 0x38bdf8];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const radius = 2.1 + (i % 2) * 0.7;
      const nodeGeo = i % 2 === 0 ? new THREE.OctahedronGeometry(0.2, 0) : new THREE.SphereGeometry(0.18, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: nodeColors[i],
        emissive: nodeColors[i],
        emissiveIntensity: 0.6,
        metalness: 0.7,
        roughness: 0.2,
      });
      materialsToDispose.push(nodeMat);
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 2) * 0.45,
        Math.sin(angle) * radius
      );
      nodesGroup.add(nodeMesh);
    }

    // Part 6: Procedural Starfield / Data Nebula Particles
    const particleCount = 450;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 3.2 + Math.random() * 2.5;
      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.065,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    materialsToDispose.push(particlesMat);
    const particles = new THREE.Points(particlesGeo, particlesMat);
    coreGroup.add(particles);

    // Part 7: Ground Datum Grid
    const grid = new THREE.GridHelper(10, 20, 0x6366f1, 0x334155);
    grid.position.y = -3.2;
    (grid.material as THREE.Material).opacity = 0.25;
    (grid.material as THREE.Material).transparent = true;
    materialsToDispose.push(grid.material as THREE.Material);
    scene.add(grid);

    sceneElementsRef.current = {
      scene,
      camera,
      renderer,
      coreGroup,
      nucleusMesh,
      ring1,
      ring2,
      ring3,
      nodesGroup,
      particles,
      grid,
      materials: materialsToDispose,
    };

    // 6. Interactive Drag Orbit Controls
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - prevMousePos.current.x;
      const deltaY = e.clientY - prevMousePos.current.y;
      prevMousePos.current = { x: e.clientX, y: e.clientY };

      cameraRotationRef.current.theta -= deltaX * 0.008;
      cameraRotationRef.current.phi = Math.max(
        0.15,
        Math.min(Math.PI - 0.15, cameraRotationRef.current.phi - deltaY * 0.008)
      );

      const r = cameraRotationRef.current.radius;
      camera.position.set(
        r * Math.sin(cameraRotationRef.current.phi) * Math.sin(cameraRotationRef.current.theta),
        r * Math.cos(cameraRotationRef.current.phi),
        r * Math.sin(cameraRotationRef.current.phi) * Math.cos(cameraRotationRef.current.theta)
      );
      camera.lookAt(0, 0, 0);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraRotationRef.current.radius = Math.max(
        4.5,
        Math.min(14.0, cameraRotationRef.current.radius + e.deltaY * 0.005)
      );
      const r = cameraRotationRef.current.radius;
      camera.position.set(
        r * Math.sin(cameraRotationRef.current.phi) * Math.sin(cameraRotationRef.current.theta),
        r * Math.cos(cameraRotationRef.current.phi),
        r * Math.sin(cameraRotationRef.current.phi) * Math.cos(cameraRotationRef.current.theta)
      );
      camera.lookAt(0, 0, 0);
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });

    // Handle Resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // 7. Render Loop with Animation
    const clock = new THREE.Clock();
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const currentElements = sceneElementsRef.current;
      if (currentElements && isPlayingRef.current) {
        const speed = speedRef.current;
        currentElements.ring1.rotation.x += delta * 0.65 * speed;
        currentElements.ring1.rotation.y += delta * 0.45 * speed;

        currentElements.ring2.rotation.y -= delta * 0.55 * speed;
        currentElements.ring2.rotation.z += delta * 0.35 * speed;

        currentElements.ring3.rotation.x -= delta * 0.4 * speed;
        currentElements.ring3.rotation.z -= delta * 0.5 * speed;

        currentElements.nodesGroup.rotation.y += delta * 0.3 * speed;
        currentElements.particles.rotation.y -= delta * 0.08 * speed;

        // Subtle nucleus breathing pulse
        const time = clock.getElapsedTime();
        const pulse = 1.0 + Math.sin(time * 2.4) * 0.04;
        currentElements.nucleusMesh.scale.set(pulse, pulse, pulse);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('wheel', handleWheel);

      materialsToDispose.forEach((mat) => mat.dispose());
      nucleusGeo.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
      ring3Geo.dispose();
      particlesGeo.dispose();
      renderer.dispose();
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
    };
  }, []);

  // Update wireframe mode
  useEffect(() => {
    const el = sceneElementsRef.current;
    if (!el) return;
    (el.nucleusMesh.material as THREE.MeshPhysicalMaterial).wireframe = wireframe;
  }, [wireframe]);

  // Update glow intensity
  useEffect(() => {
    const el = sceneElementsRef.current;
    if (!el) return;
    (el.nucleusMesh.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.85 * glowIntensity;
  }, [glowIntensity]);

  // Camera presets
  const applyCameraPreset = (preset: 'perspective' | 'isometric' | 'top') => {
    setCameraView(preset);
    const el = sceneElementsRef.current;
    if (!el) return;

    if (preset === 'perspective') {
      cameraRotationRef.current = { theta: 0.3, phi: 1.1, radius: 8.5 };
    } else if (preset === 'isometric') {
      cameraRotationRef.current = { theta: Math.PI / 4, phi: Math.PI / 4, radius: 9.0 };
    } else if (preset === 'top') {
      cameraRotationRef.current = { theta: 0.01, phi: 0.15, radius: 9.5 };
    }

    const r = cameraRotationRef.current.radius;
    el.camera.position.set(
      r * Math.sin(cameraRotationRef.current.phi) * Math.sin(cameraRotationRef.current.theta),
      r * Math.cos(cameraRotationRef.current.phi),
      r * Math.sin(cameraRotationRef.current.phi) * Math.cos(cameraRotationRef.current.theta)
    );
    el.camera.lookAt(0, 0, 0);
  };

  const resetView = () => {
    applyCameraPreset('perspective');
    setSpeedMultiplier(1.0);
    setWireframe(false);
    setGlowIntensity(1.2);
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-3xl overflow-hidden bg-gradient-to-b from-sky-100 via-indigo-50 to-violet-100 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-950 border border-indigo-200 dark:border-slate-800 shadow-xl flex flex-col select-none`}>
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Overlay Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-indigo-200 dark:border-slate-700/60 shadow-md pointer-events-none">
        <span className="text-[11px] font-bold text-indigo-900 dark:text-slate-200">ApnaBhai Neural Study Core 3D</span>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-indigo-200 dark:border-slate-700/60 shadow-md">
        <button
          onClick={() => applyCameraPreset('perspective')}
          className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold transition cursor-pointer ${cameraView === 'perspective' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-800'}`}
        >
          Perspective
        </button>
        <button
          onClick={() => applyCameraPreset('isometric')}
          className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold transition cursor-pointer ${cameraView === 'isometric' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-800'}`}
        >
          Isometric
        </button>
        <button
          onClick={() => applyCameraPreset('top')}
          className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold transition cursor-pointer ${cameraView === 'top' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-800'}`}
        >
          Top View
        </button>
      </div>

      {/* Collapsible Bottom HUD Control Dock */}
      {showFullControls && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-2xl bg-white/92 dark:bg-slate-900/90 backdrop-blur-xl border border-indigo-200 dark:border-slate-700/80 rounded-2xl p-3 shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">3D Simulation Controls</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded-lg bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
              </button>
              <button
                onClick={resetView}
                className="p-1.5 rounded-lg bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition cursor-pointer"
                title="Reset Simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsDockCollapsed(!isDockCollapsed)}
                className="p-1.5 rounded-lg bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition cursor-pointer"
              >
                {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {!isDockCollapsed && (
            <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 dark:text-slate-300 animate-in fade-in">
              {/* Rotation Speed */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  <span>Orbital Speed</span>
                  <span className="text-sky-600 dark:text-cyan-400 font-mono font-bold tabular-nums">{speedMultiplier.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={speedMultiplier}
                  onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                  className="w-full accent-sky-600 dark:accent-cyan-400 h-1.5 bg-indigo-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Energy Glow */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  <span>Core Glow</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold tabular-nums">{glowIntensity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={glowIntensity}
                  onChange={(e) => setGlowIntensity(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 dark:accent-indigo-500 h-1.5 bg-indigo-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-around bg-indigo-50/80 dark:bg-slate-800/60 rounded-xl p-1.5 border border-indigo-100 dark:border-transparent">
                <button
                  onClick={() => setWireframe(!wireframe)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                    wireframe ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                  }`}
                >
                  Wireframe
                </button>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">Drag to Orbit</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
