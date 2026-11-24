import React from 'react';
import { Search, FileText, History } from 'lucide-react';

const DOCUMENTS = [
  {
    id: 'doc-1',
    title: 'Annual Hackathon Organizer Playbook',
    type: 'Playbook',
    typeStyle: 'bg-oxidisedMint/15 text-oxidisedMint border-oxidisedMint/30',
    historyStrip: 'v3.2 active (updated 12 days ago) · v3.1 archived · v2.0 baseline',
  },
  {
    id: 'doc-2',
    title: 'Campus Venue Reservation Guidelines',
    type: 'SOP',
    typeStyle: 'bg-signalLime/15 text-signalLime border-signalLime/30',
  },
  {
    id: 'doc-3',
    title: 'Audio Equipment Rental Partner Directory',
    type: 'Vendor',
    typeStyle: 'bg-warmPaper/15 text-warmPaper border-warmPaper/30',
  },
  {
    id: 'doc-4',
    title: 'Executive Transition Protocol',
    type: 'Decision',
    typeStyle: 'bg-warmCopper/15 text-warmCopper border-warmCopper/30',
  },
];

export function InstitutionalMemoryPanel() {
  return (
    <div className="w-full flex flex-col justify-between h-full space-y-3">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-mutedSage" />
        <input
          type="text"
          readOnly
          value=""
          placeholder="Search documentation, vendor contacts, playbooks..."
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-midnight-workshop/90 border border-warmPaper/10 text-xs text-warmPaper placeholder:text-mutedSage/60 font-sans focus:outline-none cursor-default"
        />
      </div>

      {/* 4 Document Rows */}
      <div className="space-y-2 flex-1 overflow-y-auto pr-1">
        {DOCUMENTS.map((doc) => (
          <div
            key={doc.id}
            className="p-2.5 rounded-xl bg-midnight-workshop/80 border border-warmPaper/10 space-y-1.5 transition-colors hover:border-warmPaper/20"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-3.5 h-3.5 text-mutedSage flex-shrink-0" />
                <span className="font-display text-xs font-semibold text-warmPaper truncate">
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
              <div className="flex items-center gap-1.5 pt-1 border-t border-warmPaper/5 pl-6">
                <History className="w-2.5 h-2.5 text-oxidisedMint flex-shrink-0" />
                <span className="font-mono text-[10px] text-mutedSage truncate">
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
