# Final Cleanup Status

Last updated: 2026-04-08

## Scope

This note records the repo state after the post-hardening cleanup sweep that follows PRs #67 through #73.

It does not redefine the shipped architecture.
It clarifies what is technically ready, what is operationally ready, and what still needs follow-up.

## Technically Ready For Production

- Next.js 16 App Router, i18n routing, auth gating, and middleware protections remain in place.
- Tax-return document flow is backend-driven for intake snapshots, requirement generation, uploads, review state, and case progress.
- Tax-return intake UX is the step wizard merged in PR #73, not the pre-docflow compatibility surfaces.
- Stripe checkout and webhook integrity are implemented with signature verification, `stripe_events` idempotency tracking, and payment integrity constraints/triggers.
- DSAR request and export flows are implemented with authenticated download delivery.
- Admin APIs remain behind explicit admin auth and write to `admin_activity_log`.

## Ready For Internal Use

- `pnpm docflow:bootstrap` seeds requirement metadata and rule sets.
- `pnpm docflow:backfill` supports controlled migration only for docflow-compatible `wizard_data`.
- `pnpm docflow:e2e` provides a reproducible scripted validation harness for staging or QA operators.
- Internal readiness guidance lives in [tax-return-docflow-internal-readiness.md](/C:/FinTax/docs/operations/tax-return-docflow-internal-readiness.md).

## Remaining Follow-up

- Editorial localization review is still needed for `nl`, `pl`, and some `ro` tax-return/docflow copy because those locales still rely partly on English fallback text merged from `messages/en.json`.
- Fine-grained performance instrumentation is still missing. Perceived performance improved, but no durable metrics layer has been added.
- `MODULE_TYPELESS_PACKAGE_JSON` warnings were addressed by declaring root ESM in [package.json](/C:/FinTax/package.json). The temporary CommonJS eligibility harness now writes its own local `package.json` under `.tmp-test-build` to preserve Node compatibility.
- The compatibility endpoint [src/app/api/cases/[id]/checklist/route.ts](/C:/FinTax/src/app/api/cases/[id]/checklist/route.ts) still exists for older consumers and still falls back to `checklist_items` when a case has not been migrated to `case_requirements`.
- Historical planning docs inside [docs/tax-return-document-flow](/C:/FinTax/docs/tax-return-document-flow/README.md) remain valuable as design history, but some files describe pre-cutover intent rather than current runtime behavior.

## `createAdminClient` Audit

### Correct and necessary

- Stripe webhook handlers under [src/app/api/stripe/webhook/route.ts](/C:/FinTax/src/app/api/stripe/webhook/route.ts): require service-role writes to `stripe_events`, `payments`, and protected case fields.
- Admin case endpoints under [src/app/api/admin/cases/route.ts](/C:/FinTax/src/app/api/admin/cases/route.ts), [src/app/api/admin/cases/[id]/route.ts](/C:/FinTax/src/app/api/admin/cases/[id]/route.ts), [src/app/api/admin/cases/[id]/summary/route.ts](/C:/FinTax/src/app/api/admin/cases/[id]/summary/route.ts), [src/app/api/admin/cases/[id]/requirements/[requirementId]/route.ts](/C:/FinTax/src/app/api/admin/cases/[id]/requirements/[requirementId]/route.ts), and [src/app/api/admin/cases/[id]/documents/[documentId]/route.ts](/C:/FinTax/src/app/api/admin/cases/[id]/documents/[documentId]/route.ts): read and mutate admin-only data plus review state.
- Health check under [src/app/api/health/route.ts](/C:/FinTax/src/app/api/health/route.ts): intentionally validates service-role DB connectivity instead of user-scoped access.
- DSAR export under [src/app/api/dsar/[id]/export/route.ts](/C:/FinTax/src/app/api/dsar/[id]/export/route.ts): export bundle spans multiple protected tables and should not depend on end-user RLS breadth.

### Could migrate to authenticated client with additional RLS work

- Draft creation in [src/app/api/cases/draft/route.ts](/C:/FinTax/src/app/api/cases/draft/route.ts): `cases` and `profiles` both already have user policies, but current flow also writes encrypted BSN fields and relies on server-side control for sensitive profile updates.
- DSAR creation in [src/app/api/dsar/route.ts](/C:/FinTax/src/app/api/dsar/route.ts): the request row itself already uses the authenticated client; only profile lookup and completion write still use service role.
- User-owned docflow mutations under [src/app/api/cases/[id]/intake/route.ts](/C:/FinTax/src/app/api/cases/[id]/intake/route.ts), [src/app/api/cases/[id]/requirements/regenerate/route.ts](/C:/FinTax/src/app/api/cases/[id]/requirements/regenerate/route.ts), [src/app/api/cases/[id]/requirements/[requirementId]/note/route.ts](/C:/FinTax/src/app/api/cases/[id]/requirements/[requirementId]/note/route.ts), [src/app/api/cases/[id]/requirements/[requirementId]/not-available/route.ts](/C:/FinTax/src/app/api/cases/[id]/requirements/[requirementId]/not-available/route.ts), [src/app/api/cases/[id]/documents/upload-session/route.ts](/C:/FinTax/src/app/api/cases/[id]/documents/upload-session/route.ts), [src/app/api/cases/[id]/documents/finalize/route.ts](/C:/FinTax/src/app/api/cases/[id]/documents/finalize/route.ts), and [src/app/api/cases/[id]/documents/[documentId]/route.ts](/C:/FinTax/src/app/api/cases/[id]/documents/[documentId]/route.ts): these would need new user-scoped insert/update policies for `case_intake_snapshots`, `case_requirements`, `requirement_documents`, and `case_events`, plus careful trigger review. Not a safe cleanup-only change.

### Ambiguous or technically risky if changed now

- The current docflow service layer in [src/lib/tax-documents/service.ts](/C:/FinTax/src/lib/tax-documents/service.ts) mixes writes across `cases`, `case_intake_snapshots`, `case_requirements`, `documents`, `requirement_documents`, `document_upload_sessions`, and `case_events`. Moving individual routes off service role without redesigning that write model would create partial-RLS behavior and regressions.

## Languages

Strongest current locales for tax-return/docflow:

- `en`: primary canonical copy and fallback source in [messages/en.json](/C:/FinTax/messages/en.json)
- `es`: strongest non-English rewrite for tax-return/docflow in [messages/es.json](/C:/FinTax/messages/es.json)

Locales that still need editorial follow-up:

- `nl`: product and dashboard copy exists, but tax-return/docflow still inherits English fallback for part of the merged namespace in [messages/nl.json](/C:/FinTax/messages/nl.json)
- `pl`: same pattern as `nl`, with many benefits strings localized but tax-return/docflow still partly English in [messages/pl.json](/C:/FinTax/messages/pl.json)
- `ro`: better than `nl` and `pl` in some flows, but still contains mixed English fallback sections in [messages/ro.json](/C:/FinTax/messages/ro.json)

Primary namespaces to review later:

- `TaxReturn`
- `Dashboard`
- `Auth`
- benefits flow copy now embedded in the same locale files rather than split per feature

## Repo Hygiene Snapshot

Deleted in this sweep:

- local branches: `chore/benefits-integration-qa`, `codex/fix-security-prod-blockers`, `feat/tax-return-docflow-blueprint`, `feat/tax-return-docflow-frontend`, `fix/tax-return-docflow-hardening`
- remote branches: `chore/benefits-integration-qa`, `codex/fix-security-prod-blockers`, `feat/tax-return-docflow-blueprint`, `feat/tax-return-docflow-frontend`, `fix/tax-return-docflow-hardening`

Already gone remotely when audited:

- `chore/tax-return-docflow-readiness`
- `fix/tax-return-ux-i18n-performance`
- `feat/tax-return-docflow-backend`
- `fix/tax-return-flow-qa`

Local archival branches intentionally left untouched:

- `backup/merge-main-with-unrelated`
- `codex/dashboard-redesign-backup-20260322`
- `codex/rescue-pre-phase5-20260322`

Open PRs and long-lived branches that are not part of this sweep:

- benefits PRs `#63` through `#66`
- stale Dependabot PRs `#7`, `#8`, `#9`, `#27` through `#29`, `#48` through `#54`

Recommended criterion:

- delete merged feature branches that point to commits already reachable from `main`
- keep open feature branches that still represent unmerged scope
- close or refresh stale PRs only with explicit product or dependency-owner confirmation
