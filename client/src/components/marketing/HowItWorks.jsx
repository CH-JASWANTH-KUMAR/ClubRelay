import React from 'react';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export function HowItWorks() {
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
    <section id="how-it-works" className="py-20 md:py-28 bg-surface border-y border-border select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200 inline-block mb-2">
            Three step continuity journey
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight">
            How ClubRelay keeps the momentum
          </h2>
          <p className="text-sm sm:text-base text-mutedSlate leading-relaxed font-sans">
            From your first semester kickoff to the final leadership handover ceremony, your achievements stay preserved.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className="p-7 rounded-3xl bg-canvas border border-border shadow-subtle flex flex-col justify-between relative hover:border-brand-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-heading text-3xl font-extrabold text-brand-500">
                    {step.num}
                  </span>
                  <span className="text-[10px] font-bold text-mint-700 bg-mint-50 px-2.5 py-0.5 rounded-full border border-mint-200">
                    {step.highlight}
                  </span>
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-ink mb-1">
                  {step.title}
                </h3>
                <p className="text-xs font-bold text-brand-600 mb-3">
                  {step.tagline}
                </p>
                <p className="text-xs text-mutedSlate leading-relaxed font-sans">
                  {step.desc}
                </p>
              </div>

              <div className="pt-5 mt-6 border-t border-border flex items-center justify-between text-xs text-mutedSlate">
                <span className="font-semibold text-ink">Phase {idx + 1} of 3</span>
                <span className="text-mint-600 font-bold">✓ Verified Flow</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
