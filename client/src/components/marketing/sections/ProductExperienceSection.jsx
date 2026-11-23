import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Code2,
  Database,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  DollarSign,
  FileText,
  GitBranch,
} from 'lucide-react';
import { Spotlight } from '../visuals/Spotlight';

/**
 * ProductExperienceSection: Interactive platform cockpit with 6 tabs showing genuine ClubRelay UI.
 * Tabs:
 * 1. Club Workspace
 * 2. Event Execution
 * 3. Team and Members
 * 4. Engineering Projects
 * 5. Institutional Memory
 * 6. Leadership Handover
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
    <section id="platform" className="py-24 sm:py-32 bg-midnight-workshop text-lightSand select-none relative overflow-hidden">
      {/* Anchor alias for backwards compatibility */}
      <div id="product-preview" className="sr-only" />

      {/* Background glow and grid */}
      <div className="absolute inset-0 marketing-tech-grid opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-midnight-forest border border-midnight-borderLight text-xs font-display font-semibold text-signalLime mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Platform Experience</span>
          </div>

          <h2 className="text-display-section text-lightSand">
            The command center for{' '}
            <span className="text-signalLime font-extrabold">ambitious communities.</span>
          </h2>

          <p className="mt-4 text-base text-mutedSage leading-relaxed font-sans max-w-2xl mx-auto">
            Explore how ClubRelay streamlines day-to-day operations, project execution, and annual
            leadership transitions in one unified workspace.
          </p>
        </div>

        {/* Interactive Tab Switcher (6 Tabs) */}
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
                    ? 'bg-signalLime text-midnight-workshop font-bold shadow-[0_2px_14px_rgba(212,238,121,0.3)]'
                    : 'bg-midnight-forest/80 text-lightSand/75 hover:text-lightSand hover:bg-midnight-forest border border-midnight-border'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Large Platform Window with Spotlight Effect */}
        <div className="w-full max-w-5xl mx-auto rounded-3xl bg-midnight-forest/90 border border-midnight-borderLight shadow-[0_25px_70px_rgba(0,0,0,0.7)] p-4 sm:p-7 relative overflow-hidden">
          <Spotlight />

          {/* Browser Chrome Bar */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-midnight-border relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                <span className="w-3 h-3 rounded-full bg-amber-500/70" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
              </div>
              <div className="hidden sm:flex items-center gap-2 ml-4 px-3 py-1 rounded-lg bg-midnight-card border border-midnight-border text-[11px] text-mutedSage">
                <span>app.clubrelay.edu/workspace/pacific-coast</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-mutedSage uppercase tracking-wider">
                Illustrative Preview
              </span>
              <span className="w-2 h-2 rounded-full bg-signalLime animate-pulse" />
            </div>
          </div>

          {/* Tab Content Panes */}
          <div className="relative z-10 min-h-[340px]">
            {/* 1. Club Workspace */}
            {activeTab === 'club' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-midnight-card border border-midnight-border flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="font-display font-bold text-base text-lightSand">
                      Pacific Coast University · Developer Guild
                    </h3>
                    <p className="text-xs text-mutedSage mt-0.5">
                      Spring 2026 Term · 24 Active Officers & Technical Leads
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-oxidisedMint/15 border border-oxidisedMint/30 text-oxidisedMint text-xs font-semibold">
                      Term Promoted
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-midnight-surface border border-midnight-border">
                    <span className="text-[10px] text-mutedSage uppercase tracking-wider block mb-1">Upcoming Events</span>
                    <div className="font-display font-bold text-lg text-lightSand">DevFest 2026</div>
                    <span className="text-xs text-signalLime">Oct 24 · CS Auditorium</span>
                  </div>
                  <div className="p-4 rounded-xl bg-midnight-surface border border-midnight-border">
                    <span className="text-[10px] text-mutedSage uppercase tracking-wider block mb-1">Faculty Approvals</span>
                    <div className="font-display font-bold text-lg text-lightSand">$1,200 Approved</div>
                    <span className="text-xs text-oxidisedMint">Budget variance 0%</span>
                  </div>
                  <div className="p-4 rounded-xl bg-midnight-surface border border-midnight-border">
                    <span className="text-[10px] text-mutedSage uppercase tracking-wider block mb-1">Succession Status</span>
                    <div className="font-display font-bold text-lg text-lightSand">7/7 Sections Verified</div>
                    <span className="text-xs text-signalLime">Ready for handover</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Event Execution Cockpit */}
            {activeTab === 'events' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-midnight-border pb-3 text-xs font-display">
                  <span className="text-lightSand font-bold text-sm">7-Tab Event Cockpit</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-oxidisedMint font-medium">✓ Draft</span>
                    <span className="text-oxidisedMint font-medium">✓ Proposed</span>
                    <span className="text-signalLime font-bold">● Faculty Approved</span>
                    <span className="text-mutedSage">Planning</span>
                    <span className="text-mutedSage">Completed</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-midnight-card border border-midnight-border">
                    <span className="text-xs font-semibold text-signalLime block mb-1">Task Kanban & Delegation</span>
                    <p className="text-xs text-mutedSage leading-relaxed">
                      18 of 20 logistics tasks completed. Stage management, faculty permits, and AV crew assigned.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-midnight-card border border-midnight-border">
                    <span className="text-xs font-semibold text-oxidisedMint block mb-1">Faculty Approvals Audit Trail</span>
                    <p className="text-xs text-mutedSage leading-relaxed">
                      Digitally signed off by faculty advisor Dr. Robert Vance on October 12, 2026.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2b. My Work Personal Cockpit */}
            {activeTab === 'work' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-midnight-border pb-3 text-xs font-display">
                  <span className="text-lightSand font-bold text-sm">My Work Personal Cockpit</span>
                  <span className="text-signalLime font-semibold text-xs">4 Active Tasks Assigned</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-midnight-card border border-midnight-border">
                    <span className="text-xs font-semibold text-signalLime block mb-1">Personal Kanban Stepper</span>
                    <p className="text-xs text-mutedSage leading-relaxed">
                      Assigned event duties, document reviews, and sponsor inquiries aggregated into a personal dashboard.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-midnight-card border border-midnight-border">
                    <span className="text-xs font-semibold text-oxidisedMint block mb-1">Approval Deadlines</span>
                    <p className="text-xs text-mutedSage leading-relaxed">
                      Real-time status updates on submitted venue permits and financial reimbursements.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Team & Members */}
            {activeTab === 'team' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-midnight-border pb-3">
                  <h4 className="font-display font-bold text-sm text-lightSand">Executive Board & Sub-team Leads</h4>
                  <span className="text-xs text-mutedSage">Privacy-hardened collegiate roster</span>
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
                    <div key={m.name} className="p-3 rounded-xl bg-midnight-card border border-midnight-border flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-midnight-surface text-signalLime font-bold text-xs flex items-center justify-center border border-signalLime/30">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-display font-bold text-xs text-lightSand">{m.name}</div>
                        <div className="text-[10px] text-mutedSage">{m.role} · {m.team}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Engineering Projects */}
            {activeTab === 'engineering' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-xl bg-midnight-card border border-midnight-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-signalLime" />
                      <span className="font-display font-bold text-sm text-lightSand">github.com/clubrelay/hackathon-portal</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-signalLime/15 text-signalLime font-semibold">
                      Maintained
                    </span>
                  </div>
                  <p className="text-xs text-mutedSage">
                    Continuous technical handover repository for annual campus hackathon registration, ticketing, and judging.
                  </p>
                </div>
              </div>
            )}

            {/* 5. Institutional Memory */}
            {activeTab === 'memory' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-xl bg-midnight-card border border-midnight-border">
                  <h4 className="font-display font-bold text-sm text-lightSand mb-1">
                    Compliance SOPs & Vendor Playbooks
                  </h4>
                  <p className="text-xs text-mutedSage leading-relaxed">
                    Permanent access to approved caterers, campus facility booking SOPs, audio/visual stage specs, and university safety codes.
                  </p>
                </div>
              </div>
            )}

            {/* 6. Leadership Handover */}
            {activeTab === 'handover' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-midnight-card border border-midnight-border flex items-center justify-between">
                  <div>
                    <span className="text-xs font-display font-bold text-signalLime block">
                      Atomic Executive Handover Dossier
                    </span>
                    <span className="text-xs text-mutedSage">
                      7 sections verified: Governance, Active Work, Budgets, Playbooks, Sponsors, Documents, Retrospective
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-signalLime text-midnight-workshop font-display font-bold text-xs">
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
