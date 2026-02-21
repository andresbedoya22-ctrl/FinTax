"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardBody } from "@/components/fintax/Card";
import { Container } from "@/components/fintax/Container";
import { Section } from "@/components/fintax/Section";

export function FaqSection() {
  const t = useTranslations("Landing.faq");
  const faqs = t.raw("items") as Array<{ q: string; a: string }>;

  return (
    <Section id="faq">
      <Container>
        <p className="text-sm uppercase tracking-[0.16em] text-teal">{t("eyebrow")}</p>
        <h2 className="mt-2 text-3xl font-semibold text-text">{t("title")}</h2>

        <div className="mt-8 grid gap-3">
          {faqs.map((item) => (
            <Card key={item.q}>
              <CardBody className="py-0">
                <details className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left text-base font-medium text-text [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <ChevronDown
                      className="size-5 text-muted transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-secondary">{item.a}</p>
                </details>
              </CardBody>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
