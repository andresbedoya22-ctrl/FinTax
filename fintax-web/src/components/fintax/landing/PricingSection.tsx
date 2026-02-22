import { Check } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/fintax/Badge";
import { Button } from "@/components/fintax/Button";
import { Card, CardBody, CardHeader } from "@/components/fintax/Card";
import { Container } from "@/components/fintax/Container";
import { Section } from "@/components/fintax/Section";

const plans = [
  {
    name: "Basic",
    price: "€149",
    summary: "For straightforward P-form returns",
    features: ["Annual tax return filing", "Document checklist", "Email support"],
  },
  {
    name: "Standard",
    price: "€299",
    summary: "Most common cases incl. migration and benefits",
    features: ["P/M/C filing support", "Toeslagen review", "Case dashboard", "Priority review"],
    featured: true,
  },
  {
    name: "Complex",
    price: "Custom",
    summary: "ZZP, multi-income and advanced scenarios",
    features: ["ZZP + VAT workflows", "Advanced letter handling", "Custom timelines"],
  },
];

const addOns = [
  "Urgent 48h turnaround",
  "Quarterly VAT filing",
  "Historical correction filing",
  "Extra translated letter review",
];

export function PricingSection() {
  return (
    <Section id="pricing">
      <Container>
        <p className="text-sm uppercase tracking-[0.16em] text-teal">Pricing</p>
        <h2 className="mt-2 text-3xl font-semibold text-text">Fixed plans + flexible add-ons</h2>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.featured ? "relative border-green/60 bg-surface shadow-glass" : ""}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-text">{plan.name}</h3>
                    <p className="mt-1 text-sm text-secondary">{plan.summary}</p>
                  </div>
                  {plan.featured ? <Badge variant="success">Featured</Badge> : null}
                </div>
                <p className="mt-4 text-3xl font-semibold text-text">{plan.price}</p>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-secondary">
                      <Check className="mt-0.5 size-4 shrink-0 text-green" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-6 w-full">
                  <Link href="#hero">Start free precheck</Link>
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card className="mt-6">
          <CardHeader>
            <h3 className="text-lg font-semibold text-text">Add-ons</h3>
          </CardHeader>
          <CardBody>
            <ul className="grid gap-2 sm:grid-cols-2">
              {addOns.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-secondary">
                  <Check className="size-4 text-teal" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </Container>
    </Section>
  );
}
