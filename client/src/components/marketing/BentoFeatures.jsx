import React from 'react';
import {
  Users,
  Calendar,
  GitBranch,
  ArrowRightLeft,
  Sparkles,
} from 'lucide-react';

export function BentoFeatures() {
  return (
    <section id="product-pillars" className="py-20 md:py-28 bg-canvas select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-xs font-bold text-brand-600">
            <Sparkles className="w-3.5 h-3.5" /> Core Platform Architecture
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            Four pillars of student club momentum
          </h2>
          <p className="text-sm sm:text-base text-mutedSlate leading-relaxed">
            Everything student organizations need to build active teams, execute ambitious technical initiatives,
            and guarantee smooth continuity.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Pillar 1: Community (col-span-6) */}
          <div className="md:col-span-6 p-7 rounded-3xl bg-surface border border-border shadow-subtle hover:border-brand-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-brand-600 block mb-1">
                Pillar 01
              </span>
              <h3 className="font-heading font-extrabold text-xl text-ink mb-2">
                Community & Leadership Rosters
              </h3>
              <p className="text-xs text-mutedSlate leading-relaxed mb-6">
                Discover campus organizations, manage active student memberships, structure sub-team leads,
                and maintain privacy-hardened rosters across term boundaries.
              </p>
            </div>

            {/* Visual preview pill card */}
            <div className="p-3.5 rounded-xl bg-subtle border border-border space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink">Google Developer Group</span>
                <span className="text-[10px] bg-brand-100 text-brand-800 font-semibold px-2 py-0.5 rounded-full">
                  Technical
                </span>
              </div>
              <div className="flex items-center justify-between text-mutedSlate text-[11px]">
                <span>Executive Board: 4 Leads</span>
                <span>Term: 2025/2026</span>
              </div>
            </div>
          </div>

          {/* Pillar 2: Operations (col-span-6) */}
          <div className="md:col-span-6 p-7 rounded-3xl bg-surface border border-border shadow-subtle hover:border-mint-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-mint-50 border border-mint-100 text-mint-600 flex items-center justify-center mb-5">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-mint-600 block mb-1">
                Pillar 02
              </span>
              <h3 className="font-heading font-extrabold text-xl text-ink mb-2">
                Event Execution Cockpit
              </h3>
              <p className="text-xs text-mutedSlate leading-relaxed mb-6">
                Orchestrate workshops, hackathons, and guest keynotes with a 7-stage lifecycle stepper,
                faculty approvals, budget variance trackers, and delegation boards.
              </p>
            </div>

            {/* Visual preview pill card */}
            <div className="p-3.5 rounded-xl bg-subtle border border-border space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink">DevFest 2026 Summit</span>
                <span className="text-[10px] bg-mint-100 text-mint-800 font-semibold px-2 py-0.5 rounded-full">
                  Approved
                </span>
              </div>
              <div className="flex items-center justify-between text-mutedSlate text-[11px]">
                <span>Stage: Planning</span>
                <span>Budget: $1,200</span>
              </div>
            </div>
          </div>

          {/* Pillar 3: Engineering (col-span-6) */}
          <div className="md:col-span-6 p-7 rounded-3xl bg-surface border border-border shadow-subtle hover:border-coral-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-coral-50 border border-coral-100 text-coral-600 flex items-center justify-center mb-5">
                <GitBranch className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-coral-600 block mb-1">
                Pillar 03
              </span>
              <h3 className="font-heading font-extrabold text-xl text-ink mb-2">
                Engineering Projects & Repositories
              </h3>
              <p className="text-xs text-mutedSlate leading-relaxed mb-6">
                Link GitHub projects, open-source repositories, and technical deliverables directly to club workspaces
                so code ownership stays alive across graduating batches.
              </p>
            </div>

            {/* Visual preview pill card */}
            <div className="p-3.5 rounded-xl bg-subtle border border-border space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink text-xs">github.com/GDG/campus-portal</span>
                <span className="text-[10px] bg-coral-100 text-coral-800 font-semibold px-2 py-0.5 rounded-full">
                  Active Project
                </span>
              </div>
              <div className="flex items-center justify-between text-mutedSlate text-[11px]">
                <span>Maintainer: Lead Organizer</span>
                <span>Milestone: v2.0 Release</span>
              </div>
            </div>
          </div>

          {/* Pillar 4: Continuity (col-span-6) */}
          <div className="md:col-span-6 p-7 rounded-3xl bg-surface border border-border shadow-subtle hover:border-sunshine-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sunshine-50 border border-sunshine-100 text-sunshine-700 flex items-center justify-center mb-5">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-sunshine-700 block mb-1">
                Pillar 04
              </span>
              <h3 className="font-heading font-extrabold text-xl text-ink mb-2">
                Institutional Memory & Handover
              </h3>
              <p className="text-xs text-mutedSlate leading-relaxed mb-6">
                Preserve compliance SOPs, vendor contracts, and meeting decisions in an institutional memory vault.
                Complete 8-section handovers with atomic role transfers and digital sign-off.
              </p>
            </div>

            {/* Visual preview pill card */}
            <div className="p-3.5 rounded-xl bg-subtle border border-border space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink">Succession Dossier</span>
                <span className="text-[10px] bg-sunshine-100 text-sunshine-800 font-semibold px-2 py-0.5 rounded-full">
                  Verified Transfer
                </span>
              </div>
              <div className="flex items-center justify-between text-mutedSlate text-[11px]">
                <span>8 Sections Complete</span>
                <span>Formal Sign-Off</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
