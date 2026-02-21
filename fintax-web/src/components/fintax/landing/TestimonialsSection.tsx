"use client";

import { Quote } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardBody } from "@/components/fintax/Card";
import { Container } from "@/components/fintax/Container";
import { Section } from "@/components/fintax/Section";

export function TestimonialsSection() {
  const t = useTranslations("Landing.testimonials");
  const testimonials = t.raw("items") as Array<{ quote: string; author: string; role: string }>;

  return (
    <Section id="testimonials">
      <Container>
        <p className="text-sm uppercase tracking-[0.16em] text-teal">{t("eyebrow")}</p>
        <h2 className="mt-2 text-3xl font-semibold text-text">{t("title")}</h2>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((item) => (
            <Card key={item.author}>
              <CardBody>
                <Quote className="mb-4 size-5 text-teal" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-secondary">&ldquo;{item.quote}&rdquo;</p>
                <div className="mt-5">
                  <p className="text-sm font-medium text-text">{item.author}</p>
                  <p className="text-xs text-muted">{item.role}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
