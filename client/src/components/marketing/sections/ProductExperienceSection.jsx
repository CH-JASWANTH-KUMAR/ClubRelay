import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Code2,
  Database,
  ArrowRightLeft,
  CheckCircle2,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import { Spotlight } from '../visuals/Spotlight';

/**
 * ProductExperienceSection: Interactive platform cockpit with 7 tabs showing genuine ClubRelay UI.
 * Tabs:
 * 1. Club Workspace
 * 2. Event Cockpit
 * 3. My Work
 * 4. Team and Members
 * 5. Engineering Projects
 * 6. Institutional Memory
 * 7. Leadership Handover
 */
export function ProductExperienceSection() {
  const [activeTab, setActiveTab] = useState('club');

  const tabs = [
    { id: 'club', label: 'Club Workspace', icon: LayoutDashboard },
    { id: 'events', label: 'Event Cockpit', icon: Calendar },
    { id: 'work', label: 'My Work', icon: CheckCircle2 },
    { id: 'team', label: 'Team & Members', icon: Users },
    { id: 'engineering', label: 'Engineering Projects', icon: Code2 },
    { id: 'memory', label: 'Institutional Memory', icon: Database },
    { id: 'handover', label: 'Leadership Handover', icon: ArrowRightLeft },
  ];

  return (
    <section id="platform" className="py-24 sm:py-32 bg-canvas text-ink select-none relative overflow-hidden">
      {/* Anchor alias for backwards compatibility */}
      <div id="product-preview" className="sr-only" />

      {/* Background low-contrast technical grid */}
      <div className="absolute inset-0 marketing-tech-grid-light opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-xs font-display font-semibold text-brand-600 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Platform Experience</span>
          </div>

          <h2 className="text-display-section text-ink">
            The command center for{' '}
            <span className="text-brand-600 font-extrabold">ambitious communities.</span>
          </h2>

          <p className="mt-4 text-base text-ink/75 leading-relaxed font-sans max-w-2xl mx-auto">
            Explore how ClubRelay streamlines day-to-day operations, project execution, and annual
            leadership transitions in one unified workspace.
          </p>
        </div>

        {/* Interactive Tab Switcher */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-4 mb-8 max-w-4xl mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-display font-medium transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-brand-600 text-white font-bold shadow-[0_2px_14px_rgba(49,91,219,0.3)]'
                    : 'bg-surface text-ink/75 hover:text-ink hover:bg-subtle border border-border shadow-2xs'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Large Platform Window with Spotlight Effect */}
        <div className="w-full max-w-5xl mx-auto rounded-3xl bg-surface border border-border shadow-[0_20px_50px_-15px_rgba(25,43,66,0.1)] p-4 sm:p-7 relative overflow-hidden">
          <Spotlight />

          {/* Browser Chrome Bar */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-border relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="hidden sm:flex items-center gap-2 ml-4 px-3 py-1 rounded-lg bg-subtle border border-border text-[11px] text-ink/65">
                <span>app.clubrelay.edu/workspace/pacific-coast</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-ink/60 uppercase tracking-wider">
                Illustrative Preview
              </span>
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
            </div>
          </div>

          {/* Tab Content Panes */}
          <div className="relative z-10 min-h-[340px]">
            {/* 1. Club Workspace */}
            {activeTab === 'club' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-subtle/80 border border-border flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="font-display font-bold text-base text-ink">
                      Pacific Coast University · Developer Guild
                    </h3>
                    <p className="text-xs text-ink/70 mt-0.5">
                      Spring 2026 Term · 24 Active Officers & Technical Leads
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-mint-50 border border-mint-200 text-mint-700 text-xs font-semibold">
                      Term Promoted
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-surface border border-border shadow-2xs">
                    <span className="text-[10px] text-ink/60 uppercase tracking-wider block mb-1 font-semibold">Upcoming Events</span>
                    <div className="font-display font-bold text-lg text-ink">DevFest 2026</div>
                    <span className="text-xs text-brand-600 font-medium">Oct 24 · CS Auditorium</span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface border border-border shadow-2xs">
                    <span className="text-[10px] text-ink/60 uppercase tracking-wider block mb-1 font-semibold">Faculty Approvals</span>
                    <div className="font-display font-bold text-lg text-ink">$1,200 Approved</div>
                    <span className="text-xs text-mint-700 font-medium">Budget variance 0%</span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface border border-border shadow-2xs">
                    <span className="text-[10px] text-ink/60 uppercase tracking-wider block mb-1 font-semibold">Succession Status</span>
                    <div className="font-display font-bold text-lg text-ink">7/7 Sections Verified</div>
                    <span className="text-xs text-brand-600 font-medium">Ready for handover</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Event Execution Cockpit */}
            {activeTab === 'events' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-border pb-3 text-xs font-display">
                  <span className="text-ink font-bold text-sm">7-Tab Event Cockpit</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-mint-700 font-medium">✓ Draft</span>
                    <span className="text-mint-700 font-medium">✓ Proposed</span>
                    <span className="text-brand-600 font-bold">● Faculty Approved</span>
                    <span className="text-ink/60">Planning</span>
                    <span className="text-ink/60">Completed</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-subtle/80 border border-border">
                    <span className="text-xs font-semibold text-brand-600 block mb-1">Task Kanban & Delegation</span>
                    <p className="text-xs text-ink/75 leading-relaxed font-sans">
                      18 of 20 logistics tasks completed. Stage management, faculty permits, and AV crew assigned.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-subtle/80 border border-border">
                    <span className="text-xs font-semibold text-mint-700 block mb-1">Faculty Approvals Audit Trail</span>
                    <p className="text-xs text-ink/75 leading-relaxed font-sans">
                      Digitally signed off by faculty advisor Dr. Robert Vance on October 12, 2026.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. My Work Personal Cockpit */}
            {activeTab === 'work' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-border pb-3 text-xs font-display">
                  <span className="text-ink font-bold text-sm">My Work Personal Cockpit</span>
                  <span className="text-brand-600 font-semibold text-xs">4 Active Tasks Assigned</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-subtle/80 border border-border">
                    <span className="text-xs font-semibold text-brand-600 block mb-1">Personal Kanban Stepper</span>
                    <p className="text-xs text-ink/75 leading-relaxed font-sans">
                      Assigned event duties, document reviews, and sponsor inquiries aggregated into a personal dashboard.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-subtle/80 border border-border">
                    <span className="text-xs font-semibold text-mint-700 block mb-1">Approval Deadlines</span>
                    <p className="text-xs text-ink/75 leading-relaxed font-sans">
                      Real-time status updates on submitted venue permits and financial reimbursements.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Team & Members */}
            {activeTab === 'team' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h4 className="font-display font-bold text-sm text-ink">Executive Board & Sub-team Leads</h4>
                  <span className="text-xs text-ink/65 font-medium">Privacy-hardened collegiate roster</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { name: 'Sarah Chen', role: 'President', team: 'Executive' },
                    { name: 'Marcus Vance', role: 'VP Engineering', team: 'Technical' },
                    { name: 'Priya Patel', role: 'Head of Operations', team: 'Events' },
                    { name: 'Alex Thorne', role: 'Treasurer', team: 'Finance' },
                    { name: 'Elena Rostova', role: 'Outreach Lead', team: 'Sponsors' },
                    { name: 'David Kim', role: 'Hackathon Director', team: 'Programs' },
                  ].map((m) => (
                    <div key={m.name} className="p-3 rounded-xl bg-subtle/70 border border-border flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white text-brand-600 font-bold text-xs flex items-center justify-center border border-brand-200 shadow-2xs">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-display font-bold text-xs text-ink">{m.name}</div>
                        <div className="text-[10px] text-ink/65 font-medium">{m.role} · {m.team}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Engineering Projects */}
            {activeTab === 'engineering' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-xl bg-subtle/80 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-brand-600" />
                      <span className="font-display font-bold text-sm text-ink">github.com/clubrelay/hackathon-portal</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-semibold border border-brand-200">
                      Maintained
                    </span>
                  </div>
                  <p className="text-xs text-ink/75 font-sans leading-relaxed">
                    Continuous technical handover repository for annual campus hackathon registration, ticketing, and judging.
                  </p>
                </div>
              </div>
            )}

            {/* 6. Institutional Memory */}
            {activeTab === 'memory' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-xl bg-subtle/80 border border-border">
                  <h4 className="font-display font-bold text-sm text-ink mb-1">
                    Compliance SOPs & Vendor Playbooks
                  </h4>
                  <p className="text-xs text-ink/75 leading-relaxed font-sans">
                    Permanent access to approved caterers, campus facility booking SOPs, audio/visual stage specs, and university safety codes.
                  </p>
                </div>
              </div>
            )}

            {/* 7. Leadership Handover */}
            {activeTab === 'handover' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-subtle/80 border border-border flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <span className="text-xs font-display font-bold text-brand-600 block">
                      Atomic Executive Handover Dossier
                    </span>
                    <span className="text-xs text-ink/75">
                      7 sections verified: Governance, Active Work, Budgets, Playbooks, Sponsors, Documents, Retrospective
                    </span>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full bg-brand-600 text-white font-display font-bold text-xs shadow-xs">
                    Ready to Relay
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductExperienceSection;
