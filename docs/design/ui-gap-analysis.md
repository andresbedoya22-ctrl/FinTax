# UI Gap Analysis Against Visual References (F05 Audit)

## Context
- Repo audited on branch: `feat/fix-ui-gap-analysis`
- References reviewed:
  - `docs/design/landing-reference.png`
  - `docs/design/login-reference.png`
  - `docs/design/dashboard-reference.png`
- Implementations reviewed:
  - Landing: `src/app/[locale]/page.tsx` + `src/components/fintax/landing/PremiumLandingPage.tsx`
  - Auth: `src/app/[locale]/auth/page.tsx` + `src/components/fintax/auth/AuthScreen.tsx`
  - Dashboard: `src/app/[locale]/dashboard/page.tsx` + `src/components/fintax/dashboard/*`

## 1) Landing Gaps (Exact)

### What is already aligned
- Clean light background, green as primary accent, serif-led hero heading.
- Sticky top navigation and dual CTA pattern in hero.
- Includes sections for: services, pricing, FAQ, blog/resource preview, final CTA, legal footer.
- No fake legal/fiscal guarantees in current copy.

### What still differs from `landing-reference.png`
- **Global composition mismatch**:
  - Reference behaves like a dense editorial board with a strong right-side stack (services/pricing/testimonials/FAQ/blog) visible high on the page.
  - Current implementation is a classic vertical section flow; right rail is not persistent.
- **Hero authenticity block mismatch**:
  - Reference hero has larger trust strip immediately under hero with star score + outcomes + response SLA.
  - Current hero has copy-only note and no equivalent high-signal trust strip.
- **Pricing presentation mismatch**:
  - Reference pricing cards are compact plan tiles with immediate CTA and stronger visual rank.
  - Current pricing is a table-first layout, less similar to the card-led visual hierarchy in the reference.
- **Testimonials treatment mismatch**:
  - Reference includes testimonial cards with avatars and quick credibility markers.
  - Current landing intentionally avoids testimonial cards and shows trust statements only.
- **Right-side FAQ/blog rhythm mismatch**:
  - Reference places FAQ + blog preview in the same visual zone as social proof.
  - Current FAQ/blog are separate full-width sections further down.

### Files to touch for landing parity
- `src/components/fintax/landing/PremiumLandingPage.tsx`
  - Rebuild above-the-fold to a stronger two-column editorial board.
  - Add compact trust strip under hero (only with verifiable metrics).
  - Convert pricing table into card tiles closer to reference geometry.
  - Add testimonial card block only if source is verified; otherwise use validated case snippets.
  - Repack FAQ + blog preview into tighter right-column rhythm.

## 2) Login/Auth Gaps (Exact)

### What is already aligned
- Two-panel split layout with clear task panel and trust/value panel.
- Solid input controls, strong green CTA, legal links visible.
- Real auth flow preserved (Supabase password, OAuth, callback, reset password).
- No fake guarantees in current auth copy.

### What still differs from `login-reference.png`
- **Visual weight mismatch**:
  - Reference has a very bold dark gradient trust panel with larger headline and stronger emotional hierarchy.
  - Current right panel is calmer and flatter with smaller visual drama.
- **Form styling mismatch**:
  - Reference input fields are heavier/larger and CTA appears more prominent in first viewport.
  - Current form density is more compact and less brand-dominant.
- **Provider row mismatch**:
  - Reference shows Google + DigiD.
  - Current implementation shows Google + Apple (Apple conditional), and no DigiD button.
- **Testimonial/proof card mismatch**:
  - Reference includes a quote card block on the trust panel.
  - Current panel uses operational trust bullets + preview image.

### Important constraint for auth parity
- DigiD cannot be added visually as an active provider unless a real implemented flow exists in auth backend/provider config.

### Files to touch for auth parity
- `src/components/fintax/auth/AuthScreen.tsx`
  - Increase right panel hero scale and contrast gradient depth.
  - Raise form control height and CTA prominence.
  - Align trust panel block order (headline -> proof bullets -> quote/proof card).
  - Keep provider rendering strictly tied to real configured providers (no fake DigiD).

## 3) Dashboard Gaps (Exact)

### What is already aligned
- Dark institutional sidebar + light main content split.
- Stepper/status is visually dominant in main column.
- Main modules exist: declaration header, KPI, documents, fiscal history, refund breakdown, advisor, recent activity.
- Right column is cleaner and less dense than earlier versions.

### What still differs from `dashboard-reference.png`
- **Top header mismatch**:
  - Reference has breadcrumb + large tax-year title + two primary actions in one row.
  - Current header is generic dashboard topbar; declaration title sits lower in content.
- **Stepper geometry mismatch**:
  - Reference stepper is horizontal timeline with explicit current marker and fixed phase labels.
  - Current stepper is vertical card list style.
- **Card matrix mismatch**:
  - Reference uses a tighter 4-card stats row under stepper with specific fiscal labels.
  - Current KPI row exists but text and structure differ.
- **Operational card details mismatch**:
  - Reference shows stronger numeric prominence in refund block and tighter action controls.
  - Current refund and advisor cards are cleaner but less visually similar in typography/action layout.
- **Right rail content style mismatch**:
  - Reference right rail cards have stronger actionable controls and more explicit status microcopy.
  - Current right rail is lower-noise but less close to reference visual language.

### Files to touch for dashboard parity
- `src/components/fintax/dashboard/DashboardOverview.tsx`
  - Move declaration headline + breadcrumb/action bar higher and closer to reference header rhythm.
  - Replace vertical stepper card with horizontal timeline variant.
  - Re-layout KPI strip to match reference proportions and label density.
  - Tune refund breakdown typography and advisor/action controls to reference geometry.
- `src/components/fintax/dashboard/DashboardTopbar.tsx`
  - Reduce generic topbar dominance when declaration page context is active.
- `src/components/fintax/dashboard/DashboardSidebar.tsx`
  - Fine-tune nav spacing/icon weight and bottom profile block to match reference compactness.

## 4) Parts That Are Correct Today
- Architecture integrity preserved: no breakage in auth/i18n/Stripe/Supabase/middleware/domain flows.
- Visual direction remains institutional and clear; no sci-fi/glow overload.
- Public SEO baseline improved (metadata, FAQ structured data, canonical handling).
- Dashboard right rail is cleaner than prior versions and stepper remains prominent.

## 5) Priority Action Plan To Get Much Closer
1. Landing: restructure top 1.5 viewports into reference-like editorial board in `PremiumLandingPage`.
2. Auth: increase trust panel intensity and form scale in `AuthScreen` while keeping provider truth constraints.
3. Dashboard: implement horizontal timeline stepper and reference-like declaration action header in `DashboardOverview`.
4. Final pass: spacing/typography harmonization across these three files only, then validation gate.
