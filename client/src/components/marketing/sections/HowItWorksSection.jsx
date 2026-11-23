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
    <section id="how-it-works" className="py-24 sm:py-32 bg-midnight-workshop text-lightSand select-none relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-midnight-forest border border-midnight-border text-xs font-display font-semibold text-signalLime mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Three step continuity journey</span>
          </div>

          <h2 className="text-display-section text-lightSand">
            How ClubRelay keeps the momentum
          </h2>

          <p className="mt-4 text-base text-mutedSage leading-relaxed font-sans max-w-2xl mx-auto">
            From your first semester kickoff to the final leadership handover ceremony, your achievements stay preserved.
          </p>
        </div>

        {/* 3 Step Connected Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className="p-7 rounded-3xl bg-midnight-forest border border-midnight-borderLight shadow-xl flex flex-col justify-between hover:border-signalLime/40 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="font-display text-3xl font-extrabold text-signalLime">
                    {step.num}
                  </span>
                  <span className="text-[10px] font-bold text-oxidisedMint bg-oxidisedMint/15 px-2.5 py-0.5 rounded-full border border-oxidisedMint/30">
                    {step.highlight}
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-2xl text-lightSand mb-1.5">
                  {step.title}
                </h3>
                <p className="text-xs font-semibold text-oxidisedMint mb-3">
                  {step.tagline}
                </p>
                <p className="text-xs text-mutedSage leading-relaxed font-sans">
                  {step.desc}
                </p>
              </div>

              <div className="pt-5 mt-6 border-t border-midnight-border flex items-center justify-between text-xs text-mutedSage">
                <span className="font-medium text-lightSand">Phase {idx + 1} of 3</span>
                <span className="text-signalLime font-semibold flex items-center gap-1">
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
