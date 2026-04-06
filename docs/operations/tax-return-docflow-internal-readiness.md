# Tax Return Docflow Internal Readiness

Last updated: 2026-04-06

## Scope

This guide is for internal operations and serious preproduction validation of the tax return document flow shipped through PRs #67, #68, #69, and #70 plus the readiness follow-up on `chore/tax-return-docflow-readiness`.

It does not redefine the architecture.
It turns the merged docflow into an operational workflow with:

- versioned bootstrap for requirement metadata,
- controlled backfill eligibility checks,
- reproducible scripted E2E validation,
- and a release checklist for internal usage.

## Current Functional Baseline

Production-functional already present in `main`:

- case draft creation,
- intake snapshot persistence in `case_intake_snapshots`,
- backend requirement generation into `case_requirements`,
- structured help content attached to requirements,
- signed upload sessions and Supabase Storage finalization,
- document replace and delete flows,
- requirement notes and not-yet-available state,
- admin review for requirements and documents,
- timeline events in `case_events`,
- progress and dashboard summary derived from real requirements.

Not automatically operational before this readiness phase:

- explicit metadata bootstrap outside first-use runtime seeding,
- a safe backfill path for legacy active cases,
- a reproducible end-to-end validation harness,
- and an operator-facing runbook for daily usage.

## Operational Config

Source of truth: [operational-config.ts](/C:/FinTax/src/lib/tax-documents/operational-config.ts)

- active tax year: `2025`
- supported tax years for seed/bootstrap: `2024`, `2025`
- supported services: `tax_return_p`, `tax_return_m`, `tax_return_c`, `tax_return_w`
- seed release marker: `2026-04-06-internal-readiness`

## Bootstrap

Command:

```bash
pnpm docflow:bootstrap
```

What it does:

- loads `.env.local` if present,
- uses the Supabase service role,
- ensures requirement templates, help content, active rule sets, and rules exist
  for every supported tax-return case type and supported tax year.

Expected use:

- after applying migrations to staging,
- before the first serious internal validation cycle,
- before enabling a new active tax year.

## Backfill Policy

Command:

```bash
pnpm docflow:backfill -- --limit=50
pnpm docflow:backfill -- --apply --actor-id=<admin-or-system-profile-id>
```

Current decision:

- controlled backfill is supported only for cases whose `wizard_data` already contains a docflow-compatible payload,
- generic legacy wizard records are skipped,
- no missing fields are invented,
- and cases already carrying `current_intake_snapshot_id` are left untouched.

Why not broader automatic backfill yet:

- the older wizard stored broad tax context, not the normalized document-intake schema,
- critical residency facts such as interruptions, re-establishment dates, and origin-income evidence cannot be reconstructed safely from most old records,
- and defaulting missing fields would create false requirements or hide real blockers.

Interpretation of output:

- `eligibleDryRun`: safe candidates if you rerun with `--apply`
- `alreadyMigrated`: already on the new model
- `skipped`: still legacy and require manual intake refresh before internal use

## Scripted E2E Validation

Command:

```bash
pnpm docflow:e2e -- --user-id=<client-profile-id> --admin-id=<admin-profile-id>
```

Optional:

```bash
pnpm docflow:e2e -- --case-id=<existing-case-id> --user-id=<client-profile-id> --admin-id=<admin-profile-id>
```

The script validates, in order:

- save intake,
- regenerate requirements,
- read help content from a real requirement row,
- save customer note,
- mark another requirement not yet available,
- upload and finalize a real file to Supabase Storage,
- review-reject that document,
- replace the document,
- delete the replacement,
- upload and finalize again,
- review-approve the final document,
- review-approve a non-document requirement,
- fetch timeline events,
- and compare stored case summary with freshly computed progress.

Inputs required:

- a real `profiles.id` for a client user,
- a real `profiles.id` for an admin user,
- valid `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

Safety note:

- the script creates or mutates a real case,
- so use a dedicated staging/internal QA profile,
- not a live customer case.

## Manual Validation Checklist

Use this when a full scripted run is blocked or when product QA wants UI evidence.

1. Create a draft tax-return case from the client workspace.
2. Save intake with a realistic partial-year or migration-style scenario.
3. Confirm `requirements` render by section and dashboard progress is not coming from fallback checklist data.
4. Open help content for at least one blocking document requirement.
5. Upload a real PDF and verify finalize succeeds.
6. Add a customer note on a non-document or pending requirement.
7. Mark a different requirement as not yet available with an ETA note.
8. From admin, review the uploaded document and reject it with a concrete reason.
9. From client, replace the rejected document with a new file.
10. Delete the replacement once to verify the requirement returns to pending.
11. Upload the final file again and finalize it.
12. From admin, approve the final document.
13. Approve or waive a non-document requirement after reviewing its answer.
14. Verify timeline entries exist for intake, regeneration, uploads, delete, not available, note, and review actions.
15. Verify `cases.requirements_summary` matches the visible dashboard counts.

## Daily Internal Operations

### Create or continue a case

- Create the case from `/tax-return` when no active draft exists.
- Use the case page or dashboard to resume an existing active tax-return case.
- Save intake before asking the client for document follow-up.

### Review requirements and documents

- Treat `blockingRemaining` as the main gate.
- Use requirement help content to explain why evidence is requested.
- Prefer document review on the uploaded document itself when evidence quality is the issue.
- Use requirement review for non-document answers or waivers.

### Interpret blockers

- `pending`: evidence or answer still missing.
- `uploaded`: client sent something, admin review still pending.
- `rejected`: client action required.
- `waived`: internal decision documented, no more client action required.
- `not_applicable`: requirement was retired by regeneration and should not block the case.

### Handle rejections

- reject with a concrete operational reason,
- expect the requirement to stay blocking,
- ask for replacement through the same requirement slot,
- and verify the old document is not reviewed again once replaced or deleted.

### Before real submission support

- no blocking requirements remain in `pending` or `rejected`,
- required non-document answers are reviewed,
- the final evidence set is visible in the documents list,
- and the case status has moved out of `pending_documents`.

## Remaining Real Limitations

- broad legacy `wizard_data` cannot be backfilled safely in bulk yet,
- help content is still seeded in English only at metadata level,
- and scripted E2E requires explicit staging profile IDs rather than creating auth users automatically.

## Release Checklist

1. Apply migrations.
2. Run `pnpm docflow:bootstrap`.
3. Run `pnpm docflow:backfill` in dry-run mode and review skipped cases.
4. Manually refresh or resave intake for skipped active legacy cases before using them internally.
5. Run `pnpm docflow:e2e` against QA profiles or complete the manual validation checklist.
6. Run `pnpm lint`.
7. Run `pnpm typecheck`.
8. Run `pnpm test`.
9. Run `pnpm build`.
10. Run `pnpm audit --audit-level=high` and confirm only accepted residuals remain, if any.
