import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HeroSceneFallback } from './HeroSceneFallback';

/**
 * RelayCore: Illuminated central relay node emitting soft oxidised mint and signal lime glow.
 */
function RelayCore({ pulseSpeed = 1.8 }) {
  const coreRef = useRef();
  const innerRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * pulseSpeed;
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.4;
      coreRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
    }
    if (innerRef.current) {
      const scale = 1 + Math.sin(t * 2) * 0.08;
      innerRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={coreRef}>
      {/* Outer crystalline lattice sphere */}
      <mesh>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial
          color="#16221C"
          emissive="#82C9AE"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
          wireframe
        />
      </mesh>

      {/* Solid inner core emitting signal lime glow */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshStandardMaterial
          color="#D4EE79"
          emissive="#D4EE79"
          emissiveIntensity={0.85}
          roughness={0.15}
          metalness={0.2}
        />
      </mesh>

      {/* Point light positioned exactly at the relay nexus */}
      <pointLight color="#D4EE79" intensity={1.6} distance={6} decay={2} />
    </group>
  );
}

/**
 * RelayRibbons: Two interlocking sculptural ribbons symbolizing incoming/outgoing cohorts,
 * knowledge continuity, and operational momentum.
 */
function RelayRibbons({ mousePosition, reducedMotion }) {
  const groupRef = useRef();
  const ribbon1Ref = useRef();
  const ribbon2Ref = useRef();

  // Create custom interlocking 3D curve paths using CatmullRomCurve3
  const { geometry1, geometry2 } = useMemo(() => {
    // Ribbon 1: Satin charcoal metallic loop with sweeping vertical twist
    const points1 = [];
    const count1 = 60;
    for (let i = 0; i <= count1; i++) {
      const theta = (i / count1) * Math.PI * 2;
      const x = Math.sin(theta) * 2.2 + Math.cos(theta * 2) * 0.3;
      const y = Math.cos(theta) * 1.6 + Math.sin(theta * 3) * 0.4;
      const z = Math.sin(theta * 2) * 1.1;
      points1.push(new THREE.Vector3(x, y, z));
    }
    const curve1 = new THREE.CatmullRomCurve3(points1, true, 'centripetal');
    const geo1 = new THREE.TubeGeometry(curve1, 100, 0.16, 16, true);

    // Ribbon 2: Interlocking counter-loop with oxidised mint metallic sheen
    const points2 = [];
    const count2 = 60;
    for (let i = 0; i <= count2; i++) {
      const theta = (i / count2) * Math.PI * 2;
      const x = Math.cos(theta) * 1.9 + Math.sin(theta * 2) * 0.4;
      const y = Math.sin(theta) * 2.1 - Math.cos(theta * 3) * 0.3;
      const z = Math.cos(theta * 2) * 1.2;
      points2.push(new THREE.Vector3(x, y, z));
    }
    const curve2 = new THREE.CatmullRomCurve3(points2, true, 'centripetal');
    const geo2 = new THREE.TubeGeometry(curve2, 100, 0.14, 16, true);

    return { geometry1: geo1, geometry2: geo2 };
  }, []);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.getElapsedTime();

    if (groupRef.current) {
      // Gentle floating rotation
      groupRef.current.rotation.y = t * 0.18 + mousePosition.current.x * 0.35;
      groupRef.current.rotation.x = Math.sin(t * 0.15) * 0.12 - mousePosition.current.y * 0.25;
    }

    if (ribbon1Ref.current) {
      ribbon1Ref.current.rotation.z = Math.sin(t * 0.25) * 0.08;
    }
    if (ribbon2Ref.current) {
      ribbon2Ref.current.rotation.z = -Math.cos(t * 0.22) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Primary Sculptural Ribbon: Satin Metallic Charcoal with Mint edge highlight */}
      <mesh ref={ribbon1Ref} geometry={geometry1}>
        <meshStandardMaterial
          color="#1E2A23"
          roughness={0.32}
          metalness={0.78}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* Secondary Sculptural Ribbon: Oxidised Mint & Graphite */}
      <mesh ref={ribbon2Ref} geometry={geometry2}>
        <meshStandardMaterial
          color="#2B463B"
          emissive="#82C9AE"
          emissiveIntensity={0.22}
          roughness={0.38}
          metalness={0.65}
        />
      </mesh>

      {/* Accent Torus Halo Ring */}
      <mesh rotation={[Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[2.5, 0.02, 16, 100]} />
        <meshStandardMaterial
          color="#D4EE79"
          emissive="#D4EE79"
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>
    </group>
  );
}

/**
 * OrbitalNodes: Small satellite particles revolving around the relay engine.
 */
function OrbitalNodes({ count = 5 }) {
  const nodesRef = useRef();

  const nodes = useMemo(() => {
    return [
      { radius: 2.7, speed: 0.45, yOffset: 0.3, color: '#D4EE79', size: 0.075 },
      { radius: 3.1, speed: -0.32, yOffset: -0.5, color: '#82C9AE', size: 0.085 },
      { radius: 2.4, speed: 0.55, yOffset: 0.8, color: '#D77D5E', size: 0.065 },
      { radius: 3.4, speed: -0.25, yOffset: 0.1, color: '#F0EDE3', size: 0.06 },
      { radius: 2.9, speed: 0.38, yOffset: -0.7, color: '#82C9AE', size: 0.07 },
    ];
  }, [count]);

  useFrame(({ clock }) => {
    if (!nodesRef.current) return;
    const t = clock.getElapsedTime();
    nodesRef.current.children.forEach((child, i) => {
      const config = nodes[i];
      if (!config) return;
      const angle = t * config.speed + (i * Math.PI * 2) / nodes.length;
      child.position.x = Math.cos(angle) * config.radius;
      child.position.z = Math.sin(angle) * config.radius;
      child.position.y = config.yOffset + Math.sin(t * 0.8 + i) * 0.2;
    });
  });

  return (
    <group ref={nodesRef}>
      {nodes.map((node, i) => (
        <mesh key={i}>
          <sphereGeometry args={[node.size, 16, 16]} />
          <meshStandardMaterial
            color={node.color}
            emissive={node.color}
            emissiveIntensity={0.7}
            roughness={0.2}
            metalness={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * RelayEngineScene: Complete 3D composition with lighting and camera controls.
 */
function RelayEngineScene({ mousePosition, reducedMotion }) {
  return (
    <>
      {/* Lighting Architecture */}
      <ambientLight intensity={0.55} color="#D8E8DF" />
      <directionalLight position={[6, 8, 5]} intensity={1.5} color="#F0EDE3" />
      <directionalLight position={[-6, -4, -4]} intensity={0.8} color="#82C9AE" />
      <pointLight position={[0, 4, 3]} intensity={1.2} color="#D4EE79" distance={10} decay={2} />

      {/* Core and Sculptural Ribbon Elements */}
      <RelayRibbons mousePosition={mousePosition} reducedMotion={reducedMotion} />
      <RelayCore />
      <OrbitalNodes />
    </>
  );
}

/**
 * RelayEngine3D: High-performance 3D visual component for the Midnight Workshop hero.
 * Automatically halts animation when scrolled off-screen via IntersectionObserver.
 */
export function RelayEngine3D() {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const mousePosition = useRef({ x: 0, y: 0 });

  // Check WebGL availability safely
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }

    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mediaQuery.matches);
      const listener = (e) => setIsReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // IntersectionObserver to pause rendering when scrolled out of view
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Smooth pointer interaction
  const handlePointerMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mousePosition.current.x = THREE.MathUtils.clamp(x, -1, 1);
    mousePosition.current.y = THREE.MathUtils.clamp(y, -1, 1);
  };

  const handlePointerLeave = () => {
    mousePosition.current.x = 0;
    mousePosition.current.y = 0;
  };

  if (!hasWebGL) {
    return <HeroSceneFallback />;
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] relative select-none cursor-grab active:cursor-grabbing"
    >
      <Canvas
        camera={{ position: [0, 0, 6.8], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        frameloop={isVisible ? 'always' : 'never'}
        className="w-full h-full"
      >
        <RelayEngineScene mousePosition={mousePosition} reducedMotion={isReducedMotion} />
      </Canvas>
    </div>
  );
}

export default RelayEngine3D;
