import React from 'react';

/**
 * HeroSceneFallback: High-fidelity SVG poster artwork rendered before WebGL loads
 * or in non-WebGL / reduced-motion environments.
 * Electric Blue & Fresh Mint clean canvas styling.
 */
export function HeroSceneFallback() {
  return (
    <div
      className="w-full h-full min-h-[360px] sm:min-h-[420px] lg:min-h-[460px] flex items-center justify-center relative select-none"
      aria-label="3D Relay Engine representation"
    >
      <svg
        viewBox="0 0 500 500"
        className="w-full max-w-[400px] lg:max-w-[440px] h-auto drop-shadow-[0_20px_50px_rgba(49,91,219,0.15)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="fallbackRibbonBlue" x1="50" y1="50" x2="450" y2="450" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#315BDB" />
            <stop offset="50%" stopColor="#284DC4" />
            <stop offset="100%" stopColor="#192B42" />
          </linearGradient>
          <linearGradient id="fallbackRibbonMint" x1="450" y1="100" x2="80" y2="420" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2CBF9B" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#1F8A70" />
            <stop offset="100%" stopColor="#155C4A" />
          </linearGradient>
          <radialGradient id="coreGlowBlue" cx="250" cy="250" r="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#315BDB" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#2CBF9B" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Core Aura */}
        <circle cx="250" cy="250" r="120" fill="url(#coreGlowBlue)" />

        {/* Sculptural Interlocking Ribbon 1: Electric Blue */}
        <path
          d="M 140 250 C 140 180 200 145 270 160 C 350 180 375 260 335 320 C 290 380 190 370 160 310 C 145 285 155 235 195 220 C 255 195 320 235 315 290"
          stroke="url(#fallbackRibbonBlue)"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Sculptural Interlocking Ribbon 2: Fresh Mint */}
        <path
          d="M 360 250 C 360 320 300 355 230 340 C 150 320 125 240 165 180 C 210 120 310 130 340 190 C 355 215 345 265 305 280 C 245 305 180 265 185 210"
          stroke="url(#fallbackRibbonMint)"
          strokeWidth="22"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Orbiting Satellite Nodes */}
        <circle cx="170" cy="160" r="7" fill="#315BDB" />
        <circle cx="350" cy="340" r="6" fill="#2CBF9B" />
        <circle cx="160" cy="350" r="8" fill="#FF886B" /> {/* Coral accent */}
        <circle cx="340" cy="150" r="6.5" fill="#315BDB" />

        {/* Glowing Nexus Relay Core */}
        <circle cx="250" cy="250" r="22" fill="#315BDB" filter="url(#softGlow)" />
        <circle cx="250" cy="250" r="12" fill="#2CBF9B" />
        <circle cx="250" cy="250" r="5" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

export default HeroSceneFallback;
