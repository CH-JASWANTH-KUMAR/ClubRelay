import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-surface rounded-2xl border border-border p-5 shadow-card transition-colors duration-150',
          hover && 'hover:border-brand-300 hover:shadow-elevated',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={twMerge('flex items-start justify-between pb-3 border-b border-border mb-4', className)}>
      <div>
        <h3 className="font-heading text-base font-bold text-ink leading-snug">{title}</h3>
        {subtitle && <p className="text-xs text-mutedSlate mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
}
