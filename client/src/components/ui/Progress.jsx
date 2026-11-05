import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Progress({ value = 0, max = 100, className = '', barClassName = '' }) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={twMerge('w-full bg-subtle rounded-full h-2 overflow-hidden border border-border/50', className)}
    >
      <div
        className={twMerge(
          'h-full bg-forest-700 origin-left transition-transform duration-300 ease-out rounded-full w-full',
          barClassName
        )}
        style={{ transform: `scaleX(${percentage / 100})` }}
      />
    </div>
  );
}
