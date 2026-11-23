import React, { useRef, useEffect, useState } from 'react';

/**
 * RelayMascot — The official interactive character for ClubRelay.
 * Features:
 * - Scoped pointer tracking (never global, strictly within bounding container)
 * - Smooth linear interpolation (lerp) via requestAnimationFrame
 * - Bounded pupil movement inside eye sockets
 * - Gentle periodic blink
 * - Respects prefers-reduced-motion and coarse touch devices
 * - Zero layout thrashing, clean unmount cleanup
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

  // Pupil animation state (ref-based to prevent React re-renders)
  const pupilPos = useRef({
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
  });

  const [isBlinking, setIsBlinking] = useState(false);

  // Sizing map
  const sizeDimensions = {
    sm: { width: 44, height: 44, pupilMax: 2.5 },
    md: { width: 72, height: 72, pupilMax: 4.5 },
    lg: { width: 120, height: 120, pupilMax: 7 },
    hero: { width: 220, height: 220, pupilMax: 12 },
  };

  const currentSize = sizeDimensions[size] || sizeDimensions.md;
  const pupilMax = currentSize.pupilMax;

  // Periodic gentle blink
  useEffect(() => {
    // Check reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    let timeoutId;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
        // Next blink after 3.5 to 6 seconds
        const nextInterval = 3500 + Math.random() * 2500;
        timeoutId = setTimeout(triggerBlink, nextInterval);
      }, 160);
    };

    timeoutId = setTimeout(triggerBlink, 3000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // Eye tracking loop
  useEffect(() => {
    if (!interactive) return;

    // Check device capabilities and user preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isCoarsePointer =
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches;

    if (prefersReducedMotion || isCoarsePointer) {
      return;
    }

    // Determine tracking boundary container: passed containerRef or the mascot's own element
    const boundary = (containerRef && containerRef.current) || mascotRef.current;
    if (!boundary) return;

    const handlePointerMove = (e) => {
      if (!mascotRef.current) return;
      const rect = mascotRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance === 0) {
        pupilPos.current.targetX = 0;
        pupilPos.current.targetY = 0;
        return;
      }

      // Smooth distance damping factor
      const angle = Math.atan2(deltaY, deltaX);
      const intensity = Math.min(1, distance / 180);
      const moveDistance = pupilMax * intensity;

      pupilPos.current.targetX = Math.cos(angle) * moveDistance;
      pupilPos.current.targetY = Math.sin(angle) * moveDistance;
    };

    const handlePointerLeave = () => {
      // Return gaze gently to center
      pupilPos.current.targetX = 0;
      pupilPos.current.targetY = 0;
    };

    // Animation frame loop for buttery smooth interpolation (lerp)
    const animatePupils = () => {
      const state = pupilPos.current;
      const lerpFactor = 0.14; // smooth easing

      state.currentX += (state.targetX - state.currentX) * lerpFactor;
      state.currentY += (state.targetY - state.currentY) * lerpFactor;

      const tx = state.currentX.toFixed(2);
      const ty = state.currentY.toFixed(2);

      if (leftPupilRef.current) {
        leftPupilRef.current.style.transform = `translate(${tx}px, ${ty}px)`;
      }
      if (rightPupilRef.current) {
        rightPupilRef.current.style.transform = `translate(${tx}px, ${ty}px)`;
      }

      animFrameRef.current = requestAnimationFrame(animatePupils);
    };

    boundary.addEventListener('pointermove', handlePointerMove, { passive: true });
    boundary.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    animFrameRef.current = requestAnimationFrame(animatePupils);

    return () => {
      boundary.removeEventListener('pointermove', handlePointerMove);
      boundary.removeEventListener('pointerleave', handlePointerLeave);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [interactive, containerRef, pupilMax]);

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

          <filter id="relayGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
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
        {/* Left ear */}
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
        {/* Right ear */}
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
            ry={isBlinking ? 1 : 9}
            fill="#F7F8F4"
            stroke="#192B42"
            strokeWidth="1.5"
            style={{ transition: 'ry 0.1s ease-in-out' }}
          />
          {/* Pupil */}
          {!isBlinking && (
            <g
              ref={leftPupilRef}
              style={{
                transformOrigin: '37px 44px',
                willChange: 'transform',
              }}
            >
              <circle cx="37" cy="44" r="4.2" fill="#192B42" />
              {/* Eye Catchlight (White shine) */}
              <circle cx="35.5" cy="42" r="1.4" fill="#FFFFFF" />
            </g>
          )}
        </g>

        {/* --- Right Eye Socket --- */}
        <g id="relay-right-eye">
          <ellipse
            cx="63"
            cy="44"
            rx="8"
            ry={isBlinking ? 1 : 9}
            fill="#F7F8F4"
            stroke="#192B42"
            strokeWidth="1.5"
            style={{ transition: 'ry 0.1s ease-in-out' }}
          />
          {/* Pupil */}
          {!isBlinking && (
            <g
              ref={rightPupilRef}
              style={{
                transformOrigin: '63px 44px',
                willChange: 'transform',
              }}
            >
              <circle cx="63" cy="44" r="4.2" fill="#192B42" />
              {/* Eye Catchlight (White shine) */}
              <circle cx="61.5" cy="42" r="1.4" fill="#FFFFFF" />
            </g>
          )}
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
          {/* Mini pulse ring */}
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
          {/* Inner spark */}
          <circle cx="8" cy="5" r="2.5" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );
}

export default RelayMascot;
