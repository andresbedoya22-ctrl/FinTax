import type { AppLocale } from "@/i18n/routing";
import { buildPublicMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  return buildPublicMetadata({
    locale,
    pathname: "/legal/privacy",
    title: "FinTax | Privacy Notice",
    description: "Pre-launch privacy notice for FinTax services and processing categories.",
  });
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="surface-panel rounded-[var(--radius-xl)] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.14em] text-copper">Legal</p>
        <h1 className="mt-3 font-heading text-3xl tracking-[-0.03em] text-text sm:text-4xl">Privacy Notice</h1>
        <p className="mt-4 text-sm leading-7 text-secondary">
          This pre-launch privacy page describes the intended processing categories for account access, case
          management, tax filing support, document uploads, payments and notifications. Final legal text will be
          reviewed before production release.
        </p>
        <ul className="mt-6 grid gap-3 text-sm text-secondary">
          <li className="rounded-xl border border-border/35 bg-surface2/25 px-4 py-3">Public visitors can access landing content and pricing summaries.</li>
          <li className="rounded-xl border border-border/35 bg-surface2/25 px-4 py-3">Authenticated users can access their profile, cases, documents, payments and notifications only.</li>
          <li className="rounded-xl border border-border/35 bg-surface2/25 px-4 py-3">Sensitive identifiers are encrypted server-side before database storage.</li>
        </ul>
        <h2 className="mt-8 font-heading text-xl tracking-[-0.02em] text-text">Retention Policy (MVP)</h2>
        <ul className="mt-4 grid gap-3 text-sm text-secondary">
          <li className="rounded-xl border border-border/35 bg-surface2/25 px-4 py-3">Cases and payments: retained for 2555 days unless legal hold is active.</li>
          <li className="rounded-xl border border-border/35 bg-surface2/25 px-4 py-3">Documents and notifications: retained for 365 days unless legal hold is active.</li>
          <li className="rounded-xl border border-border/35 bg-surface2/25 px-4 py-3">Purge jobs must skip rows marked with legal hold.</li>
        </ul>
        <h2 className="mt-8 font-heading text-xl tracking-[-0.02em] text-text">DSAR Channel</h2>
        <p className="mt-3 text-sm leading-7 text-secondary">
          You can submit export, rectification and deletion requests from account settings or by email at{" "}
          <a className="text-copper underline underline-offset-4" href="mailto:privacy@fintax.nl">
            privacy@fintax.nl
          </a>
          . Each request is tracked with a due date and resolution status.
        </p>
      </div>
    </main>
  );
}
