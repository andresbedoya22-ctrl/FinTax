# Staging Release Gate Audit

Date: 2026-04-08

Scope: real preproduction validation status for the tax-return docflow after PRs #67 through #74.

## Evidence Collected

- `git rev-parse HEAD` and `git rev-parse origin/main` both resolved to `9449cecd7fbf90a584aa7ee69c94c3d51c91985b`.
- `gh pr view 71` confirms the previous readiness pass was blocked by DNS resolution for the configured Supabase host in `.env.local`.
- `.env.local` currently points `NEXT_PUBLIC_SUPABASE_URL` at `https://hwotylvssgefukmbnxhk.supabase.co`.
- `Resolve-DnsName hwotylvssgefukmbnxhk.supabase.co` returns `DNS_ERROR_RCODE_NAME_ERROR`.
- `pnpm docflow:bootstrap` fails with `getaddrinfo ENOTFOUND hwotylvssgefukmbnxhk.supabase.co`.
- `pnpm smoke:staging` initially fails with `Missing STAGING_URL`, which shows the repo did not yet template the staging smoke inputs.
- `gh api repos/andresbedoya22-ctrl/FinTax/actions/secrets` returns zero repository Actions secrets.
- `gh api repos/andresbedoya22-ctrl/FinTax/actions/variables` returns zero repository Actions variables.

## Real Blockers

1. The configured Supabase project host does not resolve in DNS, so bootstrap, backfill, and E2E cannot reach the database.
2. No staging smoke variables are defined in the repo templates, and no repository-level Actions variables/secrets are present to supply them.
3. No dedicated staging QA profile IDs are available in-repo for the scripted E2E harness.

## Functional Risk vs Environment Block

Environment block:

- unreachable Supabase host,
- missing `STAGING_URL`,
- missing staging parity variables,
- missing QA profile identifiers.

Functional risk still unproven because environment blocked validation:

- real upload/finalize/review cycles against staging storage,
- progress and dashboard consistency against staging data,
- controlled backfill eligibility on current staging cases.

Non-blocking improvements applied in this phase:

- operations scripts can now use dedicated `DOCFLOW_SUPABASE_*` overrides instead of reusing the app runtime URL,
- `pnpm smoke:staging` now reads `.env.local` / `.env`,
- env templates now declare the staging and docflow-specific variables required by the runbook.

## Required Next Inputs

- a real staging Supabase project ref that resolves in DNS,
- matching service-role and anon keys for that project,
- the deployed staging app origin for `STAGING_URL`,
- one QA client `profiles.id`,
- one QA admin `profiles.id`.

Without those inputs, the repository is better prepared but staging readiness remains unvalidated.
