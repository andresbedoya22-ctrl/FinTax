"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/fintax/Button";
import { Container } from "@/components/fintax/Container";
import { Section } from "@/components/fintax/Section";

type HeroStat = { value: string; label: string };

function HighlightedTitle({ markedTitle }: { markedTitle: string }) {
  const openTag = "<hl>";
  const closeTag = "</hl>";
  const start = markedTitle.indexOf(openTag);
  const end = markedTitle.indexOf(closeTag);

  if (start < 0 || end < 0 || end <= start + openTag.length) {
    return <>{markedTitle.replaceAll(openTag, "").replaceAll(closeTag, "")}</>;
  }

  const before = markedTitle.slice(0, start);
  const highlighted = markedTitle.slice(start + openTag.length, end);
  const after = markedTitle.slice(end + closeTag.length);

  return (
    <>
      {before}
      <span className="relative inline-block text-green">
        {highlighted}
        <span
          className="absolute bottom-[-4px] left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-green to-transparent"
          aria-hidden="true"
        />
      </span>
      {after}
    </>
  );
}

export function HeroSection() {
  const t = useTranslations("Landing.hero");
  const heroStats = t.raw("heroStats") as HeroStat[];

  return (
    <Section id="hero">
      <Container>
        <div className="grid min-h-screen items-center gap-16 pt-24 pb-20 lg:grid-cols-2">
          <div style={{ animation: "fadeUp 0.8s ease 0.2s both" }}>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-green/25 bg-green/10 px-3 py-1.5 text-sm text-green">
              <span
                className="h-2 w-2 rounded-full bg-green"
                style={{ animation: "pulseDot 2s ease-in-out infinite" }}
                aria-hidden="true"
              />
              {t("eyebrow")}
            </div>

            <h1 className="mb-5 font-heading text-5xl font-bold leading-[1.05] tracking-[-0.05em] lg:text-7xl">
              <HighlightedTitle markedTitle={t("titleRich")} />
            </h1>

            <p className="mb-9 max-w-lg text-lg leading-relaxed text-secondary font-light">{t("subtitle")}</p>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="#pricing">{t("primaryCta")} -&gt;</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="#services">{t("secondaryCta")}</Link>
              </Button>
            </div>

            <div className="mt-12 flex items-start gap-8">
              {heroStats.map((stat, index) => (
                <div key={`${stat.value}-${index}`} className="contents">
                  <div>
                    <p className="font-heading text-3xl font-bold tracking-[-0.03em] text-text">{stat.value}</p>
                    <p className="mt-1 text-xs text-muted">{stat.label}</p>
                  </div>
                  {index < heroStats.length - 1 ? (
                    <div className="w-px self-stretch bg-border" aria-hidden="true" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="relative" style={{ animation: "fadeUp 0.8s ease 0.4s both" }}>
            <div className="relative [perspective:1200px]">
              <div
                className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#112236] shadow-[0_40px_80px_rgba(0,0,0,0.5)]"
                style={{
                  animation: "floatY 6s ease-in-out infinite",
                  transform: "rotateY(-8deg) rotateX(4deg)",
                }}
              >
                <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#0d1b2a]/60 px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-[#FF5F57]" aria-hidden="true" />
                  <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" aria-hidden="true" />
                  <span className="h-3 w-3 rounded-full bg-[#28C840]" aria-hidden="true" />
                  <span className="ml-3 text-xs font-medium text-muted">fintax.nl - Dashboard</span>
                </div>

                <div className="space-y-5 p-5">
                  <div>
                    <p className="text-xs text-muted">{t("sampleGreeting")}</p>
                    <p className="font-heading text-lg font-bold text-text">{t("sampleMockName")}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-3">
                      <p className="mb-1 text-xs text-muted">{t("sampleRefundLabel")}</p>
                      <p className="font-heading text-xl font-bold text-green">{t("sampleRefundValue")}</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-3">
                      <p className="mb-1 text-xs text-muted">{t("sampleCasesLabel")}</p>
                      <p className="font-heading text-xl font-bold text-text">{t("sampleCasesValue")}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-text">IB Aangifte 2024</span>
                        <span className="rounded-full bg-green/15 px-2 py-0.5 text-xs font-medium text-green">In review</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-green" style={{ width: "75%" }} />
                        </div>
                        <span className="text-xs text-muted">75%</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-text">Huurtoeslag 2025</span>
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-300">Needs input</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-amber-300" style={{ width: "40%" }} />
                        </div>
                        <span className="text-xs text-muted">40%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="absolute right-[-30px] bottom-[-20px] z-10 w-56 rounded-2xl border border-white/[0.08] bg-[#0D1B2A] p-4 shadow-xl"
                style={{ animation: "floatCard 6s ease-in-out 1s infinite" }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green" aria-hidden="true" />
                  <span className="text-xs font-medium text-green">Letter analyzed</span>
                </div>
                <p className="text-sm font-semibold leading-snug text-text">Belastingdienst letter</p>
                <p className="mt-0.5 text-xs text-muted">Voorlopige aanslag - deadline April 30</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
