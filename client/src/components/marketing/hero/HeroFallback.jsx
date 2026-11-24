import React from 'react';

/**
 * HeroFallback: Static 3-frame SVG storyboard rendered for reduced-motion environments,
 * mobile screens under 768px, or when WebGL is unavailable.
 * Shows the three beats: Scattered -> Gathered -> Handed Over.
 */
export function HeroFallback() {
  return (
    <div
      className="w-full h-full min-h-[340px] flex flex-col items-center justify-center p-4 select-none"
      aria-label="Scattered to Handed Over visual narrative"
    >
      <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
        {/* Frame 1: Scattered */}
        <div className="p-3 rounded-2xl bg-white border border-border flex flex-col items-center text-center shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-subtle flex items-center justify-center mb-2 text-xs font-mono text-ink/70">
            01
          </div>
          <span className="font-display font-bold text-xs text-ink mb-1">Scattered</span>
          <p className="text-[10px] text-ink/65 leading-tight">6 disjointed tools and personal drives</p>
        </div>

        {/* Frame 2: Gathered */}
        <div className="p-3 rounded-2xl bg-white border border-brand-200 flex flex-col items-center text-center shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-2 text-xs font-mono font-bold">
            02
          </div>
          <span className="font-display font-bold text-xs text-brand-600 mb-1">Gathered</span>
          <p className="text-[10px] text-ink/65 leading-tight">Unified into the permanent club engine</p>
        </div>

        {/* Frame 3: Handed Over */}
        <div className="p-3 rounded-2xl bg-white border border-mint-200 flex flex-col items-center text-center shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-mint-50 text-mint-700 flex items-center justify-center mb-2 text-xs font-mono font-bold">
            03
          </div>
          <span className="font-display font-bold text-xs text-mint-700 mb-1">Handed Over</span>
          <p className="text-[10px] text-ink/65 leading-tight">8 verified dossier sections passed forward</p>
        </div>
      </div>
    </div>
  );
}

export default HeroFallback;
