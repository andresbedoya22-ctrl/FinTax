"use client";

import {
  BadgePercent,
  Calculator,
  FileText,
  HandCoins,
  Landmark,
  MailOpen,
  Receipt,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

import { Button } from "@/components/fintax/Button";
import { Card, CardBody, CardHeader } from "@/components/fintax/Card";
import { Container } from "@/components/fintax/Container";
import { Section } from "@/components/fintax/Section";

const serviceIcons = [
  FileText,
  UserRoundCheck,
  Landmark,
  Receipt,
  HandCoins,
  MailOpen,
  Calculator,
  BadgePercent,
  ShieldCheck,
];

const serviceDestinations = [
  "/tax-return?service=form_p",
  "/tax-return?service=form_m",
  "/tax-return?service=form_c",
  "/benefits?service=huurtoeslag",
  "/benefits?service=zorgtoeslag",
  "/benefits?service=kinderopvangtoeslag",
  "/benefits?service=kindgebonden_budget",
  "/tax-return?service=ruling_30",
  "/tax-return?service=document_review",
] as const;

export function ServicesSection() {
  const t = useTranslations("Landing.services");
  const services = t.raw("items") as Array<{ title: string; copy: string }>;

  return (
    <Section id="services">
      <Container>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-teal">{t("eyebrow")}</p>
            <h2 className="mt-2 text-3xl font-semibold text-text">{t("title")}</h2>
          </div>
          <Button asChild variant="secondary" size="sm" className="hidden md:inline-flex">
            <Link href="/auth?intent=tax-return">{t("cta")}</Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => {
            const Icon = serviceIcons[index] ?? FileText;
            return (
              <Card key={service.title} className="h-full">
                <CardHeader className="flex items-center gap-3 border-b-0 pb-1">
                  <span className="inline-flex size-10 items-center justify-center rounded-md bg-surface2 text-teal">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-base font-medium text-text">{service.title}</h3>
                </CardHeader>
                <CardBody className="pt-2">
                  <p className="text-sm leading-relaxed text-secondary">{service.copy}</p>
                  <Button asChild size="sm" className="mt-5">
                    <Link href={serviceDestinations[index] ?? "/auth?intent=tax-return"}>{t("cta")}</Link>
                  </Button>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
