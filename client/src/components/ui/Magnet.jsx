import React, { useState, useRef, useEffect } from 'react';

/**
 * Magnet: Subtle magnetic pull interaction for primary buttons
 * Pulls the button towards the cursor on proximity, spring-snapping back on exit.
 */
export function Magnet({
  children,
  magnetStrength = 0.25,
  disabled = false,
  className = '',
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  const handlePointerMove = (e) => {
    if (disabled || prefersReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    setPosition({
      x: distanceX * magnetStrength,
      y: distanceY * magnetStrength,
    });
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
  };

  const handlePointerEnter = () => {
    setIsHovered(true);
  };

  if (prefersReducedMotion || disabled) {
    return <div className={`inline-block ${className}`}>{children}</div>;
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={`inline-block ${className}`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1.2)',
      }}
    >
      {children}
    </div>
  );
}

export default Magnet;
