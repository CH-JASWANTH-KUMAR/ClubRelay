import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const base = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    default: 'bg-subtle text-ink border border-border',
    draft: 'bg-[#F1F3EE] text-[#586B7E] border border-border',
    proposed: 'bg-[#FEF8EB] text-[#B88D22] border border-[#F6C85F]/50',
    approved: 'bg-[#EAF8F5] text-[#1F8A70] border border-[#2CBF9B]/40',
    planning: 'bg-[#EEF2FD] text-[#1F3EA8] border border-[#315BDB]/30',
    inProgress: 'bg-[#EEF2FD] text-[#315BDB] border border-[#315BDB]/40',
    completed: 'bg-[#EAF8F5] text-[#1F8A70] border border-[#2CBF9B]/40',
    archived: 'bg-[#F1F3EE] text-[#68788B] border border-border',
    urgent: 'bg-[#FFF3F0] text-[#D95E41] border border-[#FF886B]/40',
    high: 'bg-[#FFF3F0] text-[#D95E41] border border-[#FF886B]/40',
    medium: 'bg-[#FEF8EB] text-[#B88D22] border border-[#F6C85F]/50',
    low: 'bg-[#EEF2FD] text-[#586B7E] border border-border',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  return (
    <span className={twMerge(clsx(base, variants[variant], sizes[size], className))}>
      {children}
    </span>
  );
}
