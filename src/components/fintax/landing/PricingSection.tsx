"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

import { Badge } from "@/components/fintax/Badge";
import { Button } from "@/components/fintax/Button";
import { Card, CardBody, CardHeader } from "@/components/fintax/Card";
import { Container } from "@/components/fintax/Container";
import { Section } from "@/components/fintax/Section";

type Plan = {
  name: string;
  price: string;
  summary: string;
  features: string[];
};

export function PricingSection() {
  const t = useTranslations("Landing.pricing");
  const plans = t.raw("plans") as Plan[];
  const addOns = t.raw("addons") as string[];

  return (
    <Section id="pricing">
      <Container>
        <p className="text-sm uppercase tracking-[0.16em] text-teal">{t("eyebrow")}</p>
        <h2 className="mt-2 text-3xl font-semibold text-text">{t("title")}</h2>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={index === 1 ? "relative border-green/60 bg-surface shadow-glass" : ""}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-text">{plan.name}</h3>
                    <p className="mt-1 text-sm text-secondary">{plan.summary}</p>
                  </div>
                  {index === 1 ? <Badge variant="success">{t("featured")}</Badge> : null}
                </div>
                <p className="mt-4 text-3xl font-semibold text-text">{plan.price}</p>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-secondary">
                      <Check className="mt-0.5 size-4 shrink-0 text-green" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-6 w-full">
                  <Link href="/auth?intent=tax-return">{t("primaryCta")}</Link>
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card className="mt-6">
          <CardHeader>
            <h3 className="text-lg font-semibold text-text">{t("addonsTitle")}</h3>
          </CardHeader>
          <CardBody>
            <ul className="grid gap-2 sm:grid-cols-2">
              {addOns.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-secondary">
                  <Check className="size-4 text-teal" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </Container>
    </Section>
  );
}
