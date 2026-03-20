# FinTax UI Principles

## 1) Core Experience Principles
1. Clarity over decoration.
2. Hierarchy before density.
3. Trust by evidence, not by slogans.
4. Consistency across locales.
5. Accessibility and readability first.

## 2) Visual System Principles
- Tone: editorial institutional premium.
- Use green as primary action/trust anchor.
- Use serif for major public headings only.
- Use sans for UI controls and long-form readability.
- Use mono for numeric content (EUR, percentages, case progress, dates, IDs).

## 3) Motion and Effects
- Motion should communicate state change, not spectacle.
- No particle systems, no sci-fi gradients, no excessive glow.
- Keep animation subtle in authenticated productivity areas.

## 4) Copy, Claims, and Testimonial Policy
- Every claim must map to a real capability in code/operations.
- Testimonials allowed only when sourced from approved internal copy.
- If testimonial quality is uncertain, mark as placeholder or remove.
- No fabricated conversion metrics, SLA claims, or legal statuses.

## 5) DigiD / Authorization Wording Policy
- Use neutral wording: "may require DigiD or machtiging depending on case" only when true.
- Never state "fully DigiD automated" without implemented and tested flow.
- Prefer describing current authorization workflow exactly as implemented.

## 6) Route and Integration Safety Rules
- UI refactors must not alter:
  - middleware origin and protected route behavior
  - Supabase auth/session semantics
  - Stripe checkout/webhook contracts
  - case status mapping and stepper semantics
- Maintain locale-aware paths and links.

## 7) Dashboard-Specific Rules
- Stepper must remain dominant in overview and case detail context.
- Main content column: concise, actionable, low-cognitive-load.
- Right column: fewer modules, more whitespace, stronger prioritization.
- CTA placement: one primary next action per section.

## 8) Done Criteria for UI Iterations
- Lint/typecheck/test/build all pass.
- No regression in protected routes or auth redirects.
- No i18n key breakage in touched strings.
- No false claim introduced in public copy.
