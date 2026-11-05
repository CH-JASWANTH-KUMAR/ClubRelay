import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const base = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    default: 'bg-subtle text-charcoal-700 border border-border',
    draft: 'bg-[#F1F1EF] text-[#5F6662] border border-border',
    proposed: 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]',
    approved: 'bg-[#E8F5EE] text-[#1B4332] border border-[#B7E4C7]',
    planning: 'bg-[#E0EDF8] text-[#1E40AF] border border-[#BFDBFE]',
    inProgress: 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]',
    completed: 'bg-[#E8F5EE] text-[#1B4332] border border-[#B7E4C7]',
    archived: 'bg-[#F3F4F6] text-[#6B7280] border border-border',
    urgent: 'bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]',
    high: 'bg-[#FFEDD5] text-[#C2410C] border border-[#FED7AA]',
    medium: 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]',
    low: 'bg-[#F1F5F9] text-[#475569] border border-border',
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
