import React from 'react';
import { ArrowRight, CheckCircle2, Sparkles, Layers, ShieldCheck } from 'lucide-react';

/**
 * HowItWorksSection: Connected 3-step sequence.
 * 01 — Organise: Build your club structure and bring your people together.
 * 02 — Build & Execute: Plan events, coordinate work and manage projects.
 * 03 — Pass it forward: Preserve knowledge and prepare the next leadership team.
 */
export function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Organise',
      tagline: 'Set up your club, leadership and members',
      desc: 'Centralize your active roster, configure executive roles, and establish term boundaries with complete privacy safeguards.',
      highlight: 'Roster & Board Formation',
    },
    {
      num: '02',
      title: 'Build & Execute',
      tagline: 'Run events, manage tasks and coordinate projects',
      desc: 'Orchestrate workshops with a 7-stage stepper, coordinate sub-team Kanban boards, and track faculty budget approvals in real time.',
      highlight: 'Events & Project Flight Deck',
    },
    {
      num: '03',
      title: 'Pass it forward',
      tagline: 'Preserve knowledge and hand over responsibilities',
      desc: 'Compile the 7-section succession dossier, lock in vendor contracts and playbooks, and complete the atomic role transfer with faculty sign-off.',
      highlight: 'Atomic Succession Relay',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-canvas text-ink select-none relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-xs font-display font-semibold text-brand-600 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Three step continuity journey</span>
          </div>

          <h2 className="text-display-section text-ink">
            How ClubRelay keeps the momentum
          </h2>

          <p className="mt-4 text-base text-ink/75 leading-relaxed font-sans max-w-2xl mx-auto">
            From your first semester kickoff to the final leadership handover ceremony, your achievements stay preserved.
          </p>
        </div>

        {/* 3 Step Connected Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className="p-7 rounded-3xl bg-surface border border-border shadow-sm flex flex-col justify-between hover:border-brand-300 hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="font-display text-3xl font-extrabold text-brand-600">
                    {step.num}
                  </span>
                  <span className="text-[10px] font-bold text-mint-700 bg-mint-50 px-2.5 py-0.5 rounded-full border border-mint-200">
                    {step.highlight}
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-2xl text-ink mb-1.5">
                  {step.title}
                </h3>
                <p className="text-xs font-semibold text-brand-600 mb-3 font-display">
                  {step.tagline}
                </p>
                <p className="text-xs text-ink/75 leading-relaxed font-sans">
                  {step.desc}
                </p>
              </div>

              <div className="pt-5 mt-6 border-t border-border flex items-center justify-between text-xs text-ink/65">
                <span className="font-medium text-ink">Phase {idx + 1} of 3</span>
                <span className="text-brand-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Flow
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
