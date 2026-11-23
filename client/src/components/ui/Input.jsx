import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = forwardRef(function Input(
  { label, error, helperText, className = '', id, ...props },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-ink mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={twMerge(
          clsx(
            'w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink placeholder:text-mutedSlate/60',
            'transition-colors duration-150 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
            error && 'border-red-600 focus:border-red-600 focus:ring-red-600',
            className
          )
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-charcoal-500 mt-1">{helperText}</p>}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, error, helperText, className = '', id, rows = 3, ...props },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-ink mb-1">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={twMerge(
          clsx(
            'w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink placeholder:text-mutedSlate/60',
            'transition-colors duration-150 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
            error && 'border-red-600 focus:border-red-600 focus:ring-red-600',
            className
          )
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-charcoal-500 mt-1">{helperText}</p>}
    </div>
  );
});
