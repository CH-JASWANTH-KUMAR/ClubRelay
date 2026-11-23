import React, { useState, useRef } from 'react';
import { Users, Workflow, Cpu, ShieldCheck, ArrowRight } from 'lucide-react';

const PILLARS = [
  {
    id: 'community',
    title: 'Community',
    badge: 'Culture & People',
    badgeBg: 'bg-mint-100 text-mint-900 border-mint-200',
    accentBorder: 'border-mint-400',
    accentBg: 'bg-mint-50/50',
    icon: Users,
    iconColor: 'text-mint-700',
    description:
      'Open, inclusive campus culture that connects senior leaders with incoming first-year builders. Eliminate knowledge silos across cohorts.',
    metric: 'Role-Based Membership',
    detail: 'Officer rosters, sub-team leads, and verified member directories.',
    defaultOffset: { x: -140, y: -20, rotate: -3 },
  },
  {
    id: 'operations',
    title: 'Operations',
    badge: 'Execution',
    badgeBg: 'bg-brand-100 text-brand-900 border-brand-200',
    accentBorder: 'border-brand-400',
    accentBg: 'bg-brand-50/50',
    icon: Workflow,
    iconColor: 'text-brand-700',
    description:
      'Standardized event lifecycles, clear faculty approval trails, and zero-loss budget records. No more frantic WhatsApp approvals.',
    metric: 'Faculty Approval Trails',
    detail: 'Event planning, personal task assignment, and faculty sign-offs.',
    defaultOffset: { x: 120, y: -40, rotate: 2 },
  },
  {
    id: 'engineering',
    title: 'Engineering',
    badge: 'Technology',
    badgeBg: 'bg-sunshine-100 text-sunshine-900 border-sunshine-200',
    accentBorder: 'border-sunshine-400',
    accentBg: 'bg-sunshine-50/50',
    icon: Cpu,
    iconColor: 'text-sunshine-800',
    description:
      'Technical continuity, shared knowledge repositories, and code/hardware documentation that outlasts graduation.',
    metric: 'Knowledge Preservation',
    detail: 'Markdown SOPs, project documentation, and repository references.',
    defaultOffset: { x: -60, y: 50, rotate: 1 },
  },
  {
    id: 'continuity',
    title: 'Continuity',
    badge: 'Governance',
    badgeBg: 'bg-coral-100 text-coral-900 border-coral-200',
    accentBorder: 'border-coral-400',
    accentBg: 'bg-coral-50/50',
    icon: ShieldCheck,
    iconColor: 'text-coral-700',
    description:
      'Formal digital handovers with term-by-term custody, structured transition playbooks, and outgoing officer sign-offs.',
    metric: 'Leadership Handover',
    detail: '7-section handover package, incoming lead acceptance, and meeting decisions.',
    defaultOffset: { x: 160, y: 60, rotate: -2 },
  },
];

export function DragCards() {
  const containerRef = useRef(null);
  const [positions, setPositions] = useState(() =>
    PILLARS.reduce((acc, p) => {
      acc[p.id] = { ...p.defaultOffset };
      return acc;
    }, {})
  );

  const [activeCardId, setActiveCardId] = useState('continuity');
  const [zIndices, setZIndices] = useState(() =>
    PILLARS.reduce((acc, p, idx) => {
      acc[p.id] = idx + 10;
      return acc;
    }, {})
  );

  const bringToFront = (id) => {
    setActiveCardId(id);
    setZIndices((prev) => {
      const highest = Math.max(...Object.values(prev), 10);
      return { ...prev, [id]: highest + 1 };
    });
  };

  const handlePointerDown = (e, id) => {
    // Only drag with primary pointer button
    if (e.button !== 0) return;
    bringToFront(id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { ...(positions[id] || { x: 0, y: 0, rotate: 0 }) };

    const handlePointerMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      // Clamp movement within bounds to prevent card from getting lost
      const clampedX = Math.max(-280, Math.min(280, startPos.x + dx));
      const clampedY = Math.max(-120, Math.min(120, startPos.y + dy));

      setPositions((prev) => ({
        ...prev,
        [id]: {
          x: clampedX,
          y: clampedY,
          rotate: Math.max(-8, Math.min(8, (clampedX / 280) * 8)),
        },
      }));
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const resetCards = () => {
    setPositions(
      PILLARS.reduce((acc, p) => {
        acc[p.id] = { ...p.defaultOffset };
        return acc;
      }, {})
    );
  };

  return (
    <section className="py-20 bg-canvas border-b border-border relative overflow-hidden" aria-labelledby="pillars-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 id="pillars-heading" className="font-heading text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            The Four Pillars of High-Performing Clubs
          </h2>
          <p className="mt-3 text-base text-mutedSlate">
            Student leadership transforms every academic year. ClubRelay stabilizes the four pillars that keep your club thriving across leadership rotations.
          </p>
        </div>

        {/* Accessible Pillar Switcher for Keyboard and Screen-Reader Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8" role="tablist" aria-label="Select pillar card">
          {PILLARS.map((pillar) => {
            const isActive = activeCardId === pillar.id;
            return (
              <button
                key={pillar.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => bringToFront(pillar.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 border cursor-pointer ${
                  isActive
                    ? 'bg-ink text-white border-ink shadow-sm'
                    : 'bg-surface text-ink border-border hover:bg-subtle'
                }`}
              >
                {pillar.title}
              </button>
            );
          })}
          <button
            type="button"
            onClick={resetCards}
            className="text-xs font-medium text-brand-600 hover:text-brand-800 ml-2 cursor-pointer underline"
          >
            Reset Positions
          </button>
        </div>

        {/* Interactive Draggable Canvas (Large Screens) */}
        <div
          ref={containerRef}
          className="relative h-[480px] w-full hidden md:flex items-center justify-center bg-subtle/50 border border-border/80 rounded-3xl p-6 overflow-hidden select-none touch-none shadow-inner"
        >
          {/* Subtle Canvas Pattern */}
          <div
            className="absolute inset-0 dark-grid-canvas-bg opacity-40 pointer-events-none"
            aria-hidden="true"
          />

          <div className="absolute top-4 left-6 text-[11px] text-mutedSlate font-medium flex items-center gap-1.5 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            Drag cards to arrange • Click or tap tab to bring to front
          </div>

          {PILLARS.map((pillar) => {
            const pos = positions[pillar.id] || { x: 0, y: 0, rotate: 0 };
            const zIndex = zIndices[pillar.id] || 10;
            const Icon = pillar.icon;
            const isActive = activeCardId === pillar.id;

            return (
              <div
                key={pillar.id}
                tabIndex={0}
                role="article"
                aria-label={`${pillar.title} pillar card`}
                onPointerDown={(e) => handlePointerDown(e, pillar.id)}
                onFocus={() => bringToFront(pillar.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    bringToFront(pillar.id);
                  }
                }}
                style={{
                  transform: `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${pos.rotate}deg)`,
                  zIndex,
                }}
                className={`absolute w-72 sm:w-80 bg-surface rounded-2xl border-2 p-5 shadow-card cursor-grab active:cursor-grabbing transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  isActive ? 'border-brand-500 shadow-xl ring-2 ring-brand-100' : 'border-border/90 hover:border-brand-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl ${pillar.accentBg} ${pillar.accentBorder} border`}>
                    <Icon className={`w-5 h-5 ${pillar.iconColor}`} />
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${pillar.badgeBg}`}>
                    {pillar.badge}
                  </span>
                </div>

                <h3 className="font-heading text-lg font-bold text-ink mb-1">{pillar.title}</h3>
                <p className="text-xs text-mutedSlate leading-relaxed mb-4">{pillar.description}</p>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="font-semibold text-brand-700">{pillar.metric}</span>
                  <span className="text-[11px] text-mutedSlate flex items-center gap-1">
                    Details <ArrowRight className="w-3 h-3 text-brand-500" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Grid Fallback (No horizontal overflow) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className="bg-surface rounded-2xl border border-border p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl ${pillar.accentBg} border ${pillar.accentBorder}`}>
                    <Icon className={`w-5 h-5 ${pillar.iconColor}`} />
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${pillar.badgeBg}`}>
                    {pillar.badge}
                  </span>
                </div>
                <h3 className="font-heading text-base font-bold text-ink mb-1">{pillar.title}</h3>
                <p className="text-xs text-mutedSlate leading-relaxed mb-3">{pillar.description}</p>
                <div className="pt-2 border-t border-border text-[11px] font-semibold text-brand-700">
                  {pillar.metric}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default DragCards;
