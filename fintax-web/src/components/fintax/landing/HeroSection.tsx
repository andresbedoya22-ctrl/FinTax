import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/fintax/Badge";
import { Button } from "@/components/fintax/Button";
import { Container } from "@/components/fintax/Container";
import { Section } from "@/components/fintax/Section";

const trustBadges = [
  "Fixed pricing",
  "Case tracking dashboard",
  "Multilingual support",
  "GDPR-ready",
];

export function HeroSection() {
  return (
    <Section id="hero" className="hero-glow">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-teal">
              FinTax for internationals in NL
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-text md:text-5xl">
              Dutch taxes &amp; benefits explained in your language.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-secondary">
              File your tax return (P/M/C), manage ZZP + VAT, apply for toeslagen, and understand
              government letters. Automation + human review. Fixed pricing.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="#pricing">Start free precheck</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="#services">Explore services</Link>
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
              <Image
                src="/visuals/hero-dashboard.png"
                alt="FinTax dashboard with client cases and tax filing status"
                width={1200}
                height={860}
                className="h-auto w-full rounded-[18px] border border-border/50 object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
