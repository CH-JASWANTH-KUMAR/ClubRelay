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
  const markerRef = useRef(null);

  useGSAP(() => {
    if (isReducedMotion || !markerRef.current) return;
    // Animate marker forward along the track to Planning (index 3 out of 6 intervals = 50%)
    gsap.fromTo(
      markerRef.current,
      { left: '0%' },
      { left: '50%', duration: 0.8, ease: 'power2.out', delay: 0.25 }
    );
  }, [isReducedMotion]);

  return (
    <div className="w-full flex flex-col justify-between h-full space-y-4">
      {/* 7-Stage Track */}
      <div className="rounded-xl bg-slate-50/90 border border-slate-200/80 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
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

        {/* Track Line and Nodes */}
        <div className="relative py-2">
          {/* Base Track Line */}
          <div className="absolute top-1/2 left-3 right-3 -translate-y-1/2 h-[2px] bg-slate-200 rounded-full" />
          {/* Completed Segment */}
          <div className="absolute top-1/2 left-3 w-1/2 -translate-y-1/2 h-[2px] bg-brand-600 rounded-full" />

          {/* Animated Glow Marker */}
          <div
            ref={markerRef}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-brand-600 ring-4 ring-brand-100 shadow-[0_0_12px_rgba(49,91,219,0.5)] pointer-events-none z-10"
            style={{ left: isReducedMotion ? '50%' : '0%' }}
          />

          {/* 7 Stage Nodes */}
          <div className="relative flex justify-between items-center z-0 px-1">
            {STAGES.map((stage, idx) => {
              const isPast = idx < 3;
              const isActive = idx === 3;
              return (
                <div key={stage.id} className="flex flex-col items-center group">
                  <div
                    className={`w-3 h-3 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'ring-4 ring-brand-200 bg-brand-600 scale-110'
                        : isPast
                        ? 'bg-brand-600'
                        : 'bg-slate-300'
                    }`}
                  />
                  <span
                    className={`mt-2 text-[9px] sm:text-[10px] font-mono whitespace-nowrap transition-colors ${
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
                    <span className="mt-2 text-[8px] font-mono text-slate-400 sm:hidden">
                      {stage.label.charAt(0)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3 Tasks with Dependency Arrow */}
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

        {/* Task 3: Attention Item with Amber/Coral */}
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
