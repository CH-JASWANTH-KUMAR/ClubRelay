import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-medium rounded transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

  const variants = {
    primary:
      'bg-forest-700 text-white hover:bg-forest-600 active:bg-forest-800 focus-visible:outline-forest-700 shadow-subtle',
    secondary:
      'bg-white text-charcoal-800 border border-border hover:bg-subtle active:bg-muted focus-visible:outline-forest-700 shadow-subtle',
    outline:
      'bg-transparent text-forest-700 border border-forest-700 hover:bg-forest-50 active:bg-forest-100 focus-visible:outline-forest-700',
    ghost:
      'bg-transparent text-charcoal-700 hover:bg-subtle active:bg-muted focus-visible:outline-forest-700',
    danger:
      'bg-red-700 text-white hover:bg-red-800 active:bg-red-900 focus-visible:outline-red-700 shadow-subtle',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={twMerge(clsx(base, variants[variant], sizes[size], className))}
      {...props}
    >
      {children}
    </button>
  );
}
