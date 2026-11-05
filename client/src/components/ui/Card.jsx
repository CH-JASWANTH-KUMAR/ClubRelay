import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-surface rounded-lg border border-border p-5 shadow-card transition-colors duration-150',
          hover && 'hover:border-charcoal-300 hover:shadow-elevated',
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
        <h3 className="text-base font-semibold text-charcoal-900 leading-snug">{title}</h3>
        {subtitle && <p className="text-xs text-charcoal-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
}
