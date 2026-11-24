import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * RelayRibbons: Two interlocking tube ribbons (TubeGeometry along CatmullRomCurve3)
 * echoing the ClubRelay brand mark and serving as the gathering track in Beat 2.
 */
export function RelayRibbons({ ribbonCurveRef }) {
  const groupRef = useRef();

  const { geo1, geo2, curve1 } = useMemo(() => {
    // Ribbon 1: Electric Blue loop with gentle vertical twist
    const points1 = [];
    const count1 = 60;
    for (let i = 0; i <= count1; i++) {
      const theta = (i / count1) * Math.PI * 2;
      const x = Math.sin(theta) * 1.5 + Math.cos(theta * 2) * 0.25;
      const y = Math.cos(theta) * 1.15 + Math.sin(theta * 3) * 0.22;
      const z = Math.sin(theta * 2) * 0.7;
      points1.push(new THREE.Vector3(x, y, z));
    }
    const c1 = new THREE.CatmullRomCurve3(points1, true, 'centripetal');
    const g1 = new THREE.TubeGeometry(c1, 90, 0.09, 16, true);

    // Ribbon 2: Fresh Mint counter-loop interlocking through Ribbon 1
    const points2 = [];
    const count2 = 60;
    for (let i = 0; i <= count2; i++) {
      const theta = (i / count2) * Math.PI * 2;
      const x = Math.cos(theta) * 1.4 + Math.sin(theta * 2) * 0.26;
      const y = Math.sin(theta) * 1.3 - Math.cos(theta * 3) * 0.18;
      const z = Math.cos(theta * 2) * 0.75;
      points2.push(new THREE.Vector3(x, y, z));
    }
    const c2 = new THREE.CatmullRomCurve3(points2, true, 'centripetal');
    const g2 = new THREE.TubeGeometry(c2, 90, 0.08, 16, true);

    return { geo1: g1, geo2: g2, curve1: c1 };
  }, []);

  // Expose curve1 so KnowledgeChips can follow the track
  if (ribbonCurveRef) {
    ribbonCurveRef.current = curve1;
  }

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.15;
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Ribbon 1: Electric Blue */}
      <mesh geometry={geo1}>
        <meshStandardMaterial
          color="#315BDB"
          emissive="#1F3EA8"
          emissiveIntensity={0.25}
          roughness={0.25}
          metalness={0.8}
        />
      </mesh>

      {/* Ribbon 2: Fresh Mint */}
      <mesh geometry={geo2}>
        <meshStandardMaterial
          color="#2CBF9B"
          emissive="#1A705B"
          emissiveIntensity={0.2}
          roughness={0.25}
          metalness={0.75}
        />
      </mesh>
    </group>
  );
}

export default RelayRibbons;
