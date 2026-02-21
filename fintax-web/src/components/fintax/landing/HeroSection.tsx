"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/fintax/Badge";
import { Button } from "@/components/fintax/Button";
import { Container } from "@/components/fintax/Container";
import { Section } from "@/components/fintax/Section";

export function HeroSection() {
  const t = useTranslations("Landing.hero");
  const trustBadges = t.raw("trustBadges") as string[];

  return (
    <Section id="hero" className="hero-glow">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-teal">
              {t("eyebrow")}
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-text md:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-secondary">
              {t("subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="#pricing">{t("primaryCta")}</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="#services">{t("secondaryCta")}</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {trustBadges.map((badge) => (
                <Badge key={badge} variant="neutral" className="text-xs">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-card bg-gradient-to-tr from-green/20 via-transparent to-teal/15 blur-3xl" />
            <div className="overflow-hidden rounded-card border border-border/60 bg-surface/70 p-3 shadow-glass backdrop-blur-md">
              <div
                className="relative aspect-[12/9] w-full overflow-hidden rounded-[18px] border border-border/50 bg-surface2"
                style={{ backgroundImage: 'url("/visuals/hero-bg.png")', backgroundSize: "cover" }}
              >
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-bg/30" />
                <Image
                  src="/visuals/hero-dashboard.png"
                  alt={t("heroImageAlt")}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="relative z-10 object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
