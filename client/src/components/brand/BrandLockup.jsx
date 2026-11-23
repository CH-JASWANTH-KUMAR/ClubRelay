import React from 'react';
import { BrandMark } from './BrandMark';
import { BrandWordmark } from './BrandWordmark';

/**
 * BrandLockup — Official horizontal combination of BrandMark + BrandWordmark.
 */
export function BrandLockup({
  size = 'md',
  variant = 'color',
  className = '',
  showWordmark = true,
}) {
  const gapMap = {
    xs: 'gap-1.5',
    sm: 'gap-2',
    md: 'gap-2.5',
    lg: 'gap-3',
    xl: 'gap-4',
  };

  const markVariant = variant === 'light' || variant === 'dark-surface' ? 'dark' : variant;
  const wordmarkVariant = variant === 'light' || variant === 'dark-surface' ? 'light' : variant;

  return (
    <div className={`inline-flex items-center ${gapMap[size] || 'gap-2.5'} ${className}`}>
      <BrandMark size={size} variant={markVariant} />
      {showWordmark && <BrandWordmark size={size} variant={wordmarkVariant} />}
    </div>
  );
}

export default BrandLockup;
