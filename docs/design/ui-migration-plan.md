# FinTax UI Migration Plan

## Phase Order
1. Foundation alignment
2. Landing refinement
3. Auth refinement
4. Dashboard shell and overview refinement
5. Case detail and flows refinement
6. QA hardening and rollout

## Phase 1 - Foundation Alignment
Targets:
- `src/app/globals.css`
- shared UI primitives in `src/components/ui/*`

Actions:
- Normalize token usage for typography and spacing.
- Preserve existing font roles (serif/sans/mono) and green primary.
- Remove style patterns that create sci-fi/glow-heavy impression.

Risks:
- Token changes can cascade to auth/dashboard unexpectedly.
Mitigation:
- Snapshot visual diffs per route and run full QA.

## Phase 2 - Landing
Targets:
- `src/app/[locale]/page.tsx`
- `src/components/fintax/landing/PremiumLandingPage.tsx`
- optionally split sections under `src/components/fintax/landing/*`

Actions:
- Simplify hero and trust presentation.
- Enforce truthful claims/testimonials policy.
- Keep CTA routing behavior unchanged (`/auth` intent/service params).

Risks:
- Breaking query-param intent handoff to auth.
Mitigation:
- Keep `buildAuthIntentHref` contract unchanged.

## Phase 3 - Auth
Targets:
- `src/app/[locale]/auth/page.tsx`
- `src/components/fintax/auth/AuthScreen.tsx`
- `src/app/[locale]/auth/callback/route.ts` (read-only safety validation)

Actions:
- Reduce decorative load and tighten hierarchy.
- Keep all Supabase auth calls and callback behavior intact.
- Keep MFA-required messaging accurate.

Risks:
- Redirect or callback regressions.
Mitigation:
- Test login/register/OAuth/callback with locale + next params.

## Phase 4 - Dashboard Shell + Overview
Targets:
- `src/app/[locale]/dashboard/layout.tsx`
- `src/app/[locale]/dashboard/page.tsx`
- `src/components/fintax/dashboard/DashboardShell.tsx`
- `src/components/fintax/dashboard/DashboardOverview.tsx`
- `src/components/fintax/dashboard/DashboardSidebar.tsx`
- `src/components/fintax/dashboard/DashboardTopbar.tsx`

Actions:
- Make stepper the main orientation artifact.
- Reduce card density.
- Increase breathing room in right column modules.

Risks:
- Functional regressions in data hooks and realtime refresh behavior.
Mitigation:
- Do not alter query hooks/realtime logic in same commit as layout polish.

## Phase 5 - Case Detail and Flows
Targets:
- `src/components/fintax/flows/CaseDetailView.tsx`
- `src/components/fintax/flows/TaxReturnFlow.tsx`
- `src/components/fintax/flows/BenefitsFlow.tsx`
- `src/components/ui/stepper.tsx`
- `src/domain/cases/status-stepper.ts` (read-only unless approved)

Actions:
- Keep status-to-step mapping semantics stable.
- Improve readability and progression cues.
- Keep authorization wording aligned with real flow.

## Phase 6 - QA and Rollout
Mandatory commands:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Release gate:
- Merge only when all checks pass and branch policy allows.
