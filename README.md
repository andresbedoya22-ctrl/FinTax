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
Copy `.env.example` to `.env.local` and fill values.

Security-critical variables:
- `BSN_ENCRYPTION_KEY` must stay server-only
- `SUPABASE_SERVICE_ROLE_KEY` must stay server-only
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` must stay server-only

Public variables:
- `NEXT_PUBLIC_*`

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
- Webhook processing must remain idempotent

## Security notes
- Client sends plaintext BSN only to server routes
- Server encrypts BSN with `BSN_ENCRYPTION_KEY` before DB storage (`profiles.bsn_encrypted`)
- Do not move encryption to client code

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

## Governance docs
- [docs/ai-rules.md](docs/ai-rules.md)
- [docs/trust-checklist.md](docs/trust-checklist.md)
- [docs/backend-plan.md](docs/backend-plan.md)
