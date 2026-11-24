import React from 'react';
import { GitBranch, Terminal, Clock } from 'lucide-react';

const RUN_STEPS = [
  'Clone repository and install local dependencies',
  'Configure environment variables with team secrets template',
  'Deploy staging build via automated workflow',
];

const REMAINING_WORK = [
  { id: '1', title: 'Migrate member database schema', status: 'In Progress', type: 'progress' },
  { id: '2', title: 'Implement webhooks for ticket validation', status: 'Blocker', type: 'attention' },
  { id: '3', title: 'Add test coverage for registration router', status: 'Queued', type: 'queued' },
];

export function EngineeringProjectsPanel() {
  return (
    <div className="w-full flex flex-col justify-between h-full space-y-3">
      {/* Project Card Header with Repository Link Row */}
      <div className="p-3 rounded-xl bg-midnight-workshop/90 border border-warmPaper/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-oxidisedMint/15 border border-oxidisedMint/30 flex items-center justify-center text-oxidisedMint flex-shrink-0">
            <GitBranch className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-warmPaper truncate">
                github.com/club/sample-portal
              </span>
              <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-warmPaper/10 text-mutedSage">
                main
              </span>
            </div>
            <span className="font-sans text-[11px] text-mutedSage block">
              Maintainer: Technical Lead
            </span>
          </div>
        </div>

        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-signalLime/15 border border-signalLime/30 text-signalLime flex-shrink-0">
          Production active
        </span>
      </div>

      {/* Two columns for How It Runs and Remaining Work */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto pr-1">
        {/* How It Runs (3 steps) */}
        <div className="p-3 rounded-xl bg-midnight-workshop/70 border border-warmPaper/10 space-y-2">
          <div className="flex items-center gap-1.5 pb-1 border-b border-warmPaper/10">
            <Terminal className="w-3 h-3 text-signalLime" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-mutedSage font-semibold">
              How it runs (3 steps)
            </span>
          </div>

          <div className="space-y-1.5">
            {RUN_STEPS.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-warmPaper/10 text-warmPaper font-mono text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="font-sans text-[11px] text-warmPaper/80 leading-snug">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Remaining Work (3 items) */}
        <div className="p-3 rounded-xl bg-midnight-workshop/70 border border-warmPaper/10 space-y-2">
          <div className="flex items-center gap-1.5 pb-1 border-b border-warmPaper/10">
            <Clock className="w-3 h-3 text-oxidisedMint" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-mutedSage font-semibold">
              Remaining work (3 items)
            </span>
          </div>

          <div className="space-y-1.5">
            {REMAINING_WORK.map((item) => {
              const isAttention = item.type === 'attention';
              const isProgress = item.type === 'progress';

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-midnight-graphite/60 border border-warmPaper/5"
                >
                  <span className="font-sans text-[11px] text-warmPaper/80 truncate">
                    {item.title}
                  </span>
                  <span
                    className={`font-mono text-[9px] px-1.5 py-0.5 rounded uppercase flex-shrink-0 font-medium ${
                      isAttention
                        ? 'bg-warmCopper/15 text-warmCopper border border-warmCopper/30 font-bold'
                        : isProgress
                        ? 'bg-oxidisedMint/15 text-oxidisedMint border border-oxidisedMint/30'
                        : 'bg-warmPaper/10 text-mutedSage'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EngineeringProjectsPanel;
