import React, { useRef } from 'react';
import { RelayMascot } from '../../brand/RelayMascot';
import { ContinuityTimeline } from '../visuals/ContinuityTimeline';
import { ShieldCheck, ArrowRightLeft, BookOpen, Users, Sparkles } from 'lucide-react';

/**
 * HandoverStorySection: Signature section of ClubRelay.
 * "The next team shouldn't have to start from zero."
 * Outgoing Leader → Organised Knowledge → Incoming Leader visual transfer with ContinuityTimeline
 * and Relay Mascot companion.
 */
export function HandoverStorySection() {
  const stageRef = useRef(null);

  const pillars = [
    {
      icon: ArrowRightLeft,
      title: '7-Section Successor Dossier',
      desc: 'Governance, open tasks, budget commitments, venue schedules, important documents, sponsor contacts, and strategic lessons learned.',
    },
    {
      icon: ShieldCheck,
      title: 'Atomic Role Handover',
      desc: 'A single verified transaction swaps leadership permissions and archives outgoing officers into alumni advisory roles without permission loss.',
    },
    {
      icon: BookOpen,
      title: 'Institutional Memory Vault',
      desc: 'Compliance SOPs, recurring event playbooks, and vendor contracts remain accessible across graduating cohorts.',
    },
    {
      icon: Users,
      title: 'Formal Faculty Oversight',
      desc: 'Assigned faculty advisors review and digitally sign off on annual succession packages before term promotion.',
    },
  ];

  return (
    <section
      id="handover"
      className="py-24 sm:py-32 bg-midnight-workshop text-lightSand select-none relative overflow-hidden"
    >
      {/* Anchor alias for backwards compatibility */}
      <div id="continuity" className="sr-only" />

      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-radial from-oxidisedMint/10 via-signalLime/5 to-transparent blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Editorial Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-midnight-forest border border-midnight-borderLight text-xs font-display font-semibold text-oxidisedMint mb-4">
            <span className="w-2 h-2 rounded-full bg-oxidisedMint animate-pulse" />
            <span>Campus Succession & Continuity</span>
          </div>

          <h2 className="text-display-section text-lightSand">
            The next team shouldn’t have to{' '}
            <span className="text-signalLime font-extrabold">start from zero.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-mutedSage leading-relaxed font-sans max-w-2xl mx-auto">
            Good clubs don’t start from zero.{' '}
            <span className="text-lightSand font-medium">They pick up where the last team left off.</span>
          </p>
        </div>

        {/* Central Visual Transfer Timeline */}
        <div className="mb-16">
          <ContinuityTimeline />
        </div>

        {/* 4 Pillars of Continuity & Relay Mascot Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8 border-t border-midnight-border">
          {/* Left: 4 Continuity Features (8 cols) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-5 rounded-2xl bg-midnight-forest/80 border border-midnight-border hover:border-oxidisedMint/40 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-midnight-card text-signalLime flex items-center justify-center mb-3 border border-midnight-borderLight">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-sm text-lightSand mb-1.5">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-mutedSage leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right: Relay Mascot Companion Stage (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center">
            <div
              ref={stageRef}
              className="w-full max-w-sm p-6 rounded-3xl bg-midnight-forest border border-midnight-borderLight shadow-2xl flex flex-col items-center relative overflow-hidden"
            >
              <div className="w-full flex items-center justify-between pb-3 border-b border-midnight-border mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-signalLime" />
                  <span className="text-xs font-display font-bold text-lightSand">Relay Companion</span>
                </div>
                <span className="text-[10px] font-semibold text-signalLime bg-signalLime/15 px-2.5 py-0.5 rounded-full border border-signalLime/30">
                  Continuity Companion
                </span>
              </div>

              {/* Vector Relay Mascot with scoped pointer interaction */}
              <div className="py-2 flex items-center justify-center">
                <RelayMascot size="lg" interactive={true} containerRef={stageRef} />
              </div>

              <p className="text-[11px] text-mutedSage text-center mt-4">
                "Preserve every playbook, sponsor email, and technical diagram for whoever takes the baton next."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HandoverStorySection;
