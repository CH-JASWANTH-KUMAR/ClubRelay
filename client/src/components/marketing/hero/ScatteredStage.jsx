import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { useGSAP } from '@gsap/react';
import { UserCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { GlowingCoreCanvas } from './GlowingCoreCanvas';

// Register MotionPathPlugin safely
if (typeof window !== 'undefined') {
  gsap.registerPlugin(MotionPathPlugin);
}

const CHIPS_DATA = [
  { id: 'chat', label: 'Group chat', left: '10%', top: '14%', rot: -7, isAccent: false, ribbonIndex: 1 },
  { id: 'drive', label: 'Personal Drive', left: '26%', top: '22%', rot: 9, isAccent: false, ribbonIndex: 1 },
  { id: 'sheet', label: 'Spreadsheet', left: '8%', top: '42%', rot: -11, isAccent: false, ribbonIndex: 2 },
  { id: 'email', label: 'Old email', left: '28%', top: '50%', rot: 6, isAccent: true, ribbonIndex: 2 }, // Warm Copper accent
  { id: 'notes', label: 'Notes app', left: '12%', top: '68%', rot: 8, isAccent: false, ribbonIndex: 2 },
  { id: 'repo', label: 'Repo', left: '25%', top: '78%', rot: -8, isAccent: false, ribbonIndex: 1 },
];

const BEATS = [
  {
    index: 1,
    title: 'Scattered across six places',
    sub: 'Loose context across group chats, personal drives, and scattered inboxes.',
  },
  {
    index: 2,
    title: 'Gathered in one workspace',
    sub: 'Active tasks, files, and project decisions unified in the ClubRelay core.',
  },
  {
    index: 3,
    title: 'Handed to the next team',
    sub: 'Complete 8-section successor dossier transferred with verified role custody.',
  },
];

export function ScatteredStage({ paused = false }) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const chipsRefs = useRef([]);
  const packetRef = useRef(null);
  const segmentsRef = useRef([]);
  const [activeBeat, setActiveBeat] = useState(0);
  const [coreIntensity, setCoreIntensity] = useState(1.0);

  useGSAP(
    () => {
      // Stage dimensions are based on 640x512
      const chips = chipsRefs.current;
      const packet = packetRef.current;
      const segments = segmentsRef.current;

      const master = gsap.timeline({
        repeat: -1,
        paused,
      });

      // BEAT 1: SCATTERED (0.0s to 2.5s)
      master.addLabel('scattered', 0);
      master.call(() => {
        setActiveBeat(0);
        setCoreIntensity(0.9);
      }, null, 0);

      // Reset initial positions and subtle drifting
      chips.forEach((chip, i) => {
        if (!chip) return;
        const data = CHIPS_DATA[i];
        gsap.set(chip, {
          clearProps: 'transform,opacity,scale',
          opacity: 0.85,
          scale: 1,
          rotation: data.rot,
        });

        // Gentle idle drift in Beat 1
        master.to(
          chip,
          {
            x: `+=${Math.sin(i * 1.5) * 8}`,
            y: `+=${Math.cos(i * 1.2) * 8}`,
            opacity: 1,
            duration: 2.4,
            ease: 'sine.inOut',
          },
          0.05
        );
      });

      // Ensure packet is hidden initially
      if (packet) {
        gsap.set(packet, { opacity: 0, scale: 0, x: 0, y: 0 });
      }

      // BEAT 2: GATHERED (2.5s to 5.0s)
      master.addLabel('gathered', 2.5);
      master.call(() => {
        setActiveBeat(1);
        setCoreIntensity(1.6);
      }, null, 2.5);

      // Chips travel along ribbon paths into the core, straightens, brightens, shrinks
      chips.forEach((chip, i) => {
        if (!chip) return;
        const delay = 2.5 + i * 0.22;
        const pathId = CHIPS_DATA[i].ribbonIndex === 1 ? '#ribbon-path-1' : '#ribbon-path-2';

        master.to(
          chip,
          {
            opacity: 1,
            rotation: 0,
            scale: 0.85,
            duration: 0.4,
            ease: 'power1.out',
          },
          delay
        );

        // MotionPath toward center (320, 256)
        master.to(
          chip,
          {
            motionPath: {
              path: pathId,
              align: pathId,
              alignOrigin: [0.5, 0.5],
              start: 0.15 + i * 0.08,
              end: 0.5, // Center intersection
              autoRotate: false,
            },
            duration: 1.3,
            ease: 'power2.in',
          },
          delay
        );

        // Shrink and disappear into core
        master.to(
          chip,
          {
            scale: 0,
            opacity: 0,
            duration: 0.35,
            ease: 'power3.in',
            onStart: () => setCoreIntensity(1.8),
            onComplete: () => setCoreIntensity(1.3),
          },
          delay + 1.1
        );
      });

      // BEAT 3: HANDED OVER (5.0s to 8.0s)
      master.addLabel('handedOver', 5.0);
      master.call(() => {
        setActiveBeat(2);
        setCoreIntensity(1.1);
      }, null, 5.0);

      if (packet) {
        // Handover packet emerges from core at (320, 256)
        master.set(packet, { opacity: 0, scale: 0.2, x: 320, y: 256 }, 5.0);
        master.to(
          packet,
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: 'back.out(1.7)',
          },
          5.05
        );

        // Travels in a straight line to Incoming Lead node (~580, 256)
        master.to(
          packet,
          {
            x: 580,
            y: 256,
            duration: 1.6,
            ease: 'power2.inOut',
          },
          5.4
        );

        // Segments illuminate one by one on arrival in Royal Blue
        segments.forEach((seg, idx) => {
          if (!seg) return;
          master.to(
            seg,
            {
              stroke: '#2563EB',
              strokeWidth: 4,
              duration: 0.12,
              ease: 'power1.out',
            },
            6.7 + idx * 0.08
          );
        });

        // Fade packet out before loop reset
        master.to(
          packet,
          {
            opacity: 0,
            scale: 0.8,
            duration: 0.4,
            ease: 'power2.in',
          },
          7.6
        );

        // Reset segments color
        master.call(() => {
          segments.forEach((seg) => {
            if (seg) gsap.set(seg, { stroke: 'rgba(37,99,235,0.3)', strokeWidth: 3 });
          });
        }, null, 7.95);
      }

      return () => {
        master.kill();
      };
    },
    { scope: containerRef, dependencies: [paused] }
  );

  const currentBeatInfo = BEATS[activeBeat] || BEATS[0];

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center select-none">
      {/* Fixed-aspect Stage: 5/4 aspect ratio, max-width 640px, 24px internal padding */}
      <div
        ref={stageRef}
        className="relative w-full max-w-[640px] aspect-[5/4] p-6 overflow-visible flex items-center justify-center"
      >
        {/* Background Soft Radial Glow behind the Stage */}
        <div className="absolute inset-0 bg-radial from-brand-500/10 via-mint-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* SVG Layer: 640x512 ViewBox containing the two thin ribbon paths */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 640 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft Glow Blur Filter */}
            <filter id="ribbonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Ribbon 1 Gradient: Brand Blue to Mint to Light Blue */}
            <linearGradient id="ribbonGrad1" x1="60" y1="140" x2="580" y2="372" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#00D2B4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.85" />
            </linearGradient>

            {/* Ribbon 2 Gradient: Mint to Brand Blue */}
            <linearGradient id="ribbonGrad2" x1="60" y1="372" x2="580" y2="140" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00D2B4" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Ribbon Path 1: Smooth S-curve crossing at center (320, 256) */}
          <path
            id="ribbon-path-1"
            d="M 60 140 C 160 140, 230 256, 320 256 C 410 256, 480 372, 580 372"
            stroke="url(#ribbonGrad1)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#ribbonGlow)"
          />

          {/* Ribbon Path 2: Interlocking smooth S-curve crossing at center (320, 256) */}
          <path
            id="ribbon-path-2"
            d="M 60 372 C 160 372, 230 256, 320 256 C 410 256, 480 140, 580 140"
            stroke="url(#ribbonGrad2)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#ribbonGlow)"
          />

          {/* Straight Handover Transfer Track (Beat 3) */}
          <line
            x1="320"
            y1="256"
            x2="580"
            y2="256"
            stroke="rgba(37,99,235,0.25)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </svg>

        {/* Left Node: Outgoing Lead at about (60, 256) */}
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

        {/* Right Node: Incoming Lead at about (580, 256) */}
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

        {/* Centered at (320, 256): ONE small R3F Canvas for the Glowing Icosahedron Core only */}
        <div
          className="absolute z-20 pointer-events-none"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <GlowingCoreCanvas pulseIntensity={coreIntensity} />
        </div>

        {/* 6 DOM Knowledge Chips (Crisp, zero-clipping) */}
        {CHIPS_DATA.map((chip, idx) => (
          <div
            key={chip.id}
            ref={(el) => (chipsRefs.current[idx] = el)}
            className={`absolute z-30 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[14px] font-sans font-medium select-none transition-shadow ${
              chip.isAccent
                ? 'bg-amber-50/95 border border-amber-300 text-amber-900 shadow-[0_4px_12px_rgba(217,119,6,0.12)]'
                : 'bg-white/95 backdrop-blur-md border border-slate-200/90 text-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
            }`}
            style={{
              left: chip.left,
              top: chip.top,
              transform: `rotate(${chip.rot}deg)`,
            }}
          >
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                chip.isAccent
                  ? 'bg-amber-500'
                  : chip.id === 'chat'
                  ? 'bg-blue-600'
                  : chip.id === 'sheet'
                  ? 'bg-emerald-500'
                  : chip.id === 'repo'
                  ? 'bg-cyan-500'
                  : chip.id === 'notes'
                  ? 'bg-indigo-500'
                  : 'bg-slate-500'
              }`}
            />
            <span className="whitespace-nowrap">{chip.label}</span>
          </div>
        ))}

        {/* Handover Packet (Beat 3): 8-segment ring emerging from core and traveling to Incoming Lead */}
        <div
          ref={packetRef}
          className="absolute z-30 pointer-events-none opacity-0"
          style={{
            left: 0,
            top: 0,
            width: '56px',
            height: '56px',
            marginLeft: '-28px',
            marginTop: '-28px',
          }}
        >
          <svg className="w-full h-full" viewBox="0 0 56 56">
            {/* Center disc */}
            <circle cx="28" cy="28" r="14" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
            <circle cx="28" cy="28" r="5" fill="#2563EB" />

            {/* 8-segment ring using SVG circle with stroke-dasharray */}
            {Array.from({ length: 8 }).map((_, i) => {
              const circumference = 2 * Math.PI * 22; // ~138.2
              const segLength = (circumference - 8 * 4) / 8; // length of each segment
              const dashoffset = -i * (segLength + 4);
              return (
                <circle
                  key={i}
                  ref={(el) => (segmentsRef.current[i] = el)}
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  stroke="rgba(37,99,235,0.3)"
                  strokeWidth="3"
                  strokeDasharray={`${segLength} ${circumference - segLength}`}
                  strokeDashoffset={dashoffset}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Caption Block below the stage (24px gap / mt-6, not overlapping) */}
      <div className="w-full max-w-[540px] mt-6 z-20">
        <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md text-slate-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-200/80 flex items-center justify-center flex-shrink-0 text-brand-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200 font-bold">
                  BEAT {currentBeatInfo.index} / 3
                </span>
                <span className="font-display font-bold text-xs text-slate-900">
                  {currentBeatInfo.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5 line-clamp-1">
                {currentBeatInfo.sub}
              </p>
            </div>
          </div>

          {/* 3 Progress Dots */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {[0, 1, 2].map((idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeBeat === idx
                    ? 'bg-brand-600 scale-125 shadow-[0_0_8px_rgba(37,99,235,0.5)]'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScatteredStage;
