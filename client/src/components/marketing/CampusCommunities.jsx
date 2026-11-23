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
      name: 'Developer Student Clubs',
      desc: 'Tech talks, code sprints, workshops and community study jams.',
      icon: Terminal,
      color: 'bg-brand-50 text-brand-600 border-brand-200',
    },
    {
      name: 'IEEE & ACM Chapters',
      desc: 'Technical conferences, paper reviews, guest lectures and research seminars.',
      icon: Code2,
      color: 'bg-mint-50 text-mint-600 border-mint-200',
    },
    {
      name: 'Robotics & Hardware Labs',
      desc: 'Maker sprints, micro-controller workshops, robot wars and equipment holds.',
      icon: Cpu,
      color: 'bg-coral-50 text-coral-600 border-coral-200',
    },
    {
      name: 'AI & Data Science Guilds',
      desc: 'Hackathons, model training reading groups and Kaggle cohorts.',
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
      desc: 'Pitch decks, founder speaker sessions, demo days and investor networks.',
      icon: Rocket,
      color: 'bg-coral-50 text-coral-600 border-coral-200',
    },
    {
      name: 'Cultural & Design Societies',
      desc: 'Campus festivals, graphic branding kits, audio-visual stage productions.',
      icon: Palette,
      color: 'bg-brand-50 text-brand-600 border-brand-200',
    },
    {
      name: 'Campus Governance & Councils',
      desc: 'Student body councils, faculty oversight and cross-club policy alignments.',
      icon: ShieldCheck,
      color: 'bg-mint-50 text-mint-600 border-mint-200',
    },
  ];

  return (
    <section id="communities" className="py-20 md:py-28 bg-canvas select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-semibold text-mint-700 bg-mint-50 px-2.5 py-1 rounded-full border border-mint-200 inline-block mb-3">
            Target ecosystems
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            Built for technical and collegiate communities
          </h2>
          <p className="text-sm sm:text-base text-mutedSlate leading-relaxed">
            From technical engineering collectives to university-wide councils, ClubRelay provides
            tailored operational structures for every campus domain.
          </p>
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {communities.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.name}
                className="p-5 rounded-2xl bg-surface border border-border shadow-subtle hover:border-brand-300 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3.5 ${c.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-sm text-ink mb-1">
                  {c.name}
                </h3>
                <p className="text-xs text-mutedSlate leading-relaxed">
                  {c.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
