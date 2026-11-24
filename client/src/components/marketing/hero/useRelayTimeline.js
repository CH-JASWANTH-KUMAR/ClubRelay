import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

/**
 * useRelayTimeline: Single GSAP master timeline driving the 8-second 3-beat story:
 * Beat 1 (0 to 2.5s): Scattered - loose drifting chips
 * Beat 2 (2.5 to 5.0s): Gathered - ribbons sweep through, chips pulled into core
 * Beat 3 (5.0 to 8.0s): Handed Over - 8-segment packet travels Outgoing -> Incoming Lead
 *
 * Drives a mutable state object read directly by R3F useFrame loops,
 * and updates reactive beatIndex for the caption UI.
 */
export function useRelayTimeline({ paused = false } = {}) {
  const containerRef = useRef(null);
  const [currentBeat, setCurrentBeat] = useState(0);

  // Shared mutable progress object read by 3D components in useFrame
  const progressRef = useRef({
    totalTime: 0,
    phase: 0, // 0 = Scattered, 1 = Gathered, 2 = Handed Over
    scatteredSpread: 1.0, // 1 = fully scattered, 0 = converged
    chipPull: 0, // 0 to 1 progress along ribbon curve
    coreGlow: 0.4, // pulse intensity of the core
    packetT: 0, // 0 to 1 position of packet from Outgoing to Incoming Lead
    packetActiveSegments: 0, // 0 to 8 illuminated segments
  });

  useGSAP(
    () => {
      const state = progressRef.current;

      const master = gsap.timeline({
        repeat: -1,
        paused,
        defaults: { ease: 'none' },
      });

      // BEAT 1: SCATTERED (0.0s to 2.5s)
      master.addLabel('scattered', 0);
      master.to(
        state,
        {
          phase: 0,
          scatteredSpread: 1.0,
          chipPull: 0,
          coreGlow: 0.35,
          packetT: 0,
          packetActiveSegments: 0,
          duration: 0.01,
          onStart: () => setCurrentBeat(0),
        },
        0
      );
      // Gentle floating drift during Beat 1
      master.to(
        state,
        {
          scatteredSpread: 0.95,
          duration: 2.49,
          ease: 'sine.inOut',
        },
        0.01
      );

      // BEAT 2: GATHERED (2.5s to 5.0s)
      master.addLabel('gathered', 2.5);
      master.to(
        state,
        {
          phase: 1,
          onStart: () => setCurrentBeat(1),
          duration: 0.01,
        },
        2.5
      );
      // Chips collapse and flow into the core along ribbon path
      master.to(
        state,
        {
          scatteredSpread: 0,
          chipPull: 1.0,
          coreGlow: 1.2,
          duration: 2.49,
          ease: 'power2.inOut',
        },
        2.51
      );

      // BEAT 3: HANDED OVER (5.0s to 8.0s)
      master.addLabel('handedOver', 5.0);
      master.to(
        state,
        {
          phase: 2,
          onStart: () => setCurrentBeat(2),
          duration: 0.01,
        },
        5.0
      );
      // Handover packet leaves core and travels from Outgoing to Incoming Lead
      master.to(
        state,
        {
          packetT: 1.0,
          coreGlow: 0.5,
          duration: 1.8,
          ease: 'power3.out',
        },
        5.01
      );
      // 8 segments illuminate sequentially as packet completes handover
      master.to(
        state,
        {
          packetActiveSegments: 8,
          duration: 1.1,
          ease: 'steps(8)',
        },
        5.8
      );
      // Settle and reset before loop
      master.to(
        state,
        {
          packetT: 0,
          chipPull: 0,
          packetActiveSegments: 0,
          duration: 0.1,
        },
        7.9
      );

      return () => {
        master.kill();
      };
    },
    { scope: containerRef, dependencies: [paused] }
  );

  return { containerRef, progressRef, currentBeat };
}
