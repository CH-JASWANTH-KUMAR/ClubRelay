import React from 'react';
import { Users, Calendar, Code2, ArrowRightLeft, Sparkles, CheckCircle2, GitBranch, ShieldCheck } from 'lucide-react';

/**
 * PillarsSection: The Four Pillars of Student Club Momentum.
 * Features alternating left/right layout with distinct visual treatments per pillar.
 */
export function PillarsSection() {
  return (
    <section id="product-pillars" className="py-24 sm:py-32 bg-midnight-forest text-lightSand select-none relative overflow-hidden">
      {/* Background low-contrast grid */}
      <div className="absolute inset-0 marketing-tech-grid opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-midnight-card border border-midnight-border text-xs font-display font-semibold text-signalLime mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Four pillars of student club momentum</span>
          </div>

          <h2 className="text-display-section text-lightSand">
            Everything your club needs to{' '}
            <span className="text-signalLime font-extrabold">keep moving.</span>
          </h2>

          <p className="mt-4 text-base text-mutedSage leading-relaxed font-sans max-w-2xl mx-auto">
            Everything student organizations need to build active teams, execute ambitious technical initiatives,
            and guarantee smooth continuity.
          </p>
        </div>

        {/* Alternating Left/Right Compositions for the 4 Pillars */}
        <div className="space-y-16 lg:space-y-24">
          {/* Pillar 01: Community & Leadership Rosters (Left visual, Right copy) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Visual (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-midnight-card border border-midnight-borderLight shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-midnight-border">
                <span className="text-[11px] font-mono text-oxidisedMint uppercase tracking-wider">Roster & Leadership Map</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-oxidisedMint/15 text-oxidisedMint font-bold">24 Active Officers</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { role: 'Executive Board', people: 'President, Vice President, Treasurer', color: 'border-l-4 border-signalLime' },
                  { role: 'Technical Committee', people: 'Tech Lead, Systems Architect, 4 Maintainers', color: 'border-l-4 border-oxidisedMint' },
                  { role: 'Operations & Logistics', people: 'Event Director, Venue Coordinator, AV Lead', color: 'border-l-4 border-warmCopper' },
                ].map((tier) => (
                  <div key={tier.role} className={`p-3 rounded-xl bg-midnight-surface ${tier.color} text-xs`}>
                    <div className="font-display font-bold text-lightSand">{tier.role}</div>
                    <div className="text-[11px] text-mutedSage mt-0.5">{tier.people}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Copy (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-signalLime">
                Pillar 01 / Community
              </span>
              <h3 className="text-display-feature text-lightSand font-display">
                Community & Leadership Rosters
              </h3>
              <p className="text-sm sm:text-base text-mutedSage leading-relaxed font-sans max-w-xl">
                Centralize student membership rosters, assign executive board roles, structure sub-team leads,
                and maintain privacy-hardened rosters across term boundaries without personal data leakage.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-midnight-card border border-midnight-border text-lightSand">
                  Role-Based Membership
                </span>
                <span className="px-3 py-1 rounded-full bg-midnight-card border border-midnight-border text-lightSand">
                  Officer Succession Permissions
                </span>
              </div>
            </div>
          </div>

          {/* Pillar 02: Event Execution Cockpit (Right visual, Left copy) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Copy (7 cols) */}
            <div className="lg:col-span-7 space-y-4 order-2 lg:order-1">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-oxidisedMint">
                Pillar 02 / Operations
              </span>
              <h3 className="text-display-feature text-lightSand font-display">
                Event Execution Cockpit
              </h3>
              <p className="text-sm sm:text-base text-mutedSage leading-relaxed font-sans max-w-xl">
                Orchestrate workshops, hackathons, and guest keynotes with a 7-stage lifecycle stepper,
                faculty approvals, budget variance trackers, and delegation boards that keep everyone accountable.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-midnight-card border border-midnight-border text-lightSand">
                  7-Stage Lifecycle Stepper
                </span>
                <span className="px-3 py-1 rounded-full bg-midnight-card border border-midnight-border text-lightSand">
                  Faculty Approvals Audit Trail
                </span>
              </div>
            </div>

            {/* Visual (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-midnight-card border border-midnight-borderLight shadow-xl order-1 lg:order-2">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-midnight-border">
                <span className="text-[11px] font-mono text-signalLime uppercase tracking-wider">DevFest 2026 Stepper</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-signalLime/15 text-signalLime font-bold">Approved</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-midnight-surface border border-oxidisedMint/40 text-oxidisedMint font-bold">
                  Stage 1: Proposal
                </div>
                <div className="p-2.5 rounded-xl bg-midnight-surface border border-signalLime/40 text-signalLime font-bold">
                  Stage 2: Budget
                </div>
                <div className="p-2.5 rounded-xl bg-midnight-surface border border-midnight-border text-mutedSage">
                  Stage 3: Logistics
                </div>
              </div>
              <div className="mt-3 p-3 rounded-xl bg-midnight-surface text-xs text-mutedSage flex items-center justify-between">
                <span>Faculty Sign-off: Dr. R. Vance</span>
                <span className="text-signalLime font-bold">$1,200 Approved</span>
              </div>
            </div>
          </div>

          {/* Pillar 03: Engineering Projects & Repositories (Left visual, Right copy) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Visual (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-midnight-card border border-midnight-borderLight shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-midnight-border">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-warmCopper" />
                  <span className="text-[11px] font-mono text-lightSand">Campus Hackathon Portal</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-warmCopper/15 text-warmCopper font-bold">Maintained</span>
              </div>
              <div className="p-3.5 rounded-xl bg-midnight-surface border border-midnight-border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-mutedSage">github.com/gdg-pcu/hack-portal</span>
                  <span className="text-signalLime">v2.4.0</span>
                </div>
                <div className="text-[11px] text-mutedSage">
                  Technical deliverables, API credentials, and deployment runbooks preserved across terms.
                </div>
              </div>
            </div>

            {/* Copy (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-warmCopper">
                Pillar 03 / Engineering
              </span>
              <h3 className="text-display-feature text-lightSand font-display">
                Engineering Projects & Repositories
              </h3>
              <p className="text-sm sm:text-base text-mutedSage leading-relaxed font-sans max-w-xl">
                Link GitHub projects, open-source repositories, and technical deliverables directly to club workspaces
                so code ownership stays alive across graduating batches.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-midnight-card border border-midnight-border text-lightSand">
                  Code & Playbook Custody
                </span>
                <span className="px-3 py-1 rounded-full bg-midnight-card border border-midnight-border text-lightSand">
                  Technical Handover Protocol
                </span>
              </div>
            </div>
          </div>

          {/* Pillar 04: Institutional Memory & Handover (Right visual, Left copy) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Copy (7 cols) */}
            <div className="lg:col-span-7 space-y-4 order-2 lg:order-1">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-signalLime">
                Pillar 04 / Continuity
              </span>
              <h3 className="text-display-feature text-lightSand font-display">
                Institutional Memory & Handover
              </h3>
              <p className="text-sm sm:text-base text-mutedSage leading-relaxed font-sans max-w-xl">
                Preserve compliance SOPs, vendor contracts, and meeting decisions in an institutional memory vault.
                Complete 7-section handovers with atomic role transfers that leave no gaps in custody.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-midnight-card border border-midnight-border text-lightSand">
                  Atomic Leadership Succession
                </span>
                <span className="px-3 py-1 rounded-full bg-midnight-card border border-midnight-border text-lightSand">
                  Institutional Memory Vault
                </span>
              </div>
            </div>

            {/* Visual (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-midnight-card border border-midnight-borderLight shadow-xl order-1 lg:order-2">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-midnight-border">
                <span className="text-[11px] font-mono text-signalLime uppercase tracking-wider">Executive Succession Dossier</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-signalLime/15 text-signalLime font-bold">Ready to Relay</span>
              </div>
              <div className="p-3.5 rounded-xl bg-midnight-surface border border-midnight-border text-xs space-y-2">
                <div className="flex items-center justify-between text-lightSand font-semibold">
                  <span>Outgoing President → Incoming President</span>
                  <span className="text-signalLime">7 of 7 Verified</span>
                </div>
                <div className="w-full bg-midnight-border h-1.5 rounded-full overflow-hidden">
                  <div className="bg-signalLime h-full w-full rounded-full" />
                </div>
                <p className="text-[11px] text-mutedSage">
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
