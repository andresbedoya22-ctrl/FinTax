import { Quote } from "lucide-react";

import { Card, CardBody } from "@/components/fintax/Card";
import { Container } from "@/components/fintax/Container";
import { Section } from "@/components/fintax/Section";

const testimonials = [
  {
    quote: "They translated every Belastingdienst letter and I finally understood what to do.",
    author: "Elena P.",
    role: "Employee, Rotterdam",
  },
  {
    quote: "M-form filing felt impossible before. FinTax handled it from intake to submission.",
    author: "Andrei M.",
    role: "Relocated professional",
  },
  {
    quote: "As a ZZP, quarterly VAT and annual return are now predictable and fast.",
    author: "Diego R.",
    role: "Freelance designer",
  },
  {
    quote: "The fixed pricing and dashboard updates removed all uncertainty for my family.",
    author: "Marta K.",
    role: "Dual-income household",
  },
  {
    quote: "Their review found deductions I missed for two years. Great process and support.",
    author: "Luis T.",
    role: "Engineer, Eindhoven",
  },
  {
    quote: "The team answered in my language and tracked every step clearly in one place.",
    author: "Ioana V.",
    role: "Startup employee",
  },
];

export function TestimonialsSection() {
  return (
    <Section id="testimonials">
      <Container>
        <p className="text-sm uppercase tracking-[0.16em] text-teal">Testimonials</p>
        <h2 className="mt-2 text-3xl font-semibold text-text">Trusted by people filing in Dutch systems</h2>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((item) => (
            <Card key={item.author}>
              <CardBody>
                <Quote className="mb-4 size-5 text-teal" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-secondary">&ldquo;{item.quote}&rdquo;</p>
                <div className="mt-5">
                  <p className="text-sm font-medium text-text">{item.author}</p>
                  <p className="text-xs text-muted">{item.role}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
