import React from 'react';
import { Calendar, Users, ArrowRightLeft, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

/**
 * HeroProductPreview: Rich, restrained ClubRelay workspace preview layered into the hero scene.
 * Clearly illustrative and authentic to real application capabilities.
 */
export function HeroProductPreview() {
  return (
    <div className="w-full max-w-lg mx-auto lg:max-w-none rounded-2xl bg-[#16221C]/85 backdrop-blur-xl border border-[#2F4339]/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] p-4 sm:p-5 text-lightSand select-none">
      {/* Cockpit Window Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#23322A]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
          </div>
          <span className="text-xs font-display font-medium text-lightSand/70 ml-2">
            Pacific Coast University · Engineering Society
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-midnight-forest border border-oxidisedMint/30 text-[10px] font-semibold text-oxidisedMint">
          <span className="w-1.5 h-1.5 rounded-full bg-oxidisedMint animate-pulse" />
          <span>Active Term · Spring 2026</span>
        </div>
      </div>

      {/* Two Column Cockpit Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Widget 1: Upcoming Major Event Execution */}
        <div className="p-3 rounded-xl bg-midnight-card border border-midnight-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-mutedSage">
                Next Milestone
              </span>
              <span className="text-[9px] font-semibold text-signalLime bg-signalLime/10 px-2 py-0.5 rounded-full border border-signalLime/20">
                Phase 4 of 7
              </span>
            </div>
            <div className="font-display font-bold text-sm text-lightSand mb-1">
              DevFest 2026 Summit
            </div>
            <div className="text-[11px] text-mutedSage flex items-center gap-1.5 mb-2">
              <Calendar className="w-3.5 h-3.5 text-oxidisedMint" />
              <span>Oct 24 · CS Auditorium</span>
            </div>
          </div>
          <div className="pt-2 border-t border-midnight-border/80 flex items-center justify-between text-[11px]">
            <span className="text-mutedSage">Budget Approved</span>
            <span className="font-semibold text-lightSand">$1,200</span>
          </div>
        </div>

        {/* Widget 2: Succession & Continuity Health */}
        <div className="p-3 rounded-xl bg-midnight-card border border-midnight-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-mutedSage">
                Continuity Readiness
              </span>
              <span className="text-[9px] font-semibold text-oxidisedMint bg-oxidisedMint/10 px-2 py-0.5 rounded-full border border-oxidisedMint/20">
                7 of 7 Ready
              </span>
            </div>
            <div className="font-display font-bold text-sm text-lightSand mb-1">
              Annual Executive Relay
            </div>
            <div className="text-[11px] text-mutedSage flex items-center gap-1.5 mb-2">
              <ArrowRightLeft className="w-3.5 h-3.5 text-signalLime" />
              <span>Outgoing Lead → Incoming Lead</span>
            </div>
          </div>
          <div className="pt-2 border-t border-midnight-border/80 flex items-center justify-between text-[11px]">
            <span className="text-mutedSage">Dossier Status</span>
            <span className="font-semibold text-signalLime flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ready
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Mini Roster Bar */}
      <div className="mt-3 pt-3 border-t border-[#23322A] flex flex-wrap items-center justify-between text-[11px] text-mutedSage gap-2">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-oxidisedMint" />
          <span>24 Active Officers & Leads</span>
        </div>
        <div className="flex items-center gap-1.5 text-lightSand/70">
          <ShieldCheck className="w-3.5 h-3.5 text-signalLime" />
          <span>Faculty oversight verified</span>
        </div>
      </div>
    </div>
  );
}

export default HeroProductPreview;
