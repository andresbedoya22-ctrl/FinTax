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
- BSN is encrypted with AES-256-GCM before DB storage (`profiles.bsn_encrypted`)
- Client never sends `bsn_encrypted`; client submits plaintext BSN to server route (`/api/cases/draft`)

## RLS

- RLS enabled for user data tables
- `service_pricing` readable for public pricing pages
- `admin_activity_log` restricted to admins via `public.is_admin()`

## Payments / Stripe

- Webhook verifies Stripe signature
- `checkout.session.completed` reads metadata (`case_id`, `user_id`, `case_type`)
- Payment inserts are idempotent via `stripe_checkout_session_id` unique index and duplicate checks
- Case status transitions to `paid` on successful checkout completion

## Audit / Operations

- Admin activity log is admin-only
- Notifications UI supports DB source + empty state + dev mock fallback

