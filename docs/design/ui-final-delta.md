# FinTax UI Final Delta (Landing/Auth/Dashboard)

## What Was Corrected
- Landing:
  - Tightened sticky navbar height and CTA weight for clearer first viewport hierarchy.
  - Refined hero typography scale/line-height and increased content-to-image balance.
  - Upgraded hero visual container (cleaner border/shadow/radius) for a more product-real surface.
  - Reworked trust strip contrast and spacing for better scanability.
  - Standardized cards (services/pricing/blog/trust) with cleaner white surfaces, lighter borders, and consistent paddings.
  - Strengthened final CTA block contrast while keeping institutional tone.
- Auth:
  - Increased form panel clarity: cleaner container, better input border contrast, and stronger CTA button presence.
  - Normalized form control visuals (email/password/register/forgot) for consistent spacing and focus behavior.
  - Increased right-side trust panel contrast and editorial hierarchy (headline/body/proof/quote).
  - Kept provider rendering bound to real implementation (Google + Apple only when enabled).
  - Confirmed DigiD is not reintroduced.
- Dashboard:
  - Reduced top-level visual noise with cleaner white topbar and subtle header shadow.
  - Tuned declaration header typography and action CTA sizing to improve operational hierarchy.
  - Kept horizontal timeline as dominant module and improved proportional spacing.
  - Harmonized KPI card heights and spacing for cleaner row alignment.
  - Expanded right rail breathing room and refined refund breakdown typographic emphasis.
  - Tightened sidebar visual rhythm (institutional dark green, balanced nav density, cleaner contrast).

## What Still Remains
- Landing:
  - The reference has a stronger editorial right-rail composition; current implementation is closer but not identical in layout rhythm.
  - Pricing cards still differ from the exact geometry/microcopy rhythm in the reference image.
- Auth:
  - Reference includes DigiD in social providers; implementation intentionally excludes it due non-supported flow.
  - Right panel quote remains internal placeholder content (non-testimonial by policy).
- Dashboard:
  - Some block proportions are still not pixel-identical to reference (especially module heights in mid/lower grid).
  - Action labels remain real-product wording, not mock wording from the visual reference.

## Manual Review Checklist
- Verify desktop (1440px+) spacing parity for:
  - Landing hero + trust bar + right rail blocks.
  - Auth split balance (left task area vs right trust panel).
  - Dashboard stepper width and right-column breathing room.
- Verify tablet/mobile behavior:
  - Sticky nav and CTA wrapping on landing.
  - Auth form readability and provider button spacing.
  - Dashboard card stacking order and timeline readability.
- Verify accessibility and interaction:
  - Keyboard focus visibility in auth inputs/buttons and dashboard CTAs.
  - Text contrast in green surfaces and muted metadata lines.
  - Hover/active states remain consistent and non-decorative.
- Verify business constraints:
  - No DigiD entrypoint in auth UI.
  - No fabricated claims/testimonials introduced.
  - No changes to auth/session, route protection, or domain status mapping behavior.
