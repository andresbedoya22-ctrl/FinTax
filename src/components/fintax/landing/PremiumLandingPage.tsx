"use client";

import Image from "next/image";
import * as React from "react";
import { ArrowRight, Check, Globe2, Star } from "lucide-react";
import { useLocale } from "next-intl";

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

type AppLocale = "en" | "nl" | "es" | "pl" | "ro";
type LandingIntent = "tax-return" | "benefits";

type Copy = {
  nav: { how: string; pricing: string; faq: string; blog: string };
  signIn: string;
  start: string;
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;
  heroPrimary: string;
  heroSecondary: string;
  heroPrice: string;
  trustBar: string[];
  stepsTitle: string;
  servicesTitle: string;
  pricingTitle: string;
  faqTitle: string;
  blogTitle: string;
  finalTitle: string;
  finalBody: string;
  legalTitle: string;
  legalBody: string;
};

const copyByLocale: Record<AppLocale, Copy> = {
  en: {
    nav: { how: "How it works", pricing: "Pricing", faq: "FAQ", blog: "Blog" },
    signIn: "Sign in",
    start: "Get started",
    heroEyebrow: "For international households in the Netherlands",
    heroTitle: "Your Dutch tax return, handled with structure.",
    heroBody:
      "Complete intake online, upload your documents, and track each milestone in one workspace with specialist review before filing.",
    heroPrimary: "Start my declaration",
    heroSecondary: "See how it works",
    heroPrice: "Fixed-fee plans from EUR 99 depending on case scope.",
    trustBar: ["Operational support", "Multi-locale routes", "Case workflow tracking", "Response in business hours"],
    stepsTitle: "Three steps to move your case forward",
    servicesTitle: "What is included",
    pricingTitle: "Transparent pricing",
    faqTitle: "Frequently asked questions",
    blogTitle: "Blog preview",
    finalTitle: "Ready to start with clarity?",
    finalBody: "Open secure intake and receive scope confirmation before full case execution.",
    legalTitle: "Legal and operational information",
    legalBody: "Privacy, terms and workflow scope are published and updated in this public area.",
  },
  nl: {
    nav: { how: "Werkwijze", pricing: "Prijzen", faq: "FAQ", blog: "Blog" },
    signIn: "Inloggen",
    start: "Start",
    heroEyebrow: "Voor internationale huishoudens in Nederland",
    heroTitle: "Jouw Nederlandse aangifte, met duidelijke structuur.",
    heroBody:
      "Doe intake online, upload documenten en volg elke stap in een workspace met specialistische review voor indiening.",
    heroPrimary: "Start mijn aangifte",
    heroSecondary: "Bekijk werkwijze",
    heroPrice: "Vaste tarieven vanaf EUR 99, afhankelijk van case-scope.",
    trustBar: ["Operationele support", "Multi-locale routes", "Case workflow tracking", "Reactie binnen kantooruren"],
    stepsTitle: "Drie stappen om je case vooruit te brengen",
    servicesTitle: "Wat is inbegrepen",
    pricingTitle: "Transparante prijzen",
    faqTitle: "Veelgestelde vragen",
    blogTitle: "Blog preview",
    finalTitle: "Klaar om met duidelijkheid te starten?",
    finalBody: "Open secure intake en ontvang scopebevestiging voor volledige uitvoering.",
    legalTitle: "Juridische en operationele informatie",
    legalBody: "Privacy, voorwaarden en workflowscope staan in dit publieke domein.",
  },
  es: {
    nav: { how: "Como funciona", pricing: "Precios", faq: "FAQ", blog: "Blog" },
    signIn: "Iniciar sesion",
    start: "Comienza",
    heroEyebrow: "Para hogares internacionales en los Paises Bajos",
    heroTitle: "Tu declaracion en Holanda, con estructura clara.",
    heroBody:
      "Completa intake online, sube documentos y sigue cada hito en un solo workspace con revision profesional antes del envio.",
    heroPrimary: "Empezar mi declaracion",
    heroSecondary: "Ver como funciona",
    heroPrice: "Planes de tarifa fija desde EUR 99 segun alcance del caso.",
    trustBar: ["Soporte operativo", "Rutas multi-locale", "Seguimiento de workflow", "Respuesta en horario laboral"],
    stepsTitle: "Tres pasos para avanzar tu caso",
    servicesTitle: "Que incluye",
    pricingTitle: "Precios transparentes",
    faqTitle: "Preguntas frecuentes",
    blogTitle: "Blog preview",
    finalTitle: "Listo para empezar con claridad?",
    finalBody: "Abre intake seguro y recibe confirmacion de alcance antes de ejecutar el caso.",
    legalTitle: "Informacion legal y operativa",
    legalBody: "Privacidad, terminos y alcance operativo publicados en este espacio publico.",
  },
  pl: {
    nav: { how: "Jak dziala", pricing: "Cennik", faq: "FAQ", blog: "Blog" },
    signIn: "Zaloguj",
    start: "Start",
    heroEyebrow: "Dla miedzynarodowych gospodarstw w Niderlandach",
    heroTitle: "Rozliczenie NL prowadzone w uporzadkowany sposob.",
    heroBody:
      "Wypelnij intake online, przeslij dokumenty i sledz etapy w jednym workspace z review specjalisty przed zlozeniem.",
    heroPrimary: "Rozpocznij deklaracje",
    heroSecondary: "Zobacz proces",
    heroPrice: "Stale pakiety od EUR 99 zalezne od zakresu sprawy.",
    trustBar: ["Wsparcie operacyjne", "Routingi multi-locale", "Tracking workflow", "Odpowiedz w godzinach pracy"],
    stepsTitle: "Trzy kroki do postepu sprawy",
    servicesTitle: "Zakres uslug",
    pricingTitle: "Przejrzysty cennik",
    faqTitle: "Najczestsze pytania",
    blogTitle: "Blog preview",
    finalTitle: "Gotowy na start z jasnym planem?",
    finalBody: "Uruchom secure intake i potwierdz zakres przed pelna realizacja.",
    legalTitle: "Informacje prawne i operacyjne",
    legalBody: "Prywatnosc, warunki i zakres operacyjny dostepne publicznie.",
  },
  ro: {
    nav: { how: "Cum functioneaza", pricing: "Preturi", faq: "FAQ", blog: "Blog" },
    signIn: "Autentificare",
    start: "Incepe",
    heroEyebrow: "Pentru gospodarii internationale in Olanda",
    heroTitle: "Declaratia ta in Olanda, cu un proces clar.",
    heroBody:
      "Finalizezi intake online, incarci documentele si urmaresti fiecare etapa intr-un workspace cu review uman inainte de depunere.",
    heroPrimary: "Incepe declaratia",
    heroSecondary: "Vezi procesul",
    heroPrice: "Planuri cu tarif fix de la EUR 99 in functie de complexitate.",
    trustBar: ["Suport operational", "Rute multi-locale", "Case workflow tracking", "Raspuns in ore de program"],
    stepsTitle: "Trei pasi pentru progresul cazului",
    servicesTitle: "Ce include",
    pricingTitle: "Preturi transparente",
    faqTitle: "Intrebari frecvente",
    blogTitle: "Blog preview",
    finalTitle: "Pregatit sa incepi cu claritate?",
    finalBody: "Deschide secure intake si primesti confirmarea scope-ului inainte de executie.",
    legalTitle: "Informatii legale si operationale",
    legalBody: "Privacy, terms si scope operational publicate in aceasta zona.",
  },
};

const services = [
  { title: "Income tax declaration", body: "P, M and C filing workflows with checklist and review." },
  { title: "Box and deductions", body: "Context review for deductions and supporting evidence." },
  { title: "Toeslagen support", body: "Eligibility and application guidance in the same case workspace." },
  { title: "ZZP and VAT", body: "Quarterly and annual workflows for self-employed obligations." },
] as const;

const plans = [
  { name: "Basic", price: "EUR 149", items: ["Standard filing", "Checklist", "Status tracking"] },
  { name: "Complete", price: "EUR 199", items: ["Filing + review", "Priority handling", "Email support"] },
  { name: "Premium", price: "EUR 299", items: ["Complex scenarios", "Extended guidance", "Priority SLA"] },
] as const;

const faqItems = [
  { q: "Can I start before collecting all documents?", a: "Yes. Intake can start first, and missing files can be uploaded later in your checklist." },
  { q: "Do you guarantee refund amounts?", a: "No. Outcomes depend on tax authority assessment and validated document context." },
  { q: "Is DigiD always required?", a: "Not always. Authorization requirements depend on case type and stage." },
  { q: "How do I track progress?", a: "Each case step is visible in the authenticated dashboard with status and next actions." },
] as const;

const blogPreview = [
  { title: "How to choose between P, M and C forms", href: "/tax-return", tag: "Taxes" },
  { title: "Document checklist quality rules", href: "/auth?intent=tax-return", tag: "Operations" },
  { title: "Authorization stages explained simply", href: "/legal/privacy", tag: "Compliance" },
] as const;

function getCopy(locale: string): Copy {
  return copyByLocale[(["en", "nl", "es", "pl", "ro"].includes(locale) ? locale : "en") as AppLocale];
}

function smoothAnchorNavigate(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
  const id = href.replace("#", "");
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildAuthIntentHref(intent: LandingIntent, service?: string) {
  const params = new URLSearchParams({ intent });
  if (service) params.set("service", service);
  return `/auth?${params.toString()}`;
}

export function PremiumLandingPage() {
  const locale = useLocale();
  const t = getCopy(locale);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className={cn("sticky top-0 z-40 border-b border-border/75 transition-colors", scrolled ? "bg-surface/97 backdrop-blur" : "bg-surface/92")}>
        <Container className="flex h-[4.35rem] items-center gap-4">
          <Link href="/" className="focus-ring inline-flex items-center rounded-md text-text">
            <span className="mr-2 grid h-7 w-7 place-items-center rounded-lg border border-green/35 bg-green/10 text-xs font-black text-green">F</span>
            <span className="font-heading text-2xl font-semibold tracking-tight">FinTax</span>
          </Link>
          <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Landing sections">
            <a href="#how" onClick={(e) => smoothAnchorNavigate(e, "#how")} className="focus-ring rounded-md px-3 py-2 text-sm text-secondary hover:text-text">{t.nav.how}</a>
            <a href="#pricing" onClick={(e) => smoothAnchorNavigate(e, "#pricing")} className="focus-ring rounded-md px-3 py-2 text-sm text-secondary hover:text-text">{t.nav.pricing}</a>
            <a href="#faq" onClick={(e) => smoothAnchorNavigate(e, "#faq")} className="focus-ring rounded-md px-3 py-2 text-sm text-secondary hover:text-text">{t.nav.faq}</a>
            <a href="#blog" onClick={(e) => smoothAnchorNavigate(e, "#blog")} className="focus-ring rounded-md px-3 py-2 text-sm text-secondary hover:text-text">{t.nav.blog}</a>
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <Link href="/auth" className="focus-ring rounded-md px-2 py-2 text-sm text-secondary hover:text-text">{t.signIn}</Link>
            <Link href={buildAuthIntentHref("tax-return")} className={cn(buttonVariants({ size: "sm" }), "px-4")}>{t.start} <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </Container>
      </header>

      <main>
        <Section className="border-b border-border/75 bg-gradient-to-b from-[#f8fbf9] to-bg py-12 sm:py-14">
          <Container>
            <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
              <div>
                <Badge variant="success">{t.heroEyebrow}</Badge>
                <h1 className="mt-4 max-w-[12.5ch] font-heading text-5xl leading-[0.93] tracking-[-0.035em] text-text sm:text-[4.2rem]">
                  {t.heroTitle}
                </h1>
                <p className="mt-6 max-w-[57ch] text-[1.0625rem] leading-8 text-secondary">{t.heroBody}</p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link href={buildAuthIntentHref("tax-return")} className={cn(buttonVariants({ size: "lg" }), "h-12 px-6 text-[0.97rem]")}>
                    {t.heroPrimary}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href="#how" onClick={(e) => smoothAnchorNavigate(e, "#how")} className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "h-12 px-5")}>
                    {t.heroSecondary}
                  </a>
                </div>
                <p className="mt-4 text-sm text-secondary">{t.heroPrice}</p>
              </div>
              <Card variant="panel" padding="none" className="relative overflow-hidden border-border/65 bg-white shadow-[0_18px_40px_rgba(9,22,14,0.08)]">
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
            {t.trustBar.map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <Star className="h-3.5 w-3.5 fill-current" />
                {item}
              </span>
            ))}
          </Container>
        </section>

        <Section className="border-b border-border/75 py-10 sm:py-12">
          <Container className="space-y-8">
            <div className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
              <div id="how" className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-secondary">How it works</p>
                  <h2 className="mt-2 font-heading text-4xl tracking-[-0.02em] text-text">{t.stepsTitle}</h2>
                </div>
                <ol className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
                  <li className="rounded-[var(--radius-xl)] border border-border/70 bg-white p-6 shadow-[0_10px_26px_rgba(10,18,13,0.07)] transition duration-200 hover:-translate-y-0.5 hover:border-green/30 hover:shadow-[0_14px_30px_rgba(14,40,24,0.12)]">
                    <p className="font-mono text-4xl leading-none text-muted">01</p>
                    <h3 className="mt-4 text-lg font-semibold text-text">Upload your documents</h3>
                    <p className="mt-2 text-sm leading-6 text-secondary">Provide tax letters, salary files and context docs in secure intake.</p>
                  </li>
                  <li className="rounded-[var(--radius-xl)] border border-border/70 bg-white p-6 shadow-[0_10px_26px_rgba(10,18,13,0.07)] transition duration-200 hover:-translate-y-0.5 hover:border-green/30 hover:shadow-[0_14px_30px_rgba(14,40,24,0.12)]">
                    <p className="font-mono text-4xl leading-none text-muted">02</p>
                    <h3 className="mt-4 text-lg font-semibold text-text">Specialist review</h3>
                    <p className="mt-2 text-sm leading-6 text-secondary">A tax specialist validates your case and clarifies missing points.</p>
                  </li>
                  <li className="rounded-[var(--radius-xl)] border border-border/70 bg-white p-6 shadow-[0_10px_26px_rgba(10,18,13,0.07)] transition duration-200 hover:-translate-y-0.5 hover:border-green/30 hover:shadow-[0_14px_30px_rgba(14,40,24,0.12)]">
                    <p className="font-mono text-4xl leading-none text-muted">03</p>
                    <h3 className="mt-4 text-lg font-semibold text-text">File and monitor</h3>
                    <p className="mt-2 text-sm leading-6 text-secondary">Track the status in dashboard until the case reaches completion.</p>
                  </li>
                </ol>
              </div>

              <div className="space-y-6">
                <section id="services">
                  <p className="text-xs uppercase tracking-[0.12em] text-secondary">Services</p>
                  <h2 className="mt-2 font-heading text-3xl tracking-[-0.02em] text-text">{t.servicesTitle}</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {services.map((service) => (
                      <Card key={service.title} variant="soft" padding="sm" className="border-border/65 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-green/30 hover:shadow-[0_14px_28px_rgba(14,40,24,0.1)]">
                        <CardHeader>
                          <CardTitle className="text-base">{service.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm leading-6 text-secondary">{service.body}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>

                <section id="pricing">
                  <p className="text-xs uppercase tracking-[0.12em] text-secondary">Pricing</p>
                  <h2 className="mt-2 font-heading text-3xl tracking-[-0.02em] text-text">{t.pricingTitle}</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {plans.map((plan, idx) => (
                      <Card
                        key={plan.name}
                        variant="panel"
                        padding="sm"
                        className={cn(
                          "bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(14,40,24,0.1)]",
                          idx === 1 ? "border-green/45 bg-green/5 shadow-[0_10px_24px_rgba(20,67,41,0.12)]" : "border-border/65 hover:border-green/30"
                        )}
                      >
                        <p className="text-sm font-semibold text-text">{plan.name}</p>
                        <p className="mt-2 font-mono text-4xl font-semibold text-text">{plan.price}</p>
                        <ul className="mt-3 space-y-1.5">
                          {plan.items.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-secondary">
                              <Check className="mt-0.5 h-4 w-4 text-green" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
              <section>
                <Card variant="soft" padding="md" className="border-border/65 bg-white">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted">Trust content (verified capabilities)</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <p className="rounded-lg border border-border/40 bg-surface/55 px-3 py-2.5 text-sm text-secondary transition hover:border-green/30 hover:bg-green/5">No guaranteed fiscal outcomes.</p>
                    <p className="rounded-lg border border-border/40 bg-surface/55 px-3 py-2.5 text-sm text-secondary transition hover:border-green/30 hover:bg-green/5">Scope confirmed before execution.</p>
                    <p className="rounded-lg border border-border/40 bg-surface/55 px-3 py-2.5 text-sm text-secondary transition hover:border-green/30 hover:bg-green/5">Secure auth and route protection active.</p>
                    <p className="rounded-lg border border-border/40 bg-surface/55 px-3 py-2.5 text-sm text-secondary transition hover:border-green/30 hover:bg-green/5">Case status tracking in dashboard.</p>
                  </div>
                </Card>
              </section>

              <div className="space-y-6">
                <section id="faq">
                  <p className="text-xs uppercase tracking-[0.12em] text-secondary">FAQ</p>
                  <h2 className="mt-2 font-heading text-3xl tracking-[-0.02em] text-text">{t.faqTitle}</h2>
                  <div className="mt-4 rounded-[var(--radius-xl)] border border-border/65 bg-white p-2 shadow-[0_8px_20px_rgba(10,18,13,0.06)]">
                    <Accordion type="single" defaultValue="faq-0">
                      {faqItems.map((item, index) => (
                        <AccordionItem key={item.q} value={`faq-${index}`}>
                          <AccordionTrigger>{item.q}</AccordionTrigger>
                          <AccordionContent>{item.a}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </section>

                <section id="blog">
                  <p className="text-xs uppercase tracking-[0.12em] text-secondary">Blog preview</p>
                  <h2 className="mt-2 font-heading text-3xl tracking-[-0.02em] text-text">{t.blogTitle}</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {blogPreview.map((item) => (
                      <article key={item.title} className="rounded-[var(--radius-lg)] border border-border/70 bg-white p-3.5 transition duration-200 hover:-translate-y-0.5 hover:border-green/30 hover:shadow-[0_12px_24px_rgba(14,40,24,0.1)]">
                        <div className="h-24 rounded-lg border border-border/40 bg-surface2/75" aria-hidden="true" />
                        <p className="mt-2 text-xs uppercase tracking-[0.1em] text-muted">{item.tag}</p>
                        <h3 className="mt-1 text-sm font-semibold leading-5 text-text">{item.title}</h3>
                        <Link href={item.href} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-green hover:text-green-hover">
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

        <Section className="border-b border-border/75 py-12 sm:py-14">
          <Container>
            <Card variant="panel" padding="lg" className="border-[#1a4a34] bg-gradient-to-r from-[#113425] to-[#184e36] text-white">
              <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                  <h2 className="font-heading text-4xl tracking-[-0.02em] text-white">{t.finalTitle}</h2>
                  <p className="mt-3 max-w-[56ch] text-sm leading-7 text-white/85">{t.finalBody}</p>
                </div>
                <div className="flex lg:justify-end">
                  <Link href={buildAuthIntentHref("tax-return")} className={cn(buttonVariants({ size: "lg" }), "h-12 bg-surface text-[#123525] hover:bg-surface/90")}>
                    {t.heroPrimary}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Card>
          </Container>
        </Section>

        <footer className="bg-surface2/70 py-10">
          <Container>
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr_1fr]">
              <div>
                <h2 className="font-body text-xl font-semibold text-text">{t.legalTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-secondary">{t.legalBody}</p>
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
                <p className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.1em] text-secondary">
                  <Globe2 className="h-3.5 w-3.5" />
                  EN / NL / ES / PL / RO
                </p>
              </div>
            </div>
          </Container>
        </footer>
      </main>
    </div>
  );
}
