import { AuthScreen } from "@/components/fintax/auth";
import { Container } from "@/components/fintax/Container";
import { Section } from "@/components/fintax/Section";

export default function AuthPage() {
  return (
    <div className="fintax-bg texture-grid texture-noise min-h-screen">
      <Section className="py-10 sm:py-16">
        <Container className="flex min-h-[80vh] items-center justify-center">
          <AuthScreen />
        </Container>
      </Section>
    </div>
  );
}
