## Existing endpoints
### Current state
- Present and used:
- `/api/cases`
- `/api/cases/[id]`
- `/api/cases/draft`
- `/api/cases/[id]/intake`
- `/api/cases/[id]/requirements`
- `/api/cases/[id]/requirements/regenerate`
- `/api/cases/[id]/progress`
- `/api/cases/[id]/events`
- `/api/cases/[id]/documents`
- `/api/cases/[id]/documents/upload-session`
- `/api/cases/[id]/documents/finalize`
- `/api/cases/[id]/tax-summary`
- `/api/cases/[id]/checklist`
- `/api/benefits/draft`
- `/api/stripe/checkout`
- `/api/stripe/webhook`
- `/api/notifications`
- `/api/admin/cases/*`
### Problems found
- Endpoint naming is mixed: some are generic case routes, some are benefits-specific, and explicit tax-return routes are absent.
### Risks
- P1 API surface confusion for frontend growth and external integrations.
### Required changes
- Keep current generic case routes stable for now, but document the canonical contracts.
### Priority
- P1
### Suggested PR
- PR G

## Missing endpoints
### Current state
- The frontend tax return workspace uses generic case endpoints instead of dedicated tax-return endpoints.
### Problems found
- Missing explicit routes requested in the product brief:
- `/api/tax-return/draft`
- `/api/tax-return/submit`
- No dedicated benefits document upload route; benefits currently leans on generic case/document concepts after payment.
### Risks
- P1 ambiguous ownership and future coupling.
### Required changes
- Decide whether to keep generic `/api/cases/*` as the stable contract or add tax-return aliases.
### Priority
- P1
### Suggested PR
- PR C and PR D

## Routes that frontend calls but backend does not implement
### Current state
- Current reviewed hooks map to existing routes.
### Problems found
- No confirmed P0 broken hook-to-route mismatch was found in the reviewed flows.
- The larger issue is contract naming mismatch, not missing files, for tax return operations.
### Risks
- P1 if future code starts assuming `/api/tax-return/*` exists.
### Required changes
- Document route ownership in code or docs before more frontend expansion.
### Priority
- P1
### Suggested PR
- PR G

## Fake persistence
### Current state
- Benefits and tax-return flows both persist meaningful data server-side.
### Problems found
- Non-production payment fallback still redirects to `mockCheckout=1`.
- Some flows can return mock-like behavior when critical infrastructure clients are unavailable in development.
### Risks
- P1 parity drift between local/staging and production.
### Required changes
- Keep mocks explicitly development-only and surface them clearly in QA.
### Priority
- P1
### Suggested PR
- PR G

## Client-side DB writes that should be server-side
### Current state
- Reviewed sensitive writes are server-mediated.
### Problems found
- No reviewed direct client-side privileged DB writes were found.
### Risks
- P2 low for current surface.
### Required changes
- Preserve the current pattern: client -> authenticated route -> service/admin client.
### Priority
- P2
### Suggested PR
- Monitor in PR review

## Storage gaps
### Current state
- Tax-return document upload session + finalize flow exists.
### Problems found
- Benefits post-payment document path is less fully realized than tax-return docflow.
- Storage policy readiness was not fully validated against a live Supabase project in this audit.
### Risks
- P1 upload/backoffice inconsistency and storage-policy surprises.
### Required changes
- Validate storage buckets, replacement upload lifecycle and signed upload restrictions in staging.
### Priority
- P1
### Suggested PR
- PR D

## RLS gaps
### Current state
- Migrations indicate strong RLS intent and user-owned data design.
### Problems found
- This audit did not find a specific broken RLS statement in code, but staging verification is still mandatory because route assumptions depend heavily on RLS correctness.
### Risks
- P1 if production policies diverge from local assumptions.
### Required changes
- Perform staging verification for user case access, admin-only access and document access.
### Priority
- P1
### Suggested PR
- PR G

## Env var gaps
### Current state
- Central env contract added in [`src/lib/env.ts`](/C:/FinTax/src/lib/env.ts).
- Example env files now cover public, server, Stripe, email, encryption and operational variables.
### Problems found
- Some modules still read `process.env` directly.
- Production requirements were not centralized before this PR.
### Risks
- P0/P1 runtime failures from missing secrets or inconsistent fallback behavior.
### Required changes
- Finish migrating env consumers.
- Keep public env and server env separated.
### Priority
- P0
### Suggested PR
- PR A and PR G

## Stripe gaps
### Current state
- Checkout route uses authenticated ownership checks, rate limiting and server-side pricing lookup.
- Webhook idempotency exists.
### Problems found
- Pricing source of truth is Supabase `service_pricing`; requested `STRIPE_PRICE_*` env vars are currently future-facing only.
- Non-production mock checkout path can hide missing setup.
### Risks
- P1 operational confusion and staging false positives.
### Required changes
- Decide on database pricing vs Stripe price IDs and document it as canonical.
### Priority
- P1
### Suggested PR
- PR G

## Email notification gaps
### Current state
- Resend integration exists and payment confirmation email is triggered from webhook flow.
### Problems found
- Missing `RESEND_API_KEY` silently disables sends at runtime.
### Risks
- P1 silent failure in production ops.
### Required changes
- Add monitoring/alerting and stronger environment gating for production mail.
### Priority
- P1
### Suggested PR
- PR F and PR G

## Admin/review gaps
### Current state
- Admin APIs exist for case summaries, requirement review and document review.
### Problems found
- UI workspace is not yet a complete operational review console.
### Risks
- P1 manual operations bottleneck.
### Required changes
- Build the admin review workspace around queueing, assignment, blocking issues and notes.
### Priority
- P1
### Suggested PR
- PR E

## GDPR/security risks
### Current state
- DSAR routes, encryption and origin policy exist.
### Problems found
- Browser draft persistence and `wizard_data` contents need minimization review.
- Auth callback and some remaining modules still bypass the central env helper.
### Risks
- P1 privacy oversharing or inconsistent security posture.
### Required changes
- Review stored payload contents and retention boundaries.
- Finish env and secret handling consolidation.
### Priority
- P1
### Suggested PR
- PR G

## Required migrations
### Current state
- No new SQL migration is strictly required for the fixes in this PR.
### Problems found
- Future parity between benefits and tax-return document workflows may require schema additions rather than UI-only work.
### Risks
- P2 for this PR, P1 for future document-engine work.
### Required changes
- Defer schema changes to document/checklist and admin-workspace follow-up PRs.
### Priority
- P2 now
### Suggested PR
- PR D and PR E

## Priority plan
### Current state
- The codebase is partially production-shaped but not yet fully hardened.
### Problems found
- Critical work spans functional UX, env hardening, tax-return completeness and ops tooling.
### Risks
- P0 merge risk if functional and manual QA gates are skipped.
### Required changes
- 1. Keep this PR focused on benefits option cards, env contract and audit docs.
- 2. Rebuild dashboard around action center semantics.
- 3. Redesign tax-return flow and dynamic document requirement engine.
- 4. Finish benefits/tax-return document upload parity.
- 5. Build admin review console.
- 6. Finish notification preferences and production hardening.
### Priority
- P0 to P1
### Suggested PR
- PR A, B, C, D, E, F, G
