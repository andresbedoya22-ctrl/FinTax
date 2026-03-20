# Current UI Audit (Repo-Based)

Date: 2026-03-14
Branch at audit start: `main`

## 1) Architecture Findings
- App Router structure under `src/app` with locale segment `src/app/[locale]`.
- Middleware handles i18n, auth redirects, admin/mfa gate, API origin policy.
- Supabase powers auth/profile/cases/documents workflows.
- Stripe checkout + webhook are active server routes.

## 2) Package Manager and Scripts (Detected)
- Package manager: pnpm
- Core scripts in `package.json`:
  - `lint`
  - `typecheck`
  - `test`
  - `build`
  - `qa` (lint + typecheck + test + build)

## 3) Route Findings
Public:
- `/{locale}` landing
- `/{locale}/legal/privacy`
- `/{locale}/legal/terms`

Auth-related:
- `/{locale}/auth`
- `/{locale}/auth/callback`
- `/{locale}/onboarding`

Dashboard/authenticated:
- `/{locale}/dashboard`
- `/{locale}/tax-return`
- `/{locale}/tax-return/{caseId}`
- `/{locale}/benefits`
- `/{locale}/benefits/{caseId}`
- `/{locale}/settings`
- `/{locale}/admin` (admin + MFA gate)

## 4) Main Branch Policy Detection
- GitHub branch query reports `main` as `protected: false`.
- This suggests direct merge/push can be attempted if credentials allow.

## 5) Existing Docs and Agent Files
- No `AGENTS.md` existed at root before this phase.
- No prior `docs/design/*` folder existed.
- Existing governance docs detected: `docs/ai-rules.md`, `docs/trust-checklist.md`, security and operations docs.

## 6) UI Baseline Assessment
Strengths:
- Already uses tokenized typography with serif/sans/mono roles.
- Stepper primitive exists and is used across onboarding/dashboard/flows.
- Locale-aware routing and components are already established.

Gaps vs target direction:
- Current styling is dark and effect-heavy in multiple surfaces.
- Some sections feel dense, especially dashboard cards and right-column modules.
- Copy includes testimonial-like and placeholder patterns requiring tighter veracity policy.

## 7) Claims/Testimonial Risk Notes
- Landing currently includes testimonial blocks and conversion-oriented copy.
- Support email and legal registration placeholders exist.
- Risk: users may interpret placeholders as factual if not explicitly controlled.

## 8) DigiD Reality Check
- Detected mention in landing FAQ copy.
- Detected authorization/machtiging language in case detail/messages.
- No direct DigiD integration route or API implementation found.
- Rule: keep DigiD mention conditional; do not claim automated DigiD flow.

## 9) Dashboard UX Findings
- Stepper appears in dashboard overview and case detail.
- Information density is high in overview and multi-card layouts.
- Right-side column includes several modules with compact spacing.
- Improvement direction: stepper-first orientation, less density, more whitespace.

## 10) Technical Risks for UI Redesign
- Breaking route protection or locale redirects in middleware.
- Breaking auth callback/next-intent handoff.
- Breaking Stripe checkout/webhook contracts.
- Introducing i18n key drift across 5 locales.
- Visual-only changes accidentally altering data-fetch/realtime behavior.
