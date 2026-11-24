import React from 'react';
import { ArrowRight, CheckCircle2, FileText, Users, DollarSign, Database, ShieldCheck, Key } from 'lucide-react';

/**
 * ContinuityTimeline: Signature visual transfer showing outgoing leaders passing organized knowledge
 * to incoming leaders through the continuous Relay Engine nexus.
 * Rendered with clean canvas surfaces, ink typography, and Electric Blue / Fresh Mint accents.
 */
export function ContinuityTimeline() {
  const artifacts = [
    { label: 'Role Responsibilities', icon: Users, color: 'text-brand-600' },
    { label: 'Event Playbooks & SOPs', icon: FileText, color: 'text-mint-700' },
    { label: 'Faculty Approved Budgets', icon: DollarSign, color: 'text-sunshine-600' },
    { label: 'Knowledge Vault SOPs', icon: Database, color: 'text-ink-700' },
    { label: 'Admin Key Handoff', icon: Key, color: 'text-brand-600' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 sm:p-10 rounded-3xl bg-surface border border-border shadow-sm relative overflow-hidden select-none">
      {/* Background Animated Beams */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        viewBox="0 0 800 360"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M 120 180 C 260 80 540 80 680 180"
          stroke="#E5E9E8"
          strokeWidth="2"
        />
        <path
          d="M 120 180 C 260 80 540 80 680 180"
          stroke="#315BDB"
          strokeWidth="2.5"
          className="animate-beam-path"
        />
        <path
          d="M 120 180 C 260 280 540 280 680 180"
          stroke="#E5E9E8"
          strokeWidth="2"
        />
        <path
          d="M 120 180 C 260 280 540 280 680 180"
          stroke="#2CBF9B"
          strokeWidth="2.5"
          className="animate-beam-path"
        />
      </svg>

      {/* Main 3-Stage Continuity Flow */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
        {/* Stage 1: Outgoing Leadership Cohort (Left) */}
        <div className="md:col-span-4 p-5 rounded-2xl bg-subtle/70 border border-border flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-white border border-brand-200/80 flex items-center justify-center mb-3 text-brand-600 shadow-2xs">
            <Users className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-display uppercase tracking-widest text-brand-600 font-bold mb-1">
            Outgoing Team
          </span>
          <h4 className="font-display font-bold text-base text-ink mb-1">
            Executive Term 2025–26
          </h4>
          <p className="text-xs text-ink/70 font-sans">
            Compiles 7-section verified handover dossier before term transition.
          </p>
          <div className="mt-4 px-3 py-1 rounded-full bg-white border border-brand-200 text-[10px] text-brand-700 font-semibold flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3 h-3 text-brand-600" />
            <span>Full term archive verified</span>
          </div>
        </div>

        {/* Stage 2: Central Organized Knowledge Nexus (Center) */}
        <div className="md:col-span-4 flex flex-col items-center text-center">
          <div className="relative mb-3">
            {/* Pulsing Relay Hub */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-100 via-mint-100 to-white border-2 border-brand-600 flex items-center justify-center shadow-[0_0_25px_rgba(49,91,219,0.2)]">
              <ShieldCheck className="w-9 h-9 text-brand-600" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-brand-600 text-white font-bold text-[10px] flex items-center justify-center shadow">
              7
            </span>
          </div>
          <span className="text-[11px] font-display uppercase tracking-widest text-brand-600 font-bold mb-1">
            The Relay Baton
          </span>
          <h5 className="font-display font-bold text-sm text-ink mb-2">
            Organized Knowledge
          </h5>

          {/* Staggered Transfer Badges */}
          <div className="w-full space-y-1.5 max-w-[220px]">
            {artifacts.slice(0, 3).map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="px-2.5 py-1 rounded-lg bg-white border border-border text-[10px] text-ink/80 flex items-center gap-2 shadow-2xs"
                >
                  <Icon className={`w-3.5 h-3.5 ${item.color} flex-shrink-0`} />
                  <span className="truncate">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage 3: Incoming Leadership Cohort (Right) */}
        <div className="md:col-span-4 p-5 rounded-2xl bg-subtle/70 border border-border flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-white border border-mint-200/80 flex items-center justify-center mb-3 text-mint-700 shadow-2xs">
            <Users className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-display uppercase tracking-widest text-mint-700 font-bold mb-1">
            Incoming Team
          </span>
          <h4 className="font-display font-bold text-base text-ink mb-1">
            Executive Term 2026–27
          </h4>
          <p className="text-xs text-ink/70 font-sans">
            Inherits established playbooks, vendor pipelines, and repositories on day one.
          </p>
          <div className="mt-4 px-3 py-1 rounded-full bg-white border border-mint-200 text-[10px] text-mint-700 font-semibold flex items-center gap-1.5 shadow-2xs">
            <ArrowRight className="w-3 h-3 text-mint-600" />
            <span>Zero-loss semester kickoff</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContinuityTimeline;
