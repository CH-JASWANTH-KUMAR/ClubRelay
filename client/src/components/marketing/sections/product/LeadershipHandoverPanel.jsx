import React, { useState, useEffect } from 'react';
import { Check, CheckCircle2, ArrowRightLeft, ArrowRight, ShieldCheck } from 'lucide-react';

const HANDOVER_SECTIONS = [
  'Role responsibilities',
  'Outstanding tasks',
  'Pending commitments',
  'Future schedules',
  'Key documents',
  'Contact network',
  'Playbooks',
  'Lessons learned',
];

export function LeadershipHandoverPanel({ isReducedMotion = false }) {
  const [completedCount, setCompletedCount] = useState(isReducedMotion ? 8 : 2);
  const [isAcknowledged, setIsAcknowledged] = useState(isReducedMotion);

  useEffect(() => {
    if (isReducedMotion) {
      setCompletedCount(8);
      setIsAcknowledged(true);
      return;
    }

    // Sequentially complete items from 2 up to 8
    const intervals = [];
    for (let i = 3; i <= 8; i++) {
      intervals.push(
        setTimeout(() => {
          setCompletedCount(i);
          if (i === 8) {
            setTimeout(() => setIsAcknowledged(true), 400);
          }
        }, (i - 2) * 350)
      );
    }

    return () => {
      intervals.forEach(clearTimeout);
    };
  }, [isReducedMotion]);

  return (
    <div className="w-full flex flex-col space-y-3.5">
      {/* Handover Dossier Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-3.5 h-3.5 text-brand-600" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
            Succession Dossier
          </span>
        </div>
        <span className="font-mono text-[10px] text-brand-700 bg-brand-50 border border-brand-200/80 px-2.5 py-0.5 rounded-full font-bold">
          {completedCount} of 8 Sections Verified
        </span>
      </div>

      {/* Handoff transition strip: Outgoing Lead -> Incoming Lead with role chips */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase text-slate-400 font-bold">From:</span>
          <span className="font-display text-xs font-bold text-ink">Outgoing Lead</span>
          <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-slate-200/90 text-slate-700 font-semibold">
            Term 2025-26
          </span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase text-slate-400 font-bold">To:</span>
          <span className="font-display text-xs font-bold text-ink">Incoming Lead</span>
          <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-bold">
            Term 2026-27
          </span>
        </div>
      </div>

      {/* 8 Sections in 2 Columns with generous padding */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 overflow-y-auto pr-1">
        {HANDOVER_SECTIONS.map((section, idx) => {
          const isDone = idx < completedCount;

          return (
            <div
              key={section}
              className={`p-2.5 sm:p-3 rounded-xl border transition-all duration-300 flex items-center justify-between gap-2 ${
                isDone
                  ? 'bg-brand-50/50 border-brand-200/80 shadow-2xs'
                  : 'bg-slate-50/70 border-slate-200/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                    isDone
                      ? 'bg-brand-600 text-white'
                      : 'border-2 border-slate-300 bg-white'
                  }`}
                >
                  {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span
                  className={`font-sans text-xs truncate transition-colors ${
                    isDone ? 'text-ink font-semibold' : 'text-slate-500 font-medium'
                  }`}
                >
                  {section}
                </span>
              </div>
              <span className="font-mono text-[9px] text-slate-400 flex-shrink-0 font-medium">
                0{idx + 1}
              </span>
            </div>
          );
        })}
      </div>

      {/* Final Row: Acknowledged by incoming lead with emerald check + saved to history */}
      <div className="space-y-2 flex-shrink-0">
        <div
          className={`p-2.5 rounded-xl border transition-all duration-500 flex items-center justify-between gap-3 ${
            isAcknowledged
              ? 'bg-emerald-50/80 border-emerald-300 shadow-[0_0_15px_rgba(44,191,155,0.15)] opacity-100 translate-y-0'
              : 'border-transparent opacity-0 translate-y-1 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-display text-xs font-bold text-emerald-800">
              Acknowledged by incoming lead
            </span>
          </div>
          <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold shadow-2xs">
            Relay sealed
          </span>
        </div>

        <div className="flex items-center justify-between px-2 pt-1.5 border-t border-slate-100 text-[11px] font-sans text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <span className="font-medium text-slate-600">Saved to the club's handover history</span>
          </div>
          <span className="font-mono text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
            Verified dossier
          </span>
        </div>
      </div>
    </div>
  );
}

export default LeadershipHandoverPanel;
