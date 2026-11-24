import React from 'react';
import { Search, FileText, History } from 'lucide-react';

const DOCUMENTS = [
  {
    id: 'doc-1',
    title: 'Annual Hackathon Organizer Playbook',
    type: 'Playbook',
    typeStyle: 'bg-brand-50 text-brand-700 border-brand-200',
    historyStrip: 'v3.2 active (updated 12 days ago) · v3.1 archived · v2.0 baseline',
  },
  {
    id: 'doc-2',
    title: 'Campus Venue Reservation Guidelines',
    type: 'SOP',
    typeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'doc-3',
    title: 'Audio Equipment Rental Partner Directory',
    type: 'Vendor',
    typeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  {
    id: 'doc-4',
    title: 'Executive Transition Protocol',
    type: 'Decision',
    typeStyle: 'bg-amber-50 text-amber-700 border-amber-200',
  },
];

export function InstitutionalMemoryPanel() {
  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          readOnly
          value=""
          placeholder="Search documentation, vendor contacts, playbooks..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-ink placeholder:text-slate-400 font-sans focus:outline-none cursor-default"
        />
      </div>

      {/* 4 Document Rows */}
      <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
        {DOCUMENTS.map((doc) => (
          <div
            key={doc.id}
            className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 transition-colors hover:border-slate-300"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="font-display text-xs font-semibold text-ink truncate">
                  {doc.title}
                </span>
              </div>
              <span
                className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border font-semibold flex-shrink-0 ${doc.typeStyle}`}
              >
                {doc.type}
              </span>
            </div>

            {/* Small version history strip on doc 1 */}
            {doc.historyStrip && (
              <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/60 pl-6">
                <History className="w-2.5 h-2.5 text-brand-600 flex-shrink-0" />
                <span className="font-mono text-[10px] text-slate-500 truncate">
                  {doc.historyStrip}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default InstitutionalMemoryPanel;
