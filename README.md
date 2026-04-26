# FinTax

FinTax is a Next.js App Router platform for multilingual Dutch tax and benefits workflows, with Supabase-backed data, Stripe payments, and strict security guardrails.

## Tech stack
- Next.js 16 (App Router), TypeScript, Tailwind CSS
- next-intl for localization
- Supabase (Auth, Postgres, RLS)
- Stripe Checkout + webhooks

## Prerequisites
- Node.js version from `.nvmrc`
- pnpm `10.x`
- Supabase project (or local Supabase CLI stack)
- Stripe test account for checkout/webhook testing

## Environment variables
Copy `.env.local.example` to `.env.local` and fill values.

Required for local app runtime:
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Required when using payments:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Required when using email notifications:
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Required when using encryption-backed personal data flows:
- `BSN_ENCRYPTION_KEY` or `BSN_ENCRYPTION_KEYS`
- Optional rotation aliases: `BSN_ENCRYPTION_KEY_CURRENT`, `BSN_ENCRYPTION_KEY_PREVIOUS`, `BSN_ENCRYPTION_ACTIVE_KEY_ID`

Optional / operational:
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `DOCFLOW_*`, `STAGING_*`, `PROD_*`
- `STRIPE_PRICE_*` reserved for a future Stripe price-id checkout path; current checkout pricing resolves from the `service_pricing` table

Validation:
- `src/lib/env.ts` is the central env contract.
- In production, missing critical Stripe/Supabase envs fail explicitly.
- Client code only consumes public env helpers; server secrets are not exposed through the public env object.

## Local development
1. Install dependencies:
   - `pnpm install`
2. Start dev server:
   - `pnpm dev`
3. Open:
   - `http://localhost:3000`

## Scripts
- `pnpm dev`: run Next.js dev server
- `pnpm lint`: strict ESLint
- `pnpm typecheck`: TypeScript no-emit checks
- `pnpm test`: repository tests
- `pnpm build`: production build
- `pnpm qa`: lint + typecheck + test + build
- `pnpm format`: Prettier format

## Quality gates
- Local: run `pnpm qa` before PR
- CI: GitHub Actions runs `pnpm qa` on pushes/PRs
- PRs: use `.github/pull_request_template.md` checklist

## Local pre-commit hook (no extra packages)
1. Enable project hooks:
   - `git config core.hooksPath .githooks`
2. Ensure `pnpm` is available in your shell
3. Commit normally; `pre-commit` runs lint + typecheck

Details: [docs/local-hooks.md](docs/local-hooks.md)

## Supabase
- Schema and RLS are in `supabase/migrations/*`
- Apply migrations through your normal Supabase workflow
- Keep RLS enabled for user-owned tables
- Admin-only access should use server-side role checks and policies

## Stripe
- Checkout route: `src/app/api/stripe/checkout/route.ts`
- Webhook route: `src/app/api/stripe/webhook/route.ts`
- Checkout validates authenticated ownership of the case and resolves pricing server-side
- Webhook processing must remain idempotent

## Security notes
- Client sends plaintext BSN only to server routes
- Server encrypts BSN with AES-256-GCM before DB storage using `profiles.bsn_key_id` + `profiles.bsn_ciphertext`
- `profiles.bsn_encrypted` is legacy compatibility only and should not receive new writes
- A baseline CSP is applied from `next.config.ts`
- Do not move encryption to client code

## Privacy / DSAR
- `POST /api/dsar` creates tracked requests with a 30-day due date
- Export requests are completed automatically and can be downloaded from `/api/dsar/[id]/export` after authentication
- Rectification and deletion requests remain tracked/manual in this iteration

## i18n
- Locales are configured in `src/i18n/routing.ts`
- Messages live in `messages/*.json`
- New user-facing strings should include all supported locales

## Folder structure
- `src/app`: routes, layouts, route handlers
- `src/components`: UI and feature components
- `src/lib`: integrations and domain utilities
- `src/hooks`: reusable React hooks
- `supabase/migrations`: SQL schema and RLS policies
- `docs`: governance/security/project docs
- `tests`: test suites

## SEO baseline
- Public routes should define robust metadata (title, description, OG, Twitter, canonical, alternates/hreflang, robots)
- Sitemap and robots are generated via Next.js metadata routes

## Deployment
Known deployment target is not declared in-repo. Safe default:
- Build with `pnpm build`
- Set all required env vars in the hosting platform
- Ensure webhook endpoint and secrets are configured per environment
- Configure a real `RESEND_FROM_EMAIL` in production
- Disable any mock fallback behavior outside local development

## Governance docs
- [docs/ai-rules.md](docs/ai-rules.md)
- [docs/trust-checklist.md](docs/trust-checklist.md)
- [docs/backend-plan.md](docs/backend-plan.md)
