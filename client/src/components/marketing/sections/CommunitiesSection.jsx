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
      accent: 'text-signalLime border-signalLime/30',
      tag: 'Code & Workshops',
    },
    {
      name: 'Coding Clubs',
      sub: 'Competitive programming cohorts, algorithm reading groups, and hackathon teams.',
      icon: Code2,
      accent: 'text-oxidisedMint border-oxidisedMint/30',
      tag: 'Competitive & Hackathons',
    },
    {
      name: 'Robotics & Hardware Labs',
      sub: 'Microcontroller sprints, hardware builds, and equipment hold tracking.',
      icon: Cpu,
      accent: 'text-warmCopper border-warmCopper/30',
      tag: 'Hardware & Lab Custody',
    },
    {
      name: 'AI & Data Science Guilds',
      sub: 'Machine learning cohorts, model training reading groups, and research teams.',
      icon: Brain,
      accent: 'text-signalLime border-signalLime/30',
      tag: 'Research & Compute',
    },
    {
      name: 'Cloud & Cyber Security',
      sub: 'Capture-the-flag teams, security clinics, and sandbox infrastructure.',
      icon: Cloud,
      accent: 'text-oxidisedMint border-oxidisedMint/30',
      tag: 'CTF & Security Labs',
    },
    {
      name: 'Entrepreneurship Communities',
      sub: 'Pitch decks, founder speaker sessions, demo days, and venture pipelines.',
      icon: Rocket,
      accent: 'text-warmCopper border-warmCopper/30',
      tag: 'Venture & Pitch Days',
    },
    {
      name: 'Technical Societies',
      sub: 'Multi-disciplinary engineering societies, symposiums, and faculty seminars.',
      icon: Palette,
      accent: 'text-lightSand border-midnight-borderLight',
      tag: 'Symposiums & Keynotes',
    },
    {
      name: 'Student Councils & Governance',
      sub: 'Student body councils, faculty oversight, and cross-club policy alignments.',
      icon: ShieldCheck,
      accent: 'text-oxidisedMint border-oxidisedMint/30',
      tag: 'Governance & Charters',
    },
  ];

  return (
    <section id="communities" className="py-24 sm:py-32 bg-midnight-forest text-lightSand select-none relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-midnight-card border border-midnight-border text-xs font-display font-semibold text-oxidisedMint mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Ecosystem</span>
          </div>

          <h2 className="text-display-section text-lightSand">
            One platform.{' '}
            <span className="text-signalLime font-extrabold">Different kinds of communities.</span>
          </h2>

          <p className="mt-4 text-base text-mutedSage leading-relaxed font-sans max-w-2xl mx-auto">
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
                className="p-5 rounded-2xl bg-midnight-card border border-midnight-border hover:border-midnight-borderLight transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-midnight-surface border ${comm.accent} flex items-center justify-center transition-transform group-hover:scale-105`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono text-mutedSage uppercase tracking-wider">
                      {comm.tag}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-sm text-lightSand mb-2">
                    {comm.name}
                  </h3>
                  <p className="text-xs text-mutedSage leading-relaxed">
                    {comm.sub}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-midnight-border/60 flex items-center justify-between text-[11px] text-mutedSage">
                  <span>Role Handover Ready</span>
                  <span className="text-oxidisedMint">✓ Supported</span>
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
