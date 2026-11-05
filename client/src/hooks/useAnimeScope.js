import { useRef, useEffect } from 'react';
import { createScope, animate } from 'animejs';

/**
 * useAnimeScope - Native React hook wrapping Anime.js v4 Scoped Animation Engine.
 * 
 * Guarantees:
 * 1. Honors `prefers-reduced-motion: reduce` by bypassing animations or setting duration 0.
 * 2. Scopes all animations strictly to `rootRef.current`.
 * 3. Uses the documented Anime.js v4 `createScope().add()` pattern so animations created
 *    in the scope constructor are registered and reverted on React unmount or StrictMode cycles.
 * 4. Prevents duplicate animations during React StrictMode lifecycle.
 * 5. Supports registering named event-driven animations via `scope.add(name, method)`.
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

    // Create Anime.js scope bound directly to component root
    const scope = createScope({ root: rootRef.current });

    if (!isReducedMotion && setupCallback) {
      try {
        // Official Anime.js v4 pattern: register constructor with scope.add()
        scope.add((self) => {
          return setupCallback({
            root: rootRef.current,
            scope: self,
            animate,
            isReducedMotion,
          });
        });
      } catch (err) {
        console.warn('[Anime.js Scope Warning]:', err);
      }
    }

    return () => {
      // Revert all active animations, clean up inline styles, and unbind listeners
      scope.revert();
    };
  }, deps);

  return rootRef;
}
