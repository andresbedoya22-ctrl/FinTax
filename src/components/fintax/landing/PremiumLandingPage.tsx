"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import * as React from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  FileText,
  Globe2,
  Layers3,
  ShieldCheck,
} from "lucide-react";

import { LanguageSwitcher } from "@/components/fintax/LanguageSwitcher";
import { StructuredData } from "@/components/fintax/landing/StructuredData";
import { getLandingContent, type LandingIntent } from "@/components/fintax/landing/content";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Container,
  Section,
  buttonVariants,
} from "@/components/ui";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

function smoothAnchorNavigate(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
  const id = href.replace("#", "");
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildAuthIntentHref(intent: LandingIntent) {
  const params = new URLSearchParams({ intent });
  return `/auth?${params.toString()}`;
}

const serviceIcons = [Layers3, FileText, ShieldCheck, Globe2] as const;

export function PremiumLandingPage() {
  const locale = useLocale() as AppLocale;
  const content = getLandingContent(locale);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fbf8_0%,#fdfcf8_32%,#ffffff_100%)] text-text">
      <StructuredData locale={locale} faq={content.faq.items} />

      <header
        className={cn(
          "sticky top-0 z-40 border-b border-border/70 transition-colors",
          scrolled ? "bg-[rgba(252,251,248,0.96)] backdrop-blur" : "bg-[rgba(252,251,248,0.86)]",
        )}
      >
        <Container className="flex h-[4.5rem] items-center gap-4">
          <Link href="/" className="focus-ring inline-flex items-center gap-3 rounded-md text-text">
            <span className="grid h-8 w-8 place-items-center rounded-xl border border-green/25 bg-green/10 font-mono text-sm font-semibold text-green">
              FT
            </span>
            <span className="font-heading text-2xl font-semibold tracking-[-0.03em]">FinTax</span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Landing sections">
            <a href="#how-it-works" onClick={(event) => smoothAnchorNavigate(event, "#how-it-works")} className="focus-ring rounded-md px-3 py-2 text-sm text-secondary hover:text-text">{content.nav.howItWorks}</a>
            <a href="#services" onClick={(event) => smoothAnchorNavigate(event, "#services")} className="focus-ring rounded-md px-3 py-2 text-sm text-secondary hover:text-text">{content.nav.services}</a>
            <a href="#pricing" onClick={(event) => smoothAnchorNavigate(event, "#pricing")} className="focus-ring rounded-md px-3 py-2 text-sm text-secondary hover:text-text">{content.nav.pricing}</a>
            <a href="#faq" onClick={(event) => smoothAnchorNavigate(event, "#faq")} className="focus-ring rounded-md px-3 py-2 text-sm text-secondary hover:text-text">{content.nav.faq}</a>
            <a href="#resources" onClick={(event) => smoothAnchorNavigate(event, "#resources")} className="focus-ring rounded-md px-3 py-2 text-sm text-secondary hover:text-text">{content.nav.resources}</a>
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher compact />
            <Link href="/auth" className="focus-ring rounded-md px-2 py-2 text-sm text-secondary hover:text-text">{content.actions.signIn}</Link>
            <Link href={buildAuthIntentHref("tax-return")} className={cn(buttonVariants({ size: "sm" }), "px-4")}>
              {content.actions.getStarted}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </header>

      <main>
        <Section className="relative overflow-hidden border-b border-border/65 pt-10 sm:pt-14 lg:pt-16" spacing="lg">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top_left,rgba(21,84,56,0.12),transparent_42%),radial-gradient(circle_at_78%_24%,rgba(180,138,92,0.12),transparent_26%)]" aria-hidden="true" />
          <Container className="relative">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] xl:items-start">
              <section aria-labelledby="landing-title" className="pb-2">
                <Badge variant="success">{content.hero.eyebrow}</Badge>
                <h1 id="landing-title" className="mt-5 max-w-[11.5ch] font-heading text-[3.45rem] leading-[0.92] tracking-[-0.05em] text-text sm:text-[4.4rem] lg:text-[5.25rem]">{content.hero.title}</h1>
                <p className="mt-6 max-w-[60ch] text-[1.05rem] leading-8 text-secondary sm:text-[1.1rem]">{content.hero.body}</p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link href={buildAuthIntentHref("tax-return")} className={cn(buttonVariants({ size: "lg" }), "h-12 px-6")}>
                    {content.hero.primaryCta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href="#how-it-works" onClick={(event) => smoothAnchorNavigate(event, "#how-it-works")} className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "h-12 px-5")}>{content.hero.secondaryCta}</a>
                </div>
                <p className="mt-4 max-w-[58ch] text-sm leading-6 text-secondary">{content.hero.microcopy}</p>

                <dl className="mt-8 grid gap-4 sm:grid-cols-3">
                  {content.hero.stats.map((stat) => (
                    <div key={`${stat.label}-${stat.value}`} className="rounded-[var(--radius-xl)] border border-border/55 bg-white/70 px-4 py-4 shadow-[0_10px_24px_rgba(12,28,19,0.05)] backdrop-blur">
                      <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">{stat.label}</dt>
                      <dd className="mt-2 font-heading text-xl tracking-[-0.03em] text-text">{stat.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <aside className="grid gap-4 xl:pl-4">
                <Card variant="panel" padding="none" className="overflow-hidden border-border/60 bg-white shadow-[0_26px_64px_rgba(11,30,20,0.1)]">
                  <div className="border-b border-border/55 px-5 py-4">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{content.hero.panelLabel}</p>
                    <h2 className="mt-2 font-heading text-2xl tracking-[-0.03em] text-text">{content.hero.panelTitle}</h2>
                    <p className="mt-2 text-sm leading-6 text-secondary">{content.hero.panelBody}</p>
                  </div>
                  <div className="relative">
                    <Image
                      src="/visuals/hero-dashboard.png"
                      alt="FinTax dashboard preview with case checklist, status tracking, and guided workflow"
                      width={1680}
                      height={1080}
                      priority
                      className="aspect-[1.12] w-full object-cover object-top"
                    />
                    <div className="pointer-events-none absolute inset-x-4 bottom-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-[1.1rem] border border-white/55 bg-[rgba(255,255,255,0.88)] p-4 backdrop-blur">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Checklist</p>
                        <p className="mt-1 text-sm font-semibold text-text">Missing documents surfaced clearly</p>
                      </div>
                      <div className="rounded-[1.1rem] border border-[#1c5b3f]/20 bg-[rgba(21,84,56,0.9)] p-4 text-white shadow-[0_10px_26px_rgba(13,52,35,0.28)]">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">Case progress</p>
                        <p className="mt-1 text-sm font-semibold text-white">Review, follow-up, and next actions stay visible</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card variant="soft" padding="md" className="border-border/60 bg-[linear-gradient(135deg,rgba(248,251,249,0.98),rgba(251,247,241,0.98))]">
                  <ul className="grid gap-3">
                    {content.hero.panelPoints.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm leading-6 text-secondary">
                        <span className="mt-0.5 rounded-full bg-green/10 p-1 text-green">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </aside>
            </div>
          </Container>
        </Section>

        <section className="border-b border-border/65 bg-[#163d2d] py-4 text-white" aria-label="Trust strip">
          <Container className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            {content.trustStrip.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-white/88">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d8c3a8]" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </Container>
        </section>

        <Section className="border-b border-border/60" spacing="lg">
          <Container className="grid gap-8 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
            <section id="how-it-works" aria-labelledby="how-it-works-title">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{content.howItWorks.eyebrow}</p>
              <h2 id="how-it-works-title" className="mt-3 max-w-[15ch] font-heading text-4xl tracking-[-0.03em] text-text sm:text-[2.9rem]">{content.howItWorks.title}</h2>
              <p className="mt-4 max-w-[60ch] text-sm leading-7 text-secondary">{content.howItWorks.intro}</p>
              <ol className="mt-8 grid gap-4">
                {content.howItWorks.steps.map((step, index) => (
                  <li key={step.title} className="grid gap-4 rounded-[var(--radius-xl)] border border-border/60 bg-white p-5 shadow-[0_16px_34px_rgba(12,28,19,0.06)] md:grid-cols-[auto_1fr]">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green/10 font-mono text-sm font-semibold text-green">0{index + 1}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-text">{step.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-secondary">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <div className="grid gap-6">
              <section id="services" aria-labelledby="services-title">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{content.services.eyebrow}</p>
                <h2 id="services-title" className="mt-3 font-heading text-4xl tracking-[-0.03em] text-text">{content.services.title}</h2>
                <p className="mt-4 max-w-[58ch] text-sm leading-7 text-secondary">{content.services.intro}</p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {content.services.items.map((service, index) => {
                    const Icon = serviceIcons[index % serviceIcons.length];
                    return (
                      <Card key={service.title} variant="panel" padding="md" className="border-border/60 bg-white">
                        <CardHeader className="mb-3">
                          <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-green/10 text-green">
                            <Icon className="h-4.5 w-4.5" />
                          </span>
                          <CardTitle className="text-lg">{service.title}</CardTitle>
                          <CardDescription>{service.body}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Link href={buildAuthIntentHref(service.intent)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-green hover:text-green-hover">
                            {service.intent === "tax-return" ? content.hero.primaryCta : content.pricing.plans[2].cta}
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>

              <section aria-labelledby="proof-title">
                <Card variant="soft" padding="lg" className="border-border/60 bg-[linear-gradient(180deg,rgba(248,251,249,1),rgba(251,248,243,1))]">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{content.proof.eyebrow}</p>
                  <h2 id="proof-title" className="mt-3 font-heading text-3xl tracking-[-0.03em] text-text">{content.proof.title}</h2>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {content.proof.items.map((item) => (
                      <div key={item.title} className="rounded-[1.1rem] border border-border/55 bg-white/80 p-4">
                        <h3 className="text-sm font-semibold text-text">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-secondary">{item.body}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </section>
            </div>
          </Container>
        </Section>

        <Section className="border-b border-border/60" spacing="lg">
          <Container className="grid gap-8 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
            <section id="pricing" aria-labelledby="pricing-title">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{content.pricing.eyebrow}</p>
              <h2 id="pricing-title" className="mt-3 font-heading text-4xl tracking-[-0.03em] text-text">{content.pricing.title}</h2>
              <p className="mt-4 max-w-[58ch] text-sm leading-7 text-secondary">{content.pricing.note}</p>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {content.pricing.plans.map((plan) => (
                  <Card key={plan.name} variant="panel" padding="md" className={cn("relative flex h-full flex-col border-border/60 bg-white", plan.featured && "border-[#20553d]/40 bg-[linear-gradient(180deg,rgba(247,251,248,1),rgba(255,255,255,1))] shadow-[0_18px_42px_rgba(15,52,34,0.12)]")}>
                    {plan.featured ? <Badge variant="copper" className="absolute right-4 top-4">{content.pricing.featuredLabel}</Badge> : null}
                    <CardHeader className="mb-4">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <div className="font-mono text-[2rem] font-semibold tracking-[-0.04em] text-text">{plan.price}</div>
                      <CardDescription>{plan.summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                      <ul className="grid gap-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm leading-6 text-secondary">
                            <Check className="mt-1 h-4 w-4 text-green" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link href={buildAuthIntentHref(plan.intent)} className={cn(buttonVariants({ variant: plan.featured ? "primary" : "secondary", size: "md" }), "mt-6 w-full")}>
                        {plan.cta}
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <div className="grid gap-6">
              <section id="faq" aria-labelledby="faq-title">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{content.faq.eyebrow}</p>
                <h2 id="faq-title" className="mt-3 font-heading text-4xl tracking-[-0.03em] text-text">{content.faq.title}</h2>
                <div className="mt-6 rounded-[var(--radius-xl)] border border-border/60 bg-white p-2 shadow-[0_16px_34px_rgba(12,28,19,0.05)]">
                  <Accordion type="single" defaultValue="faq-0">
                    {content.faq.items.map((item, index) => (
                      <AccordionItem key={item.question} value={`faq-${index}`}>
                        <AccordionTrigger>{item.question}</AccordionTrigger>
                        <AccordionContent>{item.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </section>

              <section id="resources" aria-labelledby="resources-title">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{content.resources.eyebrow}</p>
                <h2 id="resources-title" className="mt-3 font-heading text-4xl tracking-[-0.03em] text-text">{content.resources.title}</h2>
                <p className="mt-4 text-sm leading-7 text-secondary">{content.resources.intro}</p>
                <div className="mt-6 grid gap-3">
                  {content.resources.items.map((item) => (
                    <article key={item.title} className="rounded-[var(--radius-xl)] border border-border/60 bg-white p-5 shadow-[0_14px_28px_rgba(12,28,19,0.05)]">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{item.tag}</p>
                      <h3 className="mt-2 text-lg font-semibold text-text">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-secondary">{item.body}</p>
                      <Link href={item.href} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green hover:text-green-hover">
                        {item.cta}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </Container>
        </Section>

        <Section spacing="lg">
          <Container>
            <Card variant="panel" padding="lg" className="overflow-hidden border-[#1b4a35] bg-[linear-gradient(135deg,#133525_0%,#1a4d37_58%,#21553d_100%)] text-white shadow-[0_22px_56px_rgba(12,36,24,0.2)]">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_auto] lg:items-center">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/70">{content.finalCta.eyebrow}</p>
                  <h2 className="mt-3 max-w-[16ch] font-heading text-4xl tracking-[-0.03em] text-white sm:text-[2.9rem]">{content.finalCta.title}</h2>
                  <p className="mt-4 max-w-[60ch] text-sm leading-7 text-white/82">{content.finalCta.body}</p>
                </div>
                <div className="flex flex-col gap-3 lg:min-w-[16rem]">
                  <Link href={buildAuthIntentHref("tax-return")} className={cn(buttonVariants({ size: "lg" }), "h-12 bg-white text-[#153927] hover:bg-white/92")}>{content.finalCta.primaryCta}</Link>
                  <Link href="/auth" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 border-white/30 text-white hover:border-white/50 hover:bg-white/8 hover:text-white")}>{content.finalCta.secondaryCta}</Link>
                </div>
              </div>
            </Card>
          </Container>
        </Section>
      </main>

      <footer className="border-t border-border/60 bg-[rgba(248,249,245,0.8)] py-10">
        <Container className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)_auto]">
          <div>
            <h2 className="font-heading text-2xl tracking-[-0.03em] text-text">{content.footer.legalTitle}</h2>
            <p className="mt-3 max-w-[54ch] text-sm leading-7 text-secondary">{content.footer.legalBody}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{content.footer.legalLinksTitle}</p>
              <div className="mt-3 grid gap-2">
                <Link href="/legal/privacy" className="text-sm text-secondary hover:text-text">{content.footer.privacy}</Link>
                <Link href="/legal/terms" className="text-sm text-secondary hover:text-text">{content.footer.terms}</Link>
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{content.footer.navigationTitle}</p>
              <div className="mt-3 grid gap-2">
                <Link href={buildAuthIntentHref("tax-return")} className="text-sm text-secondary hover:text-text">{content.footer.taxReturn}</Link>
                <Link href={buildAuthIntentHref("benefits")} className="text-sm text-secondary hover:text-text">{content.footer.benefits}</Link>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{content.footer.languagesTitle}</p>
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-secondary">
              <Globe2 className="h-4 w-4" />
              EN / NL / ES / PL / RO
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
