import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FinTax | Terms",
  description: "FinTax terms placeholder for pre-launch review.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="surface-panel rounded-[var(--radius-xl)] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.14em] text-copper">Legal</p>
        <h1 className="mt-3 font-heading text-3xl tracking-[-0.03em] text-text sm:text-4xl">Terms of Service</h1>
        <p className="mt-4 text-sm leading-7 text-secondary">
          This pre-launch terms page provides a route-safe placeholder for legal review and content integration.
          Commercial terms, service scope and filing limitations will be finalized before production deployment.
        </p>
        <ul className="mt-6 grid gap-3 text-sm text-secondary">
          <li className="rounded-xl border border-border/35 bg-surface2/25 px-4 py-3">Scope is defined per selected service and confirmed before work starts.</li>
          <li className="rounded-xl border border-border/35 bg-surface2/25 px-4 py-3">Payments are processed through Stripe and recorded against a specific case.</li>
          <li className="rounded-xl border border-border/35 bg-surface2/25 px-4 py-3">Case status updates and document requests are surfaced in the authenticated dashboard.</li>
        </ul>
      </div>
    </main>
  );
}

