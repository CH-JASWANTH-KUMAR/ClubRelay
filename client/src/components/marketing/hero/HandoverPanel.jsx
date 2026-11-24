import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { UserCheck, ShieldCheck, Check } from 'lucide-react';

const HANDOVER_SECTIONS = [
  'Role Responsibilities',
  'Outstanding Tasks',
  'Sponsor Contacts',
  'Playbooks & SOPs',
  'Approved Budgets',
  'Code Repos & Assets',
  'Faculty Approvals',
  'Executive Retrospective',
];

/**
 * HandoverPanel: Signature "Handover Relay" glass panel in Clean Campus style.
 * Illustrates authentic product capability: Outgoing Lead -> Incoming Lead baton transfer
 * with an animated SVG beam and 8 sequential handover dossier segments.
 */
export function HandoverPanel() {
  const containerRef = useRef(null);
  const beamRef = useRef(null);
  const [activeStep, setActiveStep] = useState(7); // Default to verified state

  useGSAP(
    () => {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) return;

      // Animate the beam pulse traveling between Outgoing and Incoming Lead
      const beamTl = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });
      beamTl.fromTo(
        beamRef.current,
        { strokeDashoffset: 140, opacity: 0 },
        {
          strokeDashoffset: -140,
          opacity: 1,
          duration: 2.2,
          ease: 'power2.inOut',
        }
      ).to(
        beamRef.current,
        { opacity: 0, duration: 0.3 },
        '-=0.3'
      );

      // Cycle active step 0 through 7 gently
      const interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % 8);
      }, 1800);

      return () => clearInterval(interval);
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl bg-white/95 backdrop-blur-xl border border-border shadow-[0_20px_45px_rgba(25,43,66,0.1)] p-4 sm:p-5 text-ink select-none transition-all hover:border-brand-300"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink/60 font-semibold">
            Illustrative preview
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-[10px] font-mono text-brand-700 font-semibold">
          <ShieldCheck className="w-3 h-3 text-brand-600" />
          <span>Atomic Handover</span>
        </div>
      </div>

      {/* Main Relay Transfer Graphic: Outgoing Lead -> Animated Beam -> Incoming Lead */}
      <div className="relative py-2 px-1">
        <div className="flex items-center justify-between relative z-10">
          {/* Outgoing Lead Node */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-subtle border border-border flex items-center justify-center text-brand-600 shadow-2xs">
              <UserCheck className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-ink/60 font-semibold">
                Outgoing Lead
              </div>
              <div className="font-display font-semibold text-xs text-ink">
                Term 2025–26
              </div>
            </div>
          </div>

          {/* Incoming Lead Node */}
          <div className="flex items-center gap-2.5 text-right">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-brand-600 font-semibold">
                Incoming Lead
              </div>
              <div className="font-display font-semibold text-xs text-ink">
                Term 2026–27
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-mint-50 border border-mint-200 flex items-center justify-center text-mint-700 shadow-2xs">
              <Check className="w-4 h-4 text-mint-600 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Animated Connecting Vector Beam between the two leads */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-12 sm:px-14">
          <svg className="w-full h-8 overflow-visible" viewBox="0 0 200 20" preserveAspectRatio="none">
            {/* Background baseline track */}
            <line
              x1="0"
              y1="10"
              x2="200"
              y2="10"
              stroke="#E5E9E8"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {/* Animated GSAP pulse beam */}
            <line
              ref={beamRef}
              x1="0"
              y1="10"
              x2="200"
              y2="10"
              stroke="#315BDB"
              strokeWidth="2.5"
              strokeDasharray="30 110"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* 8-Section Handover Dossier Segmented Stepper */}
      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center justify-between text-[11px] mb-2 font-display">
          <span className="text-ink/60 text-[10px] font-mono uppercase tracking-wider font-semibold">
            8-Section Successor Dossier
          </span>
          <span className="text-brand-600 font-mono text-[10px] font-bold">
            {activeStep + 1} of 8: {HANDOVER_SECTIONS[activeStep]}
          </span>
        </div>

        {/* 8 Small segments filling sequentially */}
        <div className="grid grid-cols-8 gap-1.5 h-1.5">
          {HANDOVER_SECTIONS.map((section, idx) => {
            const isFilled = idx <= activeStep;
            const isCurrent = idx === activeStep;
            return (
              <div
                key={section}
                title={`${idx + 1}. ${section}`}
                className={`rounded-full transition-all duration-300 ${
                  isCurrent
                    ? 'bg-brand-600 shadow-[0_0_8px_rgba(49,91,219,0.5)]'
                    : isFilled
                    ? 'bg-mint-500'
                    : 'bg-border'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default HandoverPanel;
