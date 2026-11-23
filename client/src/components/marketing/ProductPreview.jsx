import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Users,
  ArrowRightLeft,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export function ProductPreview() {
  const [activeTab, setActiveTab] = useState('club');

  const previews = {
    club: {
      title: 'Club Operational Workspace',
      subtitle: 'Scheduled events flight deck, executive board roster, and succession readiness',
      render: () => (
        <div className="space-y-4">
          {/* Handover Alert Widget */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-brand-50 via-canvas to-surface border border-brand-200 flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-ink text-xs block">Annual Succession Transition Health</span>
              <span className="text-[11px] text-mutedSlate">Preserve institutional playbooks and verified contacts</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-mint-600">7 of 7 Verified</span>
              <div className="w-24 h-1.5 bg-border rounded-full mt-1 overflow-hidden">
                <div className="w-full h-full bg-mint-500 rounded-full" />
              </div>
            </div>
          </div>

          {/* Upcoming Event Item */}
          <div className="p-3 rounded-xl bg-canvas border border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sunshine-50 text-sunshine-700 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-ink text-xs block">DevFest 2026 Summit</span>
                <div className="flex items-center gap-1.5 text-[10px] text-mutedSlate">
                  <span>CS Auditorium</span>
                  <span>/</span>
                  <span>Oct 24</span>
                  <span>/</span>
                  <span>Budget: $1,200</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] bg-brand-50 text-brand-700 font-semibold px-2 py-0.5 rounded-full border border-brand-200">
              Approved
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-canvas border border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500 text-white font-bold text-xs flex items-center justify-center">
                GDG
              </div>
              <div>
                <span className="font-bold text-ink text-xs block">Google Developer Group</span>
                <span className="text-[10px] text-mutedSlate">Pacific Coast University · 24 Active Members</span>
              </div>
            </div>
            <span className="text-[10px] bg-mint-50 text-mint-700 font-semibold px-2 py-0.5 rounded-full border border-mint-200">
              Active Term
            </span>
          </div>
        </div>
      ),
    },

    events: {
      title: '7-Tab Event Cockpit',
      subtitle: 'Overview, Tasks, Attendees, Budget, Resources, Approvals, and Retrospectives',
      render: () => (
        <div className="space-y-3">
          {/* Lifecycle Bar */}
          <div className="flex items-center justify-between text-[10px] font-semibold text-mutedSlate border-b border-border pb-2">
            <span className="text-mint-600">✓ Draft</span>
            <span className="text-mint-600">✓ Proposed</span>
            <span className="text-brand-600 font-bold">● Approved</span>
            <span>Planning</span>
            <span>In Progress</span>
            <span>Completed</span>
          </div>

          {/* 7 Tabs Preview */}
          <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-semibold border-b border-border pb-1">
            <span className="px-2.5 py-1 text-brand-600 border-b-2 border-brand-600">Overview</span>
            <span className="px-2.5 py-1 text-mutedSlate">Tasks (18/20)</span>
            <span className="px-2.5 py-1 text-mutedSlate">Attendees</span>
            <span className="px-2.5 py-1 text-mutedSlate">Budget</span>
            <span className="px-2.5 py-1 text-mutedSlate">Approvals</span>
            <span className="px-2.5 py-1 text-mutedSlate">Retrospective</span>
          </div>

          <div className="p-3 rounded-xl bg-canvas border border-border text-xs space-y-1">
            <span className="font-bold text-ink block">Logistics & Venue Hold</span>
            <span className="text-[11px] text-mutedSlate block">
              Main Campus Auditorium · Stage Audio-Visual permit approved by Faculty Advisor
            </span>
          </div>
        </div>
      ),
    },

    work: {
      title: 'My Work Personal Cockpit',
      subtitle: 'Unified task board across all your active student societies with Kanban & Calendar views',
      render: () => (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-lg bg-canvas border border-border">
              <span className="text-[10px] font-bold text-mutedSlate block">To Do (2)</span>
              <div className="mt-1.5 p-2 rounded bg-surface border border-border text-[11px] font-medium text-ink">
                Draft Sponsor Proposal
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-canvas border border-border">
              <span className="text-[10px] font-bold text-brand-600 block">In Progress (1)</span>
              <div className="mt-1.5 p-2 rounded bg-surface border border-border text-[11px] font-medium text-ink">
                Book CS Lab 301
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-canvas border border-border">
              <span className="text-[10px] font-bold text-mint-600 block">Done (4)</span>
              <div className="mt-1.5 p-2 rounded bg-surface border border-border text-[11px] font-medium text-mutedSlate line-through">
                Publish Workshop RSVP
              </div>
            </div>
          </div>
        </div>
      ),
    },

    members: {
      title: 'Privacy-Hardened Member Roster',
      subtitle: 'Manage active student memberships, recruitment pipelines, and sub-team leads',
      render: () => (
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-canvas border border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-[10px]">
                MC
              </div>
              <div>
                <span className="font-bold text-ink block">Maya Chen</span>
                <span className="text-[10px] text-mutedSlate">President · Google Developer Group</span>
              </div>
            </div>
            <span className="text-[10px] bg-brand-50 text-brand-700 font-semibold px-2 py-0.5 rounded-full border border-brand-200">
              PRESIDENT
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-canvas border border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-mint-100 text-mint-800 flex items-center justify-center font-bold text-[10px]">
                AL
              </div>
              <div>
                <span className="font-bold text-ink block">Alex Liu</span>
                <span className="text-[10px] text-mutedSlate">Technical Lead · Cloud Sprints</span>
              </div>
            </div>
            <span className="text-[10px] bg-mint-50 text-mint-700 font-semibold px-2 py-0.5 rounded-full border border-mint-200">
              CORE LEAD
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-subtle border border-border flex items-center justify-between text-[11px] text-mutedSlate">
            <span>Roster Privacy: PII & Phone numbers strictly protected</span>
            <span className="text-brand-600 font-semibold">24 Verified Members</span>
          </div>
        </div>
      ),
    },

    handover: {
      title: 'Digital Leadership Handover Center',
      subtitle: '7-section succession dossier, atomic role transfer, and structured memory handoff',
      render: () => (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-xs">
                SL
              </div>
              <span className="font-bold text-ink">Outgoing President</span>
            </div>
            <span className="text-mutedSlate text-sm">→</span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-mint-100 text-mint-800 flex items-center justify-center font-bold text-xs">
                AL
              </div>
              <span className="font-bold text-ink">Incoming President</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-subtle border border-border flex items-center justify-between">
            <span className="font-semibold text-ink text-xs">Verified Sign-Off Status</span>
            <span className="text-[10px] bg-mint-50 text-mint-700 font-bold px-2 py-0.5 rounded-full border border-mint-200">
              7 of 7 Sections Verified
            </span>
          </div>
        </div>
      ),
    },
  };

  const tabs = [
    { key: 'club', label: 'Club Workspace', icon: LayoutDashboard },
    { key: 'events', label: 'Event Cockpit', icon: Calendar },
    { key: 'work', label: 'My Work', icon: CheckSquare },
    { key: 'members', label: 'Members', icon: Users },
    { key: 'handover', label: 'Handover', icon: ArrowRightLeft },
  ];

  const current = previews[activeTab];

  return (
    <section id="product-preview" className="py-20 md:py-28 bg-surface border-t border-border select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
              Interactive tour
            </span>
            <span className="text-[11px] font-medium text-mutedSlate bg-subtle px-2.5 py-1 rounded-full border border-border">
              Actual application screens
            </span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight">
            See how your club works with ClubRelay.
          </h2>
          <p className="text-sm sm:text-base text-mutedSlate leading-relaxed font-sans">
            Inspect the actual operational screens powering student organizations across events, tasks,
            and leadership successions.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-4 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-subtle'
                    : 'bg-canvas text-ink hover:bg-subtle border border-border'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Preview Frame */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-canvas border border-border p-6 sm:p-8 shadow-elevated">
          <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-ink">
                {current.title}
              </h3>
              <p className="text-xs text-mutedSlate">{current.subtitle}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-coral-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-sunshine-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-mint-400" />
            </div>
          </div>

          {/* Render Active View Mockup */}
          {current.render()}
        </div>
      </div>
    </section>
  );
}

export default ProductPreview;
