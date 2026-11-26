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
      className="py-24 sm:py-32 bg-canvas text-ink select-none relative overflow-hidden"
    >
      {/* Anchor alias for backwards compatibility */}
      <div id="continuity" className="sr-only" />

      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-brand-500/10 via-mint-500/10 to-transparent blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Editorial Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-xs font-display font-semibold text-brand-600 mb-4">
            <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
            <span>Campus Succession & Continuity</span>
          </div>

          <h2 className="text-display-section text-ink">
            The next team shouldn’t have to{' '}
            <span className="text-brand-600 font-extrabold">start from zero.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-ink/75 leading-relaxed font-sans max-w-2xl mx-auto">
            Good clubs don’t start from zero.{' '}
            <span className="text-ink font-semibold">They pick up where the last team left off.</span>
          </p>
        </div>

        {/* Central Visual Transfer Timeline */}
        <div className="mb-16">
          <ContinuityTimeline />
        </div>

        {/* 4 Pillars of Continuity & Relay Mascot Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8 border-t border-border">
          {/* Left: 4 Continuity Features (8 cols) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-5 rounded-2xl bg-surface border border-border shadow-2xs hover:border-brand-200 hover:shadow-xs transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-subtle text-brand-600 flex items-center justify-center mb-3 border border-border">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-sm text-ink mb-1.5">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-ink/70 leading-relaxed font-sans">
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
              className="w-full max-w-sm p-6 rounded-3xl bg-surface border border-border shadow-sm flex flex-col items-center relative overflow-hidden"
            >
              <div className="w-full flex items-center justify-between pb-3 border-b border-border mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />
                  <span className="text-xs font-display font-bold text-ink">Relay Companion</span>
                </div>
                <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                  Continuity Companion
                </span>
              </div>

              {/* Vector Relay Mascot with scoped pointer interaction */}
              <div className="py-2 flex items-center justify-center">
                <RelayMascot size="lg" interactive={true} containerRef={stageRef} />
              </div>

              <p className="text-[11px] text-ink/70 text-center mt-4 font-sans">
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
