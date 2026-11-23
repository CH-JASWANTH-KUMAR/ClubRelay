import React, { useRef, useEffect } from 'react';
import { ReactLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { MarketingNavbar } from '../components/marketing/MarketingNavbar';
import { MarketingHero } from '../components/marketing/MarketingHero';
import { ProblemSection } from '../components/marketing/ProblemSection';
import { BentoFeatures } from '../components/marketing/BentoFeatures';
import { DragCards } from '../components/marketing/DragCards';
import { ProductPreview } from '../components/marketing/ProductPreview';
import { RelayContinuitySection } from '../components/marketing/RelayContinuitySection';
import { HowItWorks } from '../components/marketing/HowItWorks';
import { CampusCommunities } from '../components/marketing/CampusCommunities';
import { FinalCtaSection } from '../components/marketing/FinalCtaSection';
import { MarketingFooter } from '../components/marketing/MarketingFooter';

gsap.registerPlugin(ScrollTrigger);

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

    lenis.on('scroll', ScrollTrigger.update);

    return () => {
      lenis.off('scroll', ScrollTrigger.update);
    };
  }, []);

  return (
    <ReactLenis root ref={lenisRef} autoRaf={false}>
      <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans">
        <MarketingNavbar />
        <main className="flex-1">
          <MarketingHero />
          <ProblemSection />
          <BentoFeatures />
          <DragCards />
          <ProductPreview />
          <RelayContinuitySection />
          <HowItWorks />
          <CampusCommunities />
          <FinalCtaSection />
        </main>
        <MarketingFooter />
      </div>
    </ReactLenis>
  );
}

export default LandingPage;
