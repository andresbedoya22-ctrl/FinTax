# Backend v1 Plan

## Endpoint map (v1)
- `GET /api/cases`: list current user cases.
- `GET /api/cases/:id`: get one case for current user.
- `GET /api/cases/:id/checklist`: list checklist items for a user-owned case.
- `GET /api/notifications`: list current user notifications (`?limit=1..100`, default `20`).

## API contract
All v1 endpoints use a stable envelope.

- Success:
  - `{"data": <T>, "error": null, "meta"?: {...}}`
- Failure:
  - `{"data": null, "error": {"code": "<code>", "message"?: "<msg>"}, "meta"?: {...}}`

Error codes:
- `unauthorized`
- `invalid_payload`
- `invalid_params`
- `not_found`
- `forbidden`
- `conflict`
- `internal`

## Auth and RLS expectations
- Endpoints require authenticated Supabase user session.
- Reads use user-scoped Supabase server client (RLS-first).
- No admin client usage for read endpoints in v1.
- Ownership checks are explicit for case detail/checklist access.

## Env behavior
- Server validates required Supabase env vars before querying.
- Missing required env yields controlled `internal` error envelope.
- No silent mock success responses in API v1 routes.

## Mock replacement mapping
- `src/components/fintax/dashboard/DashboardSidebar.tsx`
  - current mock: `mockCases`
  - target API: `GET /api/cases`
- `src/components/fintax/dashboard/DashboardNotifications.tsx`
  - current mock fallback path
  - target API: `GET /api/notifications`
- `src/components/fintax/flows/CaseDetailView.tsx`
  - current mock: `getMockCase`, `mockChecklistByCase`
  - target APIs: `GET /api/cases/:id`, `GET /api/cases/:id/checklist`
- `src/app/[locale]/tax-return/[caseId]/page.tsx`
  - current mock: `getMockCase`
  - target API: `GET /api/cases/:id`
- `src/app/[locale]/benefits/[caseId]/page.tsx`
  - current mock: `getMockCase`
  - target API: `GET /api/cases/:id`
