"use client";

import Image from "next/image";
import * as React from "react";
import { ArrowRight, Check, Globe2, Star } from "lucide-react";
import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/fintax/LanguageSwitcher";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Container,
  Section,
  buttonVariants,
} from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

const blogPreview = [
  { title: "How to choose between P, M and C forms", href: "/tax-return", tag: "Taxes" },
  { title: "Document checklist quality rules", href: "/auth?intent=tax-return", tag: "Operations" },
  { title: "Authorization stages explained simply", href: "/legal/privacy", tag: "Compliance" },
] as const;

function smoothAnchorNavigate(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
  const id = href.replace("#", "");
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

type LandingIntent = "tax-return" | "benefits";

function buildAuthIntentHref(intent: LandingIntent, service?: string) {
  const params = new URLSearchParams({ intent });
  if (service) params.set("service", service);
  return `/auth?${params.toString()}`;
}

export function PremiumLandingPage() {
  const tLanding = useTranslations("Landing");
  const tNavbar = useTranslations("Navbar");
  const [mounted, setMounted] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  const services = (tLanding.raw("services.items") as Array<{ title: string, copy: string }>).slice(0, 4);
  const plans = (tLanding.raw("pricing.plans") as Array<{ name: string, price: string, features: string[] }>).slice(0, 3);
  const faqItems = (tLanding.raw("faq.items") as Array<{ q: string, a: string }>).slice(0, 4);
  const trustBar = (tLanding.raw("hero.trustBadges") as Array<string>).slice(0, 4);

  React.useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className={cn("sticky top-0 z-40 border-b border-border/75 transition-colors", mounted && scrolled ? "bg-surface/97 backdrop-blur" : "bg-surface/92")}>
        <Container className="flex h-[4.35rem] items-center gap-4">
          <Link href="/" className="focus-ring inline-flex items-center rounded-lg text-text">
            <span className="mr-2 grid h-7 w-7 place-items-center rounded-xl border border-green/35 bg-green/10 text-xs font-black text-green">F</span>
            <span className="font-heading text-2xl font-semibold tracking-tight">FinTax</span>
          </Link>
          <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Landing sections">
            <a href="#how" onClick={(e) => smoothAnchorNavigate(e, "#how")} className="focus-ring whitespace-nowrap rounded-lg px-3 py-2 text-sm text-secondary hover:text-text">{tLanding("premium.navHow")}</a>
            <a href="#pricing" onClick={(e) => smoothAnchorNavigate(e, "#pricing")} className="focus-ring whitespace-nowrap rounded-lg px-3 py-2 text-sm text-secondary hover:text-text">{tLanding("pricing.eyebrow")}</a>
            <a href="#faq" onClick={(e) => smoothAnchorNavigate(e, "#faq")} className="focus-ring whitespace-nowrap rounded-lg px-3 py-2 text-sm text-secondary hover:text-text">{tLanding("faq.eyebrow")}</a>
            <a href="#blog" onClick={(e) => smoothAnchorNavigate(e, "#blog")} className="focus-ring whitespace-nowrap rounded-lg px-3 py-2 text-sm text-secondary hover:text-text">{tLanding("premium.navBlog")}</a>
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <Link href="/auth" className="focus-ring whitespace-nowrap rounded-lg px-2 py-2 text-sm text-secondary hover:text-text">{tNavbar("signIn")}</Link>
            <Link href={buildAuthIntentHref("tax-return")} className={cn(buttonVariants({ size: "sm" }), "px-4 whitespace-nowrap")}>{tLanding("hero.primaryCta")} <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </Container>
      </header>

      <main>
        <Section className="border-b border-border/75 bg-gradient-to-b from-[#f8fbf9] to-bg py-16 md:py-12">
          <Container>
            <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
              <div>
                <Badge variant="success">{tLanding("hero.eyebrow")}</Badge>
                <h1 className="mt-4 max-w-[12.5ch] font-heading text-5xl leading-[0.93] tracking-[-0.035em] text-text sm:text-[4.2rem]">
                  {tLanding("hero.title")}
                </h1>
                <p className="mt-6 max-w-[57ch] text-[1.0625rem] leading-8 text-secondary">{tLanding("hero.subtitle")}</p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link href={buildAuthIntentHref("tax-return")} className={cn(buttonVariants({ size: "lg" }), "h-12 px-6 text-[0.97rem]")}>
                    {tLanding("hero.primaryCta")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href="#how" onClick={(e) => smoothAnchorNavigate(e, "#how")} className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "h-12 px-5")}>
                    {tLanding("hero.secondaryCta")}
                  </a>
                </div>
                <p className="mt-4 text-sm text-secondary">{tLanding("premium.heroPrice")}</p>
              </div>
              <Card variant="panel" padding="none" className="relative overflow-hidden border-border/65 bg-surface shadow-[0_18px_40px_rgba(9,22,14,0.08)]">
                <div className="absolute right-5 top-5 h-20 w-20 rounded-full bg-green/12" aria-hidden="true" />
                <div className="absolute bottom-8 left-8 h-16 w-16 rounded-full bg-green/8" aria-hidden="true" />
                <Image
                  src="/visuals/hero-dashboard.png"
                  alt="FinTax product screenshot with case stepper, checklist and filing status"
                  width={1680}
                  height={1080}
                  priority
                  className="h-full w-full object-cover"
                />
              </Card>
            </div>
          </Container>
        </Section>

        <section className="border-b border-border/70 bg-gradient-to-r from-[#164c35] via-[#14593d] to-[#174f37] px-4 py-3 text-white">
          <Container className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {trustBar.map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <Star className="h-3.5 w-3.5 fill-current" />
                {item}
              </span>
            ))}
          </Container>
        </section>

        <Section id="how" className="border-b border-border/75 py-12 md:py-16">
          <Container>
            <div className="mb-10 max-w-2xl">
              <p className="text-xs uppercase tracking-[0.12em] text-secondary">{tLanding("howItWorks.eyebrow")}</p>
              <h2 className="mt-2 font-heading text-3xl md:text-4xl tracking-[-0.03em] text-text">{tLanding("howItWorks.title")}</h2>
            </div>
            <ol className="grid gap-6 md:grid-cols-3">
              <li className="rounded-xl border border-border/70 bg-surface p-6 shadow-[0_10px_26px_rgba(10,18,13,0.07)] transition duration-200 hover:-translate-y-0.5 hover:border-green/30 hover:shadow-[0_14px_30px_rgba(14,40,24,0.12)]">
                <p className="font-mono text-4xl leading-none text-muted">01</p>
                <h3 className="mt-4 text-lg font-semibold text-text">Upload your documents</h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary">Provide tax letters, salary files and context docs in secure intake.</p>
              </li>
              <li className="rounded-xl border border-border/70 bg-surface p-6 shadow-[0_10px_26px_rgba(10,18,13,0.07)] transition duration-200 hover:-translate-y-0.5 hover:border-green/30 hover:shadow-[0_14px_30px_rgba(14,40,24,0.12)]">
                <p className="font-mono text-4xl leading-none text-muted">02</p>
                <h3 className="mt-4 text-lg font-semibold text-text">Specialist review</h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary">A tax specialist validates your case and clarifies missing points.</p>
              </li>
              <li className="rounded-xl border border-border/70 bg-surface p-6 shadow-[0_10px_26px_rgba(10,18,13,0.07)] transition duration-200 hover:-translate-y-0.5 hover:border-green/30 hover:shadow-[0_14px_30px_rgba(14,40,24,0.12)]">
                <p className="font-mono text-4xl leading-none text-muted">03</p>
                <h3 className="mt-4 text-lg font-semibold text-text">File and monitor</h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary">Track the status in dashboard until the case reaches completion.</p>
              </li>
            </ol>
          </Container>
        </Section>

        <Section id="services" className="border-b border-border/75 bg-surface2/30 py-12 md:py-16">
          <Container>
            <div className="mb-10 max-w-2xl">
              <p className="text-xs uppercase tracking-[0.12em] text-secondary">{tLanding("services.eyebrow")}</p>
              <h2 className="mt-2 font-heading text-3xl md:text-4xl tracking-[-0.03em] text-text">{tLanding("services.title")}</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {services.map((service) => (
                <Card key={service.title} variant="soft" padding="sm" className="border-border/65 bg-surface transition duration-200 hover:-translate-y-0.5 hover:border-green/30 hover:shadow-[0_14px_28px_rgba(14,40,24,0.1)]">
                  <CardHeader>
                    <CardTitle className="text-base">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-secondary">{service.copy}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        <Section id="pricing" className="border-b border-border/75 py-12 md:py-16">
          <Container>
            <div className="mb-10 max-w-2xl">
              <p className="text-xs uppercase tracking-[0.12em] text-secondary">{tLanding("pricing.eyebrow")}</p>
              <h2 className="mt-2 font-heading text-3xl md:text-4xl tracking-[-0.03em] text-text">{tLanding("pricing.title")}</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {plans.map((plan, idx) => (
                <Card
                  key={plan.name}
                  variant="panel"
                  padding="sm"
                  className={cn(
                    "flex flex-col bg-surface transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(14,40,24,0.1)]",
                    idx === 1 ? "border-green/45 bg-green/5 shadow-[0_10px_24px_rgba(20,67,41,0.12)]" : "border-border/65 hover:border-green/30"
                  )}
                >
                  <p className="text-sm font-semibold text-text">{plan.name}</p>
                  <p className="mt-2 font-mono text-4xl font-semibold text-text">{plan.price}</p>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {plan.features.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-secondary">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        <Section className="border-b border-border/75 bg-surface2/30 py-12 md:py-16">
          <Container>
            <div className="grid gap-12 lg:grid-cols-2">
              <section id="faq">
                <p className="text-xs uppercase tracking-[0.12em] text-secondary">{tLanding("faq.eyebrow")}</p>
                <h2 className="mt-2 font-heading text-3xl tracking-[-0.03em] text-text">{tLanding("faq.title")}</h2>
                <div className="mt-8 rounded-xl border border-border/65 bg-surface p-2 shadow-[0_8px_20px_rgba(10,18,13,0.06)]">
                  <Accordion type="single" defaultValue="faq-0">
                    {faqItems.map((item, index) => (
                      <AccordionItem key={item.q} value={`faq-${index}`}>
                        <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                        <AccordionContent className="leading-relaxed">{item.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </section>

              <div className="space-y-12">
                <section>
                  <Card variant="soft" padding="md" className="border-border/65 bg-surface">
                    <p className="text-xs uppercase tracking-[0.12em] text-muted">Trust content (verified capabilities)</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <p className="rounded-xl border border-border/40 bg-surface/55 px-3 py-2.5 text-sm leading-relaxed text-secondary transition hover:border-green/30 hover:bg-green/5">No guaranteed fiscal outcomes.</p>
                      <p className="rounded-xl border border-border/40 bg-surface/55 px-3 py-2.5 text-sm leading-relaxed text-secondary transition hover:border-green/30 hover:bg-green/5">Scope confirmed before execution.</p>
                      <p className="rounded-xl border border-border/40 bg-surface/55 px-3 py-2.5 text-sm leading-relaxed text-secondary transition hover:border-green/30 hover:bg-green/5">Secure auth and route protection active.</p>
                      <p className="rounded-xl border border-border/40 bg-surface/55 px-3 py-2.5 text-sm leading-relaxed text-secondary transition hover:border-green/30 hover:bg-green/5">Case status tracking in dashboard.</p>
                    </div>
                  </Card>
                </section>

                <section id="blog">
                  <p className="text-xs uppercase tracking-[0.12em] text-secondary">{tLanding("premium.blogTitle")}</p>
                  <h2 className="mt-2 font-heading text-3xl tracking-[-0.03em] text-text">{tLanding("premium.blogTitle")}</h2>
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {blogPreview.map((item) => (
                      <article key={item.title} className="rounded-lg border border-border/70 bg-surface p-4 transition duration-200 hover:-translate-y-0.5 hover:border-green/30 hover:shadow-[0_12px_24px_rgba(14,40,24,0.1)]">
                        <div className="h-24 rounded-xl border border-border/40 bg-surface2/75" aria-hidden="true" />
                        <p className="mt-4 text-xs uppercase tracking-[0.1em] text-muted">{item.tag}</p>
                        <h3 className="mt-1.5 text-sm font-semibold leading-relaxed text-text">{item.title}</h3>
                        <Link href={item.href} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-green hover:text-green-hover">
                          Open
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </Container>
        </Section>

        <Section className="border-b border-border/75 py-16 md:py-12">
          <Container>
            <Card variant="panel" padding="lg" className="border-[#1a4a34] bg-gradient-to-r from-[#113425] to-[#184e36] text-white">
              <div className="grid gap-5 lg:grid-cols-[11fr_9fr] lg:items-center">
                <div>
                  <h2 className="font-heading text-4xl tracking-[-0.03em] text-white">{tLanding("premium.finalCtaTitle")}</h2>
                  <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-white/85">{tLanding("premium.finalCtaBody")}</p>
                </div>
                <div className="flex lg:justify-end">
                  <Link href={buildAuthIntentHref("tax-return")} className={cn(buttonVariants({ size: "lg" }), "h-12 bg-surface text-[#123525] hover:bg-surface/90")}>
                    {tLanding("hero.primaryCta")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Card>
          </Container>
        </Section>

        <footer className="bg-surface2/70 py-12 md:py-16">
          <Container>
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr_1fr]">
              <div>
                <h2 className="font-body text-xl font-semibold text-text">{tLanding("premium.legalTitle")}</h2>
                <p className="mt-3 text-sm leading-relaxed text-secondary">{tLanding("premium.legalBody")}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted">Legal</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/legal/privacy" className={buttonVariants({ variant: "secondary", size: "sm" })}>Privacy</Link>
                  <Link href="/legal/terms" className={buttonVariants({ variant: "secondary", size: "sm" })}>Terms</Link>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted">Locales</p>
                <div className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.1em] text-secondary">
                  <Globe2 className="h-3.5 w-3.5" />
                  EN / NL / ES / PL / RO
                </div>
              </div>
            </div>
          </Container>
        </footer>
      </main>
    </div>
  );
}