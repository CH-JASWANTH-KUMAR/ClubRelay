import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CHIP_ITEMS } from './heroConfig';

/**
 * Helper to generate high-resolution canvas text textures for knowledge chips.
 */
function createChipTexture(label, isAccent) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 76;
  const ctx = canvas.getContext('2d');

  // Background rounded rectangle
  const r = 16;
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Background fill & border
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.quadraticCurveTo(w, 0, w, r);
  ctx.lineTo(w, h - r);
  ctx.quadraticCurveTo(w, h, w - r, h);
  ctx.lineTo(r, h);
  ctx.quadraticCurveTo(0, h, 0, h - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();

  ctx.fillStyle = isAccent ? '#FF886B' : '#FFFFFF';
  ctx.fill();

  ctx.lineWidth = 4;
  ctx.strokeStyle = isAccent ? '#D95E41' : '#E5E9E8';
  ctx.stroke();

  // Subtle left badge dot
  ctx.beginPath();
  ctx.arc(28, h / 2, 6, 0, Math.PI * 2);
  ctx.fillStyle = isAccent ? '#FFFFFF' : '#315BDB';
  ctx.fill();

  // Typography
  ctx.font = 'bold 26px "Space Grotesk", -apple-system, sans-serif';
  ctx.fillStyle = isAccent ? '#FFFFFF' : '#192B42';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 48, h / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

/**
 * KnowledgeChips: 6 floating knowledge artifacts that:
 * Beat 1 (Scattered): Drift, tilted and unaligned, in 3D space
 * Beat 2 (Gathered): Flow along the ribbon curve into the core, aligning themselves
 * Beat 3 (Handed Over): Concealed inside the core as the Handover Packet travels
 */
export function KnowledgeChips({ ribbonCurveRef, progressRef }) {
  const groupRef = useRef();

  // Initial scattered layout positions around the scene
  const chipsConfig = useMemo(() => {
    const scatteredOffsets = [
      { x: -1.8, y: 1.1, z: 0.6, rotZ: 0.22, rotX: 0.15, ribbonOffset: 0.1 },
      { x: 1.9, y: 1.0, z: -0.5, rotZ: -0.18, rotX: -0.12, ribbonOffset: 0.25 },
      { x: -1.7, y: -0.9, z: -0.4, rotZ: -0.25, rotX: 0.18, ribbonOffset: 0.42 },
      { x: 1.6, y: -0.9, z: 0.7, rotZ: 0.28, rotX: -0.2, ribbonOffset: 0.6 }, // Old email (Coral)
      { x: -0.4, y: 1.45, z: -0.6, rotZ: 0.12, rotX: 0.1, ribbonOffset: 0.75 },
      { x: 0.3, y: -1.45, z: 0.5, rotZ: -0.15, rotX: -0.14, ribbonOffset: 0.9 },
    ];

    return CHIP_ITEMS.map((item, idx) => ({
      ...item,
      scattered: scatteredOffsets[idx],
      texture: createChipTexture(item.label, item.isAccent),
    }));
  }, []);

  const meshRefs = useRef([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const curve = ribbonCurveRef?.current;
    const { phase, scatteredSpread, chipPull } = progressRef?.current || {
      phase: 0,
      scatteredSpread: 1,
      chipPull: 0,
    };

    chipsConfig.forEach((chip, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;

      if (phase === 0) {
        // Beat 1: Scattered drifting
        const s = chip.scattered;
        const driftX = Math.sin(t * 0.8 + i) * 0.08 * scatteredSpread;
        const driftY = Math.cos(t * 0.7 + i) * 0.08 * scatteredSpread;
        mesh.position.set(
          s.x * scatteredSpread + driftX,
          s.y * scatteredSpread + driftY,
          s.z * scatteredSpread
        );
        mesh.rotation.z = s.rotZ + Math.sin(t * 0.5 + i) * 0.05;
        mesh.rotation.x = s.rotX + Math.cos(t * 0.6 + i) * 0.05;
        mesh.rotation.y = Math.sin(t * 0.4 + i) * 0.1;
        mesh.scale.set(1, 1, 1);
        mesh.visible = true;
      } else if (phase === 1 && curve) {
        // Beat 2: Pulled along the ribbon curve toward the core
        // progress t from chip's offset moving into the center
        const curveT = (chip.scattered.ribbonOffset + chipPull) % 1;
        const curvePos = curve.getPointAt(curveT);

        // Lerp from scattered position to curve position
        mesh.position.lerp(curvePos, 0.25);

        // Gradually straighten alignment as chip enters core
        mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, 0, 0.1);
        mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, 0, 0.1);
        mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, 0, 0.1);

        // Scale down slightly as it is absorbed into the glowing core
        const scale = THREE.MathUtils.clamp(1.0 - chipPull * 0.6, 0.2, 1.0);
        mesh.scale.set(scale, scale, scale);
        mesh.visible = true;
      } else {
        // Beat 3: Handed Over (tucked into core while Handover Packet travels)
        mesh.visible = false;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {chipsConfig.map((chip, idx) => (
        <mesh
          key={chip.id}
          ref={(el) => (meshRefs.current[idx] = el)}
        >
          <planeGeometry args={[0.72, 0.22]} />
          <meshBasicMaterial
            map={chip.texture}
            transparent
            opacity={0.96}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

export default KnowledgeChips;
