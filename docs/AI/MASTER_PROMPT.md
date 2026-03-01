# FinTax Master Prompt (Canon)

## Mandatory Read Order (before any code change)
Read these files first, in this exact order:
1. `docs/AI/MASTER_PROMPT.md`
2. `docs/ROADMAP/v9_CHECKLIST.md`

If either file is missing, create it with a minimal scaffold and stop.

## Mission
Execute Roadmap v9 in strict sequence, one PR at a time, with deterministic gates and persistent tracking.

## Core Rules
1. Single active PR branch only.
2. Do not start PR #N+1 until PR #N is merged.
3. Keep diffs minimal and scoped to the current PR objective.
4. Keep working tree clean at every checkpoint.
5. Never assume GitHub connectivity.

## Local Gates vs Publish (separate phases)

### Local Gates (must pass before publish)
Run in this order:
1. `pnpm.cmd lint`
2. `pnpm.cmd typecheck`
3. `pnpm.cmd test -- --runInBand`
4. `pnpm.cmd build`

Preferred umbrella check is `pnpm.cmd qa` when stable in the environment.

### Build Gate (Windows)
If `pnpm.cmd build` fails with `EPERM` or `DataCloneError`:
- Run build through `scripts/build-gate.mjs` (already wired via `pnpm.cmd build` in this repo).
- Do not change `next.config.ts` experiments unless the failure reproduces and the change is documented in PR log and checklist.

## Publish Policy (PUSH-FIRST; command-outcome driven)
Publishing sequence:
1. `git push -u origin <branch>`
2. `gh pr create --base main --head <branch> --title "..." --body-file .github/pull_request_template.md`
3. `gh pr merge --squash --delete-branch --auto`
4. `git switch main`
5. `git fetch origin`
6. `git rebase origin/main`
7. `git push` (only if ahead)
8. `pnpm.cmd qa`

Do not use `Test-NetConnection` as a gate/stop. Only act on real command outcomes.

Failure classes:
- A) `git push` fails -> retry ladder 2s/5s/10s + one trace attempt (`GIT_TRACE=1`, `GIT_TRACE_CURL=1`).
  If still failing: `OFFLINE PARK (GIT_BLOCKED)` and stop.
- B) `gh` fails (GraphQL/connectex/403/enablePullRequestAutoMerge) while `git push` succeeded:
  mark `MANUAL_REQUIRED` (`GH_BLOCKED` or `AUTO_MERGE_DISABLED`), record exact error + manual steps, and stop before next PR.
- C) `main` diverged -> never use `git pull --ff-only`; use `git fetch origin`, `git rebase origin/main`, and `git push` (if ahead).

If error includes `connectex ... forbidden by its access permissions`, classify as `LOCAL_POLICY_BLOCK` (local policy), not internet-down.

## Retry Ladder for Network Instability
For `git push` remote failures:
- Retry up to 3 times with backoff: 2s, 5s, 10s.
- For `git push`, if still failing, run one traced attempt with:
  - `GIT_TRACE=1`
  - `GIT_TRACE_CURL=1`

If `git push` still fails after ladder:
- Mark `OFFLINE PARK (GIT_BLOCKED)` in PR log.
- Record exact pending publish commands.
- Stop execution (do not advance to the next PR).

## PR Loop (when executing a PR)
1. `git switch main`
2. `git fetch origin`
3. `git rebase origin/main`
4. `git push` (only if ahead)
5. Create branch: `chore/roadmap-v9-prXX-<slug>` or `feat/...` per roadmap.
6. Implement scoped changes only.
7. Run local gates.
8. Commit.
9. Publish using PUSH-FIRST policy.
10. Return to `main`, run `git fetch origin`, `git rebase origin/main`, `git push` (if ahead), and rerun `pnpm.cmd qa`.
11. Update `docs/ROADMAP/v9_CHECKLIST.md` (state + PR log + gates impacted).

## Checklist Rule C (Persistence)
For every PR entry in `docs/ROADMAP/v9_CHECKLIST.md` include:
- Branch
- Commit hash
- Scope summary
- Gates impacted
- Evidence commands and outcome
- Publish state (`MERGED` or `OFFLINE PARK`)

PR log is append-only.
If publish completes, reflect it; never keep stale `OFFLINE PARK` state.

## PowerShell Safety
- Never use `&&`.
- Use `pnpm.cmd` instead of `pnpm`.
- Use `-LiteralPath` for paths containing brackets.

## Stop Conditions
Stop only for:
- Failing local gates that cannot be resolved safely within scope.
- Data-loss risk.
- Missing canonical inputs that block deterministic execution.
