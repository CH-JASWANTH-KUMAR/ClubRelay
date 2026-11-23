import React, { useEffect, useRef, useState } from 'react';

/**
 * AnimatedContent — Viewport reveal animation triggered upon scrolling into view
 * Seamlessly honors prefers-reduced-motion.
 */
export function AnimatedContent({
  children,
  distance = 20,
  direction = 'vertical',
  delay = 0,
  className = '',
  threshold = 0.1,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    if (mediaQuery.matches || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const transformStyle = isVisible
    ? 'translate3d(0, 0, 0)'
    : direction === 'vertical'
    ? `translate3d(0, ${distance}px, 0)`
    : `translate3d(${distance}px, 0, 0)`;

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: transformStyle,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default AnimatedContent;
