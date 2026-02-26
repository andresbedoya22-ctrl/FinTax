import type { Metadata } from "next";

import { PremiumLandingPage } from "@/components/fintax/landing";

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
      { url: "/visuals/app-mock.png", width: 1600, height: 1000, alt: "FinTax premium conversion landing preview" },
    ],
  },
};

export default function HomePage() {
  return <PremiumLandingPage />;
}
