## Landing
### Current state
- Public landing is implemented in [`src/components/fintax/landing/PremiumLandingPage.tsx`](/C:/FinTax/src/components/fintax/landing/PremiumLandingPage.tsx) with localized content from [`src/components/fintax/landing/content.ts`](/C:/FinTax/src/components/fintax/landing/content.ts).
- Metadata, sitemap, alternates and JSON-LD exist through [`src/lib/seo.ts`](/C:/FinTax/src/lib/seo.ts), [`src/app/sitemap.ts`](/C:/FinTax/src/app/sitemap.ts) and [`src/components/fintax/landing/StructuredData.tsx`](/C:/FinTax/src/components/fintax/landing/StructuredData.tsx).
### Problems found
- Spanish, Polish and Romanian public copy still contains ASCII-degraded wording in several places instead of proper accents.
- CTA architecture is biased toward tax return intake; benefits entry exists but is secondary across the page.
- The landing explains intake/review/tracking well, but pricing and disclaimers remain high-level and do not clearly distinguish estimation, filing preparation and manual review boundaries.
### Risks
- P2 trust and conversion friction for Spanish users.
- P2 SEO quality drift because localized keywords/descriptions are generic and not service-specific enough.
### Required changes
- Normalize all locale copy to proper encoding and tighten service-specific statements.
- Make benefits and tax return entry points equally explicit where appropriate.
- Expand pricing/disclaimer clarity without adding unverifiable claims.
### Priority
- P2
### Suggested PR
- PR B for landing copy hardening and SEO specificity.

## Login/Auth
### Current state
- Auth UI is implemented in [`src/components/fintax/auth/AuthScreen.tsx`](/C:/FinTax/src/components/fintax/auth/AuthScreen.tsx).
- Supabase callback and redirect handling exist in [`src/app/[locale]/auth/callback/route.ts`](/C:/FinTax/src/app/[locale]/auth/callback/route.ts).
- Middleware protects authenticated routes and enforces admin MFA in [`middleware.ts`](/C:/FinTax/middleware.ts).
### Problems found
- Auth callback still reads env directly instead of the new central env contract.
- Intent preservation relies on session storage and query params; this works conceptually but needs explicit regression coverage for benefits snapshots after auth redirect.
- MFA enrollment UX exists, but it depends on Supabase project capability; this is not a broken promise, but it is only partially test-covered.
### Risks
- P1 auth regression risk if redirect flows change without tests.
- P2 inconsistent runtime behavior from split env handling.
### Required changes
- Move callback env usage onto `src/lib/env.ts`.
- Add regression coverage for `intent=benefits` and `next=` restoration.
- Keep DigiD language strictly future-facing.
### Priority
- P1
### Suggested PR
- PR G for production auth hardening and redirect regression tests.

## Subsidios/Benefits
### Current state
- Wizard is implemented in [`src/components/fintax/flows/BenefitsFlow.tsx`](/C:/FinTax/src/components/fintax/flows/BenefitsFlow.tsx).
- Reusable option card now exists in [`src/components/fintax/flows/benefits/BenefitsOptionCard.tsx`](/C:/FinTax/src/components/fintax/flows/benefits/BenefitsOptionCard.tsx).
- Estimation and post-payment views exist in [`src/components/fintax/flows/benefits/BenefitsResults.tsx`](/C:/FinTax/src/components/fintax/flows/benefits/BenefitsResults.tsx).
### Problems found
- The blocking selection bug came from interactive cards not being consistently wired as real button controls across the flow.
- The wizard still has high cognitive load: 12 visible steps, many boolean cards, and heavy operational wording early in the flow.
- Locale text was partially mojibake in benefits messages; current fixes improve `/es/benefits` but other locales still need full review.
### Risks
- P0 if selection regresses again because benefits entry is blocked.
- P2 abandonment from excessive step density and technical wording.
- P1 sensitive wizard snapshots are persisted locally and later copied into case data; field minimization still deserves review.
### Required changes
- Keep `BenefitsOptionCard` as the only card interaction primitive for boolean/selectable steps.
- Preserve functional tests for click, keyboard, deselect, next-blocking and next/back persistence.
- Continue reducing step density and simplify copy in a follow-up PR rather than re-expanding the current PR.
### Priority
- P0 for selection, P2 for wizard UX
### Suggested PR
- PR A for option-card fix and test coverage, PR B for wizard simplification.

## Declaración de renta/Tax return
### Current state
- The route currently renders [`src/components/fintax/flows/TaxReturnFlow.tsx`](/C:/FinTax/src/components/fintax/flows/TaxReturnFlow.tsx), which immediately delegates to [`src/components/fintax/flows/tax-return/TaxReturnDocumentWorkspace.tsx`](/C:/FinTax/src/components/fintax/flows/tax-return/TaxReturnDocumentWorkspace.tsx).
- The product already has intake persistence, requirements generation and document workflow foundations.
### Problems found
- This is not yet a full professional tax interview. It is a compact intake plus document workspace.
- Important domains are missing or shallow: partner detail, migration edge cases, Box 3 valuation depth, deductions breadth, dynamic missing-info review and authorization preparation.
- The route naming is generic (`/api/cases/draft`, `/api/cases/[id]/intake`) rather than explicit tax-return endpoints.
### Risks
- P1 product-market mismatch if marketed as a complete filing workflow today.
- P1 operational risk because intake completeness is below manual filing standards for many real cases.
### Required changes
- Treat current flow as an intake/workspace, not as a finished aangifte engine.
- Build a fuller interview + dynamic document requirement engine in a dedicated redesign PR.
### Priority
- P1
### Suggested PR
- PR C

## Dashboard
### Current state
- Dashboard overview is implemented in [`src/components/fintax/dashboard/DashboardOverview.tsx`](/C:/FinTax/src/components/fintax/dashboard/DashboardOverview.tsx).
- The current local PR already moves the page toward an action center and away from decorative KPIs.
### Problems found
- The previous version depended on fallback tax metrics; this was misleading.
- The page still depends on first-case assumptions and lacks richer case prioritization if multiple active matters exist.
- Visual density improved, but right-column utility/action hierarchy still needs a dedicated pass.
### Risks
- P1 if fake/fallback KPI data returns to the UI.
- P2 if users cannot identify the single next operational step quickly.
### Required changes
- Keep fallback tax-summary KPIs hidden unless real source confidence is high.
- Introduce stronger active-case prioritization and empty-state logic.
### Priority
- P1
### Suggested PR
- PR B

## Success/checkout
### Current state
- Stripe checkout route and webhook are implemented in [`src/app/api/stripe/checkout/route.ts`](/C:/FinTax/src/app/api/stripe/checkout/route.ts) and [`src/app/api/stripe/webhook/route.ts`](/C:/FinTax/src/app/api/stripe/webhook/route.ts).
### Problems found
- Checkout still falls back to a mock URL in non-production when pricing or Stripe config is missing.
- Pricing currently comes from Supabase `service_pricing`, not Stripe price IDs.
### Risks
- P1 environment drift between local/staging and production payment behavior.
### Required changes
- Keep non-production mocks explicit and documented.
- Decide on one pricing source of truth: Supabase table or Stripe price IDs.
### Priority
- P1
### Suggested PR
- PR G

## Documentos/upload
### Current state
- Upload-session creation, finalize flow and requirement-bound documents exist under [`src/app/api/cases/[id]/documents/*`](/C:/FinTax/src/app/api/cases/%5Bid%5D/documents).
### Problems found
- Upload workflow is more mature for tax-return docflow than for benefits post-payment document collection.
- Benefits flow shows document checklist after payment, but the end-to-end linkage remains uneven compared with tax return.
### Risks
- P1 case handling inconsistency across product lines.
### Required changes
- Unify benefits document upload and requirement generation onto the same operational backend model where possible.
### Priority
- P1
### Suggested PR
- PR D

## Admin/review
### Current state
- Admin case routes exist under [`src/app/api/admin/cases`](/C:/FinTax/src/app/api/admin/cases).
### Problems found
- Admin surface exists at API level, but the review workspace is still not a complete operational console.
### Risks
- P1 internal ops bottleneck when real case volume increases.
### Required changes
- Build a dedicated admin review workspace with assignment, blocking issues and checklist triage.
### Priority
- P1
### Suggested PR
- PR E

## Backend/API
### Current state
- Core case, notifications, benefits draft, Stripe and docflow endpoints exist.
### Problems found
- There is no explicit `/api/tax-return/draft` or `/api/tax-return/submit`; current product uses generic `/api/cases/draft` and `/api/cases/[id]/intake`.
- Env access is still split across multiple files and only partially centralized.
### Risks
- P1 integration ambiguity for future clients and ops.
### Required changes
- Keep the current generic routes stable for this PR, but document the missing explicit tax-return contracts and consolidate env usage further.
### Priority
- P1
### Suggested PR
- PR A for docs/env, PR G for broader server hardening.

## Supabase schema/RLS/storage
### Current state
- Migrations exist through [`supabase/migrations/008_tax_return_document_flow_backend.sql`](/C:/FinTax/supabase/migrations/008_tax_return_document_flow_backend.sql).
### Problems found
- Schema appears to support document flow well, but product-level benefits and tax-return parity is not complete.
- Storage hardening and replacement flows exist, but need staging/prod verification rather than just code inspection.
### Risks
- P1 if storage policies differ from assumptions in production.
### Required changes
- Validate storage bucket policies, signed upload scope and replacement-document lifecycle in staging.
### Priority
- P1
### Suggested PR
- PR D and PR G

## Stripe/payments
### Current state
- Webhook idempotency and event locking are implemented.
### Problems found
- The webhook writes `cases.status = "paid"` directly; downstream workflow assumptions around that status should remain aligned with case steppers and dashboard logic.
### Risks
- P1 if status vocabulary diverges across frontend/backend.
### Required changes
- Keep status flow mapping audited whenever payment transitions are changed.
### Priority
- P1
### Suggested PR
- PR G

## Emails/notifications
### Current state
- Resend integration and notification route exist.
### Problems found
- Email configuration is optional at runtime and quietly becomes a no-op when missing.
### Risks
- P1 silent operational failure in production if email is assumed but not configured.
### Required changes
- Add production monitoring/alerts around missing email configuration and send failures.
### Priority
- P1
### Suggested PR
- PR F

## Env vars/configuración
### Current state
- `.env.example` and `.env.local.example` now exist with explicit placeholders.
- Central env contract now exists in [`src/lib/env.ts`](/C:/FinTax/src/lib/env.ts).
### Problems found
- Not all env consumers are migrated yet.
### Risks
- P0/P1 production instability if critical secrets are missing or interpreted inconsistently.
### Required changes
- Finish migrating direct `process.env` reads.
- Keep public and server env surfaces separate.
### Priority
- P0 for contract existence, P1 for full adoption
### Suggested PR
- PR A and PR G

## Tests/QA
### Current state
- UI, domain, SEO and selected API tests exist.
### Problems found
- There was no sufficiently strong regression coverage for the Subsidios option-card interaction before this PR.
- Visual QA still depends on manual review for `/es/benefits` and `/es/dashboard`.
### Risks
- P0 regression if manual QA is skipped before merge.
### Required changes
- Keep PR open until manual visual QA is completed.
### Priority
- P0
### Suggested PR
- PR A

## Seguridad/privacidad/GDPR
### Current state
- Middleware origin policy, DSAR routes and BSN encryption exist.
### Problems found
- Sensitive intake and wizard snapshots still deserve a field-by-field retention review.
- Env hardening was incomplete before this PR.
### Risks
- P1 privacy scope creep in `wizard_data` and browser-stored drafts.
### Required changes
- Audit stored `wizard_data` contents per flow and minimize wherever possible.
- Validate retention and operational access patterns in staging/prod.
### Priority
- P1
### Suggested PR
- PR G
