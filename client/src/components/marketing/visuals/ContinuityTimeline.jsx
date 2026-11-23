import React from 'react';
import { ArrowRight, CheckCircle2, FileText, Users, DollarSign, Database, ShieldCheck, Key } from 'lucide-react';

/**
 * ContinuityTimeline: Signature visual transfer showing outgoing leaders passing organized knowledge
 * to incoming leaders through the continuous Relay Engine nexus.
 * Inspired by Magic UI Animated Beam with bespoke SVG path animation.
 */
export function ContinuityTimeline() {
  const artifacts = [
    { label: 'Role Responsibilities', icon: Users, color: 'text-signalLime' },
    { label: 'Event Playbooks & SOPs', icon: FileText, color: 'text-oxidisedMint' },
    { label: 'Faculty Approved Budgets', icon: DollarSign, color: 'text-amberGold-500' },
    { label: 'Knowledge Vault SOPs', icon: Database, color: 'text-lightSand' },
    { label: 'Admin Key Handoff', icon: Key, color: 'text-warmCopper' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 sm:p-10 rounded-3xl bg-midnight-card border border-midnight-borderLight shadow-2xl relative overflow-hidden select-none">
      {/* Background Animated Beams */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        viewBox="0 0 800 360"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M 120 180 C 260 80 540 80 680 180"
          stroke="#2F4339"
          strokeWidth="2"
        />
        <path
          d="M 120 180 C 260 80 540 80 680 180"
          stroke="#D4EE79"
          strokeWidth="2.5"
          className="animate-beam-path"
        />
        <path
          d="M 120 180 C 260 280 540 280 680 180"
          stroke="#2F4339"
          strokeWidth="2"
        />
        <path
          d="M 120 180 C 260 280 540 280 680 180"
          stroke="#82C9AE"
          strokeWidth="2.5"
          className="animate-beam-path"
        />
      </svg>

      {/* Main 3-Stage Continuity Flow */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
        {/* Stage 1: Outgoing Leadership Cohort (Left) */}
        <div className="md:col-span-4 p-5 rounded-2xl bg-midnight-surface border border-midnight-border flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-midnight-forest border border-oxidisedMint/40 flex items-center justify-center mb-3 text-oxidisedMint shadow-md">
            <Users className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-display uppercase tracking-widest text-oxidisedMint font-bold mb-1">
            Outgoing Team
          </span>
          <h4 className="font-display font-bold text-base text-lightSand mb-1">
            Executive Term 2025–26
          </h4>
          <p className="text-xs text-mutedSage">
            Compiles 7-section verified handover dossier before term transition.
          </p>
          <div className="mt-4 px-3 py-1 rounded-full bg-midnight-card border border-oxidisedMint/30 text-[10px] text-oxidisedMint font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>Full term archive verified</span>
          </div>
        </div>

        {/* Stage 2: Central Organized Knowledge Nexus (Center) */}
        <div className="md:col-span-4 flex flex-col items-center text-center">
          <div className="relative mb-3">
            {/* Pulsing Relay Hub */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-signalLime/20 via-oxidisedMint/30 to-midnight-forest border-2 border-signalLime flex items-center justify-center shadow-[0_0_35px_rgba(212,238,121,0.3)]">
              <ShieldCheck className="w-9 h-9 text-signalLime" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-signalLime text-midnight-workshop font-bold text-[10px] flex items-center justify-center shadow">
              7
            </span>
          </div>
          <span className="text-[11px] font-display uppercase tracking-widest text-signalLime font-bold mb-1">
            The Relay Baton
          </span>
          <h5 className="font-display font-bold text-sm text-lightSand mb-2">
            Organized Knowledge
          </h5>

          {/* Staggered Transfer Badges */}
          <div className="w-full space-y-1.5 max-w-[220px]">
            {artifacts.slice(0, 3).map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="px-2.5 py-1 rounded-lg bg-midnight-surface/80 border border-midnight-border text-[10px] text-lightSand/90 flex items-center gap-2"
                >
                  <Icon className={`w-3.5 h-3.5 ${item.color} flex-shrink-0`} />
                  <span className="truncate">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage 3: Incoming Leadership Cohort (Right) */}
        <div className="md:col-span-4 p-5 rounded-2xl bg-midnight-surface border border-midnight-border flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-midnight-forest border border-signalLime/40 flex items-center justify-center mb-3 text-signalLime shadow-md">
            <Users className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-display uppercase tracking-widest text-signalLime font-bold mb-1">
            Incoming Team
          </span>
          <h4 className="font-display font-bold text-base text-lightSand mb-1">
            Executive Term 2026–27
          </h4>
          <p className="text-xs text-mutedSage">
            Inherits established playbooks, vendor pipelines, and repositories on day one.
          </p>
          <div className="mt-4 px-3 py-1 rounded-full bg-signalLime/10 border border-signalLime/30 text-[10px] text-signalLime font-semibold flex items-center gap-1.5">
            <ArrowRight className="w-3 h-3" />
            <span>Zero-loss semester kickoff</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContinuityTimeline;
