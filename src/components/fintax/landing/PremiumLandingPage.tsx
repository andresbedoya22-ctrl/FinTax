"use client";

import Image from "next/image";
import React from "react";
import { useLocale } from "next-intl";
import {
  ArrowRight,
  Check,
  Clock3,
  FileCheck2,
  FileLock2,
  Globe2,
  Landmark,
  ShieldCheck,
} from "lucide-react";

import { Container } from "@/components/fintax/Container";
import { LanguageSwitcher } from "@/components/fintax/LanguageSwitcher";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  EmptyState,
  Input,
  Select,
  Stepper,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  buttonVariants,
} from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type AppLocale = "en" | "es" | "pl" | "ro" | "nl";
type ServiceCode = "P" | "M" | "C" | "30%" | "ZZP";

const serviceCodes: ServiceCode[] = ["P", "M", "C", "30%", "ZZP"];

const tByLocale = {
  en: {
    nav: ["Services", "How it works", "Pricing", "FAQ"],
    signIn: "Sign in",
    getPrice: "Get price in 60s",
    checklist: "Free checklist",
    heroEyebrow: "Dutch tax filings and letters, handled with fixed pricing and human review",
    heroTitle: "Premium Dutch tax support built to convert trust into action",
    heroSubtitle:
      "Clear fixed-fee quotes for P/M/C returns, 30% cases and ZZP filings. Multilingual support with secure upload and status visibility.",
    heroNote: "EN / ES / PL / RO support. Dutch route remains available.",
    serviceLabel: "Service selector",
    serviceTitle: "Choose your case type above the fold",
    howLabel: "How it works",
    howTitle: "4-step filing journey",
    howIntro: "Quote first, documents second, human review before filing.",
    pricingLabel: "Pricing",
    pricingTitle: "Transparent base pricing + add-ons",
    trustLabel: "Trust",
    trustTitle: "Process controls for sensitive tax documents",
    testimonialsLabel: "Testimonials",
    testimonialsTitle: "Language-segmented proof",
    faqLabel: "FAQ",
    faqTitle: "Questions that usually block conversion",
    legal: "Legal placeholder",
    footerCta: "Start intake",
    checklistTitle: "Free pre-filing checklist",
    checklistDesc: "UI placeholder form for the checklist lead capture flow.",
    checklistSubmit: "Request checklist",
    checklistClose: "Close",
  },
  es: {
    nav: ["Servicios", "Como funciona", "Precios", "FAQ"],
    signIn: "Iniciar sesion",
    getPrice: "Precio en 60 s",
    checklist: "Checklist gratis",
    heroEyebrow: "Impuestos y cartas de Paises Bajos con precio fijo y revision humana",
    heroTitle: "Soporte fiscal neerlandes premium para convertir confianza en accion",
    heroSubtitle:
      "Cotizacion clara para declaraciones P/M/C, casos del 30% y ZZP. Soporte multilingue con carga segura y seguimiento.",
    heroNote: "Soporte EN / ES / PL / RO. La ruta en neerlandes sigue disponible.",
    serviceLabel: "Selector de servicio",
    serviceTitle: "Elige el tipo de caso desde arriba",
    howLabel: "Como funciona",
    howTitle: "Proceso en 4 pasos",
    howIntro: "Primero el precio, luego documentos, revision humana antes del envio.",
    pricingLabel: "Precios",
    pricingTitle: "Precio base transparente + extras",
    trustLabel: "Confianza",
    trustTitle: "Controles serios para documentos fiscales sensibles",
    testimonialsLabel: "Testimonios",
    testimonialsTitle: "Prueba social por idioma",
    faqLabel: "FAQ",
    faqTitle: "Preguntas que frenan la conversion",
    legal: "Placeholder legal",
    footerCta: "Iniciar intake",
    checklistTitle: "Checklist gratis antes de declarar",
    checklistDesc: "Formulario placeholder para captar leads de checklist.",
    checklistSubmit: "Solicitar checklist",
    checklistClose: "Cerrar",
  },
  pl: {
    nav: ["Uslugi", "Jak to dziala", "Cennik", "FAQ"],
    signIn: "Zaloguj",
    getPrice: "Cena w 60 s",
    checklist: "Darmowa checklista",
    heroEyebrow: "Holenderskie podatki i pisma z jasna cena i kontrola czlowieka",
    heroTitle: "Premium wsparcie podatkowe NL zaprojektowane pod konwersje",
    heroSubtitle:
      "Jasna wycena dla deklaracji P/M/C, spraw 30% i ZZP. Wielojezyczne wsparcie, bezpieczny upload i status.",
    heroNote: "Wsparcie EN / ES / PL / RO. Trasa niderlandzka pozostaje dostepna.",
    serviceLabel: "Wybor uslugi",
    serviceTitle: "Wybierz typ sprawy od razu",
    howLabel: "Jak to dziala",
    howTitle: "Sciezka w 4 krokach",
    howIntro: "Najpierw wycena, potem dokumenty, na koncu weryfikacja czlowieka.",
    pricingLabel: "Cennik",
    pricingTitle: "Przejrzysta cena bazowa + dodatki",
    trustLabel: "Zaufanie",
    trustTitle: "Kontrole procesu dla wrazliwych dokumentow",
    testimonialsLabel: "Opinie",
    testimonialsTitle: "Dowod spoleczny wedlug jezyka",
    faqLabel: "FAQ",
    faqTitle: "Pytania blokujace decyzje",
    legal: "Placeholder prawny",
    footerCta: "Rozpocznij intake",
    checklistTitle: "Darmowa checklista przed rozliczeniem",
    checklistDesc: "Placeholder formularza do pobrania checklisty.",
    checklistSubmit: "Popros o checkliste",
    checklistClose: "Zamknij",
  },
  ro: {
    nav: ["Servicii", "Cum functioneaza", "Preturi", "FAQ"],
    signIn: "Autentificare",
    getPrice: "Pret in 60 s",
    checklist: "Checklist gratuit",
    heroEyebrow: "Taxe si scrisori olandeze cu pret fix si verificare umana",
    heroTitle: "Asistenta fiscala premium NL construita pentru conversie",
    heroSubtitle:
      "Oferta clara pentru declaratii P/M/C, cazuri 30% si ZZP. Suport multilingv, upload securizat si status clar.",
    heroNote: "Suport EN / ES / PL / RO. Ruta in olandeza ramane disponibila.",
    serviceLabel: "Selector servicii",
    serviceTitle: "Alege tipul de caz din primul ecran",
    howLabel: "Cum functioneaza",
    howTitle: "Flux in 4 pasi",
    howIntro: "Oferta mai intai, documente dupa, revizuire umana inainte de depunere.",
    pricingLabel: "Preturi",
    pricingTitle: "Pret de baza transparent + add-on-uri",
    trustLabel: "Incredere",
    trustTitle: "Controale serioase pentru documente fiscale sensibile",
    testimonialsLabel: "Testimoniale",
    testimonialsTitle: "Dovada sociala pe limbi",
    faqLabel: "FAQ",
    faqTitle: "Intrebari care blocheaza conversia",
    legal: "Placeholder legal",
    footerCta: "Incepe intake",
    checklistTitle: "Checklist gratuit inainte de depunere",
    checklistDesc: "Placeholder UI pentru formularul de checklist.",
    checklistSubmit: "Solicita checklist",
    checklistClose: "Inchide",
  },
} as const;

const serviceContent: Record<ServiceCode, { title: string; price: string; eta: string; summary: string; bullets: string[] }> = {
  P: { title: "P return (resident)", price: "from EUR 95", eta: "2-5 business days", summary: "Standard resident income tax filing with deductions review and human check before submission.", bullets: ["Fixed base fee", "Human-reviewed filing", "Secure upload checklist"] },
  M: { title: "M return (migration year)", price: "from EUR 185", eta: "5-10 business days", summary: "Higher-complexity migration-year filing with split residency and timeline review.", bullets: ["Migration year scope review", "Structured document checklist", "Transparent add-ons"] },
  C: { title: "C return (non-resident)", price: "from EUR 165", eta: "4-8 business days", summary: "Non-resident filing support for Dutch-source income and related obligations.", bullets: ["Quote before work starts", "Treaty-sensitive flags", "Human support in your language"] },
  "30%": { title: "30% ruling support", price: "from EUR 145", eta: "2-6 business days", summary: "Eligibility pre-check and documentation guidance, optionally linked to your filing flow.", bullets: ["Eligibility check", "Employer coordination guidance", "Add to return workflow"] },
  ZZP: { title: "ZZP / freelancer filing", price: "from EUR 195", eta: "5-10 business days", summary: "Self-employed filing with optional VAT and bezwaar support when complexity requires it.", bullets: ["Profit/loss review", "Entrepreneur deduction checks", "Optional VAT / bezwaar add-ons"] },
};

const howSteps = [
  { id: "1", label: "Select service", description: "Choose P, M, C, 30% or ZZP and answer a short intake." },
  { id: "2", label: "See fixed quote", description: "Base fee + relevant add-ons shown before you upload." },
  { id: "3", label: "Secure upload", description: "Submit documents with a checklist and progress visibility." },
  { id: "4", label: "Human review & filing", description: "Prepared, reviewed and filed with status updates." },
];

const pricingRows = [
  ["P return", "EUR 95", "Standard filing + deductions review"],
  ["M return", "EUR 185", "Migration-year filing + split residency review"],
  ["C return", "EUR 165", "Non-resident filing + scope review"],
  ["30% ruling support", "EUR 145", "Eligibility + documentation support"],
  ["ZZP filing", "EUR 195", "Self-employed filing + deductions checks"],
] as const;

const addonRows = [
  ["Woning", "+EUR 55", "Mortgage / home ownership review"],
  ["Box3 simple", "+EUR 45", "Savings and standard investments"],
  ["Box3 advanced / crypto-heavy", "+EUR 120+", "Complex assets or high-volume transactions"],
  ["Bezwaar", "from EUR 145", "Assessment review and objection support"],
] as const;

const trustItems = [
  { icon: ShieldCheck, title: "GDPR-minded handling", body: "Only documents relevant to the selected service are requested." },
  { icon: Clock3, title: "Response time expectations", body: "Typical response within one business day." },
  { icon: FileLock2, title: "Secure upload", body: "Documents move through a secure intake flow, not ad hoc messages." },
  { icon: FileCheck2, title: "Human review", body: "Automation helps, but filing outputs are reviewed by a person." },
] as const;

const testimonials = [
  { locale: "en", label: "EN", quote: "The fixed quote and checklist removed the uncertainty around my M return.", person: "Daniel K. - Engineer, Amsterdam", service: "M return" },
  { locale: "es", label: "ES", quote: "El precio cerrado y la explicacion clara me dio confianza para empezar.", person: "Maria R. - Marketing, Utrecht", service: "30% support" },
  { locale: "pl", label: "PL", quote: "Najbardziej pomogla checklista dokumentow i szybka odpowiedz zespolu.", person: "Tomasz W. - Eindhoven", service: "P return" },
  { locale: "ro", label: "RO", quote: "Am primit un pret clar si suport in limba mea, fara surprize.", person: "Elena M. - Rotterdam", service: "C return" },
] as const;

const faqItems = [
  { q: "Can I get a quote before uploading documents?", a: "Yes. The intake shows a base quote and likely add-ons first. Final scope is confirmed after a quick completeness review." },
  { q: "Do you support crypto-heavy Box3 cases?", a: "Yes. We separate simple Box3 from advanced or crypto-heavy work so pricing stays transparent." },
  { q: "Do I need DigiD before starting?", a: "Not always. You can start with the intake and checklist first, then we explain if DigiD or a machtiging is required." },
  { q: "Can you handle ZZP and salary in the same year?", a: "Yes. That is common. The quote will show the ZZP base and any complexity add-ons if needed." },
] as const;

function getT(locale: string) {
  return tByLocale[(["en", "es", "pl", "ro"].includes(locale) ? locale : "en") as keyof typeof tByLocale];
}

function stagger(index: number): React.CSSProperties {
  return { animation: "fadeUp 680ms cubic-bezier(.22,.61,.36,1) both", animationDelay: `${index * 90}ms` };
}

function ServiceSelectorCard({ ctaLabel }: { ctaLabel: string }) {
  return (
    <Tabs defaultValue="P" className="w-full">
      <TabsList className="w-full flex-wrap justify-start rounded-2xl border-border/60 bg-surface2/65 p-1">
        {serviceCodes.map((code) => (
          <TabsTrigger key={code} value={code} className="min-w-[64px] flex-1 justify-center">
            {code}
          </TabsTrigger>
        ))}
      </TabsList>
      {serviceCodes.map((code) => {
        const item = serviceContent[code];
        return (
          <TabsContent key={code} value={code}>
            <Card variant="soft" padding="md" className="bg-surface2/45">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="success">{item.price}</Badge>
                  <Badge variant="neutral">{item.eta}</Badge>
                </div>
                <CardTitle className="text-2xl">{item.title}</CardTitle>
                <CardDescription>{item.summary}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2 text-sm text-secondary">
                  {item.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  <Link href="/auth" className={buttonVariants({ size: "sm" })}>
                    {ctaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

function ChecklistDialog({ t }: { t: ReturnType<typeof getT> }) {
  return (
    <Dialog>
      <DialogTrigger className="inline-flex h-11 items-center justify-center rounded-[var(--radius-pill)] border border-copper/30 bg-copper/8 px-5 text-sm font-medium text-text transition hover:bg-copper/12 focus-ring">
        {t.checklist}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.checklistTitle}</DialogTitle>
          <DialogDescription>{t.checklistDesc}</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm text-secondary">
              <span>Name</span>
              <Input placeholder="Name" />
            </label>
            <label className="grid gap-1.5 text-sm text-secondary">
              <span>Email</span>
              <Input type="email" placeholder="name@email.com" />
            </label>
          </div>
          <label className="grid gap-1.5 text-sm text-secondary">
            <span>Preferred language</span>
            <Select defaultValue="en">
              <option value="en">English</option>
              <option value="es">Espanol</option>
              <option value="pl">Polski</option>
              <option value="ro">Romana</option>
              <option value="nl">Nederlands</option>
            </Select>
          </label>
          <label className="grid gap-1.5 text-sm text-secondary">
            <span>Notes (optional)</span>
            <Textarea placeholder="P / M / C / 30% / ZZP" />
          </label>
          <p className="text-xs text-muted">Legal placeholder: checklist delivery flow will be wired in a later phase.</p>
          <DialogFooter>
            <Button type="button" variant="ghost">
              {t.checklistClose}
            </Button>
            <Button type="submit">{t.checklistSubmit}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Header({ t }: { t: ReturnType<typeof getT> }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-bg/72 backdrop-blur-xl">
      <Container className="flex h-16 items-center gap-3">
        <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-md text-text">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-copper/30 bg-copper/10 font-heading text-sm text-copper">
            F
          </span>
          <span className="font-heading text-lg tracking-tight">FinTax</span>
        </Link>
        <nav className="ml-2 hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {[
            { href: "#services", label: t.nav[0] },
            { href: "#how", label: t.nav[1] },
            { href: "#pricing", label: t.nav[2] },
            { href: "#faq", label: t.nav[3] },
          ].map((item) => (
            <a key={item.href} href={item.href} className="focus-ring rounded-full px-3 py-2 text-sm text-secondary hover:bg-white/5 hover:text-text">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />
          <Link href="/auth" className="focus-ring hidden rounded-full px-3 py-2 text-sm text-secondary sm:inline-flex">
            {t.signIn}
          </Link>
          <a href="#services" className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}>
            {t.getPrice}
          </a>
        </div>
      </Container>
    </header>
  );
}

export function PremiumLandingPage() {
  const locale = useLocale() as AppLocale;
  const t = getT(locale);
  const activeTestimonial = testimonials.some((x) => x.locale === locale) ? locale : "en";

  return (
    <div className="min-h-screen bg-mesh technical-lines texture-noise">
      <Header t={t} />
      <main className="relative z-10 overflow-x-clip pt-16">
        <section id="hero" className="border-b border-border/30">
          <Container className="section-rhythm pt-8 sm:pt-12">
            <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
              <div className="space-y-5 pt-4 sm:pt-8" style={stagger(0)}>
                <Badge variant="copper" className="w-fit">
                  {t.heroEyebrow}
                </Badge>
                <h1 className="max-w-[16ch] font-heading text-4xl leading-[0.95] tracking-[-0.04em] text-text sm:text-5xl lg:text-6xl">
                  {t.heroTitle}
                </h1>
                <p className="max-w-[58ch] text-sm leading-6 text-secondary sm:text-base sm:leading-7">{t.heroSubtitle}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <a href="#services" className={buttonVariants({ size: "lg" })}>
                    {t.getPrice}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <ChecklistDialog t={t} />
                </div>
                <p className="text-xs tracking-[0.06em] text-muted">{t.heroNote}</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Card variant="soft" padding="sm">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Response</p>
                    <p className="mt-2 font-heading text-lg text-text">&lt; 1 business day</p>
                  </Card>
                  <Card variant="soft" padding="sm">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Languages</p>
                    <p className="mt-2 font-heading text-lg text-text">EN ES PL RO</p>
                  </Card>
                  <Card variant="soft" padding="sm">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Model</p>
                    <p className="mt-2 font-heading text-lg text-text">Fixed fee</p>
                  </Card>
                </div>
              </div>

              <div style={stagger(1)}>
                <Card variant="panel" padding="none" className="overflow-hidden">
                  <div className="relative border-b border-border/35">
                    <Image
                      src="/visuals/hero-bg.svg"
                      alt="Editorial mesh background"
                      width={1920}
                      height={1080}
                      priority
                      className="h-[180px] w-full object-cover sm:h-[220px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/10 to-bg/75" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2">
                      <Badge variant="success">Fixed quote first</Badge>
                      <Badge variant="neutral">Secure upload</Badge>
                    </div>
                  </div>
                  <div className="grid gap-4 p-4 sm:p-5">
                    <Image
                      src="/visuals/app-mock.svg"
                      alt="App mockup"
                      width={1600}
                      height={1000}
                      className="w-full rounded-2xl border border-border/45 object-cover shadow-glass"
                    />
                    <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
                      <Card variant="soft" padding="sm" className="bg-surface2/45">
                        <p className="mb-3 text-xs uppercase tracking-[0.14em] text-copper">{t.serviceLabel}</p>
                        <ServiceSelectorCard ctaLabel={t.getPrice} />
                      </Card>
                      <Card variant="soft" padding="sm" className="bg-surface2/45">
                        <p className="text-xs uppercase tracking-[0.14em] text-muted">Letter support</p>
                        <Image
                          src="/visuals/letter-mock.svg"
                          alt="Official letter mock"
                          width={1400}
                          height={1000}
                          className="mt-3 h-[180px] w-full rounded-xl border border-border/40 object-cover"
                        />
                        <p className="mt-3 text-sm leading-6 text-secondary">
                          Belastingdienst letter review can be routed into the same intake and filing process.
                        </p>
                      </Card>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </Container>
        </section>

        <section id="services" className="border-b border-border/30">
          <Container className="section-rhythm">
            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]" style={stagger(2)}>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-copper">{t.serviceLabel}</p>
                <h2 className="mt-3 font-heading text-3xl tracking-[-0.03em] text-text sm:text-4xl">{t.serviceTitle}</h2>
                <p className="mt-4 text-sm leading-6 text-secondary">
                  P / M / C / 30% / ZZP selector is visible before scrolling past the hero, with scope preview and pricing anchors.
                </p>
              </div>
              <ServiceSelectorCard ctaLabel={t.getPrice} />
            </div>
          </Container>
        </section>

        <section id="how" className="border-b border-border/30">
          <Container className="section-rhythm">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]" style={stagger(3)}>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-copper">{t.howLabel}</p>
                <h2 className="mt-3 font-heading text-3xl tracking-[-0.03em] text-text sm:text-4xl">{t.howTitle}</h2>
                <p className="mt-4 text-sm leading-6 text-secondary">{t.howIntro}</p>
              </div>
              <Card variant="panel" padding="md">
                <Stepper steps={howSteps} currentStep={2} />
              </Card>
            </div>
          </Container>
        </section>

        <section id="pricing" className="border-b border-border/30">
          <Container className="section-rhythm">
            <div className="space-y-6" style={stagger(4)}>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-copper">{t.pricingLabel}</p>
                <h2 className="mt-3 font-heading text-3xl tracking-[-0.03em] text-text sm:text-4xl">{t.pricingTitle}</h2>
              </div>
              <Card variant="panel" padding="none" className="overflow-hidden">
                <div className="hidden md:block">
                  <table className="w-full text-left">
                    <thead className="bg-surface2/70">
                      <tr>
                        <th className="px-5 py-4 text-xs uppercase tracking-[0.14em] text-muted">Service</th>
                        <th className="px-5 py-4 text-xs uppercase tracking-[0.14em] text-muted">From</th>
                        <th className="px-5 py-4 text-xs uppercase tracking-[0.14em] text-muted">Base scope</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pricingRows.map(([service, from, scope]) => (
                        <tr key={service} className="border-t border-border/35">
                          <td className="px-5 py-4 text-sm text-text">{service}</td>
                          <td className="px-5 py-4">
                            <Badge variant="success">{from}</Badge>
                          </td>
                          <td className="px-5 py-4 text-sm text-secondary">{scope}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="grid gap-3 p-4 md:hidden">
                  {pricingRows.map(([service, from, scope]) => (
                    <Card key={service} variant="soft" padding="sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-text">{service}</p>
                          <p className="mt-1 text-xs leading-5 text-muted">{scope}</p>
                        </div>
                        <Badge variant="success">{from}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <Card variant="panel" padding="md">
                  <CardHeader>
                    <CardTitle className="text-2xl">Add-ons</CardTitle>
                    <CardDescription>
                      Woning, Box3 simple, Box3 advanced/crypto-heavy and bezwaar are priced separately to keep base pricing clear.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {addonRows.map(([name, price, note]) => (
                      <div key={name} className="editorial-frame flex items-start justify-between gap-3 rounded-[var(--radius-lg)] bg-surface2/40 p-4">
                        <div>
                          <p className="text-sm font-medium text-text">{name}</p>
                          <p className="mt-1 text-xs leading-5 text-muted">{note}</p>
                        </div>
                        <Badge variant="copper">{price}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <EmptyState
                  title={t.getPrice}
                  description="Conversion summary card using the new UI kit. Routes and flow behavior remain unchanged in Phase 2."
                  action={
                    <Link href="/auth" className={buttonVariants()}>
                      {t.footerCta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  }
                  secondaryAction={<ChecklistDialog t={t} />}
                />
              </div>
            </div>
          </Container>
        </section>

        <section id="trust" className="border-b border-border/30">
          <Container className="section-rhythm">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]" style={stagger(5)}>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-copper">{t.trustLabel}</p>
                <h2 className="mt-3 font-heading text-3xl tracking-[-0.03em] text-text sm:text-4xl">{t.trustTitle}</h2>
                <div className="mt-5 grid gap-3">
                  {trustItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Card key={item.title} variant="soft" padding="sm" className="bg-surface2/45">
                        <div className="flex items-start gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-green/20 bg-green/10 text-green">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text">{item.title}</p>
                            <p className="mt-1 text-xs leading-5 text-muted">{item.body}</p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
              <Card variant="panel" padding="lg" className="bg-mesh-subtle">
                <Badge variant="neutral" className="mb-4">
                  <Landmark className="h-3 w-3" />
                  Belastingdienst machtiging
                </Badge>
                <h3 className="font-heading text-2xl tracking-[-0.03em] text-text">Belastingdienst machtiging explained</h3>
                <p className="mt-3 text-sm leading-6 text-secondary">
                  A machtiging is a scoped authorization for specific tax matters. It is not unlimited access. We explain when it is needed, what it covers and why.
                </p>
                <ul className="mt-5 grid gap-2.5 text-sm text-secondary">
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-copper" /><span>Used only when required for the selected service</span></li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-copper" /><span>Scope and purpose explained before approval</span></li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-copper" /><span>Secure upload and human review remain separate, explicit steps</span></li>
                </ul>
              </Card>
            </div>
          </Container>
        </section>

        <section id="testimonials" className="border-b border-border/30">
          <Container className="section-rhythm">
            <div className="space-y-6" style={stagger(6)}>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-copper">{t.testimonialsLabel}</p>
                <h2 className="mt-3 font-heading text-3xl tracking-[-0.03em] text-text sm:text-4xl">{t.testimonialsTitle}</h2>
              </div>
              <Tabs defaultValue={activeTestimonial}>
                <TabsList className="flex w-full flex-wrap justify-start">
                  {testimonials.map((tab) => (
                    <TabsTrigger key={tab.locale} value={tab.locale}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {testimonials.map((tab) => (
                  <TabsContent key={tab.locale} value={tab.locale}>
                    <Card variant="panel" padding="lg" className="grid gap-5 md:grid-cols-[1.15fr_0.85fr]">
                      <div>
                        <Badge variant="copper">{tab.service}</Badge>
                        <blockquote className="mt-4 font-heading text-2xl leading-[1.15] tracking-[-0.03em] text-text sm:text-3xl">
                          &ldquo;{tab.quote}&rdquo;
                        </blockquote>
                        <p className="mt-5 text-sm font-medium text-secondary">{tab.person}</p>
                      </div>
                      <div className="editorial-frame rounded-[var(--radius-lg)] bg-surface2/35 p-5">
                        <p className="text-xs uppercase tracking-[0.14em] text-muted">Why this works</p>
                        <ul className="mt-3 grid gap-2 text-sm text-secondary">
                          <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-green" /><span>Language-matched social proof</span></li>
                          <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-green" /><span>Mentions fixed quote and checklist</span></li>
                          <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-green" /><span>Supports higher-intent traffic decisions</span></li>
                        </ul>
                      </div>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </Container>
        </section>

        <section id="faq" className="border-b border-border/30">
          <Container className="section-rhythm">
            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]" style={stagger(7)}>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-copper">{t.faqLabel}</p>
                <h2 className="mt-3 font-heading text-3xl tracking-[-0.03em] text-text sm:text-4xl">{t.faqTitle}</h2>
              </div>
              <Accordion type="single" defaultValue="faq-0">
                {faqItems.map((item, index) => (
                  <AccordionItem key={item.q} value={`faq-${index}`}>
                    <AccordionTrigger>{item.q}</AccordionTrigger>
                    <AccordionContent>{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Container>
        </section>

        <footer>
          <Container className="section-rhythm">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]" style={stagger(8)}>
              <Card variant="panel" padding="lg">
                <Badge variant="outline" className="mb-4">{t.legal}</Badge>
                <h2 className="font-heading text-2xl tracking-[-0.03em] text-text sm:text-3xl">FinTax premium conversion landing</h2>
                <p className="mt-4 text-sm leading-6 text-secondary">
                  Privacy notice, terms, cookie notice and complaint policy links will be connected before production launch. This section is intentionally a legal placeholder for now.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Privacy (placeholder)", "Terms (placeholder)", "Cookies (placeholder)", "Contact (placeholder)"].map((label) => (
                    <Badge key={label} variant="neutral">{label}</Badge>
                  ))}
                </div>
              </Card>
              <Card variant="soft" padding="lg" className="bg-mesh-subtle">
                <p className="text-xs uppercase tracking-[0.14em] text-muted">Next step</p>
                <h3 className="mt-2 font-heading text-2xl tracking-[-0.03em] text-text">{t.getPrice}</h3>
                <p className="mt-3 text-sm leading-6 text-secondary">Continue to the existing secure flow. Routes and business logic are unchanged.</p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link href="/auth" className={buttonVariants()}>
                    {t.footerCta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted">
                    <Globe2 className="h-3.5 w-3.5" />
                    EN / ES / PL / RO
                  </div>
                </div>
              </Card>
            </div>
          </Container>
        </footer>
      </main>
    </div>
  );
}
