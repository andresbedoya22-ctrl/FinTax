"use client";

import Image from "next/image";
import * as React from "react";
import { ArrowRight, Globe2 } from "lucide-react";
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
  nav: { services: string; how: string; pricing: string; faq: string; insights: string };
  signIn: string;
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;
  heroNote: string;
  ctaPrimary: string;
  ctaSecondary: string;
  trustTitle: string;
  howTitle: string;
  servicesTitle: string;
  pricingTitle: string;
  faqTitle: string;
  insightsTitle: string;
  finalCtaTitle: string;
  finalCtaBody: string;
  footerLegalTitle: string;
  footerLegalBody: string;
};

const localeCopy: Record<AppLocale, Copy> = {
  en: {
    nav: { services: "Services", how: "How it works", pricing: "Pricing", faq: "FAQ", insights: "Insights" },
    signIn: "Sign in",
    heroEyebrow: "Dutch tax and benefits guidance for international households",
    heroTitle: "A clear Dutch tax process, with human review before filing.",
    heroBody:
      "FinTax supports P, M and C returns, ZZP workflows and toeslagen guidance with structured intake, document checklists and status tracking.",
    heroNote: "No guaranteed outcomes. Scope and pricing are confirmed before work starts.",
    ctaPrimary: "Start secure intake",
    ctaSecondary: "See pricing",
    trustTitle: "Operational trust signals",
    howTitle: "How it works in 3 steps",
    servicesTitle: "Services",
    pricingTitle: "Pricing",
    faqTitle: "Frequently asked questions",
    insightsTitle: "Latest guidance previews",
    finalCtaTitle: "Start with structure, not uncertainty.",
    finalCtaBody: "Continue in the existing secure flow and receive a scoped quote before full submission.",
    footerLegalTitle: "Legal and operational clarity",
    footerLegalBody: "Public legal pages are available. Registration identifiers are shown only when verified.",
  },
  nl: {
    nav: { services: "Diensten", how: "Werkwijze", pricing: "Prijzen", faq: "FAQ", insights: "Inzichten" },
    signIn: "Inloggen",
    heroEyebrow: "Nederlandse belasting- en toeslaghulp voor internationale huishoudens",
    heroTitle: "Een helder Nederlands belastingproces, met menselijke review voor indiening.",
    heroBody:
      "FinTax ondersteunt P-, M- en C-aangiften, ZZP-workflows en toeslagenhulp met gestructureerde intake, checklist en statusoverzicht.",
    heroNote: "Geen gegarandeerde uitkomsten. Scope en prijs worden vooraf bevestigd.",
    ctaPrimary: "Start beveiligde intake",
    ctaSecondary: "Bekijk prijzen",
    trustTitle: "Operationele betrouwbaarheid",
    howTitle: "Werkwijze in 3 stappen",
    servicesTitle: "Diensten",
    pricingTitle: "Prijzen",
    faqTitle: "Veelgestelde vragen",
    insightsTitle: "Recente guidance previews",
    finalCtaTitle: "Start met structuur, niet met onzekerheid.",
    finalCtaBody: "Ga naar de bestaande veilige flow en ontvang eerst een afgebakende offerte.",
    footerLegalTitle: "Juridische en operationele duidelijkheid",
    footerLegalBody: "Publieke juridische pagina's zijn beschikbaar. Registratiegegevens tonen we alleen na verificatie.",
  },
  es: {
    nav: { services: "Servicios", how: "Como funciona", pricing: "Precios", faq: "FAQ", insights: "Guias" },
    signIn: "Iniciar sesion",
    heroEyebrow: "Soporte fiscal neerlandes para hogares internacionales",
    heroTitle: "Un proceso fiscal claro, con revision humana antes de presentar.",
    heroBody:
      "FinTax cubre formularios P, M y C, flujos ZZP y apoyo en toeslagen con intake estructurado, checklist y seguimiento.",
    heroNote: "Sin resultados garantizados. Alcance y precio se confirman antes de empezar.",
    ctaPrimary: "Empezar intake seguro",
    ctaSecondary: "Ver precios",
    trustTitle: "Prueba operativa sobria",
    howTitle: "Como funciona en 3 pasos",
    servicesTitle: "Servicios",
    pricingTitle: "Precios",
    faqTitle: "Preguntas frecuentes",
    insightsTitle: "Previews editoriales",
    finalCtaTitle: "Empieza con estructura, no con incertidumbre.",
    finalCtaBody: "Continua en el flujo seguro existente y recibe presupuesto delimitado antes del envio.",
    footerLegalTitle: "Claridad legal y operativa",
    footerLegalBody: "Las paginas legales publicas estan disponibles. Los identificadores legales se muestran al verificarse.",
  },
  pl: {
    nav: { services: "Uslugi", how: "Jak dziala", pricing: "Cennik", faq: "FAQ", insights: "Poradniki" },
    signIn: "Zaloguj",
    heroEyebrow: "Wsparcie podatkowe NL dla miedzynarodowych gospodarstw",
    heroTitle: "Jasny proces podatkowy, z weryfikacja specjalisty przed zlozeniem.",
    heroBody: "FinTax obsluguje P/M/C, ZZP i toeslagen z uporzadkowanym intake, checklista i monitoringiem statusu.",
    heroNote: "Bez gwarantowanych wynikow. Zakres i cena sa potwierdzane przed startem.",
    ctaPrimary: "Rozpocznij bezpieczny intake",
    ctaSecondary: "Zobacz ceny",
    trustTitle: "Rzetelne sygnaly zaufania",
    howTitle: "Jak to dziala w 3 krokach",
    servicesTitle: "Uslugi",
    pricingTitle: "Cennik",
    faqTitle: "Najczestsze pytania",
    insightsTitle: "Preview poradnikow",
    finalCtaTitle: "Zacznij od struktury, nie od niepewnosci.",
    finalCtaBody: "Przejdz do istniejacego bezpiecznego flow i otrzymaj zakres przed rozpoczeciem pracy.",
    footerLegalTitle: "Jasnosc prawna i operacyjna",
    footerLegalBody: "Publiczne strony prawne sa dostepne. Identyfikatory rejestrowe pokazujemy po weryfikacji.",
  },
  ro: {
    nav: { services: "Servicii", how: "Cum functioneaza", pricing: "Preturi", faq: "FAQ", insights: "Ghiduri" },
    signIn: "Autentificare",
    heroEyebrow: "Suport fiscal NL pentru gospodarii internationale",
    heroTitle: "Un proces fiscal clar, cu revizuire umana inainte de depunere.",
    heroBody: "FinTax acopera P/M/C, ZZP si toeslagen cu intake structurat, checklist de documente si urmarire status.",
    heroNote: "Fara rezultate garantate. Scopul si pretul sunt confirmate inainte de lucru.",
    ctaPrimary: "Incepe intake securizat",
    ctaSecondary: "Vezi preturile",
    trustTitle: "Semnale operationale de incredere",
    howTitle: "Cum functioneaza in 3 pasi",
    servicesTitle: "Servicii",
    pricingTitle: "Preturi",
    faqTitle: "Intrebari frecvente",
    insightsTitle: "Preview ghiduri",
    finalCtaTitle: "Incepe cu structura, nu cu incertitudine.",
    finalCtaBody: "Continua in fluxul securizat existent si primesti oferta delimitata inainte de depunere.",
    footerLegalTitle: "Claritate legala si operationala",
    footerLegalBody: "Paginile legale publice sunt disponibile. Identificatorii legali apar dupa verificare.",
  },
};

const trustItems = [
  "Locale-aware routes and legal pages available before signup",
  "Secure authentication and case tracking in one workspace",
  "Stripe checkout with webhook-based payment confirmation",
  "Authorization steps explained only when a case requires machtiging",
] as const;

const services = [
  { title: "P / M / C returns", body: "Resident, migration-year and non-resident filing support." },
  { title: "ZZP and VAT", body: "Freelancer workflows with quarterly VAT context." },
  { title: "Toeslagen support", body: "Eligibility checks and guided application preparation." },
  { title: "Letter review", body: "Belastingdienst letter interpretation with next actions." },
  { title: "Case tracking", body: "Status visibility for documents, review and milestones." },
  { title: "Multilingual guidance", body: "Support in EN, ES, PL, RO and Dutch route support." },
] as const;

const pricingRows = [
  { service: "P return", from: "from EUR 95", scope: "Standard annual filing with deductions review." },
  { service: "M return", from: "from EUR 185", scope: "Migration-year filing with split-residency checks." },
  { service: "C return", from: "from EUR 165", scope: "Non-resident filing support for Dutch-source income." },
  { service: "30% support", from: "from EUR 145", scope: "Eligibility and documentation support." },
  { service: "ZZP filing", from: "from EUR 195", scope: "Self-employed filing with optional VAT add-ons." },
] as const;

const faqItems = [
  { q: "Can I start without DigiD?", a: "In many cases, yes. We confirm if DigiD or machtiging is required after intake." },
  { q: "Do you guarantee refund outcomes?", a: "No. We support preparation and filing, but official outcomes depend on the tax authority." },
  { q: "Can I review pricing before upload?", a: "Yes. Base ranges are visible early and complexity is confirmed before filing work starts." },
  { q: "Is this only for expats?", a: "No. International workers, families and ZZP clients can all use the workflow." },
] as const;

const insights = [
  { title: "Choosing between P, M and C returns", date: "2026-03-01", excerpt: "A practical comparison to pick the right filing route.", href: "/legal/terms" },
  { title: "Understanding machtiging in plain language", date: "2026-02-20", excerpt: "When authorization is needed and what it covers.", href: "/legal/privacy" },
  { title: "Preparing documents for faster review", date: "2026-02-08", excerpt: "Checklist quality rules that reduce avoidable delays.", href: "/legal/terms" },
] as const;

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

function getCopy(locale: string): Copy {
  const normalized = (["en", "nl", "es", "pl", "ro"].includes(locale) ? locale : "en") as AppLocale;
  return localeCopy[normalized];
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
      <header className={cn("sticky top-0 z-40 border-b border-border/80 transition-colors", scrolled ? "bg-surface/95" : "bg-surface/88")}>
        <Container className="flex h-16 items-center gap-4">
          <Link href="/" className="focus-ring inline-flex items-center rounded-md text-text">
            <span className="mr-2 grid h-7 w-7 place-items-center rounded-lg border border-green/35 bg-green/10 text-xs font-black text-green">F</span>
            <span className="font-heading text-lg font-semibold tracking-tight">FinTax</span>
          </Link>
          <nav className="ml-3 hidden items-center gap-1 md:flex" aria-label="Landing sections">
            <a href="#services" onClick={(e) => smoothAnchorNavigate(e, "#services")} className="focus-ring rounded-md px-3 py-2 text-sm text-secondary hover:text-text">{t.nav.services}</a>
            <a href="#how" onClick={(e) => smoothAnchorNavigate(e, "#how")} className="focus-ring rounded-md px-3 py-2 text-sm text-secondary hover:text-text">{t.nav.how}</a>
            <a href="#pricing" onClick={(e) => smoothAnchorNavigate(e, "#pricing")} className="focus-ring rounded-md px-3 py-2 text-sm text-secondary hover:text-text">{t.nav.pricing}</a>
            <a href="#faq" onClick={(e) => smoothAnchorNavigate(e, "#faq")} className="focus-ring rounded-md px-3 py-2 text-sm text-secondary hover:text-text">{t.nav.faq}</a>
            <a href="#insights" onClick={(e) => smoothAnchorNavigate(e, "#insights")} className="focus-ring rounded-md px-3 py-2 text-sm text-secondary hover:text-text">{t.nav.insights}</a>
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <Link href="/auth" className="focus-ring rounded-md px-2 py-2 text-sm text-secondary hover:text-text">{t.signIn}</Link>
            <Link href={buildAuthIntentHref("tax-return")} className={buttonVariants({ size: "sm" })}>{t.ctaPrimary}</Link>
          </div>
        </Container>
      </header>

      <main>
        <Section className="border-b border-border/75 pt-10 sm:pt-14">
          <Container>
            <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-secondary">{t.heroEyebrow}</p>
                <h1 className="mt-4 font-heading text-4xl leading-[1.02] tracking-[-0.03em] text-text sm:text-5xl">{t.heroTitle}</h1>
                <p className="mt-5 max-w-[62ch] text-base leading-7 text-secondary">{t.heroBody}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href={buildAuthIntentHref("tax-return")} className={buttonVariants({ size: "lg" })}>{t.ctaPrimary}<ArrowRight className="h-4 w-4" /></Link>
                  <a href="#pricing" onClick={(e) => smoothAnchorNavigate(e, "#pricing")} className={buttonVariants({ variant: "secondary", size: "lg" })}>{t.ctaSecondary}</a>
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.1em] text-muted">{t.heroNote}</p>
              </div>
              <Card variant="panel" padding="none" className="overflow-hidden">
                <Image src="/visuals/hero-dashboard.png" alt="FinTax dashboard preview" width={1680} height={1080} priority className="h-full w-full object-cover" />
              </Card>
            </div>
          </Container>
        </Section>

        <Section className="border-b border-border/75">
          <Container>
            <h2 className="font-body text-2xl font-semibold text-text">{t.trustTitle}</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {trustItems.map((item) => <li key={item} className="rounded-[var(--radius-lg)] border border-border/75 bg-surface2/65 p-4 text-sm leading-6 text-secondary">{item}</li>)}
            </ul>
          </Container>
        </Section>

        <Section id="how" className="border-b border-border/75">
          <Container>
            <h2 className="font-heading text-3xl tracking-[-0.02em] text-text sm:text-4xl">{t.howTitle}</h2>
            <ol className="mt-6 grid gap-4 md:grid-cols-3">
              <li className="rounded-[var(--radius-xl)] border border-border/75 bg-surface p-5"><h3 className="font-body text-lg font-semibold text-text">1. Select your case</h3><p className="mt-2 text-sm leading-6 text-secondary">Choose tax return or benefits flow and share baseline context.</p></li>
              <li className="rounded-[var(--radius-xl)] border border-border/75 bg-surface p-5"><h3 className="font-body text-lg font-semibold text-text">2. Confirm scope and documents</h3><p className="mt-2 text-sm leading-6 text-secondary">Review checklist, upload documents and confirm service scope.</p></li>
              <li className="rounded-[var(--radius-xl)] border border-border/75 bg-surface p-5"><h3 className="font-body text-lg font-semibold text-text">3. Human-reviewed delivery</h3><p className="mt-2 text-sm leading-6 text-secondary">A specialist reviews your case before submission and follow-up.</p></li>
            </ol>
          </Container>
        </Section>

        <Section id="services" className="border-b border-border/75">
          <Container>
            <h2 className="font-heading text-3xl tracking-[-0.02em] text-text sm:text-4xl">{t.servicesTitle}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => <Card key={service.title} variant="soft" padding="md"><CardHeader><CardTitle className="text-lg">{service.title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-6 text-secondary">{service.body}</p></CardContent></Card>)}
            </div>
          </Container>
        </Section>

        <Section id="pricing" className="border-b border-border/75">
          <Container>
            <h2 className="font-heading text-3xl tracking-[-0.02em] text-text sm:text-4xl">{t.pricingTitle}</h2>
            <Card variant="panel" padding="none" className="mt-6 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-surface2/75">
                  <tr><th className="px-5 py-4 text-xs uppercase tracking-[0.12em] text-muted">Service</th><th className="px-5 py-4 text-xs uppercase tracking-[0.12em] text-muted">From</th><th className="px-5 py-4 text-xs uppercase tracking-[0.12em] text-muted">Scope</th></tr>
                </thead>
                <tbody>
                  {pricingRows.map((row) => <tr key={row.service} className="border-t border-border/75"><td className="px-5 py-4 text-sm text-text">{row.service}</td><td className="px-5 py-4"><Badge variant="success">{row.from}</Badge></td><td className="px-5 py-4 text-sm text-secondary">{row.scope}</td></tr>)}
                </tbody>
              </table>
            </Card>
          </Container>
        </Section>

        <Section id="faq" className="border-b border-border/75">
          <Container>
            <h2 className="font-heading text-3xl tracking-[-0.02em] text-text sm:text-4xl">{t.faqTitle}</h2>
            <div className="mt-6"><Accordion type="single" defaultValue="faq-0">{faqItems.map((item, index) => <AccordionItem key={item.q} value={`faq-${index}`}><AccordionTrigger>{item.q}</AccordionTrigger><AccordionContent>{item.a}</AccordionContent></AccordionItem>)}</Accordion></div>
          </Container>
        </Section>

        <Section id="insights" className="border-b border-border/75">
          <Container>
            <h2 className="font-heading text-3xl tracking-[-0.02em] text-text sm:text-4xl">{t.insightsTitle}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {insights.map((post) => <article key={post.title} className="rounded-[var(--radius-xl)] border border-border/75 bg-surface p-5"><p className="font-mono text-xs tracking-[0.06em] text-muted"><time dateTime={post.date}>{post.date}</time></p><h3 className="mt-2 font-body text-lg font-semibold text-text">{post.title}</h3><p className="mt-2 text-sm leading-6 text-secondary">{post.excerpt}</p><Link href={post.href} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-green hover:text-green-hover">Read preview<ArrowRight className="h-4 w-4" /></Link></article>)}
            </div>
          </Container>
        </Section>

        <Section className="border-b border-border/75">
          <Container>
            <Card variant="panel" padding="lg" className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div><h2 className="font-heading text-3xl tracking-[-0.02em] text-text sm:text-4xl">{t.finalCtaTitle}</h2><p className="mt-3 text-sm leading-7 text-secondary">{t.finalCtaBody}</p></div>
              <div className="flex items-center lg:justify-end"><Link href={buildAuthIntentHref("tax-return")} className={buttonVariants({ size: "lg" })}>{t.ctaPrimary}<ArrowRight className="h-4 w-4" /></Link></div>
            </Card>
          </Container>
        </Section>

        <footer className="bg-surface2/70">
          <Container className="py-14">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h2 className="font-body text-xl font-semibold text-text">{t.footerLegalTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-secondary">{t.footerLegalBody}</p>
                <div className="mt-5 flex flex-wrap gap-2"><Link href="/legal/privacy" className={buttonVariants({ variant: "secondary", size: "sm" })}>Privacy</Link><Link href="/legal/terms" className={buttonVariants({ variant: "secondary", size: "sm" })}>Terms</Link></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[var(--radius-lg)] border border-border/75 bg-surface p-4"><p className="text-xs uppercase tracking-[0.12em] text-muted">Contact</p><a href="mailto:support@fintax.example" className="mt-2 block text-sm text-text hover:text-green">support@fintax.example</a></div>
                <div className="rounded-[var(--radius-lg)] border border-border/75 bg-surface p-4"><p className="text-xs uppercase tracking-[0.12em] text-muted">KvK</p><p className="mt-2 text-sm text-text">Pending registration</p></div>
              </div>
            </div>
            <div className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.1em] text-muted"><Globe2 className="h-3.5 w-3.5" />EN / NL / ES / PL / RO</div>
          </Container>
        </footer>
      </main>
    </div>
  );
}
