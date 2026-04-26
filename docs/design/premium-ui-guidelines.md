# Premium FinTech UI Guidelines

## Principles
- Use deep navy as the primary product environment and modern green as the main action/status accent.
- Lead with hierarchy: one primary CTA per major section, summary first, details second.
- Keep cards spacious, white or subtly elevated, with soft borders and restrained shadows.
- Avoid fake proof, decorative badges, excessive gradients, particle effects, and gold-heavy styling.

## Palette
- Navy 950: `#061426`
- Navy 900: `#081B33`
- Navy 850: `#0B2340`
- Green 500: `#4CAF50`
- Green 600: `#3F9E48`
- Green soft: `#EAF7EC`
- Surface soft: `#F6F8F5`
- Light text primary: `#102033`
- Light text secondary: `#667085`

## Typography
- Use the existing sans for operational UI and large app headlines.
- Use mono only for figures, totals, IDs, and operational data.
- Keep dense dashboard panels compact; reserve display sizes for page headers and hero summaries.

## Cards And Panels
- Main cards use 24-28px radius, white surfaces, soft borders, and generous padding.
- Dark action panels use navy gradients only where they create clear focus for the primary CTA.
- Do not nest cards inside decorative cards. Use grid layout and unframed sections when possible.

## CTAs
- Primary CTAs are green, large, and explicit.
- Secondary actions are quieter and should not compete with the main action.
- Icon-only buttons require accessible labels.

## Stepper
- Desktop uses horizontal circles and connecting lines.
- Mobile may scroll horizontally or collapse compactly.
- States: completed green check, current green number, upcoming muted navy.

## Badges
- Success: green soft background.
- Warning: amber soft background.
- Danger: red soft background.
- Neutral: slate soft background.
- Do not use badges as fake certifications or unverified trust proof.

## Iconography
- Use `lucide-react`.
- Keep icon containers consistent: circular or softly rounded, one size per component group.
- Benefit icons: health, home, family, childcare. Process icons: search, shield, upload, file check.

## Do / Don't
- Do: show estimates as ranges before payment.
- Do: unlock detailed calculation and documents after payment.
- Do: keep legal/compliance copy tied to implemented behavior.
- Don't: promise DigiD automation without an implemented flow.
- Don't: show calculation trace or full document checklist before payment.
- Don't: leave non-Dutch UI labels as "toeslagen" except when referring to the Dutch agency/term.

## Maintenance
- Prefer reusable components under `src/components/fintax/ui`, `layout`, and `brand`.
- Add tokens to `src/styles/tokens.css` before introducing new color literals broadly.
- Keep tests focused on behavior and text, not exact Tailwind class strings.

## Premium UI Application Fix

PR #79 created premium primitives, but this follow-up applies them to actual routes and replaces legacy panels.

- Benefits, dashboard, success, and case detail routes render through the premium app shell/navigation layer.
- The Benefits wizard uses premium option-card inputs, dark contextual panels, and the premium stepper from the first step onward.
- Dashboard cards use explicit dark, glass, and premium variants instead of generic white `surface-panel` cards.
- New UI tests assert stable intent with `premium-app-shell`, `premium-top-nav`, `benefits-wizard-shell`, `benefits-step-card`, `benefits-option-card`, `dashboard-metric-card`, and `dashboard-panel`.
