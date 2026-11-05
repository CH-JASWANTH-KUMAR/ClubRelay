import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Select = forwardRef(function Select(
  { label, error, helperText, options = [], children, className = '', id, ...props },
  ref
) {
  const selectId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-charcoal-700 mb-1">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={twMerge(
          clsx(
            'w-full rounded border border-border bg-white px-3 py-2 text-sm text-charcoal-900',
            'transition-colors duration-150 focus:border-forest-700 focus:outline-none focus:ring-1 focus:ring-forest-700',
            error && 'border-red-600 focus:border-red-600 focus:ring-red-600',
            className
          )
        )}
        {...props}
      >
        {children ||
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-charcoal-500 mt-1">{helperText}</p>}
    </div>
  );
});
