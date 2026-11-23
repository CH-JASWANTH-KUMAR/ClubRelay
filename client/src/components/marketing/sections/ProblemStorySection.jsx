import React from 'react';
import { MessageSquare, UserMinus, MailWarning, FolderX, RotateCcw, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

/**
 * ProblemStorySection: Editorial Warm Paper section illustrating the cost of starting over.
 * Editorial sequence: Outgoing team → Fragmented knowledge → Lost context → Incoming team.
 */
export function ProblemStorySection() {
  const painPoints = [
    {
      icon: MessageSquare,
      title: 'Responsibilities vanish in private chats',
      desc: 'Critical event logistics, vendor agreements, and permits get buried in ephemeral group chats that incoming boards never see.',
    },
    {
      icon: UserMinus,
      title: 'Technical maintainers graduate',
      desc: 'Hackathon portals, club software, and documentation sit abandoned with dead repositories and zero credential handoff.',
    },
    {
      icon: MailWarning,
      title: 'Sponsor & alumni contacts get lost',
      desc: 'Industry partnerships and keynote connections stay trapped in personal inboxes of graduating seniors.',
    },
    {
      icon: FolderX,
      title: 'Documentation scatters across drives',
      desc: 'Fragmented spreadsheets, budget receipts, and meeting notes vanish when student Google accounts expire.',
    },
    {
      icon: RotateCcw,
      title: 'New boards start from scratch every year',
      desc: 'Every incoming executive team spends their first four months reinventing the wheel instead of building on momentum.',
    },
  ];

  return (
    <section id="problem" className="py-24 sm:py-32 bg-warmPaper text-deepInk select-none relative overflow-hidden">
      {/* Background low-contrast editorial grid */}
      <div className="absolute inset-0 marketing-tech-grid-light opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-warmCopper" />
            <span className="text-eyebrow text-warmCopper font-bold tracking-widest uppercase">
              The collegiate leadership cycle
            </span>
          </div>

          <h2 className="text-display-section text-deepInk font-display">
            The semester ends.{' '}
            <span className="text-editorial-accent font-normal text-warmCopper block sm:inline">
              The knowledge shouldn’t.
            </span>
          </h2>

          <p className="mt-5 text-base sm:text-lg text-deepInk/80 leading-relaxed font-sans max-w-2xl">
            Every leadership transition creates a choice. Start from scratch, or continue from where
            the last team stopped.
          </p>
        </div>

        {/* Editorial Timeline: Outgoing team → Fragmented knowledge → Lost context → Incoming team */}
        <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-warmPaper-light border border-warmPaper-dark shadow-sm">
          <div className="text-xs font-display uppercase tracking-widest text-deepInk/60 font-bold mb-6 flex items-center justify-between">
            <span>Where context disappears</span>
            <span className="hidden sm:inline text-warmCopper">The Cycle of Amnesia</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="flex flex-col">
              <span className="text-xs font-mono text-warmCopper font-semibold mb-1">01 / Outgoing Team</span>
              <h3 className="font-display font-bold text-base text-deepInk mb-1">Graduation Approaching</h3>
              <p className="text-xs text-deepInk/70 leading-relaxed">
                Knowledge resides in seniors’ heads, unrecorded chats, and personal notebooks.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col">
              <span className="text-xs font-mono text-warmCopper font-semibold mb-1">02 / Fragmented Knowledge</span>
              <h3 className="font-display font-bold text-base text-deepInk mb-1">Tool Sprawl</h3>
              <p className="text-xs text-deepInk/70 leading-relaxed">
                Spreadsheets, event photos, and vendor contacts split across disparate drives.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col">
              <span className="text-xs font-mono text-warmCopper font-semibold mb-1">03 / Lost Context</span>
              <h3 className="font-display font-bold text-base text-deepInk mb-1">Accounts Expire</h3>
              <p className="text-xs text-deepInk/70 leading-relaxed">
                Student email accounts close, taking permissions and historical context with them.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col">
              <span className="text-xs font-mono text-warmCopper font-semibold mb-1">04 / Incoming Team</span>
              <h3 className="font-display font-bold text-base text-deepInk mb-1">Rebuilding From Zero</h3>
              <p className="text-xs text-deepInk/70 leading-relaxed">
                New officers spend months repeating solved mistakes instead of innovating.
              </p>
            </div>
          </div>
        </div>

        {/* Two-Column Contrast: Failure Points vs ClubRelay Solution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Failure Modes (6 cols) */}
          <div className="lg:col-span-6 p-7 sm:p-8 rounded-3xl bg-[#E8E4D7] border border-warmPaper-dark flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-warmCopper" />
                <h3 className="font-display font-bold text-lg text-deepInk">
                  Common campus pain points
                </h3>
              </div>

              <div className="space-y-4">
                {painPoints.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-warmPaper text-warmCopper flex items-center justify-center flex-shrink-0 mt-0.5 border border-warmPaper-dark">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-xs text-deepInk">{item.title}</h4>
                        <p className="text-xs text-deepInk/75 leading-normal mt-0.5 font-sans">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-deepInk/10 text-xs font-semibold text-deepInk/70">
              Without structured continuity, each new cohort inherits responsibilities without context.
            </div>
          </div>

          {/* Right Column: How ClubRelay Keeps Momentum (6 cols) */}
          <div className="lg:col-span-6 p-7 sm:p-8 rounded-3xl bg-midnight-forest text-lightSand border border-midnight-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-signalLime" />
                  <h3 className="font-display font-bold text-lg text-lightSand">
                    How ClubRelay keeps momentum
                  </h3>
                </div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-signalLime bg-signalLime/10 px-2.5 py-1 rounded-full border border-signalLime/20">
                  Built to endure
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-midnight-card border border-midnight-border">
                  <div className="flex items-center gap-2 text-signalLime font-display font-semibold text-xs mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>7-Section Successor Dossier</span>
                  </div>
                  <p className="text-xs text-mutedSage">
                    Captures governance, active tasks, budget commitments, playbooks, sponsor relations, and retrospective lessons.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-midnight-card border border-midnight-border">
                  <div className="flex items-center gap-2 text-oxidisedMint font-display font-semibold text-xs mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Single Verified Role Transition</span>
                  </div>
                  <p className="text-xs text-mutedSage">
                    Swaps executive leadership permissions securely while maintaining past leaders as alumni advisors.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-midnight-card border border-midnight-border">
                  <div className="flex items-center gap-2 text-warmCopper font-display font-semibold text-xs mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Perpetual Technical Custody</span>
                  </div>
                  <p className="text-xs text-mutedSage">
                    Keeps repositories, hackathon tools, and infrastructure docs tied to the club, not a student's personal account.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-midnight-border/80 flex items-center justify-between text-xs text-mutedSage">
              <span className="flex items-center gap-1.5 text-signalLime font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Continuous organizational memory</span>
              </span>
              <a href="#platform" className="text-lightSand hover:text-signalLime inline-flex items-center gap-1 transition-colors">
                <span>See the platform</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProblemStorySection;
