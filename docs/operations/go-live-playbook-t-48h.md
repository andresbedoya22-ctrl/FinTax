# Go-Live Playbook (T-48h)

## T-48h checklist
1. Confirm `main` is green (`pnpm.cmd qa` PASS).
2. Confirm staging smoke checks PASS (`pnpm.cmd smoke:staging` and `pnpm.cmd smoke:postdeploy`).
3. Verify 5 BetterUptime monitors are green.
4. Confirm rollback owner and communications owner are assigned.
5. Confirm break-glass document is present and validated.
6. Confirm pending high/critical vulnerabilities are zero (or risk-accepted).

## T-24h checklist
1. Freeze non-critical changes.
2. Re-run QA on release candidate commit.
3. Validate migration plan and rollback steps.
4. Validate on-call rota and escalation channel.

## T-1h checklist
1. Announce deployment start in comms channel.
2. Deploy release.
3. Run post-deploy smoke checks.
4. Confirm monitor stability for 30 minutes.

## T+1h checklist
1. Publish deployment completion note.
2. Capture links to smoke evidence and monitor dashboards.
3. Log any incident and mitigation actions.
