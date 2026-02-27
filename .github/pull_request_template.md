## Summary
<!-- What changed and why -->

## Scope
- [ ] Documentation
- [ ] Frontend/UI
- [ ] API/Backend
- [ ] Database/RLS
- [ ] CI/DevEx

## Validation
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`

## Security Checklist
- [ ] No secrets exposed to client
- [ ] `BSN_ENCRYPTION_KEY` remains server-only
- [ ] Client does not send `bsn_encrypted`
- [ ] Auth and authorization paths reviewed
- [ ] Stripe webhook verification/idempotency unchanged or improved

## SEO Checklist (public routes affected)
- [ ] Metadata includes title/description
- [ ] Open Graph configured (image URL + dimensions)
- [ ] Twitter metadata configured
- [ ] Canonical and alternates/hreflang configured
- [ ] Robots directives reviewed
- [ ] Sitemap/robots metadata routes updated if needed

## i18n Checklist
- [ ] New user-facing strings localized for all supported locales
- [ ] Existing translation keys not broken

## Supabase / RLS Checklist
- [ ] Migration added if schema changed
- [ ] RLS policy impact reviewed
- [ ] Admin-only access paths validated

## Risk Review
- [ ] No existing functionality removed
- [ ] No broad refactor outside agreed scope

## Screenshots / Evidence (if UI changed)
<!-- Optional -->
