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
        <label htmlFor={inputId} className="block text-xs font-medium text-charcoal-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={twMerge(
          clsx(
            'w-full rounded border border-border bg-white px-3 py-2 text-sm text-charcoal-900 placeholder:text-charcoal-400',
            'transition-colors duration-150 focus:border-forest-700 focus:outline-none focus:ring-1 focus:ring-forest-700',
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
        <label htmlFor={inputId} className="block text-xs font-medium text-charcoal-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={twMerge(
          clsx(
            'w-full rounded border border-border bg-white px-3 py-2 text-sm text-charcoal-900 placeholder:text-charcoal-400',
            'transition-colors duration-150 focus:border-forest-700 focus:outline-none focus:ring-1 focus:ring-forest-700',
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
