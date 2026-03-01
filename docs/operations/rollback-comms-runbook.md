# FinTax Rollback + Communications Runbook

## Scope
- Covers roadmap v9 operational gates for post-deploy smoke checks and rollback communications.
- Applies to staging and production deploys.

## Pre-deploy checklist
1. Confirm migrations are applied in target environment.
2. Confirm `pnpm.cmd qa` passed on `main`.
3. Run `pnpm.cmd smoke:staging`.
4. Confirm release owner and comms owner are assigned.

## Post-deploy smoke (5 checks)
Run:

```powershell
$env:POSTDEPLOY_BASE_URL="https://<env-host>"
pnpm.cmd smoke:postdeploy
```

Required pass criteria:
1. Root route responds with `2xx/3xx`.
2. `/api/health` returns API success envelope with `data.status="ok"`.
3. Required security headers exist on root response.
4. `/api/cases` returns `401` with `error.code="unauthorized"` when no session is provided.
5. `/api/notifications` returns `401` with `error.code="unauthorized"` when no session is provided.

## Rollback triggers
- Smoke check fails and cannot be mitigated within 15 minutes.
- Elevated 5xx rates for API or auth callback.
- Data integrity issue affecting cases, payments, or DSAR flows.

## Rollback procedure
1. Freeze deploy pipeline and incident channel.
2. Revert to previous known-good release in hosting provider.
3. Re-run:
   - `pnpm.cmd smoke:postdeploy`
   - `pnpm.cmd smoke:staging` (if staging rollback performed)
4. Validate `/api/health` and critical API envelopes.
5. Publish incident update using template A.
6. Publish recovery update using template B after verification.

## Communication templates
### Template A - incident start
```
Subject: FinTax deployment rollback in progress

We detected a deployment issue impacting service stability and started rollback to the previous stable release.
Current impact: <short impact>.
ETA for next update: <time>.
Owner: <name>.
```

### Template B - recovery confirmation
```
Subject: FinTax service restored after rollback

Rollback completed successfully. Core checks and API health are passing.
Affected window: <start-end UTC>.
Follow-up actions: <bullets>.
Owner: <name>.
```
