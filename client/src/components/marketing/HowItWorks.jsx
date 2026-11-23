import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Organise',
      desc: 'Set up your campus student club, designate officer positions, and establish active rosters for the academic term.',
      highlight: 'Roster & Team Formation',
    },
    {
      num: '02',
      title: 'Build & Execute',
      desc: 'Run events through structured lifecycle stages, delegate tasks in personal workspaces, and track technical milestones.',
      highlight: 'Events, Projects & Tasks',
    },
    {
      num: '03',
      title: 'Pass It Forward',
      desc: 'Preserve SOPs, vendor contacts, and strategic playbooks. Execute atomic role transitions with formal digital sign-off.',
      highlight: 'Verified Leadership Handover',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-surface border-y border-border select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200 inline-block mb-3">
            Three step transition
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            How ClubRelay keeps the momentum
          </h2>
          <p className="text-sm sm:text-base text-mutedSlate leading-relaxed">
            From your first semester kickoff to the final leadership transition ceremony, ClubRelay keeps your
            achievements intact.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className="p-6 rounded-3xl bg-canvas border border-border shadow-subtle flex flex-col justify-between relative"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-heading text-3xl font-extrabold text-brand-500">
                    {step.num}
                  </span>
                  <span className="text-[11px] font-semibold text-mint-700 bg-mint-50 px-2.5 py-0.5 rounded-full border border-mint-200">
                    {step.highlight}
                  </span>
                </div>
                <h3 className="font-heading font-extrabold text-xl text-ink mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-mutedSlate leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-ink font-semibold">
                <span>Phase {idx + 1} of 3</span>
                <CheckCircle2 className="w-4 h-4 text-brand-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
