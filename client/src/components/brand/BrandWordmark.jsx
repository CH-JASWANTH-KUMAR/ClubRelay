import React from 'react';

/**
 * BrandWordmark: Typography wordmark for ClubRelay.
 * Features high-contrast display weights with signature Campus Energy accents.
 */
export function BrandWordmark({
  size = 'md',
  variant = 'dark',
  className = '',
  'aria-hidden': ariaHidden = true,
}) {
  const sizeClasses = {
    xs: 'text-sm tracking-tight',
    sm: 'text-base tracking-tight',
    md: 'text-lg tracking-tight',
    lg: 'text-2xl tracking-tight',
    xl: 'text-3xl tracking-tight',
  };

  const isLight = variant === 'light' || variant === 'dark-surface';
  const isWhite = variant === 'white';

  return (
    <span
      className={`font-heading font-extrabold select-none inline-flex items-center ${sizeClasses[size] || sizeClasses.md} ${className}`}
      aria-hidden={ariaHidden}
    >
      <span className={isLight || isWhite ? 'text-white' : 'text-ink'}>Club</span>
      <span className={isWhite ? 'text-white' : isLight ? 'text-brand-300' : 'text-brand-500'}>
        Relay
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-mint-500 ml-1 inline-block" />
    </span>
  );
}

export default BrandWordmark;

