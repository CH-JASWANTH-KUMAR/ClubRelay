import React from 'react';
import {
  Code2,
  Cpu,
  Brain,
  Cloud,
  Rocket,
  ShieldCheck,
  Palette,
  Terminal,
} from 'lucide-react';

export function CampusCommunities() {
  const communities = [
    {
      name: 'Developer Communities',
      desc: 'Google Developer Groups, ACM chapters, code sprints, and technical workshops.',
      icon: Terminal,
      color: 'bg-brand-50 text-brand-600 border-brand-200',
    },
    {
      name: 'Coding Clubs',
      desc: 'Competitive programming cohorts, algorithm reading groups, and hackathon teams.',
      icon: Code2,
      color: 'bg-mint-50 text-mint-600 border-mint-200',
    },
    {
      name: 'Robotics & Hardware Labs',
      desc: 'IEEE student branches, microcontroller sprints, robot wars and equipment holds.',
      icon: Cpu,
      color: 'bg-coral-50 text-coral-600 border-coral-200',
    },
    {
      name: 'AI & Data Science Guilds',
      desc: 'Machine learning cohorts, model training reading groups and Kaggle teams.',
      icon: Brain,
      color: 'bg-sunshine-50 text-sunshine-700 border-sunshine-200',
    },
    {
      name: 'Cloud & Cyber Security',
      desc: 'Capture-the-flag competitions, cloud lab permits and vulnerability clinics.',
      icon: Cloud,
      color: 'bg-ink-50 text-ink-700 border-ink-200',
    },
    {
      name: 'Entrepreneurship Cells',
      desc: 'Pitch decks, founder speaker sessions, demo days and student venture pipelines.',
      icon: Rocket,
      color: 'bg-coral-50 text-coral-600 border-coral-200',
    },
    {
      name: 'Technical Societies',
      desc: 'Multi-disciplinary engineering societies, symposiums, and faculty research seminars.',
      icon: Palette,
      color: 'bg-brand-50 text-brand-600 border-brand-200',
    },
    {
      name: 'Student Councils & Governance',
      desc: 'Student body councils, faculty oversight and cross-club policy alignments.',
      icon: ShieldCheck,
      color: 'bg-mint-50 text-mint-600 border-mint-200',
    },
  ];

  return (
    <section id="communities" className="py-20 md:py-28 bg-canvas select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200 inline-block mb-2">
            Campus Ecosystem
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight">
            Built for collegiate tech culture.
          </h2>
          <p className="text-sm sm:text-base text-mutedSlate leading-relaxed font-sans">
            Engineered for student-led developer communities, robotics teams, hackathon guilds, and campus societies.
          </p>
        </div>

        {/* Featured Communities Visual Banner */}
        <div className="mb-12 rounded-3xl overflow-hidden border border-border bg-surface p-3 shadow-subtle max-w-4xl mx-auto">
          <img
            src="/assets/images/tech-communities-visual.svg"
            alt="Collegiate Tech Culture Communities Workbench"
            className="w-full h-auto object-contain rounded-2xl"
            fetchpriority="high"
          />
        </div>

        {/* 8 Community Ecosystem Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {communities.map((comm) => {
            const Icon = comm.icon;
            return (
              <div
                key={comm.name}
                className="p-5 rounded-2xl bg-surface border border-border shadow-subtle hover:border-brand-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3.5 ${comm.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-heading font-bold text-sm text-ink mb-1">
                    {comm.name}
                  </h3>
                  <p className="text-xs text-mutedSlate leading-relaxed font-sans">
                    {comm.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CampusCommunities;
