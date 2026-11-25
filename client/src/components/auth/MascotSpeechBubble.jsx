import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const MASCOT_BUBBLE_TEXT = {
  idle: "Hi! Let's get your club started.",
  email: 'Got it, a university email.',
  password: 'Not looking, promise.',
  peek: 'Okay, just a peek.',
  error: 'Hmm, that did not match. Try again.',
  signup_success: 'Account created. Sign in to continue.',
  signin_success: 'Welcome back!',
};

/**
 * Decorative speech bubble reacting to authentication states.
 * Uses aria-live="off" so screen readers focus on semantic form alerts instead.
 */
export function MascotSpeechBubble({ mascotState = 'idle', className = '' }) {
  const textRef = useRef(null);
  const message = MASCOT_BUBBLE_TEXT[mascotState] || MASCOT_BUBBLE_TEXT.idle;

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    if (!textRef.current || prefersReducedMotion) return;

    const tween = gsap.fromTo(
      textRef.current,
      { opacity: 0, y: 3 },
      { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }
    );
    return () => tween.kill();
  }, [message]);

  return (
    <div
      data-testid="mascot-speech-bubble"
      aria-live="off"
      aria-hidden="true"
      className={`relative inline-flex items-center justify-center bg-white text-ink border border-ink-100 rounded-2xl px-4 py-2.5 shadow-elevated text-xs sm:text-sm font-semibold text-center max-w-[280px] ${className}`}
    >
      <span ref={textRef}>{message}</span>
      <span
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-ink-100 rotate-45"
        aria-hidden="true"
      />
    </div>
  );
}

export default MascotSpeechBubble;
