"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { Container } from "@/components/fintax/Container";

const footerSections = {
  Product: [
    { label: "Tax Engine", href: "/dashboard" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Integrations", href: "/#services" },
  ],
  Company: [
    { label: "About", href: "/" },
    { label: "Careers", href: "/auth" },
    { label: "Contact", href: "/legal/privacy" },
  ],
  Legal: [
    { label: "Privacy", href: "/legal/privacy" },
    { label: "Terms", href: "/legal/terms" },
    { label: "Cookies", href: "/legal/privacy" },
  ],
  Languages: [
    { label: "EN", href: "/" },
    { label: "NL", href: "/" },
    { label: "ES", href: "/" },
    { label: "RO", href: "/" },
    { label: "PL", href: "/" },
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
