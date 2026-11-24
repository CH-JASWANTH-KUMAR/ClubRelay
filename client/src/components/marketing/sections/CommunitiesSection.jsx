import React from 'react';
import { Terminal, Code2, Cpu, Brain, Cloud, Rocket, Palette, ShieldCheck, Sparkles } from 'lucide-react';

/**
 * CommunitiesSection: Built for different campus communities.
 * Shows Developer Collectives, Robotics, Academic/Research, AI, Cloud, Entrepreneurship, etc.
 * Avoids fabricated partner logos or unsupported endorsement claims.
 */
export function CommunitiesSection() {
  const communities = [
    {
      name: 'Developer Communities',
      sub: 'Developer chapters, open-source cohorts, and technical workshops.',
      icon: Terminal,
      accent: 'text-brand-600 border-brand-200',
      tag: 'Code & Workshops',
    },
    {
      name: 'Coding Clubs',
      sub: 'Competitive programming cohorts, algorithm reading groups, and hackathon teams.',
      icon: Code2,
      accent: 'text-mint-700 border-mint-200',
      tag: 'Competitive & Hackathons',
    },
    {
      name: 'Robotics & Hardware Labs',
      sub: 'Microcontroller sprints, hardware builds, and equipment hold tracking.',
      icon: Cpu,
      accent: 'text-brand-700 border-brand-200',
      tag: 'Hardware & Lab Custody',
    },
    {
      name: 'AI & Data Science Guilds',
      sub: 'Machine learning cohorts, model training reading groups, and research teams.',
      icon: Brain,
      accent: 'text-brand-600 border-brand-200',
      tag: 'Research & Compute',
    },
    {
      name: 'Cloud & Cyber Security',
      sub: 'Capture-the-flag teams, security clinics, and sandbox infrastructure.',
      icon: Cloud,
      accent: 'text-mint-700 border-mint-200',
      tag: 'CTF & Security Labs',
    },
    {
      name: 'Entrepreneurship Communities',
      sub: 'Pitch decks, founder speaker sessions, demo days, and venture pipelines.',
      icon: Rocket,
      accent: 'text-sunshine-700 border-sunshine-200',
      tag: 'Venture & Pitch Days',
    },
    {
      name: 'Technical Societies',
      sub: 'Multi-disciplinary engineering societies, symposiums, and faculty seminars.',
      icon: Palette,
      accent: 'text-ink border-border',
      tag: 'Symposiums & Keynotes',
    },
    {
      name: 'Student Councils & Governance',
      sub: 'Student body councils, faculty oversight, and cross-club policy alignments.',
      icon: ShieldCheck,
      accent: 'text-mint-700 border-mint-200',
      tag: 'Governance & Charters',
    },
  ];

  return (
    <section id="communities" className="py-24 sm:py-32 bg-subtle/50 text-ink select-none relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-xs font-display font-semibold text-brand-600 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Ecosystem</span>
          </div>

          <h2 className="text-display-section text-ink">
            One platform.{' '}
            <span className="text-brand-600 font-extrabold">Different kinds of communities.</span>
          </h2>

          <p className="mt-4 text-base text-ink/75 leading-relaxed font-sans max-w-2xl mx-auto">
            Built for collegiate tech culture. Engineered for student-led developer communities,
            robotics teams, hackathon guilds, and campus societies.
          </p>
        </div>

        {/* 8 Distinct Community Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {communities.map((comm) => {
            const Icon = comm.icon;
            return (
              <div
                key={comm.name}
                className="p-5 rounded-2xl bg-surface border border-border shadow-2xs hover:border-brand-300 hover:shadow-xs transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-subtle border ${comm.accent} flex items-center justify-center transition-transform group-hover:scale-105`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono text-ink/60 uppercase tracking-wider font-semibold">
                      {comm.tag}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-sm text-ink mb-2">
                    {comm.name}
                  </h3>
                  <p className="text-xs text-ink/70 leading-relaxed font-sans">
                    {comm.sub}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-[11px] text-ink/65 font-medium">
                  <span>Role Handover Ready</span>
                  <span className="text-mint-700 font-semibold">✓ Supported</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CommunitiesSection;
