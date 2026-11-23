import React from 'react';
import {
  Users,
  Calendar,
  Code2,
  ArrowRightLeft,
  Sparkles,
  CheckCircle2,
  FileText,
  ShieldCheck,
} from 'lucide-react';

export function BentoFeatures() {
  const pillars = [
    {
      num: 'Pillar 01',
      title: 'Community & Leadership Rosters',
      category: 'Community',
      desc: 'Centralize student membership rosters, assign executive board roles, structure sub-team leads, and maintain privacy-hardened rosters across term boundaries.',
      icon: Users,
      color: 'bg-brand-50 text-brand-600 border-brand-100',
      tag: 'Role-Based Membership',
      tagColor: 'bg-brand-50 text-brand-700 border-brand-200',
      preview: {
        title: 'Google Developer Group',
        sub: '24 Active Members · 4 Officers · Spring 2026',
        badge: 'Technical Society',
      },
    },
    {
      num: 'Pillar 02',
      title: 'Event Execution Cockpit',
      category: 'Operations',
      desc: 'Orchestrate workshops, hackathons, and guest keynotes with a 7-stage lifecycle stepper, faculty approvals, budget variance trackers, and delegation boards.',
      icon: Calendar,
      color: 'bg-mint-50 text-mint-600 border-mint-100',
      tag: '7-Stage Lifecycle Stepper',
      tagColor: 'bg-mint-50 text-mint-700 border-mint-200',
      preview: {
        title: 'DevFest 2026 Summit',
        sub: 'CS Auditorium · Oct 24 · Approved Budget $1,200',
        badge: 'Approved',
      },
    },
    {
      num: 'Pillar 03',
      title: 'Engineering Projects & Repositories',
      category: 'Engineering',
      desc: 'Link GitHub projects, open-source repositories, and technical deliverables directly to club workspaces so code ownership stays alive across graduating batches.',
      icon: Code2,
      color: 'bg-coral-50 text-coral-600 border-coral-100',
      tag: 'Code & Playbook Custody',
      tagColor: 'bg-coral-50 text-coral-700 border-coral-200',
      preview: {
        title: 'Campus Hackathon Portal',
        sub: 'github.com/gdg-pcu/hack-portal · 14 Microservices',
        badge: 'Maintained',
      },
    },
    {
      num: 'Pillar 04',
      title: 'Institutional Memory & Handover',
      category: 'Continuity',
      desc: 'Preserve compliance SOPs, vendor contracts, and meeting decisions in an institutional memory vault. Complete 7-section handovers with atomic role transfers.',
      icon: ArrowRightLeft,
      color: 'bg-sunshine-50 text-sunshine-700 border-sunshine-100',
      tag: 'Atomic Leadership Succession',
      tagColor: 'bg-sunshine-50 text-sunshine-800 border-sunshine-200',
      preview: {
        title: 'Annual Executive Handover',
        sub: 'Outgoing President → Incoming President · 7 Sections',
        badge: 'Ready to Relay',
      },
    },
  ];

  return (
    <section id="product-pillars" className="py-20 md:py-28 bg-canvas select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-xs font-bold text-brand-600">
            <Sparkles className="w-3.5 h-3.5" /> Four pillars of student club momentum
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight">
            Everything your club needs to keep moving.
          </h2>
          <p className="text-sm sm:text-base text-mutedSlate leading-relaxed font-sans">
            Everything student organizations need to build active teams, execute ambitious technical initiatives,
            and guarantee smooth continuity.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="p-7 rounded-3xl bg-surface border border-border shadow-subtle hover:border-brand-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${pillar.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${pillar.tagColor}`}>
                      {pillar.tag}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-brand-600 block mb-1">
                    {pillar.num} · {pillar.category}
                  </span>
                  <h3 className="font-heading font-extrabold text-xl text-ink mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-mutedSlate leading-relaxed mb-6 font-sans">
                    {pillar.desc}
                  </p>
                </div>

                {/* Embedded Live Functional UI Snippet */}
                <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink">{pillar.preview.title}</span>
                    <span className="text-[10px] bg-surface text-ink font-semibold px-2 py-0.5 rounded-full border border-border">
                      {pillar.preview.badge}
                    </span>
                  </div>
                  <div className="text-[11px] text-mutedSlate">
                    {pillar.preview.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default BentoFeatures;
