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
  Sparkles,
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
const resourceAccents = ["bg-green/8 text-green", "bg-copper/10 text-[#8f6239]", "bg-teal/10 text-teal"] as const;

function LandingSection({
  id,
  label,
  title,
  intro,
  className,
  children,
}: {
  id?: string;
  label: string;
  title: string;
  intro?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const headingId = id ? `${id}-title` : undefined;

  return (
    <section id={id} aria-labelledby={headingId} className={className}>
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{label}</p>
      <h2 id={headingId} className="mt-3 max-w-[16ch] font-heading text-[2.15rem] tracking-[-0.035em] text-text sm:text-[2.5rem] lg:text-[2.85rem]">
        {title}
      </h2>
      {intro ? <p className="mt-4 max-w-[62ch] text-sm leading-7 text-secondary">{intro}</p> : null}
      {children}
    </section>
  );
}

function LandingNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      onClick={(event) => smoothAnchorNavigate(event, href)}
      className="focus-ring rounded-md px-3 py-2 text-sm text-secondary transition-colors duration-200 hover:text-text motion-safe:hover:-translate-y-0.5 motion-safe:transition-transform motion-reduce:transform-none"
    >
      {children}
    </a>
  );
}

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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fbf8_0%,#fbf8f3_22%,#ffffff_52%,#fbfcfa_100%)] text-text">
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
            <LandingNavLink href="#how-it-works">{content.nav.howItWorks}</LandingNavLink>
            <LandingNavLink href="#services">{content.nav.services}</LandingNavLink>
            <LandingNavLink href="#pricing">{content.nav.pricing}</LandingNavLink>
            <LandingNavLink href="#faq">{content.nav.faq}</LandingNavLink>
            <LandingNavLink href="#resources">{content.nav.resources}</LandingNavLink>
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher compact />
            <Link href="/auth" className="focus-ring rounded-md px-2 py-2 text-sm text-secondary transition-colors duration-200 hover:text-text motion-safe:hover:-translate-y-0.5 motion-safe:transition-transform motion-reduce:transform-none">
              {content.actions.signIn}
            </Link>
            <Link href={buildAuthIntentHref("tax-return")} className={cn(buttonVariants({ size: "sm" }), "px-4")}>
              {content.actions.getStarted}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-border/65 px-0 pb-10 pt-10 sm:pb-12 sm:pt-14 lg:pb-14 lg:pt-16">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_top_left,rgba(21,84,56,0.12),transparent_42%),radial-gradient(circle_at_78%_24%,rgba(180,138,92,0.12),transparent_28%)]"
            aria-hidden="true"
          />
          <Container className="relative">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)] xl:items-center xl:gap-10">
              <section aria-labelledby="landing-title" className="max-w-[42rem] pb-1">
                <Badge variant="success">{content.hero.eyebrow}</Badge>
                <h1
                  id="landing-title"
                  className="mt-5 max-w-[13.2ch] font-heading text-[3.15rem] leading-[0.95] tracking-[-0.055em] text-text sm:text-[4rem] lg:max-w-[13.8ch] lg:text-[4.65rem] xl:text-[4.95rem]"
                >
                  {content.hero.title}
                </h1>
                <p className="mt-6 max-w-[58ch] text-[1.02rem] leading-8 text-secondary sm:text-[1.08rem]">
                  {content.hero.body}
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link href={buildAuthIntentHref("tax-return")} className={cn(buttonVariants({ size: "lg" }), "h-12 px-6")}>
                    {content.hero.primaryCta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="#how-it-works"
                    onClick={(event) => smoothAnchorNavigate(event, "#how-it-works")}
                    className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "h-12 px-5")}
                  >
                    {content.hero.secondaryCta}
                  </a>
                </div>
                <p className="mt-4 max-w-[56ch] text-sm leading-6 text-secondary">{content.hero.microcopy}</p>

                <dl className="mt-7 grid gap-3 sm:grid-cols-3">
                  {content.hero.stats.map((stat) => (
                    <div
                      key={`${stat.label}-${stat.value}`}
                      className="landing-card rounded-[1.25rem] border border-border/55 bg-white/80 px-4 py-3.5 shadow-[0_12px_26px_rgba(12,28,19,0.05)] backdrop-blur"
                    >
                      <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">{stat.label}</dt>
                      <dd className="mt-1.5 font-heading text-[1.15rem] tracking-[-0.03em] text-text">{stat.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <aside className="xl:pl-2">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_17rem] xl:items-stretch">
                  <Card
                    variant="panel"
                    padding="none"
                    className="landing-card overflow-hidden border-border/60 bg-white shadow-[0_24px_54px_rgba(11,30,20,0.1)]"
                  >
                    <div className="border-b border-border/55 px-5 py-4 sm:px-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{content.hero.panelLabel}</p>
                          <h2 className="mt-2 max-w-[18ch] font-heading text-[1.9rem] tracking-[-0.035em] text-text">
                            {content.hero.panelTitle}
                          </h2>
                        </div>
                        <span className="hidden rounded-full border border-green/15 bg-green/8 p-2 text-green sm:inline-flex">
                          <Sparkles className="h-4 w-4" />
                        </span>
                      </div>
                      <p className="mt-2 max-w-[60ch] text-sm leading-6 text-secondary">{content.hero.panelBody}</p>
                    </div>
                    <div className="relative">
                      <Image
                        src="/visuals/hero-dashboard.png"
                        alt="FinTax dashboard preview with case checklist, status tracking, and guided workflow"
                        width={1680}
                        height={1080}
                        priority
                        className="aspect-[1.28] w-full object-cover object-top"
                      />
                      <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-[1.1rem] border border-white/60 bg-[rgba(255,255,255,0.9)] px-4 py-3 backdrop-blur">
                        <div className="flex flex-wrap items-center gap-2.5 text-[11px] uppercase tracking-[0.14em] text-muted">
                          {content.trustStrip.slice(0, 3).map((item) => (
                            <span key={item} className="inline-flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-green/55" aria-hidden="true" />
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card
                    variant="soft"
                    padding="md"
                    className="landing-card flex h-full flex-col justify-between border-border/60 bg-[linear-gradient(180deg,rgba(248,251,249,0.98),rgba(251,247,241,0.98))]"
                  >
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{content.actions.seeFlow}</p>
                      <h3 className="mt-2 font-heading text-[1.55rem] tracking-[-0.03em] text-text">{content.proof.title}</h3>
                    </div>
                    <ul className="mt-5 grid gap-3">
                      {content.hero.panelPoints.map((point) => (
                        <li key={point} className="flex items-start gap-3 text-sm leading-6 text-secondary">
                          <span className="mt-0.5 rounded-full bg-green/10 p-1 text-green">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href="#services"
                      onClick={(event) => smoothAnchorNavigate(event, "#services")}
                      className="landing-inline-link mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-green"
                    >
                      {content.nav.services}
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  </Card>
                </div>
              </aside>
            </div>
          </Container>
        </section>

        <section className="border-b border-border/65 bg-[#163d2d] py-3.5 text-white" aria-label="Trust strip">
          <Container>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 lg:gap-x-7">
              {content.trustStrip.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-white/88">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d8c3a8]" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="border-b border-border/60 py-12 sm:py-14 lg:py-16">
          <Container className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.98fr)] xl:gap-9">
            <LandingSection
              id="how-it-works"
              label={content.howItWorks.eyebrow}
              title={content.howItWorks.title}
              intro={content.howItWorks.intro}
            >
              <ol className="mt-7 grid gap-3.5">
                {content.howItWorks.steps.map((step, index) => (
                  <li
                    key={step.title}
                    className="landing-card grid gap-4 rounded-[var(--radius-xl)] border border-border/60 bg-white px-5 py-4 shadow-[0_14px_30px_rgba(12,28,19,0.05)] md:grid-cols-[auto_1fr] md:items-start"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green/10 font-mono text-sm font-semibold text-green">
                      0{index + 1}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-text sm:text-[1.06rem]">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-secondary">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </LandingSection>

            <div className="grid gap-5 lg:gap-6">
              <LandingSection
                id="services"
                label={content.services.eyebrow}
                title={content.services.title}
                intro={content.services.intro}
              >
                <div className="mt-7 grid gap-3.5 md:grid-cols-2">
                  {content.services.items.map((service, index) => {
                    const Icon = serviceIcons[index % serviceIcons.length];
                    return (
                      <Card
                        key={service.title}
                        variant="panel"
                        padding="md"
                        className="landing-card flex h-full flex-col border-border/60 bg-white"
                      >
                        <CardHeader className="mb-3">
                          <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-green/10 text-green">
                            <Icon className="h-[1.1rem] w-[1.1rem]" />
                          </span>
                          <CardTitle className="text-[1.05rem]">{service.title}</CardTitle>
                          <CardDescription>{service.body}</CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto pt-2">
                          <Link href={buildAuthIntentHref(service.intent)} className="landing-inline-link inline-flex items-center gap-1.5 text-sm font-semibold text-green">
                            {service.intent === "tax-return" ? content.hero.primaryCta : content.pricing.plans[2].cta}
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </LandingSection>

              <section aria-labelledby="proof-title">
                <Card
                  variant="soft"
                  padding="md"
                  className="border-border/60 bg-[linear-gradient(180deg,rgba(248,251,249,1),rgba(251,248,243,1))]"
                >
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{content.proof.eyebrow}</p>
                  <h2 id="proof-title" className="mt-3 max-w-[18ch] font-heading text-[2rem] tracking-[-0.03em] text-text sm:text-[2.25rem]">
                    {content.proof.title}
                  </h2>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {content.proof.items.map((item) => (
                      <div key={item.title} className="rounded-[1.1rem] border border-border/55 bg-white/82 px-4 py-4">
                        <h3 className="text-sm font-semibold text-text">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-secondary">{item.body}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </section>
            </div>
          </Container>
        </section>

        <section className="border-b border-border/60 py-12 sm:py-14 lg:py-16">
          <Container className="grid gap-8 xl:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] xl:gap-9">
            <LandingSection
              id="pricing"
              label={content.pricing.eyebrow}
              title={content.pricing.title}
              intro={content.pricing.note}
            >
              <div className="mt-7 grid gap-4 lg:grid-cols-3 lg:items-stretch">
                {content.pricing.plans.map((plan) => (
                  <Card
                    key={plan.name}
                    variant="panel"
                    padding="md"
                    className={cn(
                      "landing-card relative flex h-full flex-col border-border/60 bg-white",
                      plan.featured &&
                        "border-[#20553d]/35 bg-[linear-gradient(180deg,rgba(247,251,248,1),rgba(255,255,255,1))] shadow-[0_20px_42px_rgba(15,52,34,0.12)] lg:-translate-y-1",
                    )}
                  >
                    {plan.featured ? (
                      <Badge variant="copper" className="absolute right-4 top-4">
                        {content.pricing.featuredLabel}
                      </Badge>
                    ) : null}
                    <CardHeader className="mb-4 pr-12">
                      <CardTitle className="text-[1.08rem]">{plan.name}</CardTitle>
                      <div className="font-mono text-[1.85rem] font-semibold tracking-[-0.045em] text-text">{plan.price}</div>
                      <CardDescription>{plan.summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                      <ul className="grid gap-2.5">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm leading-6 text-secondary">
                            <Check className="mt-1 h-4 w-4 shrink-0 text-green" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={buildAuthIntentHref(plan.intent)}
                        className={cn(buttonVariants({ variant: plan.featured ? "primary" : "secondary", size: "md" }), "mt-6 w-full")}
                      >
                        {plan.cta}
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </LandingSection>

            <div className="grid gap-5 lg:gap-6">
              <LandingSection id="faq" label={content.faq.eyebrow} title={content.faq.title}>
                <div className="mt-6 rounded-[var(--radius-xl)] border border-border/60 bg-white p-2 shadow-[0_14px_30px_rgba(12,28,19,0.05)]">
                  <Accordion type="single" defaultValue="faq-0">
                    {content.faq.items.map((item, index) => (
                      <AccordionItem key={item.question} value={`faq-${index}`}>
                        <AccordionTrigger>{item.question}</AccordionTrigger>
                        <AccordionContent>{item.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </LandingSection>

              <LandingSection
                id="resources"
                label={content.resources.eyebrow}
                title={content.resources.title}
                intro={content.resources.intro}
              >
                <div className="mt-6 grid gap-3">
                  {content.resources.items.map((item, index) => (
                    <article
                      key={item.title}
                      className="landing-card rounded-[var(--radius-xl)] border border-border/60 bg-white px-5 py-4 shadow-[0_12px_24px_rgba(12,28,19,0.04)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{item.tag}</p>
                          <h3 className="mt-2 text-base font-semibold text-text">{item.title}</h3>
                        </div>
                        <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-2xl", resourceAccents[index % resourceAccents.length])}>
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>
                      <p className="mt-2.5 text-sm leading-6 text-secondary">{item.body}</p>
                      <Link href={item.href} className="landing-inline-link mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green">
                        {item.cta}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </article>
                  ))}
                </div>
              </LandingSection>
            </div>
          </Container>
        </section>

        <section className="py-12 sm:py-14 lg:py-16">
          <Container>
            <Card
              variant="panel"
              padding="lg"
              className="overflow-hidden border-[#1b4a35] bg-[linear-gradient(135deg,#133525_0%,#1a4d37_58%,#21553d_100%)] text-white shadow-[0_22px_56px_rgba(12,36,24,0.2)]"
            >
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/70">{content.finalCta.eyebrow}</p>
                  <h2 className="mt-3 max-w-[18ch] font-heading text-[2.3rem] tracking-[-0.04em] text-white sm:text-[2.7rem]">
                    {content.finalCta.title}
                  </h2>
                  <p className="mt-4 max-w-[58ch] text-sm leading-7 text-white/82">{content.finalCta.body}</p>
                </div>
                <div className="flex flex-col gap-3 lg:min-w-[15rem]">
                  <Link href={buildAuthIntentHref("tax-return")} className={cn(buttonVariants({ size: "lg" }), "h-12 bg-white text-[#153927] hover:bg-white/92")}>
                    {content.finalCta.primaryCta}
                  </Link>
                  <Link
                    href="/auth"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "h-12 border-white/30 text-white hover:border-white/50 hover:bg-white/8 hover:text-white",
                    )}
                  >
                    {content.finalCta.secondaryCta}
                  </Link>
                </div>
              </div>
            </Card>
          </Container>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-[rgba(248,249,245,0.8)] py-8">
        <Container className="grid gap-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)_auto] lg:items-start">
          <div>
            <h2 className="font-heading text-[1.85rem] tracking-[-0.03em] text-text">{content.footer.legalTitle}</h2>
            <p className="mt-3 max-w-[54ch] text-sm leading-7 text-secondary">{content.footer.legalBody}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{content.footer.legalLinksTitle}</p>
              <div className="mt-3 grid gap-2">
                <Link href="/legal/privacy" className="landing-inline-link text-sm text-secondary">
                  {content.footer.privacy}
                </Link>
                <Link href="/legal/terms" className="landing-inline-link text-sm text-secondary">
                  {content.footer.terms}
                </Link>
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{content.footer.navigationTitle}</p>
              <div className="mt-3 grid gap-2">
                <Link href={buildAuthIntentHref("tax-return")} className="landing-inline-link text-sm text-secondary">
                  {content.footer.taxReturn}
                </Link>
                <Link href={buildAuthIntentHref("benefits")} className="landing-inline-link text-sm text-secondary">
                  {content.footer.benefits}
                </Link>
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
