import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * RelayCore: Glowing central icosahedron core positioned at the ribbon intersection.
 * Emissive glow intensifies dynamically during Beat 2 (Gathered) and Beat 3.
 */
export function RelayCore({ progressRef }) {
  const coreRef = useRef();
  const innerRef = useRef();
  const lightRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const glow = progressRef?.current?.coreGlow ?? 0.4;

    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.3;
      coreRef.current.rotation.x = Math.sin(t * 0.25) * 0.15;
    }
    if (innerRef.current) {
      const pulseScale = 1 + Math.sin(t * 2.5) * 0.05 * (glow > 0.8 ? 1.8 : 1.0);
      innerRef.current.scale.set(pulseScale, pulseScale, pulseScale);
      innerRef.current.material.emissiveIntensity = glow * 1.4;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1.6 + glow * 1.5;
    }
  });

  return (
    <group ref={coreRef} position={[0, 0, 0]}>
      {/* Outer crystalline lattice sphere */}
      <mesh>
        <icosahedronGeometry args={[0.34, 1]} />
        <meshStandardMaterial
          color="#192B42"
          emissive="#315BDB"
          emissiveIntensity={0.7}
          roughness={0.2}
          metalness={0.9}
          wireframe
        />
      </mesh>

      {/* Solid inner core emitting Fresh Mint / Lime aura */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial
          color="#2CBF9B"
          emissive="#2CBF9B"
          emissiveIntensity={0.9}
          roughness={0.15}
          metalness={0.3}
        />
      </mesh>

      {/* Nexus point light */}
      <pointLight ref={lightRef} color="#315BDB" intensity={2.0} distance={6} decay={2} />
    </group>
  );
}

export default RelayCore;
