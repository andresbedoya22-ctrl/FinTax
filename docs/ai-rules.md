# AI Rules (Project Constitution)

## Workflow
- Mandatory sequence: `PLAN -> EXECUTE -> PR -> MERGE`.
- PLAN step must include: findings, file-by-file changes, commands, risks, acceptance criteria.
- EXECUTE starts only after explicit user approval (`EXECUTE`).
- MERGE only after CI checks pass.

## Definition of Done
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm test` passes
- `pnpm build` passes
- PR template checklist completed
- Security and RLS impact reviewed
- i18n coverage reviewed for changed user-facing copy
- SEO metadata reviewed for changed public routes

## Security Rules
- `BSN_ENCRYPTION_KEY` is server-only.
- Client must never send `bsn_encrypted`.
- Client sends plaintext BSN to server route (`/api/cases/draft`), server encrypts and stores.
- Never expose service-role keys or webhook secrets to client bundles.
- Keep Stripe webhook verification enabled.
- Preserve idempotency for payment write paths.

## Database and RLS Rules
- Keep RLS enabled on user data tables.
- User-facing reads/writes must respect user ownership policies.
- Admin operations must require explicit admin checks and admin-scoped policies.
- Any schema change must be in `supabase/migrations/*` with policy impact documented in PR.

## SEO Rules
- Every public route must define metadata:
  - title and description
  - Open Graph
  - Twitter
  - canonical
  - alternates/hreflang
  - robots directives
- Keep authenticated/private routes `noindex`.
- Keep sitemap and robots metadata routes up to date.

## Testing Rules
- No PR without running `pnpm qa` locally.
- Add or update tests when behavior changes.
- Avoid weakening assertions to force passing tests.

## i18n Rules
- No hardcoded user-facing copy in components if translations are already used in that surface.
- When adding new localized copy, update all supported locale files.
- Do not remove locale support from routing without explicit approval.

## Engineering Constraints
- No new npm packages without explicit approval.
- Follow `claude.md` UI and component rules.
- No `any` in TypeScript.
- No inline styles.
- No hardcoded colors outside token system.
