import React from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert, History, FolderKanban } from 'lucide-react';

export function ProblemSection() {
  const problems = [
    {
      title: 'The Leadership Amnesia',
      desc: 'Important drive folders, password vaults, and agreements disappear the moment senior officers graduate.',
      impact: 'New leaders start from zero every single year.',
      icon: History,
      color: 'bg-coral-50 text-coral-600 border-coral-200',
    },
    {
      title: 'Tool Fragmentation Sprawl',
      desc: 'Budgets live in personal spreadsheets, tasks in WhatsApp group chats, and attendees in disconnected forms.',
      impact: 'Critical decisions are scattered across personal inboxes.',
      icon: FolderKanban,
      color: 'bg-sunshine-50 text-sunshine-700 border-sunshine-200',
    },
    {
      title: 'Orphaned Technical Projects',
      desc: 'Hackathon portals and community open-source repos sit abandoned without clear maintainer handoffs.',
      impact: 'Software built with university effort gets abandoned.',
      icon: ShieldAlert,
      color: 'bg-brand-50 text-brand-600 border-brand-200',
    },
    {
      title: 'Vanished Partner Networks',
      desc: 'Sponsor contacts, venue pricing, and keynote connections evaporate when outgoing teams step down.',
      impact: 'Valuable industry bridges must be rebuilt repeatedly.',
      icon: AlertCircle,
      color: 'bg-ink-50 text-ink-700 border-ink-200',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-surface border-y border-border select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-semibold text-coral-700 bg-coral-50 px-2.5 py-1 rounded-full border border-coral-200 inline-block mb-3">
            The student club dilemma
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            The semester ends. The work shouldn’t.
          </h2>
          <p className="text-sm sm:text-base text-mutedSlate leading-relaxed">
            Every academic term, incredible university clubs lose their momentum due to chaotic leadership
            handovers and fragmented personal tools.
          </p>
        </div>

        {/* 4 Failure Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((prob) => {
            const Icon = prob.icon;
            return (
              <div
                key={prob.title}
                className="p-5 rounded-2xl bg-canvas border border-border shadow-subtle flex flex-col justify-between"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${prob.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-ink mb-1.5">
                    {prob.title}
                  </h3>
                  <p className="text-xs text-mutedSlate leading-relaxed mb-4">
                    {prob.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-border text-[11px] font-semibold text-coral-600">
                  {prob.impact}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contrast Banner: Without vs With ClubRelay */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-canvas via-subtle to-surface border border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-heading font-bold text-base text-ink">
              Turn annual leadership transitions into an advantage
            </h4>
            <p className="text-xs text-mutedSlate max-w-xl">
              ClubRelay preserves institutional memory, verified SOPs, and atomic executive succession so each incoming batch starts ahead.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-mint-700 bg-mint-50 px-3.5 py-2 rounded-xl border border-mint-200 flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-mint-600" />
            <span>Built for Campus Continuity</span>
          </div>
        </div>
      </div>
    </section>
  );
}
