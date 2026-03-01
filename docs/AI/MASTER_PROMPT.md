# FinTax — Master Prompt (Canon)

## 0) Canon / Source of Truth (MUST READ FIRST)
Before taking any action, always read these files in this order:

1) `docs/AI/MASTER_PROMPT.md` (this file)
2) `docs/ROADMAP/FinTax_Roadmap_v9.md` (Roadmap v9 source of truth)
3) `docs/ROADMAP/v9_CHECKLIST.md` (execution state: PR log + gate checklist)

If any of these files are missing, you MUST create them first (minimal scaffold), then STOP and ask for the missing content (do not start new PR work).

---

## 1) Primary Goal
Execute **Roadmap v9** strictly and deterministically.
- No improvisation.
- No skipping steps.
- No parallel PRs.
- No “nice to have” refactors outside the current PR scope unless required to pass gates.

---

## 2) Execution Model (PLAN → EXECUTE → GATES → PUBLISH → MERGE → UPDATE CHECKLIST)
For every PR:

### A) PLAN
- Identify the next PR number and scope from `docs/ROADMAP/FinTax_Roadmap_v9.md`.
- Confirm what gates (from 1..25) this PR satisfies.
- List files to touch.
- List local commands to run.

### B) EXECUTE
- Implement only what is needed for the PR scope.
- Keep changes minimal, clean, and consistent with existing patterns.

### C) GATES (local)
Run gates locally and capture results:

- `pnpm.cmd lint`
- `pnpm.cmd typecheck`
- `pnpm.cmd test -- --runInBand`
- `pnpm.cmd build` (uses build-gate if configured)

If any gate fails, fix and re-run until PASS.

### D) PUBLISH (PUSH-FIRST policy)
Publishing is *strictly*:

1) `git push -u origin <branch>`
2) `gh pr create ...`
3) `gh pr merge --squash --delete-branch --auto`
4) `git switch main`
5) `git pull --ff-only`
6) `pnpm.cmd qa`

**Do NOT require `git fetch` as a prerequisite.**  
If fetch fails but push works, proceed.

### E) OFFLINE PARK policy (when network fails)
If `git push` fails due to GitHub connectivity:
- Write an OFFLINE PARK entry into `docs/ROADMAP/v9_CHECKLIST.md`:
  - branch
  - HEAD commit
  - working tree status (must be clean)
  - which gates passed (lint/typecheck/test/build)
  - the exact pending publish commands
- STOP. Do not start next PR.

### F) UPDATE CHECKLIST (always)
After a PR is merged:
- Append a PR log line to `docs/ROADMAP/v9_CHECKLIST.md` (append-only).
- Update “Estado actual” (branch/main, HEAD, último PR, próximo PR).
- Mark any gates that are fully satisfied **only if** you can map them to the exact Roadmap gate text.

---

## 3) Determinism Rules (non-negotiable)
- One PR at a time.
- PR numbering is sequential and must match Roadmap v9.
- No PR #N+1 until PR #N is merged.
- Avoid manual steps for the user: prefer scripts, repeatable commands, and doc-driven workflow.
- Do not invent gates, rename gates, or re-order gates. Gates are verbatim from Roadmap v9.

---

## 4) Git Rules
- Default branch: `main`
- Branch naming: use Roadmap v9 convention: `chore/roadmap-v9-prXX-...` or `feat/...` as specified by v9.
- Always keep working tree clean at checkpoints.
- Squash merge PRs unless Roadmap explicitly says otherwise.

---

## 5) Documentation Rules
- `docs/ROADMAP/FinTax_Roadmap_v9.md` is the source of truth.
- `docs/ROADMAP/v9_CHECKLIST.md` is the living execution state (PR log + gate status).
- Any decision taken due to environment flakiness (Windows spawn EPERM, transient network) must be logged in `v9_CHECKLIST.md` with exact error snippets.

---

## 6) Build / Windows Stability Guardrails
This repo may run on Windows with intermittent build issues.
- Prefer deterministic build gates (e.g., a build-gate script) over ad-hoc retries in chat.
- If a Next.js/Node build fails intermittently, isolate it, document it, and implement the smallest stable workaround that preserves correctness and CI parity.

---

## 7) Security / Secrets Handling
- Never commit secrets.
- Use `.env.local` for local development only.
- For CI, use GitHub Actions secrets.
- For production, use the chosen hosting provider secret store (document steps in runbooks).

---

## 8) STOP Conditions (must stop immediately)
Stop and ask for input if:
- Roadmap v9 file missing or does not include gates 1..25.
- Checklist file missing.
- Any required secret/config values are unknown and needed to proceed.
- A publish step fails and OFFLINE PARK is required.

---

## 9) Output Format Requirements (for the assistant)
When implementing PR work:
- Provide a short plan.
- Provide exact PowerShell commands to execute.
- When asked to create/edit files, output **full file contents** (not diffs).
- Always include gate results and next action.

End.