import React from 'react';
import { Calendar, Users, ArrowRightLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

/**
 * HeroProductPreview: Rich, restrained ClubRelay workspace preview layered into the hero scene.
 * Clearly illustrative and authentic to real application capabilities with clean light surface styling.
 */
export function HeroProductPreview() {
  return (
    <div className="w-full max-w-lg mx-auto lg:max-w-none rounded-2xl bg-white/95 backdrop-blur-xl border border-border shadow-[0_20px_50px_-15px_rgba(25,43,66,0.12)] p-4 sm:p-5 text-ink select-none">
      {/* Cockpit Window Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs font-display font-semibold text-ink/70 ml-2">
            Pacific Coast University · Engineering Society
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-[10px] font-bold text-brand-600">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
          <span>Active Term · Spring 2026</span>
        </div>
      </div>

      {/* Two Column Cockpit Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Widget 1: Upcoming Major Event Execution */}
        <div className="p-3 rounded-xl bg-subtle/80 border border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-ink/60">
                Next Milestone
              </span>
              <span className="text-[9px] font-bold text-brand-700 bg-brand-100/70 px-2 py-0.5 rounded-full border border-brand-200">
                Phase 4 of 7
              </span>
            </div>
            <div className="font-display font-bold text-sm text-ink mb-1">
              DevFest 2026 Summit
            </div>
            <div className="text-[11px] text-ink/70 flex items-center gap-1.5 mb-2 font-sans">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              <span>Oct 24 · CS Auditorium</span>
            </div>
          </div>
          <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
            <span className="text-ink/60 font-medium">Budget Approved</span>
            <span className="font-bold text-ink">$1,200</span>
          </div>
        </div>

        {/* Widget 2: Succession & Continuity Health */}
        <div className="p-3 rounded-xl bg-subtle/80 border border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-ink/60">
                Continuity Readiness
              </span>
              <span className="text-[9px] font-bold text-mint-700 bg-mint-100/70 px-2 py-0.5 rounded-full border border-mint-200">
                7 of 7 Ready
              </span>
            </div>
            <div className="font-display font-bold text-sm text-ink mb-1">
              Annual Executive Relay
            </div>
            <div className="text-[11px] text-ink/70 flex items-center gap-1.5 mb-2 font-sans">
              <ArrowRightLeft className="w-3.5 h-3.5 text-mint-600" />
              <span>Outgoing Lead → Incoming Lead</span>
            </div>
          </div>
          <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
            <span className="text-ink/60 font-medium">Dossier Status</span>
            <span className="font-bold text-mint-700 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-mint-600" /> Ready
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Mini Roster Bar */}
      <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center justify-between text-[11px] text-ink/65 gap-2 font-medium">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-brand-600" />
          <span>24 Active Officers & Leads</span>
        </div>
        <div className="flex items-center gap-1.5 text-ink/80">
          <ShieldCheck className="w-3.5 h-3.5 text-mint-600" />
          <span>Faculty oversight verified</span>
        </div>
      </div>
    </div>
  );
}

export default HeroProductPreview;
