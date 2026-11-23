import React from 'react';
import { twMerge } from 'tailwind-merge';

export function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div
      className={twMerge(
        'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-border bg-subtle/50',
        className
      )}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-3 border border-brand-100">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h4 className="font-heading text-sm font-bold text-ink mb-1">{title}</h4>
      {description && <p className="text-xs text-mutedSlate max-w-sm mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

export function Avatar({ src, name = 'User', size = 'md', className = '' }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sizes = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-14 h-14 text-base font-semibold',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={twMerge('rounded-full object-cover border border-border', sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={twMerge(
        'rounded-full bg-brand-100 text-brand-800 font-semibold flex items-center justify-center border border-brand-200 select-none',
        sizes[size],
        className
      )}
      title={name}
    >
      {initials}
    </div>
  );
}
