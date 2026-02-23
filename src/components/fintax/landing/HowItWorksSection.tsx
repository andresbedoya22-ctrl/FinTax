"use client";

import { CheckCheck, FileSearch, Languages, Send } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardBody } from "@/components/fintax/Card";
import { Container } from "@/components/fintax/Container";
import { Section } from "@/components/fintax/Section";

const stepIcons = [FileSearch, Send, Languages, CheckCheck];

export function HowItWorksSection() {
  const t = useTranslations("Landing.howItWorks");
  const steps = t.raw("steps") as Array<{ title: string; copy: string }>;

  return (
    <Section id="how-it-works">
      <Container>
        <p className="text-sm uppercase tracking-[0.16em] text-teal">{t("eyebrow")}</p>
        <h2 className="mt-2 text-3xl font-semibold text-text">{t("title")}</h2>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = stepIcons[index] ?? FileSearch;
            return (
              <Card key={step.title} className="relative overflow-hidden">
                <CardBody>
                  <span className="mb-4 inline-flex size-10 items-center justify-center rounded-full border border-border/70 bg-surface2 text-sm font-semibold text-text">
                    {index + 1}
                  </span>
                  <div className="mb-3 inline-flex size-10 items-center justify-center rounded-md bg-surface2 text-teal">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-medium text-text">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-secondary">{step.copy}</p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
