import React from 'react';
import { Sparkles, Code2 } from 'lucide-react';

/**
 * PillarsSection: The Four Pillars of Student Club Momentum.
 * Features alternating left/right layout with distinct visual treatments per pillar.
 */
export function PillarsSection() {
  return (
    <section id="product-pillars" className="py-24 sm:py-32 bg-subtle/50 text-ink select-none relative overflow-hidden">
      {/* Background low-contrast grid */}
      <div className="absolute inset-0 marketing-tech-grid-light opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-xs font-display font-semibold text-brand-600 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Four pillars of student club momentum</span>
          </div>

          <h2 className="text-display-section text-ink">
            Everything your club needs to{' '}
            <span className="text-brand-600 font-extrabold">keep moving.</span>
          </h2>

          <p className="mt-4 text-base text-ink/75 leading-relaxed font-sans max-w-2xl mx-auto">
            Everything student organizations need to build active teams, execute ambitious technical initiatives,
            and guarantee smooth continuity.
          </p>
        </div>

        {/* Alternating Left/Right Compositions for the 4 Pillars */}
        <div className="space-y-16 lg:space-y-24">
          {/* Pillar 01: Community & Leadership Rosters (Left visual, Right copy) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Visual (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-surface border border-border shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
                <span className="text-[11px] font-mono text-brand-600 uppercase tracking-wider font-semibold">Roster & Leadership Map</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold border border-brand-200">24 Active Officers</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { role: 'Executive Board', people: 'President, Vice President, Treasurer', color: 'border-l-4 border-brand-500' },
                  { role: 'Technical Committee', people: 'Tech Lead, Systems Architect, 4 Maintainers', color: 'border-l-4 border-mint-500' },
                  { role: 'Operations & Logistics', people: 'Event Director, Venue Coordinator, AV Lead', color: 'border-l-4 border-brand-400' },
                ].map((tier) => (
                  <div key={tier.role} className={`p-3 rounded-xl bg-subtle/80 ${tier.color} text-xs`}>
                    <div className="font-display font-bold text-ink">{tier.role}</div>
                    <div className="text-[11px] text-ink/70 mt-0.5 font-sans">{tier.people}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Copy (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-600">
                Pillar 01 / Community
              </span>
              <h3 className="text-display-feature text-ink font-display">
                Community & Leadership Rosters
              </h3>
              <p className="text-sm sm:text-base text-ink/75 leading-relaxed font-sans max-w-xl">
                Centralize student membership rosters, assign executive board roles, structure sub-team leads,
                and maintain privacy-hardened rosters across term boundaries without personal data leakage.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-surface border border-border text-ink/80 shadow-2xs">
                  Role-Based Membership
                </span>
                <span className="px-3 py-1 rounded-full bg-surface border border-border text-ink/80 shadow-2xs">
                  Officer Succession Permissions
                </span>
              </div>
            </div>
          </div>

          {/* Pillar 02: Event Execution Cockpit (Right visual, Left copy) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Copy (7 cols) */}
            <div className="lg:col-span-7 space-y-4 order-2 lg:order-1">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-mint-700">
                Pillar 02 / Operations
              </span>
              <h3 className="text-display-feature text-ink font-display">
                Event Execution Cockpit
              </h3>
              <p className="text-sm sm:text-base text-ink/75 leading-relaxed font-sans max-w-xl">
                Orchestrate workshops, hackathons, and guest keynotes with a 7-stage lifecycle stepper,
                faculty approvals, budget variance trackers, and delegation boards that keep everyone accountable.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-surface border border-border text-ink/80 shadow-2xs">
                  7-Stage Lifecycle Stepper
                </span>
                <span className="px-3 py-1 rounded-full bg-surface border border-border text-ink/80 shadow-2xs">
                  Faculty Approvals Audit Trail
                </span>
              </div>
            </div>

            {/* Visual (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-surface border border-border shadow-sm order-1 lg:order-2">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
                <span className="text-[11px] font-mono text-mint-700 uppercase tracking-wider font-semibold">DevFest 2026 Stepper</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-mint-50 text-mint-700 font-bold border border-mint-200">Approved</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-subtle/80 border border-mint-200 text-mint-700 font-bold">
                  Stage 1: Proposal
                </div>
                <div className="p-2.5 rounded-xl bg-subtle/80 border border-brand-200 text-brand-700 font-bold">
                  Stage 2: Budget
                </div>
                <div className="p-2.5 rounded-xl bg-subtle/80 border border-border text-ink/65">
                  Stage 3: Logistics
                </div>
              </div>
              <div className="mt-3 p-3 rounded-xl bg-subtle/80 text-xs text-ink/75 flex items-center justify-between">
                <span>Faculty Sign-off: Dr. R. Vance</span>
                <span className="text-brand-600 font-bold">$1,200 Approved</span>
              </div>
            </div>
          </div>

          {/* Pillar 03: Engineering Projects & Repositories (Left visual, Right copy) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Visual (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-surface border border-border shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-brand-600" />
                  <span className="text-[11px] font-mono text-ink font-semibold">Campus Hackathon Portal</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold border border-brand-200">Maintained</span>
              </div>
              <div className="p-3.5 rounded-xl bg-subtle/80 border border-border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-ink/70">github.com/gdg-pcu/hack-portal</span>
                  <span className="text-brand-600 font-semibold font-mono">v2.4.0</span>
                </div>
                <div className="text-[11px] text-ink/75 font-sans">
                  Technical deliverables, API credentials, and deployment runbooks preserved across terms.
                </div>
              </div>
            </div>

            {/* Copy (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-600">
                Pillar 03 / Engineering
              </span>
              <h3 className="text-display-feature text-ink font-display">
                Engineering Projects & Repositories
              </h3>
              <p className="text-sm sm:text-base text-ink/75 leading-relaxed font-sans max-w-xl">
                Link GitHub projects, open-source repositories, and technical deliverables directly to club workspaces
                so code ownership stays alive across graduating batches.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-surface border border-border text-ink/80 shadow-2xs">
                  Code & Playbook Custody
                </span>
                <span className="px-3 py-1 rounded-full bg-surface border border-border text-ink/80 shadow-2xs">
                  Technical Handover Protocol
                </span>
              </div>
            </div>
          </div>

          {/* Pillar 04: Institutional Memory & Handover (Right visual, Left copy) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Copy (7 cols) */}
            <div className="lg:col-span-7 space-y-4 order-2 lg:order-1">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-mint-700">
                Pillar 04 / Continuity
              </span>
              <h3 className="text-display-feature text-ink font-display">
                Institutional Memory & Handover
              </h3>
              <p className="text-sm sm:text-base text-ink/75 leading-relaxed font-sans max-w-xl">
                Preserve compliance SOPs, vendor contracts, and meeting decisions in an institutional memory vault.
                Complete 7-section handovers with atomic role transfers that leave no gaps in custody.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-surface border border-border text-ink/80 shadow-2xs">
                  Atomic Leadership Succession
                </span>
                <span className="px-3 py-1 rounded-full bg-surface border border-border text-ink/80 shadow-2xs">
                  Institutional Memory Vault
                </span>
              </div>
            </div>

            {/* Visual (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-surface border border-border shadow-sm order-1 lg:order-2">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
                <span className="text-[11px] font-mono text-brand-600 uppercase tracking-wider font-semibold">Executive Succession Dossier</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold border border-brand-200">Ready to Relay</span>
              </div>
              <div className="p-3.5 rounded-xl bg-subtle/80 border border-border text-xs space-y-2">
                <div className="flex items-center justify-between text-ink font-semibold">
                  <span>Outgoing President → Incoming President</span>
                  <span className="text-brand-600">7 of 7 Verified</span>
                </div>
                <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-600 h-full w-full rounded-full" />
                </div>
                <p className="text-[11px] text-ink/75 font-sans">
                  Governance, ongoing tasks, venue permits, and alumni relations ready for handover.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PillarsSection;
