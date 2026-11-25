import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { RelayMascot } from '../brand/RelayMascot';
import { MascotSpeechBubble } from './MascotSpeechBubble';

const STAGE_CHIPS = [
  { label: 'Events', positionClass: 'top-[10%] left-[8%]', floatY: -7, duration: 4.2 },
  { label: 'Handover', positionClass: 'top-[14%] right-[8%]', floatY: 6, duration: 4.8 },
  { label: 'Playbooks', positionClass: 'bottom-[15%] left-[9%]', floatY: 7, duration: 4.5 },
  { label: 'Contacts', positionClass: 'bottom-[18%] right-[9%]', floatY: -6, duration: 5.0 },
];

/**
 * Right-column stage panel for desktop authentication viewports (1024px+).
 * Renders Electric Blue to Ink Navy gradient, subtle grid, radial backdrop glow,
 * 4 low-opacity floating workspace chips, large interactive RelayMascot, and speech bubble.
 */
export function AuthStagePanel({ mascotState = 'idle', pose = 'idle', mood = 'friendly' }) {
  const stageRef = useRef(null);
  const chipRefs = useRef([]);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const isCoarsePointer =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(pointer: coarse)')?.matches;

    if (prefersReducedMotion || isCoarsePointer) return;

    const ctx = gsap.context(() => {
      chipRefs.current.forEach((el, idx) => {
        if (!el) return;
        const chip = STAGE_CHIPS[idx];
        gsap.to(el, {
          y: chip.floatY,
          duration: chip.duration,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    }, stageRef);

    return () => ctx.revert();
  }, []);

  return (
    <aside
      ref={stageRef}
      data-testid="auth-stage-panel"
      aria-label="ClubRelay interactive workspace preview"
      className="relative h-full w-full overflow-hidden flex flex-col items-center justify-between py-12 px-10 select-none"
      style={{
        background: 'linear-gradient(135deg, #315BDB 0%, #1F3EA8 48%, #192B42 100%)',
      }}
    >
      {/* Subtle architectural grid overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Soft radial highlight behind robot */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 70%)',
        }}
      />

      {/* 4 non-overlapping floating glass chips at outer perimeter */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        {STAGE_CHIPS.map((chip, idx) => (
          <div
            key={chip.label}
            ref={(el) => {
              chipRefs.current[idx] = el;
            }}
            className={`absolute ${chip.positionClass} px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/85 text-xs font-semibold tracking-wide`}
          >
            {chip.label}
          </div>
        ))}
      </div>

      {/* Top spacer */}
      <div className="h-4" aria-hidden="true" />

      {/* Center Mascot + Speech Bubble */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <MascotSpeechBubble mascotState={mascotState} className="mb-5" />
        <RelayMascot
          size="stage"
          interactive
          trackViewport
          idleFloat
          pose={pose}
          mood={mood}
        />
      </div>

      {/* Bottom tagline */}
      <p className="relative z-10 text-sm font-semibold text-white/95 tracking-wide text-center">
        Build the club. Keep the momentum.
      </p>
    </aside>
  );
}

export default AuthStagePanel;
