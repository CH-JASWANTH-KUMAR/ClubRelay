import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

/**
 * CoreMesh: Small glowing icosahedron core.
 * Royal Blue and Cyan emissive solid with a slightly larger wireframe shell,
 * slow rotation, and a soft point light.
 */
function CoreMesh({ pulseIntensity = 1.0 }) {
  const groupRef = useRef();
  const innerRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.35;
      groupRef.current.rotation.x = Math.sin(t * 0.25) * 0.15;
    }
    if (innerRef.current) {
      const scale = 1 + Math.sin(t * 2.5) * 0.05 * pulseIntensity;
      innerRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer crystalline wireframe shell */}
      <mesh>
        <icosahedronGeometry args={[0.78, 1]} />
        <meshStandardMaterial
          color="#1D4ED8"
          emissive="#3B82F6"
          emissiveIntensity={0.7 * pulseIntensity}
          roughness={0.2}
          metalness={0.8}
          wireframe
        />
      </mesh>

      {/* Solid inner core in Royal Blue and Mint Glow */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color="#2563EB"
          emissive="#00D2B4"
          emissiveIntensity={1.3 * pulseIntensity}
          roughness={0.15}
          metalness={0.2}
        />
      </mesh>

      {/* Soft point light */}
      <pointLight color="#3B82F6" intensity={2.5 * pulseIntensity} distance={5} decay={2} />
    </group>
  );
}

/**
 * GlowingCoreCanvas: ONE small R3F canvas (about 200px square, transparent background)
 * centered at the nexus of the SVG ribbons.
 */
export function GlowingCoreCanvas({ className = '', pulseIntensity = 1.0 }) {
  return (
    <div className={`w-[200px] h-[200px] pointer-events-none select-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 4]} intensity={1.2} color="#FFFFFF" />
        <CoreMesh pulseIntensity={pulseIntensity} />
      </Canvas>
    </div>
  );
}

export default GlowingCoreCanvas;
