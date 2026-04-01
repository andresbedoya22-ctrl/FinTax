# FinTax Trust Checklist

## Scope

- Public: landing pages, pricing summaries, legal placeholders (`/[locale]/legal/privacy`, `/[locale]/legal/terms`)
- Authenticated: profiles, cases, checklist items, documents, notifications, payments
- Admin only: `admin_activity_log` and admin case operations

## Privacy

- No emoji-only trust indicators in core UI
- Privacy and terms routes exist pre-launch
- Contact email and KvK placeholder shown in landing footer

## Security

- `BSN_ENCRYPTION_KEY` remains server-only
- BSN is encrypted with AES-256-GCM before DB storage (`profiles.bsn_key_id`, `profiles.bsn_ciphertext`)
- `profiles.bsn_encrypted` is legacy-only compatibility data and must not receive new writes
- Client never sends encrypted BSN fields; client submits plaintext BSN to server route (`/api/cases/draft`)
- A Content Security Policy is shipped at the framework header layer

## RLS

- RLS enabled for user data tables
- `service_pricing` readable for public pricing pages
- `admin_activity_log` restricted to admins via `public.is_admin()`

## Payments / Stripe

- Webhook verifies Stripe signature
- `checkout.session.completed` reads metadata (`case_id`, `user_id`, `case_type`)
- Checkout route requires an authenticated user, validates case ownership, and resolves pricing server-side
- Checkout route applies in-process rate limiting before creating Stripe sessions
- Payment inserts are idempotent via `stripe_checkout_session_id` unique index and duplicate checks
- Case status transitions to `paid` on successful checkout completion

## Audit / Operations

- Admin activity log is admin-only
- Admin case updates run through authenticated admin APIs and write `admin_activity_log`
- DSAR export requests are completed automatically with authenticated download delivery
- Notifications UI supports DB source + empty state + dev mock fallback
