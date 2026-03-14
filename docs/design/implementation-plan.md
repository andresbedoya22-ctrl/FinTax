# FinTax UI Implementation Plan (Operational)

## Objective
Execute UI redesign in controlled phases while preserving all critical integrations and fiscal flows.

## Non-Negotiable Constraints
- Preserve auth, i18n, Stripe, Supabase, middleware, and tax domain semantics.
- No route contract changes without explicit approval.
- No fake claims, fake badges, fake metrics, or unverifiable trust statements.

## Implementation Sequence
1. Baseline and safeguards
2. Landing rewrite for clarity and veracity
3. Auth visual simplification with unchanged flow logic
4. Dashboard information architecture update
5. Case-flow refinements and stepper harmonization
6. Regression QA and release

## Phase Details

### 1) Baseline and safeguards
- Freeze route and integration contracts.
- Add/update docs and acceptance criteria.
- Confirm required scripts pass before and after UI edits.

### 2) Landing
- Reduce effect noise and tighten editorial hierarchy.
- Keep CTA path behavior and locale handling unchanged.
- Rewrite claims/testimonials to comply with evidence policy.

### 3) Auth
- Improve readability and trust framing.
- Keep Supabase methods and callback semantics unchanged.
- Keep `next` and `intent/service` handoff intact.

### 4) Dashboard
- Make progression stepper dominant.
- Reduce card crowding and repetitive labels.
- Increase spacing and simplicity in right-side column.

### 5) Case flows
- Keep `mapCaseStatusToStep` semantics stable unless explicitly approved.
- Align step labels and visual rhythm across flows.
- Keep authorization wording truthful and conditional where needed.

### 6) QA and release checks
Mandatory commands:
1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`
4. `pnpm build`

## Technical Risk Register
- Middleware behavior regression
- OAuth/auth callback regression
- Stripe webhook/idempotency regression
- i18n locale drift
- Data hook behavior changes during UI refactors

Mitigation pattern:
- Small scoped commits
- Route-by-route smoke verification
- Full QA gate before merge

## Merge Procedure
- Attempt direct merge to `main` only if protection/perms allow.
- If blocked, keep feature branch pushed and open PR with validation evidence.

## Acceptance Criteria
- Documentation complete for design direction and migration plan.
- Routes/components inventory captured.
- Risks and phase order documented.
- QA scripts pass.
- Git flow completed with push; merge outcome reported explicitly.
