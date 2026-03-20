# AGENTS.md - FinTax Working Rules

## Scope
These rules apply to any change in this repository.
Do not create a parallel project or reinitialize the repo.

## Architecture Baseline (as of 2026-03-14)
- Framework: Next.js 16 App Router + TypeScript + Tailwind
- Package manager: pnpm (lockfile: pnpm-lock.yaml)
- i18n: next-intl (`src/i18n/routing.ts`, locales: en, nl, es, ro, pl)
- Auth/data: Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- Payments: Stripe checkout + webhook (`src/app/api/stripe/*`)
- Security gate: middleware in `middleware.ts`

## Hard No-Break Zones
Never break or bypass:
- auth/session flows
- i18n routing and translations
- Stripe checkout/webhook + idempotency
- Supabase + RLS assumptions
- middleware origin policy and protected route checks
- tax domain status flow (`src/domain/cases/status-stepper.ts` and related flows)

## Truthfulness and Copy Rules
- No fake metrics, fake social proof, fake badges, fake logos.
- No invented regulatory claims.
- No invented legal registration details.
- Any testimonial must be verifiable internal content or explicitly marked as placeholder.
- Claims about security/compliance must match implemented behavior.

## DigiD and Authorization Rules
- Mention DigiD only where an actual implemented flow exists.
- Current repo has machtiging/authorization UI and copy; no direct DigiD API integration detected.
- Do not promise DigiD automation unless backed by code and tested flow.

## UI Direction (Target)
- Tone: clear, editorial, institutional, premium, European with Latin warmth.
- Primary color: institutional green.
- Typography:
  - Serif for large public headlines
  - Clean sans for UI
  - Mono for figures and operational data
- Explicitly avoid: sci-fi look, particle effects, gold-heavy/glow-heavy styling, fake trust badges.

## Dashboard Direction Rules
- Stepper is the primary progression component.
- Reduce visual density in primary panels.
- Increase whitespace in right-side column cards and utilities.
- Keep information hierarchy obvious before decorative elements.

## Required Validation Before Merge
Run and pass, in order:
1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`
4. `pnpm build`

If available and stable, `pnpm qa` can be used as a full gate.

## Git Rules for UI Doc/Refactor Phases
- Work on feature branch.
- Commit focused scope only.
- Do not include unrelated local files.
- Merge to `main` directly only if branch protection and permissions allow it.
- If blocked, push branch and provide exact PR steps.
