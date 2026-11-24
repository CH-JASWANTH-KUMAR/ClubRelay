import React, { useCallback, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const Beam = ({ width, x, delay, duration }) => {
  // Luminous campus energy hues: cyan, electric blue, mint, and sunshine
  const [hue] = useState(() => {
    const paletteHues = [215, 165, 45, 190]; // Blue, Mint, Sunshine, Cyan
    return paletteHues[Math.floor(Math.random() * paletteHues.length)];
  });
  const [ar] = useState(() => Math.floor(Math.random() * 8) + 2);

  return (
    <motion.div
      style={{
        left: `${x}%`,
        width: `${width}%`,
        aspectRatio: `1 / ${ar}`,
        background: `linear-gradient(hsl(${hue} 85% 60%), transparent)`,
      }}
      className="absolute top-0 -translate-x-1/2 pointer-events-none rounded-full blur-[1px]"
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: '-100%', opacity: [0, 0.9, 0] }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
};

export function WarpBackground({
  children,
  perspective = 120,
  className = '',
  beamsPerSide = 3,
  beamSize = 6,
  beamDelayMax = 3,
  beamDelayMin = 0,
  beamDuration = 3.5,
  gridColor = 'rgba(49, 91, 219, 0.15)',
  ...props
}) {
  const generateBeams = useCallback(() => {
    const beams = [];
    const cellsPerSide = Math.floor(100 / beamSize);
    const step = cellsPerSide / beamsPerSide;

    for (let i = 0; i < beamsPerSide; i++) {
      const x = Math.floor(i * step);
      const delay = Math.random() * (beamDelayMax - beamDelayMin) + beamDelayMin;
      beams.push({ x: x * beamSize, delay });
    }
    return beams;
  }, [beamsPerSide, beamSize, beamDelayMax, beamDelayMin]);

  const topBeams = useMemo(() => generateBeams(), [generateBeams]);
  const rightBeams = useMemo(() => generateBeams(), [generateBeams]);
  const bottomBeams = useMemo(() => generateBeams(), [generateBeams]);
  const leftBeams = useMemo(() => generateBeams(), [generateBeams]);

  return (
    <div className={cn('relative rounded-3xl border border-border overflow-hidden p-8 sm:p-14 select-none', className)} {...props}>
      {/* 3D Warp Perspective Tunnel */}
      <div
        style={{
          perspective: `${perspective}px`,
        }}
        className="pointer-events-none absolute inset-0 size-full overflow-hidden"
      >
        <div
          className="absolute inset-0 size-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Top grid ceiling */}
          <div
            className="absolute top-0 left-0 w-full h-[150%] origin-top pointer-events-none"
            style={{
              transform: 'rotateX(-90deg)',
              backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          >
            {topBeams.map((beam, i) => (
              <Beam key={`top-${i}`} width={beamSize} x={beam.x} delay={beam.delay} duration={beamDuration} />
            ))}
          </div>

          {/* Bottom grid floor */}
          <div
            className="absolute bottom-0 left-0 w-full h-[150%] origin-bottom pointer-events-none"
            style={{
              transform: 'rotateX(90deg)',
              backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          >
            {bottomBeams.map((beam, i) => (
              <Beam key={`bottom-${i}`} width={beamSize} x={beam.x} delay={beam.delay} duration={beamDuration} />
            ))}
          </div>

          {/* Left grid wall */}
          <div
            className="absolute top-0 left-0 h-full w-[150%] origin-left pointer-events-none"
            style={{
              transform: 'rotateY(90deg)',
              backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          >
            {leftBeams.map((beam, i) => (
              <Beam key={`left-${i}`} width={beamSize} x={beam.x} delay={beam.delay} duration={beamDuration} />
            ))}
          </div>

          {/* Right grid wall */}
          <div
            className="absolute top-0 right-0 h-full w-[150%] origin-right pointer-events-none"
            style={{
              transform: 'rotateY(-90deg)',
              backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          >
            {rightBeams.map((beam, i) => (
              <Beam key={`right-${i}`} width={beamSize} x={beam.x} delay={beam.delay} duration={beamDuration} />
            ))}
          </div>
        </div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default WarpBackground;

