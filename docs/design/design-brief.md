# FinTax UI Design Brief (F00)

## Purpose
Define a safe, operational UI redesign direction for FinTax without breaking auth, i18n, Stripe, Supabase, middleware, or fiscal domain flows.

## Repository Reality Snapshot
- Existing app is production-shaped Next.js App Router with localized public + authenticated routes.
- Existing visual system is dark, textured, and high-effect in several screens.
- Existing domain and integrations are already wired (Supabase auth/data, Stripe checkout/webhook, route protection in middleware).

## Product Surfaces in Scope
- Landing/public experience: `src/app/[locale]/page.tsx` + `src/components/fintax/landing/*`
- Auth entry: `src/app/[locale]/auth/page.tsx` + `src/components/fintax/auth/AuthScreen.tsx`
- Dashboard shell/overview: `src/app/[locale]/dashboard/*` + `src/components/fintax/dashboard/*`

## Target Visual Philosophy
- Clear: low ambiguity, explicit hierarchy, direct language.
- Editorial: strong typography rhythm and measured spacing.
- Institutional: calm trust, policy-grade clarity, operational seriousness.
- Premium: craftsmanship in spacing, composition, and states, not flashy effects.
- European with Latin warmth: formal structure + human tone.

## Type + Color Direction
- Primary color family: institutional green (already compatible with current tokens).
- Public hero/display headlines: serif.
- Interface controls/body copy: clean sans.
- Data, amounts, percentages, case IDs: mono.

## Copy and Veracity Constraints
- Do not publish unverifiable claims.
- Do not add fake social proof.
- Do not imply legal/compliance certifications unless evidenced.
- Keep legal/contact placeholders clearly marked until verified.

## DigiD Rule
- DigiD can only be shown as conditional context if the real path supports it.
- Current codebase supports authorization/machtiging steps; no direct DigiD integration route detected.

## Dashboard UX Priority
- Stepper-led journey is the main orientation mechanism.
- Lower card density and reduce duplicated status text.
- Relax right-column spacing and emphasize next action clarity.

## Delivery in This Phase
- Documentation + operating rules only.
- No integration behavior changes.
