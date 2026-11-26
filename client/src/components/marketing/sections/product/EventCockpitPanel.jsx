import React, { useRef } from 'react';
import { Check, AlertCircle, ArrowDown } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const STAGES = [
  { id: 'draft', label: 'Draft', status: 'done' },
  { id: 'proposed', label: 'Proposed', status: 'done' },
  { id: 'approved', label: 'Approved', status: 'done' },
  { id: 'planning', label: 'Planning', status: 'active' },
  { id: 'progress', label: 'In Progress', status: 'pending' },
  { id: 'completed', label: 'Completed', status: 'pending' },
  { id: 'archived', label: 'Archived', status: 'pending' },
];

export function EventCockpitPanel({ isReducedMotion = false }) {
  const trackRef = useRef(null);
  const dotRefs = useRef([]);
  const markerRef = useRef(null);
  const completedLineRef = useRef(null);

  useGSAP(() => {
    const track = trackRef.current;
    const activeDot = dotRefs.current[3];
    const firstDot = dotRefs.current[0];
    const marker = markerRef.current;
    const completedLine = completedLineRef.current;
    if (!track || !activeDot || !marker) return;

    // Compute exact center position of the dot relative to the track container
    const computeCenter = (dotEl) => {
      const trackRect = track.getBoundingClientRect();
      const dotRect = dotEl.getBoundingClientRect();
      return dotRect.left + dotRect.width / 2 - trackRect.left;
    };

    const targetX = computeCenter(activeDot);
    const startX = firstDot ? computeCenter(firstDot) : targetX;

    if (completedLine) {
      completedLine.style.width = `${targetX}px`;
    }

    if (isReducedMotion) {
      gsap.set(marker, { left: targetX });
      return;
    }

    gsap.fromTo(
      marker,
      { left: startX },
      { left: targetX, duration: 0.7, ease: 'power2.out', delay: 0.15 }
    );
  }, [isReducedMotion]);

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* 7-Stage Track Card */}
      <div className="rounded-xl bg-slate-50/90 border border-slate-200/80 p-3.5 sm:p-4">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Lifecycle Track
            </span>
            <span className="text-slate-300">/</span>
            <span className="font-display text-xs text-brand-600 font-bold">
              Phase: Planning
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Stage 4 of 7</span>
        </div>

        {/* Dedicated Track Area */}
        <div ref={trackRef} className="relative pt-1 pb-1">
          {/* Row of Dots and connecting line */}
          <div className="relative flex justify-between items-center h-4 px-1">
            {/* Base line behind dots */}
            <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 h-[2px] bg-slate-200 rounded-full" />
            {/* Completed line up to active dot */}
            <div
              ref={completedLineRef}
              className="absolute top-1/2 -translate-y-1/2 left-2 h-[2px] bg-brand-600 rounded-full"
            />

            {/* 7 Dots */}
            {STAGES.map((stage, idx) => {
              const isPast = idx < 3;
              const isActive = idx === 3;
              return (
                <div
                  key={stage.id}
                  ref={(el) => (dotRefs.current[idx] = el)}
                  className="relative z-10 flex items-center justify-center w-3.5 h-3.5 flex-shrink-0"
                >
                  <div
                    className={`w-3 h-3 rounded-full transition-all ${
                      isActive
                        ? 'bg-brand-600 ring-2 ring-white shadow-xs'
                        : isPast
                        ? 'bg-brand-600'
                        : 'bg-slate-300'
                    }`}
                  />
                </div>
              );
            })}

            {/* Glowing marker centered exactly on the active stage dot */}
            <div
              ref={markerRef}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none z-20 flex items-center justify-center"
            >
              <div className="w-5 h-5 rounded-full bg-brand-600/25 animate-ping absolute" />
              <div className="w-4 h-4 rounded-full ring-4 ring-brand-100 bg-brand-600 shadow-[0_0_10px_rgba(49,91,219,0.5)]" />
            </div>
          </div>

          {/* Row of Labels: separated by at least 14px (mt-4 is 16px) */}
          <div className="relative flex justify-between items-start mt-4 px-1">
            {STAGES.map((stage, idx) => {
              const isPast = idx < 3;
              const isActive = idx === 3;
              return (
                <div
                  key={stage.id}
                  className="w-3.5 flex justify-center overflow-visible"
                >
                  <span
                    className={`text-[9px] sm:text-[10px] font-mono whitespace-nowrap transition-colors ${
                      isActive
                        ? 'text-brand-600 font-bold block'
                        : isPast
                        ? 'text-slate-700 hidden sm:block font-medium'
                        : 'text-slate-400 hidden sm:block'
                    }`}
                  >
                    {stage.label}
                  </span>
                  {!isActive && (
                    <span className="text-[8px] font-mono text-slate-400 sm:hidden">
                      {stage.label.charAt(0)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3 Tasks with Dependency Arrow (16px rhythm maintained) */}
      <div className="space-y-2 relative">
        {/* Task 1: Completed */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <Check className="w-3 h-3 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <span className="font-display text-xs font-semibold text-ink block leading-snug">
                Venue booking and permits
              </span>
              <span className="font-sans text-[10px] sm:text-[11px] text-slate-500 block leading-tight">
                Signed facility reservation and security clearance
              </span>
            </div>
          </div>
          <span className="font-mono text-[9px] sm:text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 flex-shrink-0 shadow-2xs font-medium">
            Operations Lead
          </span>
        </div>

        {/* Visible Dependency Indicator between Task 1 and Task 2 */}
        <div className="flex items-center gap-2 px-4 py-0.5">
          <div className="w-4 flex justify-center">
            <ArrowDown className="w-3.5 h-3.5 text-brand-600 animate-bounce" />
          </div>
          <span className="font-mono text-[10px] text-brand-600 uppercase tracking-wider font-semibold">
            Dependency: Required before setup
          </span>
        </div>

        {/* Task 2: In Progress */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-brand-50/40 border border-brand-200/80 flex items-center justify-between gap-2.5 sm:gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-5 h-5 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-600 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
            </div>
            <div className="min-w-0">
              <span className="font-display text-xs font-semibold text-ink block leading-snug">
                Stage equipment setup
              </span>
              <span className="font-sans text-[10px] sm:text-[11px] text-slate-500 block leading-tight">
                Sound system routing and presentation displays
              </span>
            </div>
          </div>
          <span className="font-mono text-[9px] sm:text-[10px] px-2 py-0.5 rounded bg-brand-50 border border-brand-200 text-brand-700 flex-shrink-0 font-medium">
            Technical Lead
          </span>
        </div>

        {/* Task 3: Attention Item with Amber */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 flex-shrink-0">
              <AlertCircle className="w-3 h-3" />
            </div>
            <div className="min-w-0">
              <span className="font-display text-xs font-semibold text-ink block leading-snug">
                Guest speaker outreach
              </span>
              <span className="font-sans text-[10px] sm:text-[11px] text-slate-500 block leading-tight">
                Confirm travel schedule and panel itinerary
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded uppercase font-bold bg-amber-50 border border-amber-200 text-amber-700">
              Action required
            </span>
            <span className="font-mono text-[9px] sm:text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hidden sm:inline-block shadow-2xs font-medium">
              Events Lead
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventCockpitPanel;
