import React, { useRef, useEffect, useState } from 'react';

// Clearance parameters in SVG viewBox coordinates (100 x 100)
// Eye sockets: rx = 8, ry = 9; Pupil: r = 4.2; Stroke margin: 0.6
export const PUPIL_MAX_X = 8 - 4.2 - 0.6; // 3.2 SVG units
export const PUPIL_MAX_Y = 9 - 4.2 - 0.6; // 4.2 SVG units

/**
 * Computes an ellipse-aware clamped pupil offset in SVG viewBox coordinates.
 * Guaranteed: (x / PUPIL_MAX_X)^2 + (y / PUPIL_MAX_Y)^2 <= 1.
 */
export function computeClampedPupilOffset(deltaX, deltaY, reach = 180) {
  const distance = Math.hypot(deltaX, deltaY);
  if (distance === 0) return { x: 0, y: 0 };

  const angle = Math.atan2(deltaY, deltaX);
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  // Exact radius of clearance ellipse along ray at angle theta
  const rMax = (PUPIL_MAX_X * PUPIL_MAX_Y) / Math.sqrt((PUPIL_MAX_Y * cosA) ** 2 + (PUPIL_MAX_X * sinA) ** 2);
  const intensity = Math.min(1, distance / reach);
  const moveDist = intensity * rMax;

  const x = Number((cosA * moveDist).toFixed(3));
  const y = Number((sinA * moveDist).toFixed(3));

  return { x, y };
}

/**
 * RelayMascot — The official interactive character for ClubRelay.
 * Features:
 * - Geometric ellipse clamp in SVG viewBox coordinates (pupil never crosses aperture border)
 * - Resolution-independent scaling across all sizes (sm, md, lg, hero)
 * - Idle RAF loop management: halts animation frame when gaze settles (0% idle CPU)
 * - Smooth pointer entry/exit interpolation to neutral
 * - Glitch-free SVG clip-path blinking without unmounting pupil refs
 * - Clean event listener and timer cleanup on unmount or resize
 * - Respects prefers-reduced-motion and coarse touch devices
 */
export function RelayMascot({
  size = 'md',
  interactive = true,
  containerRef = null,
  mood = 'friendly',
  className = '',
}) {
  const mascotRef = useRef(null);
  const leftPupilRef = useRef(null);
  const rightPupilRef = useRef(null);
  const animFrameRef = useRef(null);
  const isAnimating = useRef(false);

  // Pupil animation state
  const pupilPos = useRef({
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
  });

  const [isBlinking, setIsBlinking] = useState(false);

  // Sizing map (width/height in CSS px; internal SVG units are 0..100)
  const sizeDimensions = {
    sm: { width: 44, height: 44 },
    md: { width: 72, height: 72 },
    lg: { width: 120, height: 120 },
    hero: { width: 220, height: 220 },
  };

  const currentSize = sizeDimensions[size] || sizeDimensions.md;

  // Periodic gentle blink with clean timer management
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    let timeoutId;
    let closeTimeoutId;

    const triggerBlink = () => {
      setIsBlinking(true);
      closeTimeoutId = setTimeout(() => {
        setIsBlinking(false);
        const nextInterval = 3500 + Math.random() * 2500;
        timeoutId = setTimeout(triggerBlink, nextInterval);
      }, 140);
    };

    timeoutId = setTimeout(triggerBlink, 2800);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(closeTimeoutId);
    };
  }, []);

  // Eye tracking loop with RAF idle settling and resize cleanup
  useEffect(() => {
    if (!interactive) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isCoarsePointer =
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches;

    if (prefersReducedMotion || isCoarsePointer) {
      return;
    }

    const boundary = (containerRef && containerRef.current) || mascotRef.current;
    if (!boundary) return;

    const updateDOM = (x, y) => {
      const tx = x.toFixed(2);
      const ty = y.toFixed(2);
      const transformStr = `translate(${tx}, ${ty})`;
      if (leftPupilRef.current) {
        leftPupilRef.current.setAttribute('transform', transformStr);
      }
      if (rightPupilRef.current) {
        rightPupilRef.current.setAttribute('transform', transformStr);
      }
    };

    const animatePupils = () => {
      const state = pupilPos.current;
      const lerpFactor = 0.16;

      state.currentX += (state.targetX - state.currentX) * lerpFactor;
      state.currentY += (state.targetY - state.currentY) * lerpFactor;

      const dx = Math.abs(state.targetX - state.currentX);
      const dy = Math.abs(state.targetY - state.currentY);

      if (dx < 0.005 && dy < 0.005) {
        state.currentX = state.targetX;
        state.currentY = state.targetY;
        updateDOM(state.currentX, state.currentY);
        isAnimating.current = false;
        return; // Halt RAF loop when settled
      }

      updateDOM(state.currentX, state.currentY);
      animFrameRef.current = requestAnimationFrame(animatePupils);
    };

    const startAnimationLoop = () => {
      if (isAnimating.current) return;
      isAnimating.current = true;
      animFrameRef.current = requestAnimationFrame(animatePupils);
    };

    const handlePointerMove = (e) => {
      if (!mascotRef.current) return;
      const rect = mascotRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      const clamped = computeClampedPupilOffset(deltaX, deltaY, 180);
      pupilPos.current.targetX = clamped.x;
      pupilPos.current.targetY = clamped.y;

      startAnimationLoop();
    };

    const handlePointerLeave = () => {
      pupilPos.current.targetX = 0;
      pupilPos.current.targetY = 0;
      startAnimationLoop();
    };

    boundary.addEventListener('pointermove', handlePointerMove, { passive: true });
    boundary.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    return () => {
      boundary.removeEventListener('pointermove', handlePointerMove);
      boundary.removeEventListener('pointerleave', handlePointerLeave);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      isAnimating.current = false;
    };
  }, [interactive, containerRef]);

  return (
    <div
      ref={mascotRef}
      className={`inline-flex items-center justify-center select-none flex-shrink-0 ${className}`}
      style={{ width: currentSize.width, height: currentSize.height }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-subtle"
        aria-hidden="true"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="relayBodyGrad" x1="20" y1="15" x2="80" y2="95" gradientUnits="userSpaceOnUse">
            <stop stopColor="#315BDB" />
            <stop offset="1" stopColor="#1F3EA8" />
          </linearGradient>

          <linearGradient id="relayEarGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#2CBF9B" />
            <stop offset="1" stopColor="#1F8A70" />
          </linearGradient>

          <linearGradient id="relayAntennaSpark" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#F6C85F" />
            <stop offset="1" stopColor="#E5B445" />
          </linearGradient>

          {/* Eye Socket Clipping for Seamless Blinking without unmounting pupil refs */}
          <clipPath id="relayLeftEyeClip">
            <ellipse
              cx="37"
              cy="44"
              rx="7.4"
              ry={isBlinking ? 1 : 8.4}
              style={{ transition: 'ry 0.12s ease-in-out' }}
            />
          </clipPath>
          <clipPath id="relayRightEyeClip">
            <ellipse
              cx="63"
              cy="44"
              rx="7.4"
              ry={isBlinking ? 1 : 8.4}
              style={{ transition: 'ry 0.12s ease-in-out' }}
            />
          </clipPath>
        </defs>

        {/* --- Antenna --- */}
        <path
          d="M50 18 L50 9"
          stroke="#192B42"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle
          cx="50"
          cy="7"
          r="4.5"
          fill="url(#relayAntennaSpark)"
          stroke="#192B42"
          strokeWidth="1.5"
        />

        {/* --- Side Ears / Relay Grips --- */}
        <rect
          x="10"
          y="42"
          width="7"
          height="22"
          rx="3.5"
          fill="url(#relayEarGrad)"
          stroke="#192B42"
          strokeWidth="2"
        />
        <rect
          x="83"
          y="42"
          width="7"
          height="22"
          rx="3.5"
          fill="url(#relayEarGrad)"
          stroke="#192B42"
          strokeWidth="2"
        />

        {/* --- Main Capsule Body --- */}
        <rect
          x="15"
          y="18"
          width="70"
          height="72"
          rx="24"
          fill="url(#relayBodyGrad)"
          stroke="#192B42"
          strokeWidth="2.5"
        />

        {/* Top subtle highlight shimmer */}
        <path
          d="M26 24 C36 21, 64 21, 74 24"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.35"
        />

        {/* --- Face Visor Plate --- */}
        <rect
          x="22"
          y="28"
          width="56"
          height="38"
          rx="15"
          fill="#FFFFFF"
          stroke="#192B42"
          strokeWidth="2"
        />

        {/* --- Left Eye Socket --- */}
        <g id="relay-left-eye">
          <ellipse
            cx="37"
            cy="44"
            rx="8"
            ry={isBlinking ? 1.5 : 9}
            fill="#F7F8F4"
            stroke="#192B42"
            strokeWidth="1.5"
            style={{ transition: 'ry 0.12s ease-in-out' }}
          />
          {/* Pupil: permanently mounted, clipped by eye socket lid */}
          <g
            ref={leftPupilRef}
            clipPath="url(#relayLeftEyeClip)"
            style={{ willChange: 'transform' }}
          >
            <circle cx="37" cy="44" r="4.2" fill="#192B42" />
            <circle cx="35.5" cy="42" r="1.4" fill="#FFFFFF" />
          </g>
        </g>

        {/* --- Right Eye Socket --- */}
        <g id="relay-right-eye">
          <ellipse
            cx="63"
            cy="44"
            rx="8"
            ry={isBlinking ? 1.5 : 9}
            fill="#F7F8F4"
            stroke="#192B42"
            strokeWidth="1.5"
            style={{ transition: 'ry 0.12s ease-in-out' }}
          />
          {/* Pupil: permanently mounted, clipped by eye socket lid */}
          <g
            ref={rightPupilRef}
            clipPath="url(#relayRightEyeClip)"
            style={{ willChange: 'transform' }}
          >
            <circle cx="63" cy="44" r="4.2" fill="#192B42" />
            <circle cx="61.5" cy="42" r="1.4" fill="#FFFFFF" />
          </g>
        </g>

        {/* --- Blush Cheeks --- */}
        <circle cx="28" cy="53" r="3" fill="#FF886B" fillOpacity="0.8" />
        <circle cx="72" cy="53" r="3" fill="#FF886B" fillOpacity="0.8" />

        {/* --- Mouth --- */}
        <path
          d={
            mood === 'celebrate'
              ? 'M44 54 Q50 62 56 54 Z'
              : 'M45 54 Q50 59 55 54'
          }
          fill={mood === 'celebrate' ? '#192B42' : 'none'}
          stroke="#192B42"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* --- Chest Emblem: Momentum Relay Core --- */}
        <g transform="translate(42, 72)">
          <rect
            x="0"
            y="0"
            width="16"
            height="10"
            rx="5"
            fill="#2CBF9B"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
          <circle cx="8" cy="5" r="2.5" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );
}

export default RelayMascot;
