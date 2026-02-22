"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/fintax/Button";
import { Container } from "@/components/fintax/Container";
import { Section } from "@/components/fintax/Section";

function HighlightedTitle({ title }: { title: string }) {
  const idx = title.toLowerCase().indexOf("right");
  if (idx === -1) return <>{title}</>;
  return (
    <>
      {title.slice(0, idx)}
      <span className="text-green relative inline-block">
        {title.slice(idx, idx + 5)}
        <span
          className="absolute bottom-[-4px] left-0 right-0 h-[3px] bg-gradient-to-r from-green to-transparent rounded-full"
          aria-hidden="true"
        />
      </span>
      {title.slice(idx + 5)}
    </>
  );
}

export function HeroSection() {
  const t = useTranslations("Landing.hero");

  return (
    <Section id="hero">
      <Container>
        <div
          className="grid lg:grid-cols-2 gap-16 items-center min-h-screen pt-24 pb-20"
        >
          {/* LEFT COLUMN */}
          <div style={{ animation: "fadeUp 0.8s ease 0.2s both" }}>
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 bg-green/10 border border-green/25 rounded-full px-3 py-1.5 text-sm text-green mb-7">
              <span
                className="w-2 h-2 bg-green rounded-full"
                style={{ animation: "pulseDot 2s ease-in-out infinite" }}
                aria-hidden="true"
              />
              {t("eyebrow")}
            </div>

            {/* H1 */}
            <h1 className="font-heading text-5xl lg:text-7xl font-bold leading-[1.05] tracking-[-0.05em] mb-5">
              <HighlightedTitle title={t("title")} />
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-secondary font-light leading-relaxed max-w-lg mb-9">
              {t("subtitle")}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="#pricing">
                  {t("primaryCta")} →
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="#services">{t("secondaryCta")}</Link>
              </Button>
            </div>

            {/* Stats row */}
            <div className="mt-12 flex items-start gap-8">
              <div>
                <p className="font-heading text-3xl font-bold text-text">€847</p>
                <p className="text-xs text-muted mt-1">avg. refund recovered</p>
              </div>
              <div className="w-px bg-border self-stretch" aria-hidden="true" />
              <div>
                <p className="font-heading text-3xl font-bold text-text">4 lang</p>
                <p className="text-xs text-muted mt-1">EN · ES · PL · RO</p>
              </div>
              <div className="w-px bg-border self-stretch" aria-hidden="true" />
              <div>
                <p className="font-heading text-3xl font-bold text-text">Fixed</p>
                <p className="text-xs text-muted mt-1">price, no surprises</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div
            className="relative"
            style={{ animation: "fadeUp 0.8s ease 0.4s both" }}
          >
            <div className="[perspective:1200px] relative">
              {/* macOS-style dashboard mockup */}
              <div
                className="rounded-2xl border border-white/[0.08] bg-[#112236] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)]"
                style={{
                  animation: "floatY 6s ease-in-out infinite",
                  transform: "rotateY(-8deg) rotateX(4deg)",
                }}
              >
                {/* Window bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#0d1b2a]/60">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F57]" aria-hidden="true" />
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" aria-hidden="true" />
                  <span className="w-3 h-3 rounded-full bg-[#28C840]" aria-hidden="true" />
                  <span className="ml-3 text-xs text-muted font-medium">
                    fintax.nl — Dashboard
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 space-y-5">
                  {/* Greeting */}
                  <div>
                    <p className="text-xs text-muted">Good morning,</p>
                    <p className="font-heading font-bold text-lg text-text">Andrés 👋</p>
                  </div>

                  {/* Mini stat cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                      <p className="text-xs text-muted mb-1">Estimated refund</p>
                      <p className="font-heading text-xl font-bold text-green">€1,240</p>
                    </div>
                    <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                      <p className="text-xs text-muted mb-1">Active cases</p>
                      <p className="font-heading text-xl font-bold text-text">3 open</p>
                    </div>
                  </div>

                  {/* Progress rows */}
                  <div className="space-y-3">
                    {/* Case 1 */}
                    <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-text">IB Aangifte 2024</span>
                        <span className="text-xs bg-green/15 text-green rounded-full px-2 py-0.5 font-medium">
                          In review
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green rounded-full"
                            style={{ width: "75%" }}
                          />
                        </div>
                        <span className="text-xs text-muted">75%</span>
                      </div>
                    </div>

                    {/* Case 2 */}
                    <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-text">Huurtoeslag 2025</span>
                        <span className="text-xs bg-yellow-500/15 text-yellow-400 rounded-full px-2 py-0.5 font-medium">
                          Needs input
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ width: "40%" }}
                          />
                        </div>
                        <span className="text-xs text-muted">40%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification card */}
              <div
                className="absolute bottom-[-20px] right-[-30px] bg-[#0D1B2A] border border-white/[0.08] rounded-2xl p-4 w-56 shadow-xl z-10"
                style={{ animation: "floatCard 6s ease-in-out 1s infinite" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-green rounded-full" aria-hidden="true" />
                  <span className="text-xs text-green font-medium">Letter analyzed ✓</span>
                </div>
                <p className="text-sm font-semibold text-text leading-snug">
                  Belastingdienst letter
                </p>
                <p className="text-xs text-muted mt-0.5">
                  Voorlopige aanslag — deadline April 30
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
