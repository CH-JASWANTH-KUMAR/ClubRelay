import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { RelayRibbons } from './RelayRibbons';
import { RelayCore } from './RelayCore';
import { KnowledgeChips } from './KnowledgeChips';
import { HandoverPacket } from './HandoverPacket';
import { HeroFallback } from './HeroFallback';

/**
 * SceneContent: Encapsulates parallax tilt, lights, and the 3-beat visual elements.
 */
function SceneContent({ mousePosition, progressRef }) {
  const sceneGroupRef = useRef();
  const ribbonCurveRef = useRef(null);

  useFrame(() => {
    if (!sceneGroupRef.current || !mousePosition) return;
    // Max 5 degrees (~0.087 rad) mouse parallax tilt
    const maxTilt = 0.087;
    const targetRotY = mousePosition.x * maxTilt;
    const targetRotX = -mousePosition.y * maxTilt;
    sceneGroupRef.current.rotation.y = THREE.MathUtils.lerp(
      sceneGroupRef.current.rotation.y,
      targetRotY,
      0.05
    );
    sceneGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      sceneGroupRef.current.rotation.x,
      targetRotX,
      0.05
    );
  });

  return (
    <>
      <ambientLight intensity={1.3} />
      <directionalLight position={[5, 6, 6]} intensity={1.8} color="#FFFFFF" />
      <directionalLight position={[-6, -4, -4]} intensity={1.4} color="#2CBF9B" />
      <directionalLight position={[0, -5, 4]} intensity={1.1} color="#315BDB" />

      <group ref={sceneGroupRef}>
        <Float
          speed={1.5}
          rotationIntensity={0.2}
          floatIntensity={0.35}
          floatingRange={[-0.07, 0.07]}
        >
          {/* Two Interlocking Ribbon Tracks */}
          <RelayRibbons ribbonCurveRef={ribbonCurveRef} />

          {/* Glowing Nexus Core */}
          <RelayCore progressRef={progressRef} />

          {/* Floating Knowledge Chips that converge in Beat 2 */}
          <KnowledgeChips ribbonCurveRef={ribbonCurveRef} progressRef={progressRef} />

          {/* Handover Packet that travels in Beat 3 */}
          <HandoverPacket progressRef={progressRef} />
        </Float>
      </group>
    </>
  );
}

/**
 * RelayScene: R3F Canvas scene with dpr={[1, 1.5]}, mouse parallax,
 * and automatic off-screen pause via IntersectionObserver.
 */
export function RelayScene({ progressRef }) {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Check WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  // Listen to prefers-reduced-motion
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

  // Mouse parallax handler
  const handlePointerMove = (e) => {
    if (!containerRef.current || reducedMotion) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    setMousePosition({ x, y });
  };

  if (!hasWebGL || reducedMotion) {
    return <HeroFallback />;
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className="w-full h-full relative select-none"
      style={{ touchAction: 'none' }}
    >
      <Canvas
        camera={{ position: [0, 0, 4.4], fov: 42 }}
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
        <SceneContent mousePosition={mousePosition} progressRef={progressRef} />
      </Canvas>
    </div>
  );
}

export default RelayScene;
