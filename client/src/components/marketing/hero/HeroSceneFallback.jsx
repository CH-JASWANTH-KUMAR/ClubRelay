import React from 'react';

/**
 * HeroSceneFallback: High-fidelity SVG poster artwork rendered before WebGL loads
 * or in non-WebGL / reduced-motion environments.
 */
export function HeroSceneFallback() {
  return (
    <div
      className="w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] flex items-center justify-center relative select-none"
      aria-label="3D Relay Engine representation"
    >
      <svg
        viewBox="0 0 500 500"
        className="w-full max-w-[440px] lg:max-w-[500px] h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="fallbackRibbon1" x1="50" y1="50" x2="450" y2="450" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#82C9AE" />
            <stop offset="50%" stopColor="#2F4339" />
            <stop offset="100%" stopColor="#16221C" />
          </linearGradient>
          <linearGradient id="fallbackRibbon2" x1="450" y1="100" x2="80" y2="420" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D4EE79" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#3B5447" />
            <stop offset="100%" stopColor="#131B17" />
          </linearGradient>
          <radialGradient id="coreGlow" cx="250" cy="250" r="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D4EE79" stopOpacity="0.6" />
            <stop offset="40%" stopColor="#82C9AE" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#101815" stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Core Aura */}
        <circle cx="250" cy="250" r="140" fill="url(#coreGlow)" />

        {/* Sculptural Interlocking Ribbon 1: Charcoal & Mint */}
        <path
          d="M 120 250 C 120 160 200 120 280 140 C 370 165 400 260 350 330 C 300 400 180 390 145 320 C 130 290 140 230 190 210 C 260 180 340 230 330 300"
          stroke="url(#fallbackRibbon1)"
          strokeWidth="32"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />

        {/* Sculptural Interlocking Ribbon 2: Luminous Mint & Lime Contour */}
        <path
          d="M 380 250 C 380 340 300 380 220 360 C 130 335 100 240 150 170 C 200 100 320 110 355 180 C 370 210 360 270 310 290 C 240 320 160 270 170 200"
          stroke="url(#fallbackRibbon2)"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Core Nexus Sphere */}
        <circle cx="250" cy="250" r="32" fill="#151A18" stroke="#82C9AE" strokeWidth="3" />
        <circle cx="250" cy="250" r="18" fill="#D4EE79" filter="url(#softGlow)" />
        <circle cx="250" cy="250" r="8" fill="#FFFFFF" />

        {/* Orbital Nodes with Connection Sparkles */}
        <circle cx="150" cy="120" r="8" fill="#D77D5E" />
        <circle cx="390" cy="160" r="10" fill="#82C9AE" filter="url(#softGlow)" />
        <circle cx="340" cy="390" r="7" fill="#D4EE79" />
        <circle cx="100" cy="320" r="6" fill="#F0EDE3" opacity="0.8" />

        {/* Orbit Path Guides */}
        <ellipse cx="250" cy="250" rx="190" ry="90" stroke="rgba(130, 201, 174, 0.15)" strokeWidth="1.5" strokeDasharray="4 6" transform="rotate(-25 250 250)" />
        <ellipse cx="250" cy="250" rx="210" ry="110" stroke="rgba(212, 238, 121, 0.12)" strokeWidth="1.5" strokeDasharray="3 8" transform="rotate(35 250 250)" />
      </svg>
    </div>
  );
}

export default HeroSceneFallback;
