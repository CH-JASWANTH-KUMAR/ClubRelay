import React, { useState, useEffect } from 'react';
import { Check, Clock, Layers } from 'lucide-react';

const WORK_GROUPS = [
  {
    club: 'Sample Engineering Society',
    items: [
      {
        id: 'eng-1',
        title: 'Submit audio equipment requisition',
        meta: 'Due in 2 days',
        role: 'Operations Lead',
      },
      {
        id: 'eng-2',
        title: 'Review workshop technical slide deck',
        meta: 'Due Friday',
        role: 'Technical Lead',
      },
    ],
  },
  {
    club: 'Sample Design Collective',
    items: [
      {
        id: 'des-1',
        title: 'Confirm annual showcase schedule',
        meta: 'Due next week',
        role: 'Events Lead',
      },
      {
        id: 'des-2',
        title: 'Archive brand asset kit for handover',
        meta: 'End of term',
        role: 'Design Lead',
      },
    ],
  },
];

export function MyWorkPanel({ isReducedMotion = false }) {
  // Number of ticked items: from 0 to 4
  const [tickedCount, setTickedCount] = useState(isReducedMotion ? 4 : 1);

  useEffect(() => {
    if (isReducedMotion) {
      setTickedCount(4);
      return;
    }

    // Sequentially tick items: 1, 2, 3, 4
    const t1 = setTimeout(() => setTickedCount(2), 700);
    const t2 = setTimeout(() => setTickedCount(3), 1500);
    const t3 = setTimeout(() => setTickedCount(4), 2300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isReducedMotion]);

  let globalItemIndex = 0;

  return (
    <div className="w-full flex flex-col justify-between h-full space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-brand-600" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
            Personal Action Queue
          </span>
        </div>
        <span className="font-mono text-[10px] text-brand-700 bg-brand-50 border border-brand-200/80 px-2 py-0.5 rounded-full font-bold">
          {tickedCount} of 4 Completed
        </span>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {WORK_GROUPS.map((group) => (
          <div key={group.club} className="space-y-1.5">
            <div className="flex items-center gap-2 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
              <h4 className="font-display font-bold text-xs text-ink">
                {group.club}
              </h4>
            </div>

            <div className="space-y-1.5">
              {group.items.map((item) => {
                const currentIndex = globalItemIndex++;
                const isTicked = currentIndex < tickedCount;

                return (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-between gap-3 ${
                      isTicked
                        ? 'bg-brand-50/40 border-brand-200/80 shadow-2xs'
                        : 'bg-slate-50/70 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Interactive checkbox */}
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                          isTicked
                            ? 'bg-brand-600 text-white'
                            : 'border-2 border-slate-300 bg-white'
                        }`}
                      >
                        {isTicked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span
                          className={`font-display text-xs block leading-snug sm:truncate transition-colors ${
                            isTicked
                              ? 'text-ink font-semibold'
                              : 'text-slate-600 font-medium'
                          }`}
                        >
                          {item.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-sans text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {item.meta}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="font-mono text-[9px] sm:text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 flex-shrink-0 shadow-2xs font-medium">
                      {item.role}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyWorkPanel;
