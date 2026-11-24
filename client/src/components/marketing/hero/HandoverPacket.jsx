import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HANDOVER_SECTIONS } from './heroConfig';

/**
 * HandoverPacket: Ring of 8 aligned segments (the Handover Packet) that emerges
 * from the core in Beat 3, traveling from Outgoing Lead node to Incoming Lead node.
 * Segments illuminate in Fresh Mint & Electric Blue as the handover completes.
 */
export function HandoverPacket({ progressRef }) {
  const packetGroupRef = useRef();
  const segmentRefs = useRef([]);

  // 8 segments distributed around a circular ring packet
  const segments = useMemo(() => {
    const count = 8;
    const radius = 0.38;
    return HANDOVER_SECTIONS.map((name, i) => {
      const angle = (i / count) * Math.PI * 2;
      return {
        name,
        angle,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      };
    });
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const { phase, packetT, packetActiveSegments } = progressRef?.current || {
      phase: 0,
      packetT: 0,
      packetActiveSegments: 0,
    };

    if (!packetGroupRef.current) return;

    if (phase === 2) {
      packetGroupRef.current.visible = true;

      // Travels along X axis from Outgoing Lead (-1.4) to Incoming Lead (+1.4)
      const startX = -1.35;
      const endX = 1.35;
      const currentX = THREE.MathUtils.lerp(startX, endX, packetT);
      const arcY = Math.sin(packetT * Math.PI) * 0.45; // Gentle upward arc

      packetGroupRef.current.position.set(currentX, arcY, 0.3);
      packetGroupRef.current.rotation.z = t * 0.4;

      // Illuminate segments sequentially
      segments.forEach((seg, i) => {
        const mesh = segmentRefs.current[i];
        if (mesh) {
          const isLit = i < packetActiveSegments;
          mesh.material.color.set(isLit ? '#2CBF9B' : '#192B42');
          mesh.material.emissive.set(isLit ? '#315BDB' : '#192B42');
          mesh.material.emissiveIntensity = isLit ? 1.5 : 0.2;
        }
      });
    } else {
      packetGroupRef.current.visible = false;
    }
  });

  return (
    <>
      {/* Fixed Outgoing Lead terminal station on the left */}
      <group position={[-1.35, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial
            color="#192B42"
            emissive="#315BDB"
            emissiveIntensity={0.6}
            roughness={0.2}
          />
        </mesh>
        <pointLight color="#315BDB" intensity={0.6} distance={2} />
      </group>

      {/* Fixed Incoming Lead terminal station on the right */}
      <group position={[1.35, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial
            color="#2CBF9B"
            emissive="#2CBF9B"
            emissiveIntensity={0.9}
            roughness={0.2}
          />
        </mesh>
        <pointLight color="#2CBF9B" intensity={1.2} distance={2} />
      </group>

      {/* Traveling Handover Packet */}
      <group ref={packetGroupRef}>
        {/* Central sealed core disc */}
        <mesh>
          <cylinderGeometry args={[0.22, 0.22, 0.05, 32]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#315BDB"
            emissiveIntensity={0.4}
            metalness={0.6}
            roughness={0.2}
          />
        </mesh>

        {/* Ring of 8 aligned handover section segments */}
        {segments.map((seg, i) => (
          <mesh
            key={seg.name}
            ref={(el) => (segmentRefs.current[i] = el)}
            position={[seg.x, seg.y, 0]}
            rotation={[0, 0, seg.angle]}
          >
            <boxGeometry args={[0.12, 0.06, 0.04]} />
            <meshStandardMaterial
              color="#192B42"
              emissive="#315BDB"
              emissiveIntensity={0.2}
              roughness={0.2}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}

export default HandoverPacket;
