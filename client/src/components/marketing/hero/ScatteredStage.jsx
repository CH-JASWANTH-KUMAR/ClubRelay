import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { useGSAP } from '@gsap/react';
import { UserCheck, CheckCircle2, Check, Sparkles } from 'lucide-react';
import { GlowingCoreCanvas } from './GlowingCoreCanvas';
import {
  STAGE_WIDTH,
  STAGE_HEIGHT,
  OUTGOING_NODE,
  CORE_CENTER,
  INCOMING_NODE,
  RIBBON_PATHS,
  CHIP_SLOTS,
  BEATS,
  validateChipLayout,
} from './heroGeometry';

// Register MotionPathPlugin safely
if (typeof window !== 'undefined') {
  gsap.registerPlugin(MotionPathPlugin);
}

export function ScatteredStage({ isPaused = false }) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const chipsRefs = useRef([]);
  const coreContainerRef = useRef(null);
  const incomingCircleRef = useRef(null);
  const packetRef = useRef(null);
  const segmentsRef = useRef([]);
  const masterTimelineRef = useRef(null);

  const [activeBeat, setActiveBeat] = useState(0);
  const [coreIntensity, setCoreIntensity] = useState(1.0);
  const [incomingChecked, setIncomingChecked] = useState(false);

  // Dev-only validation of chip layout clearances
  useEffect(() => {
    validateChipLayout();
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
          isFallback: '(max-width: 767px), (prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { isDesktop } = context.conditions;
          if (!isDesktop) return;

          const chips = chipsRefs.current;
          const packet = packetRef.current;
          const segments = segmentsRef.current;
          const coreBox = coreContainerRef.current;
          const incomingCircle = incomingCircleRef.current;
          const stageEl = stageRef.current;

          const stageW = stageEl?.offsetWidth || 600;
          const stageH = stageEl?.offsetHeight || 375;

          const tl = gsap.timeline({
            repeat: -1,
            paused: isPaused,
            onUpdate: function () {
              const time = this.time() % 8.0;
              const newBeat = time >= 5.2 ? 2 : time >= 2.4 ? 1 : 0;
              setActiveBeat(newBeat);
              setIncomingChecked(time >= 6.75 && time < 7.95);
            },
          });
          masterTimelineRef.current = tl;
          if (typeof window !== 'undefined') {
            window.__heroTimeline = tl;
          }

          // BEAT 1: SCATTERED (0.0s to 2.4s)
          tl.addLabel('scattered', 0);

          // Reset initial chip positions at their predefined slots
          chips.forEach((chip, i) => {
            if (!chip) return;
            const slot = CHIP_SLOTS[i];
            tl.set(
              chip,
              {
                x: 0,
                y: 0,
                xPercent: -50,
                yPercent: -50,
                scale: 1,
                opacity: 0.95,
                rotation: slot.rot,
              },
              0
            );

            // Gentle idle drift in Beat 1 (within +/- 3px)
            tl.to(
              chip,
              {
                x: Math.sin(i * 1.5) * 4,
                y: Math.cos(i * 1.2) * 3,
                duration: 2.3,
                ease: 'sine.inOut',
              },
              0.05
            );
          });

          // Reset packet
          if (packet) {
            tl.set(packet, { opacity: 0, scale: 0, x: CORE_CENTER.x, y: CORE_CENTER.y }, 0);
          }

          // BEAT 2: GATHERED (2.4s to 5.2s, exactly 2.8s duration)
          // Choreographed queue: chips travel one at a time along Ribbon A or B with 0.4s stagger.
          // At most 2 chips in flight at once.
          tl.addLabel('gathered', 2.4);

          const TRANSIT_DURATION = 0.75;
          const STAGGER = 0.4;

          chips.forEach((chip, i) => {
            if (!chip) return;
            const slot = CHIP_SLOTS[i];
            const startTime = 2.4 + i * STAGGER;
            const arrivalTime = startTime + TRANSIT_DURATION;

            // Target delta to core center (50%, 50%)
            const dx = (0.50 - slot.xPct / 100) * stageW;
            const dy = (0.50 - slot.yPct / 100) * stageH;

            // Intermediate arch coordinate along Ribbon A or B
            const archYPct = slot.ribbon === 'A' ? 22.5 : 77.5;
            const archY = ((archYPct - slot.yPct) / 100) * stageH;
            const archX = dx * 0.5;

            // Chip moves along smooth relative path to core center
            tl.to(
              chip,
              {
                motionPath: {
                  path: [
                    { x: 0, y: 0 },
                    { x: archX, y: archY },
                    { x: dx, y: dy },
                  ],
                  curviness: 1.2,
                  autoRotate: false,
                },
                rotation: 0,
                duration: TRANSIT_DURATION,
                ease: 'power2.in',
              },
              startTime
            );

            // As it reaches core center, scale down to 0.25 and fade out
            tl.to(
              chip,
              {
                scale: 0.25,
                opacity: 0,
                duration: 0.2,
                ease: 'power3.in',
              },
              arrivalTime - 0.2
            );

            // Core pulse trigger on each chip arrival (scale 1.06, glow up, then back)
            if (coreBox) {
              tl.to(
                coreBox,
                {
                  scale: 1.06,
                  duration: 0.1,
                  ease: 'power1.out',
                  onStart: () => setCoreIntensity(1.6),
                },
                arrivalTime - 0.05
              );
              tl.to(
                coreBox,
                {
                  scale: 1.0,
                  duration: 0.15,
                  ease: 'power1.inOut',
                  onComplete: () => setCoreIntensity(1.2),
                },
                arrivalTime + 0.05
              );
            }
          });

          // BEAT 3: HANDED OVER (5.2s to 8.0s)
          tl.addLabel('handedOver', 5.2);

          if (packet) {
            // Handover packet (40px) emerges from the core (320, 200) inside SVG
            tl.set(packet, { opacity: 0, scale: 0.2, x: CORE_CENTER.x, y: CORE_CENTER.y }, 5.2);
            tl.to(
              packet,
              {
                opacity: 1,
                scale: 1,
                duration: 0.35,
                ease: 'back.out(1.5)',
              },
              5.25
            );

            // Travels along main axis y=200 to Incoming node center (568, 200)
            tl.to(
              packet,
              {
                x: INCOMING_NODE.x,
                y: INCOMING_NODE.y,
                duration: 1.2,
                ease: 'power2.inOut',
              },
              5.55
            );

            // Arrives exactly at Incoming node center (568, 200) at 6.75s
            // Incoming node ring pulses once
            if (incomingCircle) {
              tl.to(
                incomingCircle,
                {
                  scale: 1.12,
                  boxShadow: '0 0 25px rgba(37, 99, 235, 0.35)',
                  duration: 0.15,
                  ease: 'power1.out',
                },
                6.75
              );
              tl.to(
                incomingCircle,
                {
                  scale: 1.0,
                  boxShadow: '0 0 15px rgba(37, 99, 235, 0.15)',
                  duration: 0.2,
                  ease: 'power1.inOut',
                },
                6.9
              );
            }

            // 8 segments illuminate in sequence
            segments.forEach((seg, idx) => {
              if (!seg) return;
              tl.to(
                seg,
                {
                  stroke: '#2563EB',
                  strokeWidth: 3.5,
                  duration: 0.08,
                  ease: 'power1.out',
                },
                6.75 + idx * 0.05
              );
            });

            // Fade packet out before loop reset
            tl.to(
              packet,
              {
                opacity: 0,
                scale: 0.75,
                duration: 0.35,
                ease: 'power2.in',
              },
              7.55
            );

            // Reset segments before restart
            tl.call(() => {
              segments.forEach((seg) => {
                if (seg) gsap.set(seg, { stroke: 'rgba(37,99,235,0.25)', strokeWidth: 2.5 });
              });
            }, null, 7.95);
          }
        }
      );

      return () => mm.revert();
    },
    { scope: containerRef, dependencies: [] }
  );

  // Sync timeline paused state
  useEffect(() => {
    if (!masterTimelineRef.current) return;
    if (isPaused) {
      masterTimelineRef.current.pause();
    } else {
      masterTimelineRef.current.play();
    }
  }, [isPaused]);

  const currentBeatInfo = BEATS[activeBeat] || BEATS[0];

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center select-none">
      {/* Fixed-aspect Stage: viewBox 640 x 400 (aspect 16/10), max-width 600px */}
      <div
        ref={stageRef}
        className="relative w-full max-w-[600px] aspect-[640/400] overflow-visible flex items-center justify-center"
        aria-label="Interactive Handover Engine Stage"
      >
        {/* Soft radial ambient glow */}
        <div className="absolute inset-0 bg-radial from-brand-500/10 via-mint-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* SVG Coordinate Layer: viewBox 0 0 640 400 */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          viewBox={`0 0 ${STAGE_WIDTH} ${STAGE_HEIGHT}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft Blur Glow Filter */}
            <filter id="ribbonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.0" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Ribbon A Gradient: Mint to Royal Blue to Warm Paper */}
            <linearGradient id="ribbonGradA" x1="100" y1="90" x2="540" y2="310" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00D2B4" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#2563EB" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.75" />
            </linearGradient>

            {/* Ribbon B Gradient: Warm Paper to Royal Blue to Mint */}
            <linearGradient id="ribbonGradB" x1="100" y1="310" x2="540" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#2563EB" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#00D2B4" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Ribbon Path A: Starts at Outgoing edge (100, 200), ends at Incoming edge (540, 200) */}
          <path
            id="ribbon-path-a"
            d={RIBBON_PATHS.A}
            stroke="url(#ribbonGradA)"
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#ribbonGlow)"
          />

          {/* Ribbon Path B: Starts at Outgoing edge (100, 200), ends at Incoming edge (540, 200) */}
          <path
            id="ribbon-path-b"
            d={RIBBON_PATHS.B}
            stroke="url(#ribbonGradB)"
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#ribbonGlow)"
          />

          {/* Straight Handover Transfer Axis (Beat 3) */}
          <line
            x1={CORE_CENTER.x}
            y1={CORE_CENTER.y}
            x2={INCOMING_NODE.x}
            y2={INCOMING_NODE.y}
            stroke="rgba(37,99,235,0.25)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Handover Packet (Beat 3): 40px diameter ring inside SVG coordinate system */}
          <g id="handover-packet" ref={packetRef} opacity="0">
            {/* Center disc 40px diameter -> radius 20 */}
            <circle cx="0" cy="0" r="10" fill="#FFFFFF" stroke="#2563EB" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="3.5" fill="#2563EB" />

            {/* 8-segment ring -> radius 16 */}
            {Array.from({ length: 8 }).map((_, i) => {
              const circumference = 2 * Math.PI * 16;
              const segLength = (circumference - 8 * 3) / 8;
              const dashoffset = -i * (segLength + 3);
              return (
                <circle
                  key={i}
                  ref={(el) => (segmentsRef.current[i] = el)}
                  cx="0"
                  cy="0"
                  r="16"
                  fill="none"
                  stroke="rgba(37,99,235,0.25)"
                  strokeWidth="2.5"
                  strokeDasharray={`${segLength} ${circumference - segLength}`}
                  strokeDashoffset={dashoffset}
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        </svg>

        {/* Outgoing Node: Center at (72, 200) on 640x400 stage */}
        <div
          className="absolute z-20 pointer-events-none select-none"
          style={{
            left: `${(OUTGOING_NODE.x / STAGE_WIDTH) * 100}%`,
            top: `${(OUTGOING_NODE.y / STAGE_HEIGHT) * 100}%`,
          }}
        >
          {/* 56px circle centered exactly on (72, 200) */}
          <div
            className="w-14 h-14 rounded-full bg-white/95 border border-slate-200/90 flex items-center justify-center text-slate-700 shadow-md"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <UserCheck className="w-5 h-5 text-slate-600" />
          </div>

          {/* Grouped label block fixed width 120px below node (never wraps) */}
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

        {/* Incoming Node: Center at (568, 200) on 640x400 stage */}
        <div
          className="absolute z-20 pointer-events-none select-none"
          style={{
            left: `${(INCOMING_NODE.x / STAGE_WIDTH) * 100}%`,
            top: `${(INCOMING_NODE.y / STAGE_HEIGHT) * 100}%`,
          }}
        >
          {/* 56px circle centered exactly on (568, 200) */}
          <div
            ref={incomingCircleRef}
            className="w-14 h-14 rounded-full bg-white/95 border border-brand-300 flex items-center justify-center text-brand-600 shadow-[0_0_15px_rgba(37,99,235,0.15)] transition-colors"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            {incomingChecked ? (
              <Check className="w-5 h-5 text-brand-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-brand-600" />
            )}
          </div>

          {/* Grouped label block fixed width 120px below node (never wraps) */}
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

        {/* Glowing Core: Centered at (320, 200) on 640x400 stage */}
        <div
          ref={coreContainerRef}
          className="absolute z-20 pointer-events-none"
          style={{
            left: `${(CORE_CENTER.x / STAGE_WIDTH) * 100}%`,
            top: `${(CORE_CENTER.y / STAGE_HEIGHT) * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <GlowingCoreCanvas pulseIntensity={coreIntensity} isPaused={isPaused} />
        </div>

        {/* 6 DOM Knowledge Chips positioned at predefined slots */}
        {CHIP_SLOTS.map((slot, idx) => (
          <div
            key={slot.id}
            ref={(el) => (chipsRefs.current[idx] = el)}
            className={`absolute z-30 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[14px] font-sans font-medium select-none will-change-transform ${
              slot.isAccent
                ? 'bg-amber-50/95 border border-amber-300 text-amber-900 shadow-[0_4px_12px_rgba(217,119,6,0.12)]'
                : 'bg-white/95 backdrop-blur-md border border-slate-200/90 text-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
            }`}
            style={{
              left: `${slot.xPct}%`,
              top: `${slot.yPct}%`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: slot.dotColor }}
            />
            <span className="whitespace-nowrap">{slot.label}</span>
          </div>
        ))}
      </div>

      {/* Caption Card below the stage: exactly max-w-[600px], 20px gap (mt-5) */}
      <div className="w-full max-w-[600px] mt-5 z-20">
        <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md text-slate-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-200/80 flex items-center justify-center flex-shrink-0 text-brand-600">
              <Sparkles className="w-4 h-4" />
            </div>
            {/* Fixed min-height so nothing shifts between beats */}
            <div className="min-h-[44px] flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200 font-bold">
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
