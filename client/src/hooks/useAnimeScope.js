import { useRef, useEffect } from 'react';
import { createScope, animate } from 'animejs';

/**
 * useAnimeScope - Native React hook wrapping Anime.js v4 Scoped Animation Engine.
 * 
 * Guarantees:
 * 1. Honors `prefers-reduced-motion: reduce` by bypassing animations or setting duration 0.
 * 2. Scopes all animations strictly to `rootRef.current`.
 * 3. Automatically invokes `scope.revert()` on component unmount or effect cleanup.
 * 
 * @param {Function} setupCallback - Callback receiving ({ root, scope, animate, isReducedMotion })
 * @param {Array} deps - Dependency array for effect re-execution
 * @returns {React.RefObject} rootRef to attach to the root element
 */
export function useAnimeScope(setupCallback, deps = []) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!rootRef.current) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isReducedMotion = mediaQuery.matches;

    // Create Anime.js scope bound to component root
    const scope = createScope({ root: rootRef.current });

    if (!isReducedMotion && setupCallback) {
      try {
        setupCallback({
          root: rootRef.current,
          scope,
          animate,
          isReducedMotion,
        });
      } catch (err) {
        console.warn('[Anime.js Scope Warning]:', err);
      }
    }

    return () => {
      scope.revert();
    };
  }, deps);

  return rootRef;
}
