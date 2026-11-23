import React, { useEffect, useState } from 'react';

/**
 * SplitText — Word-level staggered entrance animation
 * Respects prefers-reduced-motion to guarantee accessibility.
 */
export function SplitText({
  text = '',
  className = '',
  delay = 50,
  staggerDelay = 60,
  as: Component = 'span',
}) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (event) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const words = text.split(' ');

  if (prefersReducedMotion) {
    return <Component className={className}>{text}</Component>;
  }

  return (
    <Component className={`inline-flex flex-wrap gap-x-[0.28em] ${className}`} aria-label={text}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="inline-block animate-split-word"
          style={{
            animationDelay: `${delay + index * staggerDelay}ms`,
            animationFillMode: 'both',
          }}
          aria-hidden="true"
        >
          {word}
        </span>
      ))}
    </Component>
  );
}

export default SplitText;
