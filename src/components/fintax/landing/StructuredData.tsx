import type { AppLocale } from "@/i18n/routing";
import { buildAbsoluteUrl } from "@/lib/seo";

type StructuredDataProps = {
  locale: AppLocale;
  faq: { question: string; answer: string }[];
  nonce?: string;
};

export function StructuredData({ locale, faq, nonce }: StructuredDataProps) {
  const url = buildAbsoluteUrl(`/${locale}`);

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FinTax",
    url,
    inLanguage: locale,
  };

  const service = {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "SoftwareApplication"],
    name: "FinTax",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    serviceType: "Tax and benefits case guidance",
    description:
      "Guided intake, human review, and case tracking for Dutch tax returns and benefits workflows.",
    areaServed: "NL",
    availableLanguage: ["en", "nl", "es", "pl", "ro"],
    url,
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
      <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
      <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
    </>
  );
}
