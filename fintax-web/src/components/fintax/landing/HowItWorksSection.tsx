import { CheckCheck, FileSearch, Languages, Send } from "lucide-react";

import { Card, CardBody } from "@/components/fintax/Card";
import { Container } from "@/components/fintax/Container";
import { Section } from "@/components/fintax/Section";

const steps = [
  {
    title: "Free precheck",
    copy: "Share your case type and we confirm scope, timeline and fixed pricing.",
    icon: FileSearch,
  },
  {
    title: "Document intake",
    copy: "Upload documents in your dashboard and track missing items in real time.",
    icon: Send,
  },
  {
    title: "Multilingual review",
    copy: "Automation prepares drafts, then a tax specialist verifies everything.",
    icon: Languages,
  },
  {
    title: "File & follow-up",
    copy: "Submission support, status monitoring and response handling if needed.",
    icon: CheckCheck,
  },
];

export function HowItWorksSection() {
  return (
    <Section id="how-it-works">
      <Container>
        <p className="text-sm uppercase tracking-[0.16em] text-teal">How it works</p>
        <h2 className="mt-2 text-3xl font-semibold text-text">Simple 4-step workflow</h2>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={step.title} className="relative overflow-hidden">
                <CardBody>
                  <span className="mb-4 inline-flex size-10 items-center justify-center rounded-full border border-border/70 bg-surface2 text-sm font-semibold text-text">
                    {index + 1}
                  </span>
                  <div className="mb-3 inline-flex size-10 items-center justify-center rounded-md bg-surface2 text-teal">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-medium text-text">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-secondary">{step.copy}</p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
