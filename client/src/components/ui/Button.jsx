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
    'inline-flex items-center justify-center font-medium rounded-xl transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

  const variants = {
    primary:
      'bg-brand-500 bg-forest-700 text-white hover:bg-brand-600 active:bg-brand-700 focus-visible:outline-brand-500 shadow-subtle',
    secondary:
      'bg-surface text-ink border border-border hover:bg-subtle active:bg-muted focus-visible:outline-brand-500 shadow-subtle',
    outline:
      'bg-transparent text-brand-600 border border-brand-500 hover:bg-brand-50 active:bg-brand-100 focus-visible:outline-brand-500',
    ghost:
      'bg-transparent text-mutedSlate hover:text-ink hover:bg-subtle active:bg-muted focus-visible:outline-brand-500',
    danger:
      'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:outline-red-600 shadow-subtle',
    // Midnight Workshop Marketing Variants
    'signal':
      'bg-signalLime text-[#101815] font-semibold hover:bg-signalLime-hover active:bg-signalLime-active focus-visible:outline-signalLime shadow-[0_4px_24px_rgba(212,238,121,0.28)] hover:shadow-[0_6px_28px_rgba(212,238,121,0.4)] transition-all duration-200 transform-gpu active:scale-[0.98]',
    'marketing-secondary':
      'bg-midnight-surface/85 backdrop-blur-md text-[#F0EDE3] border border-midnight-borderLight hover:bg-midnight-forest hover:border-oxidisedMint/50 active:bg-midnight-card focus-visible:outline-oxidisedMint shadow-sm transition-all duration-200',
    'marketing-ghost':
      'bg-transparent text-[#A8B5A9] hover:text-[#F0EDE3] hover:bg-midnight-forest/60 active:bg-midnight-card focus-visible:outline-signalLime transition-colors',
    'paper-primary':
      'bg-[#19251F] text-[#F0EDE3] font-semibold hover:bg-[#101815] active:bg-[#0D1411] focus-visible:outline-[#19251F] shadow-sm transition-all duration-200',
    'paper-secondary':
      'bg-transparent text-[#19251F] font-medium border border-[#19251F]/30 hover:border-[#19251F] hover:bg-[#19251F]/5 active:bg-[#19251F]/10 focus-visible:outline-[#19251F] transition-all duration-200',

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
