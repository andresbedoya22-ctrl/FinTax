import { ChevronDown } from "lucide-react";

import { Card, CardBody } from "@/components/fintax/Card";
import { Container } from "@/components/fintax/Container";
import { Section } from "@/components/fintax/Section";

const faqs = [
  {
    q: "Do you only support expats?",
    a: "We support expats, international employees, students, families and ZZP clients living or earning in the Netherlands.",
  },
  {
    q: "Which forms do you handle?",
    a: "We handle P-form, M-form and C-form workflows, plus related letters and follow-up actions.",
  },
  {
    q: "Can I get help with toeslagen?",
    a: "Yes, we review eligibility and help with aanvragen for zorgtoeslag, huurtoeslag and other relevant allowances.",
  },
  {
    q: "How does fixed pricing work?",
    a: "After free precheck, you get a fixed quote before work starts. Scope changes are flagged before any extra cost.",
  },
  {
    q: "What languages do you support?",
    a: "We support EN, NL, ES, RO and PL for communication and document explanation.",
  },
  {
    q: "How long does filing take?",
    a: "Typical cases are completed in days, complex cases in weeks. You get timeline estimates in your dashboard.",
  },
  {
    q: "Do you work with ZZP + VAT?",
    a: "Yes. We support quarterly VAT workflows, annual reporting and deductible reviews for freelancers.",
  },
  {
    q: "Can you review old tax years?",
    a: "Yes, we can assess prior filings and help submit corrections where applicable.",
  },
  {
    q: "How secure is my data?",
    a: "We use GDPR-ready practices with least-access controls, secure storage and audit-friendly process tracking.",
  },
  {
    q: "What happens after submission?",
    a: "We monitor updates, help interpret responses and can support next actions if Dutch authorities request follow-up.",
  },
];

export function FaqSection() {
  return (
    <Section id="faq">
      <Container>
        <p className="text-sm uppercase tracking-[0.16em] text-teal">FAQ</p>
        <h2 className="mt-2 text-3xl font-semibold text-text">Common questions</h2>

        <div className="mt-8 grid gap-3">
          {faqs.map((item) => (
            <Card key={item.q}>
              <CardBody className="py-0">
                <details className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left text-base font-medium text-text [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <ChevronDown
                      className="size-5 text-muted transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-secondary">{item.a}</p>
                </details>
              </CardBody>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
