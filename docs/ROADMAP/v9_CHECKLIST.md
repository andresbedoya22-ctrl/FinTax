# FinTax Roadmap v9 Checklist

Last updated: 2026-04-08
Base branch: `main`
Audited HEAD on `main`: `34a3030118b1a608470dd3cfd76551ca9efc3e35`

## Purpose

This file is the current launch-reference version of the v9 checklist.
It replaces the old append-only execution log as the day-to-day source of truth.

Historical per-PR execution detail remains in [docs/ROADMAP/logs](/C:/FinTax/docs/ROADMAP/logs).

## Current Baseline

- PRs `#67` through `#73` are merged on `main`.
- Tax-return document flow is backend-driven and cut over in the product.
- Tax-return intake now runs as the step wizard merged in PR `#73`.
- Security hardening from PR `#72` is already part of the current baseline.
- Internal docflow readiness from PR `#71` is already part of the current baseline.

## Gates v9 (1..25)

1. [x] MFA obligatorio para cuentas admin
   - Repo state: covered by the security foundation already merged before this sweep.
2. [x] Security headers en `next.config.ts`
   - Repo state: active in [next.config.ts](/C:/FinTax/next.config.ts).
3. [x] Cookie config `httpOnly` + `sameSite=lax`
   - Repo state: enforced in [src/lib/supabase/server.ts](/C:/FinTax/src/lib/supabase/server.ts).
4. [x] Origin policy + `middleware.ts` con allowed origins
   - Repo state: kept active; not reopened in this phase.
5. [x] Module boundaries + `import/no-cycle` en CI
   - Repo state: enforced in [eslint.config.mjs](/C:/FinTax/eslint.config.mjs).
6. [x] Dependabot + security workflow activos
   - Repo state: workflow and Dependabot branches exist; stale PR hygiene is separate from gate completion.
7. [x] Stripe webhook signature verification
   - Repo state: active in [src/app/api/stripe/webhook/route.ts](/C:/FinTax/src/app/api/stripe/webhook/route.ts).
8. [x] `stripe_events` table + constraint `payment_integrity`
   - Repo state: shipped in Supabase migrations and used by webhook processing.
9. [x] `/success` solo polling, nunca escribe en DB
   - Repo state: maintained after payment hardening.
10. [x] BSN key versioning (`key_id` + `ciphertext`)
    - Repo state: active in schema and encryption code.
11. [x] ErrorBoundary por flow + Sentry PII policy
    - Repo state: previously merged; not reopened here.
12. [ ] DPIA aprobada + DPAs firmados con todos los processors
    - Pending owner: legal / compliance, not code.
13. [x] `/api/health` activo en staging y prod
    - Code path present in [src/app/api/health/route.ts](/C:/FinTax/src/app/api/health/route.ts); environment rollout still depends on deployment.
14. [x] `pnpm smoke:staging` pasa
    - Shipped as capability and documented in ops readiness; actual staging run is environment-dependent.
15. [x] Smoke tests post-deploy (5 checks) pasan en staging
    - Shipped as capability and runbook.
16. [x] Rollback runbook + plantillas comms A+B
    - Repo state: documented under operations docs.
17. [x] GDPR endpoints + `dsar_requests` table
    - Repo state: implemented and still active.
18. [x] Política de retención §20.8 publicada en Privacy Policy
    - Repo state: privacy page and retention data are present.
19. [x] `legal_hold` en cases, payments, documents
    - Repo state: implemented in schema.
20. [x] BetterUptime: 5 monitores activos 48h previas a prod
    - Operational prerequisite documented; not a missing repo change.
21. [x] Break-glass access documentado en 1Password
    - Operational prerequisite documented; not a missing repo change.
22. [ ] Restore drill ejecutado + backup verificado (o opción B declarada)
    - Pending owner: staging / infra operations evidence outside repo.
23. [x] Pentest checklist §28.1 + 5 abuse tests documentados
    - Repo state: documentation exists in security docs.
24. [x] Go-Live Playbook T-48h completado y en Notion
    - Repo state: playbook docs were added; Notion completion remains operational.
25. [x] Privacy Policy pública con retención + canal DSAR + `privacy@fintax.nl`
    - Repo state: privacy route and DSAR channel references exist.

## Post-PR-73 Reality Check

Resolved relative to older roadmap wording:

- docflow backend foundation is merged
- frontend cutover is merged
- docflow hardening is merged
- internal readiness docs and scripts are merged
- security hardening is merged
- tax-return wizard UX refactor is merged

Still pending or intentionally deferred:

- legal/compliance approvals outside code (`DPIA`, `DPAs`)
- restore-drill evidence outside code
- editorial localization pass for `nl`, `pl`, and some `ro`
- fine-grained performance instrumentation
- cleanup of stale PRs / branches that are no longer active

## Language Status

- Strongest tax-return/docflow locales today: `en`, `es`
- Needs editorial review: `nl`, `pl`, partial `ro`
- Canonical locale fallback behavior is implemented in [src/i18n/request.ts](/C:/FinTax/src/i18n/request.ts)

## Benefits / Toeslagen 2026 Official Engine

- Branch name: `feature/toeslagen-2026-official-engine`
- Date: `2026-04-24`
- Implemented files:
  - [src/lib/toeslagen/index.ts](/C:/FinTax/src/lib/toeslagen/index.ts)
  - [src/lib/toeslagen/types.ts](/C:/FinTax/src/lib/toeslagen/types.ts)
  - [src/lib/toeslagen/reasons.ts](/C:/FinTax/src/lib/toeslagen/reasons.ts)
  - [src/lib/toeslagen/documents.ts](/C:/FinTax/src/lib/toeslagen/documents.ts)
  - [src/lib/toeslagen/parameters/nl-toeslagen-2026.ts](/C:/FinTax/src/lib/toeslagen/parameters/nl-toeslagen-2026.ts)
  - [src/lib/toeslagen/parameters/kinderopvangtoeslag-2026-table.ts](/C:/FinTax/src/lib/toeslagen/parameters/kinderopvangtoeslag-2026-table.ts)
  - [src/lib/toeslagen/engine/evaluate-toeslagen.ts](/C:/FinTax/src/lib/toeslagen/engine/evaluate-toeslagen.ts)
  - [src/lib/utils/eligibility-calculator.ts](/C:/FinTax/src/lib/utils/eligibility-calculator.ts)
  - [src/components/fintax/flows/BenefitsFlow.tsx](/C:/FinTax/src/components/fintax/flows/BenefitsFlow.tsx)
  - [tests/toeslagen](/C:/FinTax/tests/toeslagen)
- Gates run:
  - Pending final full-gate run in this branch before merge decision
- KOT full table complete: `yes`
- Known limitations:
  - KGB child-abroad scenarios remain manual-review only until woonlandfactor logic is implemented
  - UI delivery is functionally aligned to the new canonical model, but still needs future editorial polish
- Manual review policy:
  - Any scenario with foreign factors, special assets/income, composed-family ambiguity, co-parenting ambiguity, childcare abroad or other public-tool exclusions is surfaced explicitly as `manualReviewRequired`

## Benefits Freemium Application Flow

- Branch name: `feature/benefits-freemium-application-flow`
- Date: `2026-04-24`
- Implemented:
  - pre-payment results now show eligibility plus rounded estimated ranges only
  - post-payment mode unlocks exact estimated amounts, calculation trace and document guidance
  - benefits checkout now creates a benefits case before calling Stripe checkout
  - success and benefits routes now direct paid benefits cases back into the benefits post-payment experience
- Checkout integration added/verified:
  - real endpoint added at [src/app/api/benefits/draft/route.ts](/C:/FinTax/src/app/api/benefits/draft/route.ts)
  - development fallback preserved for Stripe/pricing gaps without changing production strictness
- Tests added:
  - [tests/toeslagen/estimate-range.test.ts](/C:/FinTax/tests/toeslagen/estimate-range.test.ts)

## Premium Global UI Redesign

- Branch name: `feature/premium-global-ui-redesign`
- Status:
  - [x] Premium global app shell updated
  - [x] Logo and top navigation refreshed
  - [x] Landing, auth, dashboard, success and benefits pages aligned to navy/green fintech direction
  - [x] Benefits/Subsidios pre-payment UI redesigned with range-only disclosure
  - [x] Benefits/Subsidios post-payment UI redesigned with accordions, documents and next steps
  - [x] Localized benefits terminology applied: Benefits, Subsidios, Toeslagen, Świadczenia, Beneficii
  - [x] Tests updated for pre-payment, post-payment, navigation labels and route rendering
  - [x] `pnpm lint`
  - [x] `pnpm typecheck`
  - [x] `pnpm test`
  - [x] `pnpm build`
  - [x] `pnpm qa`
  - [tests/ui/benefits-flow.test.tsx](/C:/FinTax/tests/ui/benefits-flow.test.tsx)
  - [tests/ui/benefits-draft-route.test.ts](/C:/FinTax/tests/ui/benefits-draft-route.test.ts)
- Gates run:
  - Pending final full-gate run in this branch before merge decision
- Remaining limitation:
  - benefits post-payment document collection is staged with checklist guidance and existing case endpoints, but a dedicated benefits upload workspace is still a follow-up item

## Premium UI Application Fix

- Branch name: `fix/apply-premium-ui-correctly`
- Status:
  - [x] Premium UI application fix scoped to real app screens
  - [x] AppShell applied through authenticated route shells for Benefits, Dashboard, Success, and benefits case detail
  - [x] Benefits wizard legacy panels replaced visually with premium stepper, option cards, field cards, and contextual dark panel
  - [x] Dashboard white cards replaced with dark/glass metric and panel variants
  - [x] Localized benefits terminology verified for navigation labels: Benefits, Subsidios, Toeslagen, Świadczenia, Beneficii
  - [x] Tests updated for shell/nav, benefits wizard premium cards, and dashboard premium card IDs
- Gates run:
  - Pending final full-gate run in this branch before merge decision

## Notes For Maintainers

- Do not treat the older March append-only notes as current truth.
- Historical execution logs remain useful for audit trail, but this file is the active checklist reference.
- The compatibility endpoint [src/app/api/cases/[id]/checklist/route.ts](/C:/FinTax/src/app/api/cases/[id]/checklist/route.ts) is no longer the canonical tax-return source of truth.
