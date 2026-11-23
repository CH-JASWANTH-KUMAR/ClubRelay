import React from 'react';
import {
  MessageSquare,
  FolderX,
  UserMinus,
  MailWarning,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';

export function ProblemSection() {
  const painPoints = [
    {
      icon: MessageSquare,
      title: 'Responsibilities vanish in private chats',
      desc: 'Critical event logistics and venue permits get buried in ephemeral group chats that incoming boards never see.',
    },
    {
      icon: UserMinus,
      title: 'Technical maintainers graduate',
      desc: 'Hackathon portals and student-built software sit abandoned with dead repositories and zero credential handoff.',
    },
    {
      icon: MailWarning,
      title: 'Sponsor & alumni contacts get lost',
      desc: 'Industry partnerships and keynote connections stay trapped in personal inboxes of graduating seniors.',
    },
    {
      icon: FolderX,
      title: 'Documentation scatters across drives',
      desc: 'Fragmented spreadsheets, budget receipts, and meeting notes vanish when student Google accounts expire.',
    },
    {
      icon: RotateCcw,
      title: 'New boards start from scratch every year',
      desc: 'Every incoming executive team spends their first four months reinventing the wheel instead of building.',
    },
  ];

  return (
    <section id="problem" className="py-20 md:py-28 bg-surface border-y border-border select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-semibold text-coral-700 bg-coral-50 px-3 py-1 rounded-full border border-coral-200 inline-block mb-2">
            The collegiate leadership cycle
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight">
            The semester ends.{' '}
            <span className="text-coral-500">The knowledge shouldn’t.</span>
          </h2>
          <p className="text-sm sm:text-base text-mutedSlate leading-relaxed font-sans">
            Every academic year, ambitious student communities lose months of hard-earned operational momentum
            due to uncoordinated handovers and tool sprawl.
          </p>
        </div>

        {/* Distinctive Left-to-Right Editorial Transition Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: The Chaos of Fragmented Personal Tools (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-canvas border border-coral-200/80 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-coral-500" />
                <h3 className="font-heading font-extrabold text-lg text-ink">
                  Where context disappears
                </h3>
              </div>

              <div className="space-y-4">
                {painPoints.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-coral-50 text-coral-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-coral-100">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-xs text-ink">{item.title}</h4>
                        <p className="text-[11px] text-mutedSlate leading-normal mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border text-xs font-bold text-coral-600">
              Result: 60% of club institutional knowledge vanishes annually.
            </div>
          </div>

          {/* Center Column: The Transition Bridge (Visual Illustration) (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-brand-50/40 via-canvas to-mint-50/40 border border-brand-200/80 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-mint-500" />
                  <h3 className="font-heading font-extrabold text-lg text-ink">
                    How ClubRelay keeps momentum
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                  INSTITUTIONAL RELAY
                </span>
              </div>

              <p className="text-xs text-mutedSlate mb-6 leading-relaxed">
                By structuring operational playbooks, active member rosters, event approvals, and leadership succession into one campus platform, your club’s work continues across graduating batches.
              </p>

              {/* Vector SVG Graphic */}
              <div className="rounded-2xl overflow-hidden border border-border bg-surface p-2 shadow-subtle">
                <img
                  src="/assets/images/continuity-relay-visual.svg"
                  alt="ClubRelay Continuity Handover Bridge"
                  className="w-full h-auto object-contain rounded-xl"
                  fetchpriority="high"
                />
              </div>
            </div>

            {/* Checklist of Preserved Assets */}
            <div className="mt-6 pt-4 border-t border-border grid grid-cols-2 gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-ink">
                <CheckCircle2 className="w-4 h-4 text-mint-500 flex-shrink-0" />
                <span>Verified 7-Section Dossier</span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-ink">
                <CheckCircle2 className="w-4 h-4 text-mint-500 flex-shrink-0" />
                <span>Persistent Sponsor Directory</span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-ink">
                <CheckCircle2 className="w-4 h-4 text-mint-500 flex-shrink-0" />
                <span>Atomic Leadership Transition</span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-ink">
                <CheckCircle2 className="w-4 h-4 text-mint-500 flex-shrink-0" />
                <span>Faculty Approval Trail</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProblemSection;
