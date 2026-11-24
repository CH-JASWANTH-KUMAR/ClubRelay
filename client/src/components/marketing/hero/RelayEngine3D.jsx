import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { HeroSceneFallback } from './HeroSceneFallback';

/**
 * RelayCore: Illuminated central relay nexus where ribbons cross.
 * Small icosahedron with outer lattice and glowing Fresh Mint & Electric Blue core.
 */
function RelayCore() {
  const coreRef = useRef();
  const innerRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.25;
      coreRef.current.rotation.x = Math.sin(t * 0.2) * 0.15;
    }
    if (innerRef.current) {
      const scale = 1 + Math.sin(t * 2) * 0.06;
      innerRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={coreRef} position={[0, 0, 0]}>
      {/* Outer crystalline lattice sphere (small wireframe) */}
      <mesh>
        <icosahedronGeometry args={[0.38, 1]} />
        <meshStandardMaterial
          color="#192B42"
          emissive="#315BDB"
          emissiveIntensity={0.65}
          roughness={0.2}
          metalness={0.9}
          wireframe
        />
      </mesh>

      {/* Solid inner core emitting Fresh Mint glow */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.24, 24, 24]} />
        <meshStandardMaterial
          color="#2CBF9B"
          emissive="#2CBF9B"
          emissiveIntensity={1.1}
          roughness={0.15}
          metalness={0.3}
        />
      </mesh>

      {/* Point light positioned exactly at the core nexus */}
      <pointLight color="#315BDB" intensity={2.2} distance={6} decay={2} />
    </group>
  );
}

/**
 * BatonPulse: A luminous energy beacon that travels along Ribbon 1 from one end
 * to the other every few seconds, symbolizing the continuous relay of leadership and knowledge.
 */
function BatonPulse({ curve, duration = 4.0 }) {
  const pulseRef = useRef();
  const lightRef = useRef();

  useFrame(({ clock }) => {
    if (!pulseRef.current || !curve) return;
    const t = (clock.getElapsedTime() / duration) % 1;
    const pos = curve.getPointAt(t);
    pulseRef.current.position.copy(pos);
    if (lightRef.current) {
      lightRef.current.position.copy(pos);
    }
  });

  return (
    <>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.13, 20, 20]} />
        <meshStandardMaterial
          color="#315BDB"
          emissive="#315BDB"
          emissiveIntensity={2.5}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
      <pointLight ref={lightRef} color="#315BDB" intensity={2.0} distance={4} decay={2} />
    </>
  );
}

/**
 * OrbitingNodes: 5 tiny satellite spheres representing campus pillars:
 * People, Events, Projects, Documents, and an accent node in Coral (#FF886B).
 */
function OrbitingNodes() {
  const groupRef = useRef();

  const nodes = useMemo(
    () => [
      { radius: 1.7, speed: 0.45, yOffset: 0.25, color: '#315BDB', size: 0.07, label: 'People' },
      { radius: 1.9, speed: -0.35, yOffset: -0.3, color: '#2CBF9B', size: 0.08, label: 'Events' },
      { radius: 1.6, speed: 0.5, yOffset: 0.4, color: '#192B42', size: 0.065, label: 'Projects' },
      { radius: 1.85, speed: -0.4, yOffset: -0.15, color: '#2CBF9B', size: 0.07, label: 'Docs' },
      // Coral accent node (#FF886B)
      { radius: 2.1, speed: 0.3, yOffset: 0.1, color: '#FF886B', size: 0.09, label: 'Handover' },
    ],
    []
  );

  const meshesRef = useRef([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    nodes.forEach((node, i) => {
      const mesh = meshesRef.current[i];
      if (mesh) {
        const angle = t * node.speed + (i * Math.PI * 2) / nodes.length;
        mesh.position.x = Math.cos(angle) * node.radius;
        mesh.position.z = Math.sin(angle) * node.radius;
        mesh.position.y = node.yOffset + Math.sin(t * 0.8 + i) * 0.15;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <mesh
          key={node.label}
          ref={(el) => (meshesRef.current[i] = el)}
        >
          <sphereGeometry args={[node.size, 16, 16]} />
          <meshStandardMaterial
            color={node.color}
            emissive={node.color}
            emissiveIntensity={node.color === '#FF886B' ? 1.0 : 0.7}
            roughness={0.25}
            metalness={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * RelayRibbons: Two interlocking sculptural ribbons echoing the ClubRelay logo.
 * Sized 60-70% of previous dimensions to prevent clipping.
 * Ribbon 1: Electric Blue (#315BDB)
 * Ribbon 2: Fresh Mint (#2CBF9B)
 */
function RelayRibbons({ mousePosition, reducedMotion }) {
  const groupRef = useRef();

  // Procedural curves sized comfortably to fit inside canvas without clipping
  const { geometry1, geometry2, curve1 } = useMemo(() => {
    // Ribbon 1: Flowing loop with Electric Blue metallic finish
    const points1 = [];
    const count1 = 60;
    // Sized to ~65% of original (radius ~1.4 instead of 2.2)
    for (let i = 0; i <= count1; i++) {
      const theta = (i / count1) * Math.PI * 2;
      const x = Math.sin(theta) * 1.4 + Math.cos(theta * 2) * 0.22;
      const y = Math.cos(theta) * 1.1 + Math.sin(theta * 3) * 0.25;
      const z = Math.sin(theta * 2) * 0.75;
      points1.push(new THREE.Vector3(x, y, z));
    }
    const c1 = new THREE.CatmullRomCurve3(points1, true, 'centripetal');
    const geo1 = new THREE.TubeGeometry(c1, 90, 0.11, 16, true);

    // Ribbon 2: Interlocking counter-loop with Fresh Mint finish
    const points2 = [];
    const count2 = 60;
    for (let i = 0; i <= count2; i++) {
      const theta = (i / count2) * Math.PI * 2;
      const x = Math.cos(theta) * 1.3 + Math.sin(theta * 2) * 0.28;
      const y = Math.sin(theta) * 1.35 - Math.cos(theta * 3) * 0.2;
      const z = Math.cos(theta * 2) * 0.8;
      points2.push(new THREE.Vector3(x, y, z));
    }
    const c2 = new THREE.CatmullRomCurve3(points2, true, 'centripetal');
    const geo2 = new THREE.TubeGeometry(c2, 90, 0.10, 16, true);

    return { geometry1: geo1, geometry2: geo2, curve1: c1 };
  }, []);

  useFrame(() => {
    if (reducedMotion || !groupRef.current) return;

    // Mouse parallax: subtle 5 degree tilt (~0.087 rad)
    if (mousePosition) {
      const maxTilt = 0.087; // ~5 degrees
      const targetRotY = mousePosition.x * maxTilt;
      const targetRotX = -mousePosition.y * maxTilt;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotY,
        0.05
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotX,
        0.05
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* Float from drei for gentle natural levitation */}
      <Float
        speed={1.6}
        rotationIntensity={0.25}
        floatIntensity={0.4}
        floatingRange={[-0.08, 0.08]}
      >
        {/* Ribbon 1: Electric Blue */}
        <mesh geometry={geometry1}>
          <meshStandardMaterial
            color="#315BDB"
            emissive="#1F3EA8"
            emissiveIntensity={0.25}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Ribbon 2: Fresh Mint */}
        <mesh geometry={geometry2}>
          <meshStandardMaterial
            color="#2CBF9B"
            emissive="#1A705B"
            emissiveIntensity={0.2}
            metalness={0.75}
            roughness={0.25}
          />
        </mesh>

        {/* Luminous Core where ribbons cross */}
        <RelayCore />

        {/* Baton Pulse traveling along Ribbon 1 */}
        <BatonPulse curve={curve1} duration={4.2} />

        {/* 5 Tiny Orbiting Nodes */}
        <OrbitingNodes />
      </Float>
    </group>
  );
}

/**
 * SceneContent: Lighting setup for Clean Campus palette
 */
function SceneContent({ mousePosition, reducedMotion }) {
  return (
    <>
      <ambientLight intensity={1.2} />
      {/* Key Directional Light */}
      <directionalLight position={[5, 6, 6]} intensity={2.0} color="#FFFFFF" />
      {/* Fill Light with Fresh Mint tint */}
      <directionalLight position={[-6, -4, -4]} intensity={1.5} color="#2CBF9B" />
      {/* Subtle Accent Light with Electric Blue tint */}
      <directionalLight position={[0, -5, 4]} intensity={1.0} color="#315BDB" />

      {/* Main Relay Kinetic Composition */}
      <RelayRibbons mousePosition={mousePosition} reducedMotion={reducedMotion} />
    </>
  );
}

/**
 * RelayEngine3D: High-performance 3D Relay Engine with Float, mouse parallax,
 * and automatic off-screen pause. Sized 60-70% to never clip.
 */
export function RelayEngine3D() {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef(null);

  // Check WebGL availability safely
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  // Listen for reduced motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Pause rendering when scrolled off-screen
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

  // Track mouse coordinates normalized between -1 and 1
  const handlePointerMove = (e) => {
    if (!containerRef.current || reducedMotion) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    setMousePosition({ x, y });
  };

  if (!hasWebGL || reducedMotion) {
    return <HeroSceneFallback />;
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className="w-full h-full relative select-none"
      style={{ touchAction: 'none' }}
    >
      <Canvas
        camera={{ position: [0, 0, 4.6], fov: 42 }}
        dpr={[1, 1.5]}
        frameloop={isVisible ? 'always' : 'never'}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            setHasWebGL(false);
          });
        }}
      >
        <SceneContent mousePosition={mousePosition} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}

export default RelayEngine3D;
