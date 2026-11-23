import React from 'react';
import { MarketingNavbar } from '../components/marketing/MarketingNavbar';
import { MarketingHero } from '../components/marketing/MarketingHero';
import { ProblemSection } from '../components/marketing/ProblemSection';
import { BentoFeatures } from '../components/marketing/BentoFeatures';
import { HowItWorks } from '../components/marketing/HowItWorks';
import { CampusCommunities } from '../components/marketing/CampusCommunities';
import { ProductPreview } from '../components/marketing/ProductPreview';
import { MarketingFooter } from '../components/marketing/MarketingFooter';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans">
      <MarketingNavbar />
      <main className="flex-1">
        <MarketingHero />
        <ProblemSection />
        <BentoFeatures />
        <HowItWorks />
        <CampusCommunities />
        <ProductPreview />
      </main>
      <MarketingFooter />
    </div>
  );
}

export default LandingPage;
