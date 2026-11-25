import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

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

  const rMax =
    (PUPIL_MAX_X * PUPIL_MAX_Y) /
    Math.sqrt((PUPIL_MAX_Y * cosA) ** 2 + (PUPIL_MAX_X * sinA) ** 2);
  const intensity = Math.min(1, distance / reach);
  const moveDist = intensity * rMax;

  const x = Number((cosA * moveDist).toFixed(3));
  const y = Number((sinA * moveDist).toFixed(3));

  return { x, y };
}

/**
 * RelayMascot: Interactive character for ClubRelay.
 * Supports viewport or container eye tracking via gsap.quickTo, form field poses
 * (idle, focus-text, password, peek), moods (friendly, error, celebrate),
 * optional idle bob & antenna pulse, coarse pointer fallback, and prefers-reduced-motion.
 */
export function RelayMascot({
  size = 'md',
  interactive = true,
  trackViewport = false,
  idleFloat = false,
  containerRef = null,
  mood = 'friendly',
  pose = 'idle',
  className = '',
}) {
  const mascotRef = useRef(null);
  const bobWrapperRef = useRef(null);
  const svgRef = useRef(null);
  const antennaGlowRef = useRef(null);
  const leftPupilRef = useRef(null);
  const rightPupilRef = useRef(null);
  const leftHandRef = useRef(null);
  const rightHandRef = useRef(null);
  const quickTrackRef = useRef(null);

  const [isBlinking, setIsBlinking] = useState(false);

  const sizeDimensions = {
    sm: { width: 44, height: 44 },
    md: { width: 72, height: 72 },
    mobile: { width: 96, height: 96 },
    lg: { width: 120, height: 120 },
    hero: { width: 220, height: 220 },
    stage: { width: 340, height: 340 },
  };

  const currentSize =
    typeof size === 'number'
      ? { width: size, height: size }
      : sizeDimensions[size] || sizeDimensions.md;

  // Periodic random blink every 3 to 6 seconds when eyes are uncovered
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    if (prefersReducedMotion || pose === 'password' || mood === 'celebrate') {
      setIsBlinking(false);
      return;
    }

    let timeoutId;
    let closeTimeoutId;

    const scheduleNextBlink = () => {
      const nextInterval = 3000 + Math.random() * 3000;
      timeoutId = setTimeout(() => {
        setIsBlinking(true);
        closeTimeoutId = setTimeout(() => {
          setIsBlinking(false);
          scheduleNextBlink();
        }, 140);
      }, nextInterval);
    };

    scheduleNextBlink();

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(closeTimeoutId);
    };
  }, [pose, mood]);

  // Idle vertical bob (6px, 4s full cycle) & antenna light pulse
  useEffect(() => {
    if (!idleFloat) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const isCoarsePointer =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(pointer: coarse)')?.matches;

    if (prefersReducedMotion || isCoarsePointer) return;

    const ctx = gsap.context(() => {
      if (bobWrapperRef.current) {
        gsap.to(bobWrapperRef.current, {
          y: -6,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }
      if (antennaGlowRef.current) {
        gsap.to(antennaGlowRef.current, {
          scale: 1.45,
          opacity: 0.15,
          svgOrigin: '50 7',
          duration: 1.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }
    }, mascotRef);

    return () => ctx.revert();
  }, [idleFloat]);

  // Cursor eye tracking with gsap.quickTo (clamped inside eye aperture)
  useEffect(() => {
    if (!interactive) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    const isCoarsePointer =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(pointer: coarse)')?.matches;

    if (!leftPupilRef.current || !rightPupilRef.current) return;

    const ctx = gsap.context(() => {
      const duration = prefersReducedMotion ? 0 : 0.22;
      const lx = gsap.quickTo(leftPupilRef.current, 'x', { duration, ease: 'power3.out' });
      const ly = gsap.quickTo(leftPupilRef.current, 'y', { duration, ease: 'power3.out' });
      const rx = gsap.quickTo(rightPupilRef.current, 'x', { duration, ease: 'power3.out' });
      const ry = gsap.quickTo(rightPupilRef.current, 'y', { duration, ease: 'power3.out' });
      quickTrackRef.current = { lx, ly, rx, ry };
    }, mascotRef);

    if (prefersReducedMotion || isCoarsePointer) {
      return () => {
        quickTrackRef.current = null;
        ctx.revert();
      };
    }

    const boundary = trackViewport
      ? window
      : (containerRef && containerRef.current) || mascotRef.current;

    if (!boundary) {
      return () => {
        quickTrackRef.current = null;
        ctx.revert();
      };
    }

    const reach = trackViewport ? 420 : 180;

    const handlePointerMove = (e) => {
      if (pose !== 'idle' || !mascotRef.current || !quickTrackRef.current) return;

      const rect = mascotRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      const clamped = computeClampedPupilOffset(deltaX, deltaY, reach);
      quickTrackRef.current.lx(clamped.x);
      quickTrackRef.current.ly(clamped.y);
      quickTrackRef.current.rx(clamped.x);
      quickTrackRef.current.ry(clamped.y);
    };

    const handlePointerLeave = () => {
      if (pose !== 'idle' || !quickTrackRef.current) return;
      quickTrackRef.current.lx(0);
      quickTrackRef.current.ly(0);
      quickTrackRef.current.rx(0);
      quickTrackRef.current.ry(0);
    };

    boundary.addEventListener('pointermove', handlePointerMove, { passive: true });
    if (!trackViewport) {
      boundary.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    } else {
      document.addEventListener('mouseleave', handlePointerLeave, { passive: true });
    }

    return () => {
      boundary.removeEventListener('pointermove', handlePointerMove);
      if (!trackViewport) {
        boundary.removeEventListener('pointerleave', handlePointerLeave);
      } else {
        document.removeEventListener('mouseleave', handlePointerLeave);
      }
      quickTrackRef.current = null;
      ctx.revert();
    };
  }, [interactive, trackViewport, containerRef, pose]);

  // Pose-driven pupil & hand cover animations
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    const animDur = prefersReducedMotion ? 0 : 0.24;

    if (leftPupilRef.current && rightPupilRef.current) {
      if (pose === 'focus-text') {
        gsap.to([leftPupilRef.current, rightPupilRef.current], {
          x: -1.1,
          y: Number((PUPIL_MAX_Y * 0.72).toFixed(2)),
          duration: animDur,
          ease: 'power2.out',
        });
      } else if (pose === 'peek') {
        gsap.to([leftPupilRef.current, rightPupilRef.current], {
          x: 1.0,
          y: 1.6,
          duration: animDur,
          ease: 'power2.out',
        });
      } else if (pose === 'idle') {
        gsap.to([leftPupilRef.current, rightPupilRef.current], {
          x: 0,
          y: 0,
          duration: animDur,
          ease: 'power2.out',
        });
      }
    }

    if (leftHandRef.current && rightHandRef.current) {
      if (pose === 'password') {
        gsap.to(leftHandRef.current, {
          y: -31,
          x: 3,
          opacity: 1,
          duration: animDur,
          ease: 'power3.out',
        });
        gsap.to(rightHandRef.current, {
          y: -31,
          x: -3,
          opacity: 1,
          duration: animDur,
          ease: 'power3.out',
        });
      } else if (pose === 'peek') {
        gsap.to(leftHandRef.current, {
          y: -26,
          x: 2,
          opacity: 1,
          duration: animDur,
          ease: 'power3.out',
        });
        gsap.to(rightHandRef.current, {
          y: -14,
          x: -1,
          opacity: 1,
          duration: animDur,
          ease: 'power3.out',
        });
      } else {
        gsap.to([leftHandRef.current, rightHandRef.current], {
          y: 0,
          x: 0,
          opacity: 0,
          duration: animDur,
          ease: 'power2.in',
        });
      }
    }
  }, [pose]);

  // Mood-driven reaction (shake on error, bounce on celebrate)
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    if (!svgRef.current || prefersReducedMotion) return;

    if (mood === 'error') {
      const tl = gsap.timeline();
      tl.to(svgRef.current, { x: -5, duration: 0.06, ease: 'power1.inOut' })
        .to(svgRef.current, { x: 5, duration: 0.07, ease: 'power1.inOut' })
        .to(svgRef.current, { x: -3, duration: 0.06, ease: 'power1.inOut' })
        .to(svgRef.current, { x: 0, duration: 0.08, ease: 'power1.out' });
      return () => tl.kill();
    }

    if (mood === 'celebrate') {
      const tl = gsap.timeline();
      tl.to(svgRef.current, { y: -5, duration: 0.16, ease: 'power2.out' }).to(svgRef.current, {
        y: 0,
        duration: 0.22,
        ease: 'bounce.out',
      });
      return () => tl.kill();
    }
  }, [mood]);

  const showHappyEyes = mood === 'celebrate' && pose !== 'password';

  return (
    <div
      ref={mascotRef}
      data-testid="relay-mascot"
      data-pose={pose}
      data-mood={mood}
      className={`inline-flex items-center justify-center select-none flex-shrink-0 ${className}`}
      style={{ width: currentSize.width, height: currentSize.height }}
      aria-hidden="true"
    >
      <div ref={bobWrapperRef} className="w-full h-full">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-subtle overflow-visible"
          aria-hidden="true"
        >
          <defs>
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

          {/* Antenna + Pulse Halo */}
          <path d="M50 18 L50 9" stroke="#192B42" strokeWidth="3" strokeLinecap="round" />
          <circle
            ref={antennaGlowRef}
            cx="50"
            cy="7"
            r="6.5"
            fill="#F6C85F"
            opacity="0.35"
          />
          <circle
            cx="50"
            cy="7"
            r="4.5"
            fill="url(#relayAntennaSpark)"
            stroke="#192B42"
            strokeWidth="1.5"
          />

          {/* Side Ears */}
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

          {/* Main Capsule Body */}
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

          <path
            d="M26 24 C36 21, 64 21, 74 24"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.35"
          />

          {/* Face Visor Plate */}
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

          {/* Sad / Worried Eyebrows on error mood */}
          {mood === 'error' && pose !== 'password' && (
            <g stroke="#192B42" strokeWidth="1.8" strokeLinecap="round">
              <path d="M31 35 L42 32.5" />
              <path d="M69 35 L58 32.5" />
            </g>
          )}

          {/* Left Eye */}
          <g id="relay-left-eye">
            {showHappyEyes ? (
              <path
                d="M31 45 Q37 38 43 45"
                stroke="#192B42"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <>
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
                <g ref={leftPupilRef} clipPath="url(#relayLeftEyeClip)" style={{ willChange: 'transform' }}>
                  <circle cx="37" cy="44" r="4.2" fill="#192B42" />
                  <circle cx="35.5" cy="42" r="1.4" fill="#FFFFFF" />
                </g>
              </>
            )}
          </g>

          {/* Right Eye */}
          <g id="relay-right-eye">
            {showHappyEyes ? (
              <path
                d="M57 45 Q63 38 69 45"
                stroke="#192B42"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <>
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
                <g ref={rightPupilRef} clipPath="url(#relayRightEyeClip)" style={{ willChange: 'transform' }}>
                  <circle cx="63" cy="44" r="4.2" fill="#192B42" />
                  <circle cx="61.5" cy="42" r="1.4" fill="#FFFFFF" />
                </g>
              </>
            )}
          </g>

          {/* Blush Cheeks */}
          <circle cx="28" cy="53" r="3" fill="#FF886B" fillOpacity="0.8" />
          <circle cx="72" cy="53" r="3" fill="#FF886B" fillOpacity="0.8" />

          {/* Mouth */}
          <path
            d={
              mood === 'celebrate'
                ? 'M44 54 Q50 62 56 54 Z'
                : mood === 'error'
                  ? 'M45 58 Q50 53 55 58'
                  : 'M45 54 Q50 59 55 54'
            }
            fill={mood === 'celebrate' ? '#192B42' : 'none'}
            stroke="#192B42"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Animated Eye-Covering Paws */}
          <g ref={leftHandRef} style={{ opacity: 0, willChange: 'transform, opacity' }}>
            <rect
              x="25"
              y="66"
              width="18"
              height="19"
              rx="8"
              fill="url(#relayEarGrad)"
              stroke="#192B42"
              strokeWidth="2"
            />
            <line x1="31" y1="68" x2="31" y2="73" stroke="#192B42" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="37" y1="68" x2="37" y2="73" stroke="#192B42" strokeWidth="1.4" strokeLinecap="round" />
          </g>
          <g ref={rightHandRef} style={{ opacity: 0, willChange: 'transform, opacity' }}>
            <rect
              x="57"
              y="66"
              width="18"
              height="19"
              rx="8"
              fill="url(#relayEarGrad)"
              stroke="#192B42"
              strokeWidth="2"
            />
            <line x1="63" y1="68" x2="63" y2="73" stroke="#192B42" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="69" y1="68" x2="69" y2="73" stroke="#192B42" strokeWidth="1.4" strokeLinecap="round" />
          </g>

          {/* Chest Emblem */}
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
    </div>
  );
}

export default RelayMascot;
