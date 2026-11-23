import { useState, useEffect } from 'react';

/**
 * Hook to track scroll position and active marketing section for Pill Nav
 */
export function useMarketingScroll(sectionIds = ['overview', 'platform', 'pillars', 'handover', 'communities', 'how-it-works']) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(sectionIds[0] || '');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 40);

      // Section intersection detection
      const scrollPosition = scrollY + 200;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionIds]);

  return { scrolled, activeSection };
}

export default useMarketingScroll;
