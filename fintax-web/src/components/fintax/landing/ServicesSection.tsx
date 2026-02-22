import {
  BadgePercent,
  Calculator,
  FileText,
  HandCoins,
  Landmark,
  MailOpen,
  Receipt,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/fintax/Button";
import { Card, CardBody, CardHeader } from "@/components/fintax/Card";
import { Container } from "@/components/fintax/Container";
import { Section } from "@/components/fintax/Section";

const services = [
  { title: "Income Tax Return (P-form)", icon: FileText, copy: "Employees and residents filing annual returns." },
  { title: "M-form Migration Tax", icon: UserRoundCheck, copy: "Arrival/departure year support with full checks." },
  { title: "C-form Non-resident", icon: Landmark, copy: "For non-residents with Dutch income sources." },
  { title: "ZZP + VAT Setup", icon: Receipt, copy: "Registration, quarterly VAT and deductible guidance." },
  { title: "Toeslagen Applications", icon: HandCoins, copy: "Healthcare, rent and childcare benefit applications." },
  { title: "Government Letter Review", icon: MailOpen, copy: "Translate and explain Belastingdienst letters." },
  { title: "Tax Optimization Review", icon: Calculator, copy: "Missed deductions and filing corrections review." },
  { title: "Benefits Eligibility Check", icon: BadgePercent, copy: "Quick scan of possible allowances and credits." },
  { title: "Compliance Health Check", icon: ShieldCheck, copy: "Deadlines, risks and action plan in one dashboard." },
];

export function ServicesSection() {
  return (
    <Section id="services">
      <Container>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-teal">Services</p>
            <h2 className="mt-2 text-3xl font-semibold text-text">What we handle end-to-end</h2>
          </div>
          <Button asChild variant="secondary" size="sm" className="hidden md:inline-flex">
            <Link href="#pricing">Precheck</Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card key={service.title} className="h-full">
                <CardHeader className="flex items-center gap-3 border-b-0 pb-1">
                  <span className="inline-flex size-10 items-center justify-center rounded-md bg-surface2 text-teal">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-base font-medium text-text">{service.title}</h3>
                </CardHeader>
                <CardBody className="pt-2">
                  <p className="text-sm leading-relaxed text-secondary">{service.copy}</p>
                  <Button asChild size="sm" className="mt-5">
                    <Link href="#pricing">Precheck</Link>
                  </Button>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
