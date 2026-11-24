import React, { useState, useRef } from 'react';
import { Users } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const POSITIONS = [
  {
    title: 'President',
    fall2025: { role: 'Outgoing Lead', status: 'Term Completed', statusType: 'done' },
    spring2026: { role: 'Incoming Lead', status: 'Active Term', statusType: 'active' },
  },
  {
    title: 'Technical Director',
    fall2025: { role: 'Lead Systems Architect', status: 'Handover Prepared', statusType: 'done' },
    spring2026: { role: 'Senior Systems Maintainer', status: 'Active Term', statusType: 'active' },
  },
  {
    title: 'Operations Chair',
    fall2025: { role: 'Logistics Lead', status: 'Transition In Review', statusType: 'attention' },
    spring2026: { role: 'Operations Coordinator', status: 'Pending Confirmation', statusType: 'attention' },
  },
  {
    title: 'Events Director',
    fall2025: { role: 'Program Lead', status: 'Term Completed', statusType: 'done' },
    spring2026: { role: 'Showcase Director', status: 'Active Term', statusType: 'active' },
  },
];

export function TeamMembersPanel({ isReducedMotion = false }) {
  const [term, setTerm] = useState('spring2026');
  const rosterContentRef = useRef(null);

  useGSAP(() => {
    if (isReducedMotion || !rosterContentRef.current) return;
    // Animate member roles in place
    gsap.fromTo(
      rosterContentRef.current.querySelectorAll('.member-role-cell'),
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.25, stagger: 0.04, ease: 'power2.out' }
    );
  }, [term, isReducedMotion]);

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Top Bar with Term Switcher */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-brand-600" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
            Roster Continuity
          </span>
        </div>

        {/* Two-option term switch */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
          <button
            type="button"
            onClick={() => setTerm('fall2025')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
              term === 'fall2025'
                ? 'bg-white text-ink font-bold shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-ink'
            }`}
          >
            Fall 2025
          </button>
          <button
            type="button"
            onClick={() => setTerm('spring2026')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
              term === 'spring2026'
                ? 'bg-brand-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-ink'
            }`}
          >
            Spring 2026
          </button>
        </div>
      </div>

      {/* Roster Table: Position Rows remain steady */}
      <div ref={rosterContentRef} className="space-y-2 flex-1 overflow-y-auto pr-1">
        {POSITIONS.map((pos) => {
          const currentData = term === 'fall2025' ? pos.fall2025 : pos.spring2026;
          const isAttention = currentData.statusType === 'attention';
          const isActive = currentData.statusType === 'active';

          return (
            <div
              key={pos.title}
              className="p-2.5 sm:p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3"
            >
              {/* Position stays constant */}
              <div className="sm:w-[130px] flex-shrink-0">
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 block">
                  Position
                </span>
                <span className="font-display text-xs font-semibold text-ink block">
                  {pos.title}
                </span>
              </div>

              {/* Member role changes on term switch */}
              <div className="member-role-cell flex-1 flex items-center justify-between gap-2 border-t border-slate-200/60 sm:border-t-0 pt-1.5 sm:pt-0">
                <div className="min-w-0">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 block">
                    Assigned Member
                  </span>
                  <span className="font-display text-xs text-ink/90 font-medium block truncate">
                    {currentData.role}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  {isAttention ? (
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded uppercase font-semibold bg-amber-50 border border-amber-200 text-amber-700">
                      {currentData.status}
                    </span>
                  ) : isActive ? (
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded uppercase font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
                      {currentData.status}
                    </span>
                  ) : (
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded uppercase font-medium bg-slate-100 border border-slate-200 text-slate-600">
                      {currentData.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TeamMembersPanel;
