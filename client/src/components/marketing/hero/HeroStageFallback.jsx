import React from 'react';
import { UserCheck, CheckCircle2 } from 'lucide-react';
import {
  STAGE_WIDTH,
  STAGE_HEIGHT,
  OUTGOING_NODE,
  CORE_CENTER,
  INCOMING_NODE,
  RIBBON_PATHS,
} from './heroGeometry';

/**
 * HeroStageFallback: Static storyboard rendered when prefers-reduced-motion is on,
 * mobile screen is under 768px, or WebGL is unavailable.
 * Single coordinate system matching heroGeometry.js (viewBox 640 x 400).
 */
export function HeroStageFallback() {
  return (
    <div
      className="w-full flex flex-col items-center select-none"
      aria-label="Handover system: Scattered to Handed Over visual storyboard"
    >
      {/* Fixed-aspect Stage: 640/400, max-width 600px */}
      <div className="relative w-full max-w-[600px] aspect-[640/400] overflow-visible flex items-center justify-center">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-radial from-brand-500/10 via-mint-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* SVG Ribbon Paths matching heroGeometry */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          viewBox={`0 0 ${STAGE_WIDTH} ${STAGE_HEIGHT}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d={RIBBON_PATHS.A}
            stroke="#00D2B4"
            strokeWidth="2"
            strokeOpacity="0.8"
            strokeLinecap="round"
          />
          <path
            d={RIBBON_PATHS.B}
            stroke="#2563EB"
            strokeWidth="2"
            strokeOpacity="0.8"
            strokeLinecap="round"
          />
          <line
            x1={CORE_CENTER.x}
            y1={CORE_CENTER.y}
            x2={INCOMING_NODE.x}
            y2={INCOMING_NODE.y}
            stroke="#2563EB"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            strokeOpacity="0.6"
          />
        </svg>

        {/* Outgoing Lead Node */}
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: `${(OUTGOING_NODE.x / STAGE_WIDTH) * 100}%`,
            top: `${(OUTGOING_NODE.y / STAGE_HEIGHT) * 100}%`,
          }}
        >
          <div
            className="w-14 h-14 rounded-full bg-white/95 border border-slate-200/90 flex items-center justify-center text-slate-700 shadow-md"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <UserCheck className="w-5 h-5 text-slate-600" />
          </div>
          <div
            className="w-[120px] text-center flex flex-col items-center"
            style={{
              position: 'absolute',
              left: 0,
              top: '34px',
              transform: 'translateX(-50%)',
            }}
          >
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-700 font-semibold whitespace-nowrap">
              {OUTGOING_NODE.label}
            </span>
            <span className="font-mono text-[9px] text-slate-400 whitespace-nowrap">
              {OUTGOING_NODE.sub}
            </span>
          </div>
        </div>

        {/* Incoming Lead Node */}
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: `${(INCOMING_NODE.x / STAGE_WIDTH) * 100}%`,
            top: `${(INCOMING_NODE.y / STAGE_HEIGHT) * 100}%`,
          }}
        >
          <div
            className="w-14 h-14 rounded-full bg-white/95 border border-brand-300 flex items-center justify-center text-brand-600 shadow-[0_0_15px_rgba(37,99,235,0.18)]"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <CheckCircle2 className="w-5 h-5 text-brand-600" />
          </div>
          <div
            className="w-[120px] text-center flex flex-col items-center"
            style={{
              position: 'absolute',
              left: 0,
              top: '34px',
              transform: 'translateX(-50%)',
            }}
          >
            <span className="font-mono text-[11px] uppercase tracking-wider text-brand-600 font-semibold whitespace-nowrap">
              {INCOMING_NODE.label}
            </span>
            <span className="font-mono text-[9px] text-brand-500/70 whitespace-nowrap">
              {INCOMING_NODE.sub}
            </span>
          </div>
        </div>

        {/* Static Central Core Disc */}
        <div
          className="absolute z-20 flex items-center justify-center pointer-events-none"
          style={{
            left: `${(CORE_CENTER.x / STAGE_WIDTH) * 100}%`,
            top: `${(CORE_CENTER.y / STAGE_HEIGHT) * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-14 h-14 rounded-full bg-white/95 border-2 border-brand-500 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.25)]">
            <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500" />
          </div>
        </div>

        {/* Handover Packet at Incoming Node center */}
        <div
          className="absolute z-30 pointer-events-none"
          style={{
            left: `${(INCOMING_NODE.x / STAGE_WIDTH) * 100}%`,
            top: `${(INCOMING_NODE.y / STAGE_HEIGHT) * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-10 h-10 rounded-full border-2 border-brand-600 bg-white flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <span className="font-mono text-[9px] text-brand-600 font-bold">8/8</span>
          </div>
        </div>
      </div>

      {/* Static 3-step storyboard list below stage */}
      <div className="w-full max-w-[600px] mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
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
