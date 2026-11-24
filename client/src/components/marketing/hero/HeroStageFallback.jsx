import React from 'react';
import { UserCheck, CheckCircle2 } from 'lucide-react';

/**
 * HeroStageFallback: Static final-state stage rendered when prefers-reduced-motion is on,
 * mobile screen is under 768px, or WebGL is unavailable.
 * Shows chips gathered, packet at Incoming Lead, and a clean 3-step caption list.
 * Styled cleanly for the Clean Canvas and Royal Blue brand palette.
 * No R3F in this component.
 */
export function HeroStageFallback() {
  return (
    <div
      className="w-full flex flex-col items-center select-none"
      aria-label="Handover system: Scattered to Handed Over visual storyboard"
    >
      {/* Fixed-aspect Stage: 5/4, max-width 640px, 24px padding */}
      <div className="relative w-full max-w-[640px] aspect-[5/4] p-6 overflow-visible flex items-center justify-center">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-radial from-brand-500/10 via-mint-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* SVG Ribbon Paths */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 640 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 60 140 C 160 140, 230 256, 320 256 C 410 256, 480 372, 580 372"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeOpacity="0.75"
            strokeLinecap="round"
          />
          <path
            d="M 60 372 C 160 372, 230 256, 320 256 C 410 256, 480 140, 580 140"
            stroke="#00D2B4"
            strokeWidth="2.5"
            strokeOpacity="0.75"
            strokeLinecap="round"
          />
          <line
            x1="320"
            y1="256"
            x2="580"
            y2="256"
            stroke="#2563EB"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            strokeOpacity="0.6"
          />
        </svg>

        {/* Outgoing Lead Node */}
        <div
          className="absolute z-20 flex flex-col items-center"
          style={{ left: '9.3%', top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="w-11 h-11 rounded-full bg-white/95 border border-slate-200/90 flex items-center justify-center text-slate-700 shadow-md">
            <UserCheck className="w-5 h-5 text-slate-600" />
          </div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-700 mt-2 font-semibold">
            Outgoing Lead
          </span>
          <span className="font-mono text-[9px] text-slate-400">Term 2025-26</span>
        </div>

        {/* Incoming Lead Node */}
        <div
          className="absolute z-20 flex flex-col items-center"
          style={{ left: '90.6%', top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="w-11 h-11 rounded-full bg-white/95 border border-brand-300 flex items-center justify-center text-brand-600 shadow-[0_0_20px_rgba(37,99,235,0.18)]">
            <CheckCircle2 className="w-5 h-5 text-brand-600" />
          </div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-brand-600 mt-2 font-semibold">
            Incoming Lead
          </span>
          <span className="font-mono text-[9px] text-brand-500/70">Term 2026-27</span>
        </div>

        {/* Static Central Core Disc */}
        <div
          className="absolute z-20 flex items-center justify-center pointer-events-none"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="w-16 h-16 rounded-full bg-white/90 border-2 border-brand-500 flex items-center justify-center shadow-[0_0_25px_rgba(37,99,235,0.25)]">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500" />
          </div>
        </div>

        {/* Handover Packet at Arrival */}
        <div
          className="absolute z-30 pointer-events-none"
          style={{ left: '88%', top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="w-12 h-12 rounded-full border-2 border-brand-600 bg-white flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <span className="font-mono text-[10px] text-brand-600 font-bold">8/8</span>
          </div>
        </div>
      </div>

      {/* Static 3-step storyboard list below stage */}
      <div className="w-full max-w-[540px] mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="font-mono text-[10px] uppercase font-bold text-slate-500">
              01 Scattered
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-900">Six disjointed tools</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Chat, drives, sheets, emails</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-brand-500" />
            <span className="font-mono text-[10px] uppercase font-bold text-brand-600">
              02 Gathered
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-900">Unified workspace</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Automated context intake</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-mono text-[10px] uppercase font-bold text-emerald-600">
              03 Handed over
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-900">Sealed successor packet</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Atomic verified custody</p>
        </div>
      </div>
    </div>
  );
}

export default HeroStageFallback;
