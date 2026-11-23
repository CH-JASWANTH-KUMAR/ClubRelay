import React from 'react';

/**
 * BrandMark: Official geometric vector logo for ClubRelay.
 * Represents continuity, connected pathways, and passing institutional memory forward.
 */
export function BrandMark({
  size = 'md',
  variant = 'color',
  className = '',
  'aria-hidden': ariaHidden = true,
}) {
  const sizeMap = {
    xs: 18,
    sm: 24,
    md: 32,
    lg: 48,
    xl: 64,
    hero: 96,
  };

  const dimension = typeof size === 'number' ? size : sizeMap[size] || 32;

  // Variant color definitions
  const isDark = variant === 'dark' || variant === 'light';
  const isWhite = variant === 'white';

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 select-none ${className}`}
      aria-hidden={ariaHidden}
    >
      <defs>
        <linearGradient id={`crBlue-${variant}`} x1="20" y1="20" x2="108" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={isDark ? '#5D8BEE' : isWhite ? '#FFFFFF' : '#315BDB'} />
          <stop offset="100%" stopColor={isDark ? '#315BDB' : isWhite ? '#FFFFFF' : '#1F3EA8'} />
        </linearGradient>
        <linearGradient id={`crMint-${variant}`} x1="108" y1="108" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={isDark ? '#52C9B0' : isWhite ? '#FFFFFF' : '#2CBF9B'} />
          <stop offset="100%" stopColor={isDark ? '#2CBF9B' : isWhite ? '#FFFFFF' : '#1F8A70'} />
        </linearGradient>
      </defs>

      {/* Track 1: Outgoing Batch / Momentum Loop (Electric Blue) */}
      <path
        d="M 32 64 C 32 38 48 24 72 24 C 92 24 104 36 104 52 C 104 68 88 80 64 80 L 40 80"
        stroke={`url(#crBlue-${variant})`}
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Track 2: Incoming Continuity / Passing Forward Loop (Fresh Mint) */}
      <path
        d="M 96 64 C 96 90 80 104 56 104 C 36 104 24 92 24 76 C 24 60 40 48 64 48 L 88 48"
        stroke={`url(#crMint-${variant})`}
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Handover Nexus Spark: Baton Transfer of Institutional Knowledge */}
      <circle cx="64" cy="64" r="7.5" fill={isWhite ? '#FFFFFF' : '#FF886B'} />
      <circle cx="64" cy="64" r="3" fill={isWhite ? '#192B42' : '#FFFFFF'} />
    </svg>
  );
}

export default BrandMark;

