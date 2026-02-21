"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { Container } from "@/components/fintax/Container";

const footerSections = {
  Product: [
    { label: "Tax Engine", href: "#tax-engine" },
    { label: "Pricing", href: "#pricing" },
    { label: "Integrations", href: "#integrations" },
  ],
  Company: [
    { label: "About", href: "#about" },
    { label: "Careers", href: "#careers" },
    { label: "Contact", href: "#contact" },
  ],
  Legal: [
    { label: "Privacy", href: "#privacy" },
    { label: "Terms", href: "#terms" },
    { label: "Cookies", href: "#cookies" },
  ],
  Languages: [
    { label: "EN", href: "#lang-en" },
    { label: "NL", href: "#lang-nl" },
    { label: "ES", href: "#lang-es" },
    { label: "RO", href: "#lang-ro" },
    { label: "PL", href: "#lang-pl" },
  ],
};

type SectionTitle = keyof typeof footerSections;

export type FooterProps = React.HTMLAttributes<HTMLElement>;

export function Footer({ className, ...props }: FooterProps) {
  const t = useTranslations("Footer");

  return (
    <footer className={cn("border-t border-border/60 bg-surface2/60", className)} {...props}>
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(footerSections) as SectionTitle[]).map((section) => (
            <div key={section}>
              <h3 className="font-heading text-sm font-semibold text-text">
                {t(`sections.${section.toLowerCase()}`)}
              </h3>
              <ul className="mt-4 space-y-2">
                {footerSections[section].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-secondary transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                    >
                      {section === "Languages" ? item.label : t(`links.${toFooterKey(item.label)}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </footer>
  );
}

function toFooterKey(label: string): string {
  switch (label) {
    case "Tax Engine":
      return "taxEngine";
    case "Pricing":
      return "pricing";
    case "Integrations":
      return "integrations";
    case "About":
      return "about";
    case "Careers":
      return "careers";
    case "Contact":
      return "contact";
    case "Privacy":
      return "privacy";
    case "Terms":
      return "terms";
    case "Cookies":
      return "cookies";
    default:
      return label;
  }
}
