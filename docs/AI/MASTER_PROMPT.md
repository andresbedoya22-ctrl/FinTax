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

## Publish Policy (PUSH-FIRST, no fetch gate)
Publishing sequence:
1. `git push -u origin <branch>`
2. `gh pr create --base main --head <branch> --title "..." --body-file .github/pull_request_template.md`
3. `gh pr merge --squash --delete-branch --auto`
4. `git switch main`
5. `git pull --ff-only`
6. `pnpm.cmd qa`

`git fetch` is optional and never a blocker for publish.

## Retry Ladder for Network Instability
For `git push` and `git pull --ff-only` remote failures:
- Retry up to 3 times with backoff: 2s, 5s, 10s.
- For `git push`, if still failing, run one traced attempt with:
  - `GIT_TRACE=1`
  - `GIT_TRACE_CURL=1`

If `git push` still fails after ladder:
- Mark `OFFLINE PARK` in `docs/ROADMAP/v9_CHECKLIST.md`.
- Record exact pending publish commands.
- Stop execution (do not advance to the next PR).

## PR Loop (when executing a PR)
1. `git switch main`
2. `git pull --ff-only` (retry ladder if network unstable)
3. Create branch: `chore/roadmap-v9-prXX-<slug>` or `feat/...` per roadmap.
4. Implement scoped changes only.
5. Run local gates.
6. Commit.
7. Publish using PUSH-FIRST policy.
8. Return to `main`, pull, and rerun `pnpm.cmd qa`.
9. Update `docs/ROADMAP/v9_CHECKLIST.md` (state + PR log + gates impacted).

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
