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
    // Animate the member roles in place without moving position rows
    gsap.fromTo(
      rosterContentRef.current.querySelectorAll('.member-role-cell'),
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.25, stagger: 0.04, ease: 'power2.out' }
    );
  }, [term, isReducedMotion]);

  return (
    <div className="w-full flex flex-col justify-between h-full space-y-3">
      {/* Top Bar with Term Switcher */}
      <div className="flex items-center justify-between pb-2 border-b border-warmPaper/10">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-oxidisedMint" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-mutedSage">
            Roster Continuity
          </span>
        </div>

        {/* Two-option term switch */}
        <div className="flex items-center bg-midnight-workshop rounded-lg p-0.5 border border-warmPaper/10">
          <button
            type="button"
            onClick={() => setTerm('fall2025')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
              term === 'fall2025'
                ? 'bg-warmPaper/20 text-warmPaper font-bold shadow-xs'
                : 'text-mutedSage hover:text-warmPaper'
            }`}
          >
            Fall 2025
          </button>
          <button
            type="button"
            onClick={() => setTerm('spring2026')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
              term === 'spring2026'
                ? 'bg-signalLime text-midnight font-bold shadow-xs'
                : 'text-mutedSage hover:text-warmPaper'
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
              className="p-2.5 sm:p-3 rounded-xl bg-midnight-workshop/80 border border-warmPaper/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3"
            >
              {/* Position stays constant */}
              <div className="sm:w-[130px] flex-shrink-0">
                <span className="font-mono text-[9px] uppercase tracking-wider text-mutedSage block">
                  Position
                </span>
                <span className="font-display text-xs font-semibold text-warmPaper block">
                  {pos.title}
                </span>
              </div>

              {/* Member role changes on term switch */}
              <div className="member-role-cell flex-1 flex items-center justify-between gap-2 border-t border-warmPaper/5 sm:border-t-0 pt-1.5 sm:pt-0">
                <div className="min-w-0">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-mutedSage block">
                    Assigned Member
                  </span>
                  <span className="font-display text-xs text-warmPaper/90 font-medium block truncate">
                    {currentData.role}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  {isAttention ? (
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded uppercase font-semibold bg-warmCopper/15 border border-warmCopper/30 text-warmCopper">
                      {currentData.status}
                    </span>
                  ) : isActive ? (
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded uppercase font-semibold bg-signalLime/15 border border-signalLime/30 text-signalLime">
                      {currentData.status}
                    </span>
                  ) : (
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded uppercase font-medium bg-warmPaper/10 border border-warmPaper/15 text-warmPaper/70">
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
