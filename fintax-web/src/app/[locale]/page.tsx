import type { Metadata } from "next";

import { Footer, Navbar } from "@/components/fintax";
import {
  FaqSection,
  HeroSection,
  HowItWorksSection,
  PricingSection,
  ServicesSection,
  TestimonialsSection,
  WhyFinTaxSection,
} from "@/components/fintax/landing";

export const metadata: Metadata = {
  title: "FinTax | Dutch taxes & benefits explained in your language",
  description:
    "File your tax return (P/M/C), manage ZZP + VAT, apply for toeslagen, and understand government letters with automation + human review.",
  openGraph: {
    title: "FinTax | Dutch taxes & benefits explained in your language",
    description:
      "Multilingual Dutch tax support with fixed pricing, dashboard tracking, and human-reviewed filing.",
    type: "website",
    images: [
      {
        url: "/visuals/hero-dashboard.png",
        width: 1200,
        height: 860,
        alt: "FinTax dashboard preview",
      },
    ],
  },
};

export default function HomePage() {
  return (
    <div className="fintax-bg texture-grid texture-noise min-h-screen">
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <HowItWorksSection />
        <WhyFinTaxSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
