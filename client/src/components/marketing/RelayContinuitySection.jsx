import React, { useRef } from 'react';
import { RelayMascot } from '../brand/RelayMascot';
import { CheckCircle2, ShieldCheck, ArrowRightLeft, BookOpen, Users } from 'lucide-react';

/**
 * RelayContinuitySection: The dedicated home for the Relay Mascot.
 * "Good clubs don't start from zero. They pick up where the last team left off."
 * Features scoped pointer tracking within the mascot area, obeying strict boundary & reduced-motion rules.
 */
export function RelayContinuitySection() {
  const sectionRef = useRef(null);
  const mascotStageRef = useRef(null);

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
      ref={sectionRef}
      id="continuity"
      className="py-20 md:py-28 bg-canvas border-t border-border select-none relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Continuity Storytelling */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint-50 border border-mint-200 text-xs font-semibold text-mint-700">
              <span className="w-2 h-2 rounded-full bg-mint-500 animate-pulse" />
              <span>Campus Succession & Continuity</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight leading-[1.15]">
              Good clubs don’t start from zero.{' '}
              <span className="text-brand-500">They pick up where the last team left off.</span>
            </h2>

            <p className="text-sm sm:text-base text-mutedSlate leading-relaxed max-w-2xl font-sans">
              Senior leaders spend years discovering venue contacts, sponsor pipelines, and operational playbooks.
              ClubRelay turns annual leadership transitions into an advantage so incoming teams execute on day one.
            </p>

            {/* 4 Pillars of Continuity Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="p-4 rounded-2xl bg-surface border border-border shadow-subtle hover:border-brand-300 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-2.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-heading font-bold text-xs text-ink mb-1">
                      {pillar.title}
                    </h3>
                    <p className="text-[11px] text-mutedSlate leading-normal">
                      {pillar.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Dedicated Relay Mascot Interactive Stage */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div
              ref={mascotStageRef}
              className="w-full max-w-md p-8 rounded-3xl bg-surface border border-border shadow-elevated flex flex-col items-center relative overflow-hidden"
            >
              {/* Status Header */}
              <div className="w-full flex items-center justify-between pb-4 border-b border-border mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-mint-500" />
                  <span className="text-xs font-bold text-ink">Relay Companion</span>
                </div>
                <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                  Continuity Guardian
                </span>
              </div>

              {/* The Relay Mascot with Scoped Pointer Tracking */}
              <div className="py-4 my-2 relative">
                <RelayMascot size="hero" containerRef={mascotStageRef} />
              </div>

              {/* Character Description */}
              <div className="text-center mt-4 space-y-1">
                <h4 className="font-heading font-extrabold text-base text-ink">
                  Continuity Companion
                </h4>
                <p className="text-xs text-mutedSlate max-w-xs leading-relaxed">
                  Watching over your student community, verifying playbooks, and keeping institutional memory alive.
                </p>
              </div>

              {/* Verified Sign-Off Mini Banner */}
              <div className="w-full mt-6 p-3 rounded-xl bg-mint-50/60 border border-mint-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-mint-600 flex-shrink-0" />
                  <span className="font-semibold text-mint-800 text-[11px]">7 of 7 Sections Verified</span>
                </div>
                <span className="text-[10px] font-bold text-mint-700 bg-mint-100 px-2 py-0.5 rounded-full">
                  HANDOVER READY
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RelayContinuitySection;
