"use client";

import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { HeroSection } from "@/components/marketing/hero";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { ProblemSection } from "@/components/marketing/problem-section";
import { FrameworkSection } from "@/components/marketing/framework-section";
import { SignalLadderSection } from "@/components/marketing/signal-ladder";
import { AIAnalysisSection } from "@/components/marketing/ai-analysis";
import { CTASection } from "@/components/marketing/cta-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { NoiseOverlay } from "@/components/ui/noise-overlay";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { Marquee } from "@/components/ui/marquee";
import { SmoothScroll } from "@/components/ui/smooth-scroll";
import { PageLoader } from "@/components/ui/page-loader";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { ScrollRevealSection } from "@/components/ui/scroll-reveal-section";

const marqueeItems = [
  "AI-Powered Analysis",
  "Multi-Variant Testing",
  "Demand Scoring",
  "Willingness-to-Pay",
  "Behavioral Signals",
  "Conversion Tracking",
  "Audience Segmentation",
  "Smart Recommendations",
];

export default function LandingPage() {
  return (
    <SmoothScroll>
      <PageLoader />
      <CustomCursor />
      <NoiseOverlay />
      <ScrollProgress />
      <MarketingNav />
      <main>
        <HeroSection />
        <DashboardPreview />
        <Marquee items={marqueeItems} speed={35} className="py-6 border-y border-white/[0.06]" />
        <ProblemSection />
        <FrameworkSection />
        <SignalLadderSection />
        <ScrollRevealSection
          eyebrow="The result"
          heading="Demand signals you can actually trust."
          subheading="Every data point is real traffic, real behavior, and real buying intent — not surveys, not guesses, not vibes."
        />
        <AIAnalysisSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <MarketingFooter />
    </SmoothScroll>
  );
}