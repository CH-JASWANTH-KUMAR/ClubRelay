import React, { useRef, useEffect } from 'react';
import { ReactLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { MarketingNavbar } from '../components/marketing/navigation/MarketingNavbar';
import { MarketingHero } from '../components/marketing/hero/MarketingHero';
import { ProblemStorySection } from '../components/marketing/sections/ProblemStorySection';
import { ProductExperienceSection } from '../components/marketing/sections/ProductExperienceSection';
import { PillarsSection } from '../components/marketing/sections/PillarsSection';
import { HandoverStorySection } from '../components/marketing/sections/HandoverStorySection';
import { CommunitiesSection } from '../components/marketing/sections/CommunitiesSection';
import { HowItWorksSection } from '../components/marketing/sections/HowItWorksSection';
import { FinalCtaSection } from '../components/marketing/sections/FinalCtaSection';
import { MarketingFooter } from '../components/marketing/footer/MarketingFooter';

gsap.registerPlugin(ScrollTrigger);

/**
 * LandingPage: Phase 3.5 Clean Campus Technology Marketing Composition.
 * Driven by the single official GSAP ticker + Lenis loop with autoRaf={false}.
 */
export function LandingPage() {
  const lenisRef = useRef(null);

  // Single GSAP ticker driving Lenis RAF loop (official recommended pattern)
  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  // Sync Lenis scroll events with ScrollTrigger
  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;

    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);

    return () => {
      window.__lenis = null;
      lenis.off('scroll', ScrollTrigger.update);
    };
  }, []);

  // Ensure root body background matches Clean Canvas while on marketing landing page
  useEffect(() => {
    const prevBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#F7F8F4';
    return () => {
      document.body.style.backgroundColor = prevBg;
    };
  }, []);

  return (
    <ReactLenis root ref={lenisRef} autoRaf={false}>
      <div className="min-h-screen bg-canvas text-ink selection:bg-brand-100 selection:text-brand-900 flex flex-col font-sans">
        {/* Section 01: Floating Pill Navbar */}
        <MarketingNavbar />

        <main className="flex-1">
          {/* Section 02: Hero with 3D Relay Engine & KineticText */}
          <MarketingHero />

          {/* Section 03: The Cost of Starting Over */}
          <ProblemStorySection />

          {/* Section 04: See the Platform (Interactive Cockpit) */}
          <ProductExperienceSection />

          {/* Section 05: Four Pillars of Club Operations */}
          <PillarsSection />

          {/* Section 06: Leadership Handover (Signature Continuity Flow) */}
          <HandoverStorySection />

          {/* Section 07: Built for Different Campus Communities */}
          <CommunitiesSection />

          {/* Section 08: How It Works */}
          <HowItWorksSection />

          {/* Section 09: Final Call To Action with WarpBackground */}
          <FinalCtaSection />
        </main>

        {/* Section 10: Marketing Footer */}
        <MarketingFooter />
      </div>
    </ReactLenis>
  );
}

export default LandingPage;
