"use client";

import { Globe2, Lock, Scale, Sparkles, Timer } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Card, CardBody } from "@/components/fintax/Card";
import { Container } from "@/components/fintax/Container";
import { Section } from "@/components/fintax/Section";

const reasonIcons = [Globe2, Scale, Timer, Sparkles, Lock];

export function WhyFinTaxSection() {
  const t = useTranslations("Landing.why");
  const reasons = t.raw("items") as Array<{ title: string; copy: string }>;

  return (
    <Section id="why-fintax">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-teal">{t("eyebrow")}</p>
            <h2 className="mt-2 text-3xl font-semibold text-text">{t("title")}</h2>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {reasons.map((reason, index) => {
                const Icon = reasonIcons[index] ?? Globe2;
                return (
                  <Card key={reason.title}>
                    <CardBody>
                      <div className="mb-3 inline-flex size-9 items-center justify-center rounded-md bg-surface2 text-teal">
                        <Icon className="size-5" aria-hidden="true" />
                      </div>
                      <h3 className="text-base font-medium text-text">{reason.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-secondary">{reason.copy}</p>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="self-center">
            <div className="overflow-hidden rounded-card border border-border/60 bg-surface/70 p-3 shadow-glass">
              <Image
                src="/visuals/letter-mock.png"
                alt={t("imageAlt")}
                width={1000}
                height={760}
                className="h-auto w-full rounded-[18px] border border-border/50 object-cover"
              />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
