import React, { useRef, useState } from 'react';

/**
 * Spotlight: Aceternity-inspired ambient spotlight effect for focal regions.
 * Tracks pointer movement gently to create a realistic directional torch effect.
 */
export function Spotlight({ className = '', fill = '#315BDB' }) {
  const containerRef = useRef(null);
  const [position, setPosition] = useState({ x: 50, y: 30 });
  const [opacity, setOpacity] = useState(0);

  const handlePointerMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
    setOpacity(1);
  };

  const handlePointerLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-500 ${className}`}
      style={{ opacity }}
    >
      <div
        className="absolute w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px] transition-transform duration-75 ease-out"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          background: `radial-gradient(circle, ${fill}18 0%, ${fill}05 45%, transparent 70%)`,
        }}
      />
    </div>
  );
}

export default Spotlight;

