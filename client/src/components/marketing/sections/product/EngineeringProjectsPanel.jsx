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
    <div className="w-full flex flex-col space-y-4">
      {/* Project Card Header with Repository Link Row */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 flex-shrink-0">
            <GitBranch className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-ink truncate">
                github.com/club/sample-portal
              </span>
              <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-semibold">
                main
              </span>
            </div>
            <span className="font-sans text-[11px] text-slate-500 block">
              Maintainer: Technical Lead
            </span>
          </div>
        </div>

        <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex-shrink-0 font-semibold">
          Production active
        </span>
      </div>

      {/* Two columns for How It Runs and Remaining Work */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto pr-1">
        {/* How It Runs (3 steps) */}
        <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
            <Terminal className="w-3 h-3 text-brand-600" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              How it runs (3 steps)
            </span>
          </div>

          <div className="space-y-1.5">
            {RUN_STEPS.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-mono text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  {idx + 1}
                </span>
                <span className="font-sans text-[11px] text-ink/80 leading-snug">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Remaining Work (3 items) */}
        <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
            <Clock className="w-3 h-3 text-brand-600" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold">
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
                  className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white border border-slate-200/60 shadow-2xs"
                >
                  <span className="font-sans text-[11px] text-ink/80 truncate">
                    {item.title}
                  </span>
                  <span
                    className={`font-mono text-[9px] px-1.5 py-0.5 rounded uppercase flex-shrink-0 font-medium ${
                      isAttention
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 font-bold'
                        : isProgress
                        ? 'bg-brand-50 text-brand-700 border border-brand-200 font-semibold'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
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
