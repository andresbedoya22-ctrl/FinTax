# Implementation Plan

## Delivery objective

Implement the new document-request workflow without breaking:

- auth/session flows,
- i18n routing,
- Stripe checkout/webhook,
- Supabase/RLS assumptions,
- middleware protection,
- case status stepper foundation.

## Execution strategy

Build the target flow in controlled layers. Do not attempt a one-shot rewrite.

## Phase 2 scope recommendation

Phase 2 should deliver the first production slice that is user-valuable:

- canonical tax-return intake contract,
- personalized requirement generation,
- real uploads,
- case detail based on persistent requirements,
- initial internal review surface for documents and requirements.

## Ordered work plan

### Workstream 1. Normalize intake contract

Backend:

- add `case_intake_snapshots` and supporting `cases` columns,
- define Zod server schema for tax-return intake payload,
- add intake save endpoint: `PUT /api/cases/:id/intake`,
- normalize payload into `derived_facts`,
- set `cases.current_intake_snapshot_id`,
- set top-level case summary fields such as `tax_year`, `origin_country_code`, `filing_route`.

Frontend:

- refactor `TaxReturnFlow.tsx` to save through the new intake endpoint,
- keep local storage only as resilience cache,
- expand wizard schema to collect required business inputs,
- stop treating wizard summary as the checklist authority.

Acceptance criteria:

- changing intake answers persists canonical backend data,
- reopening a case reconstructs the wizard from backend state,
- tax year and origin country are persisted as case facts.

### Workstream 2. Introduce requirement engine

Backend:

- add `requirement_templates`, `requirement_rule_sets`, `requirement_rules`, `case_requirements`,
- create server evaluator for the rules in `conditional-rules.md`,
- add requirement regeneration service,
- add endpoints:
  - `POST /api/cases/:id/requirements/regenerate`
  - `GET /api/cases/:id/requirements`
  - `GET /api/cases/:id/requirements/:requirementId`

Frontend:

- replace wizard faux checklist with preview messaging only, or with real backend requirements if available,
- update case detail to render real `case_requirements`,
- show help content and missing-action states.

Acceptance criteria:

- checklist changes when intake facts change,
- tax year affects requirement set,
- non-full-year NL registration triggers origin-country income certificate requirement.

### Workstream 3. Real uploads

Backend:

- create storage bucket/policies,
- add `document_upload_sessions` and `requirement_documents`,
- add endpoints:
  - `POST /api/cases/:id/documents/upload-session`
  - `POST /api/cases/:id/documents/finalize`
  - `GET /api/cases/:id/documents`
  - `DELETE /api/cases/:id/documents/:documentId`
- enforce MIME/size/ownership validation on server,
- bind uploaded documents to requirement rows.

Frontend:

- replace in-memory uploads in `CaseDetailView.tsx`,
- show upload states, per-requirement file list, retry/delete flows,
- show validation errors from server.

Acceptance criteria:

- files survive refresh,
- uploads are visible to admins,
- requirement progress updates from real document state.

### Workstream 4. Internal review surface

Backend:

- add review endpoints:
  - `PATCH /api/admin/cases/:id/requirements/:requirementId`
  - `PATCH /api/admin/cases/:id/documents/:documentId`
- add `case_events`,
- emit events for upload/review/request-more-info/state changes.

Frontend:

- add admin requirement/document review modules,
- show reviewer notes and rejection reasons,
- show client timeline from `case_events`.

Acceptance criteria:

- admin can approve/reject evidence,
- client sees actionable next steps,
- case can move between `pending_documents` and `in_review` based on real blockers.

### Workstream 5. Progressive cleanup

- remove dependency on `checklist_items` from user-facing tax-return flow,
- retire fake activity items,
- align dashboard document progress with `case_requirements`,
- optionally backfill or bridge old cases.

## API plan

### User-facing endpoints

- `PUT /api/cases/:id/intake`
- `GET /api/cases/:id/intake`
- `GET /api/cases/:id/requirements`
- `GET /api/cases/:id/requirements/:requirementId`
- `POST /api/cases/:id/documents/upload-session`
- `POST /api/cases/:id/documents/finalize`
- `GET /api/cases/:id/documents`
- `POST /api/cases/:id/authorization-code`
- `GET /api/cases/:id/events`

### Admin endpoints

- `GET /api/admin/cases/:id/summary`
- `PATCH /api/admin/cases/:id/requirements/:requirementId`
- `PATCH /api/admin/cases/:id/documents/:documentId`
- `GET /api/admin/requirements/queue`

## Frontend plan

### Wizard

- expand step model to ask:
  - tax year first,
  - residency/registration facts,
  - household applicability,
  - income applicability branches,
  - housing/debt/assets applicability branches,
  - deductions applicability,
  - review/confirmation.

- keep the existing stepper shell and visual language,
- move conditional logic from copy-only toggles to shared typed facts.

### Case detail

Turn `CaseDetailView.tsx` into the primary execution workspace:

- overview tab:
  - case summary, filing route, tax year, blocking items.
- documents tab:
  - grouped by requirement category,
  - per-requirement upload cards,
  - “how to obtain it” help panel,
  - status and reviewer notes.
- authorization tab:
  - persist real code if required by the case.
- activity tab:
  - real timeline from `case_events`.

### Dashboard

- switch progress calculations to `case_requirements`,
- remove fallback checklist dependence for active tax-return cases,
- expose blockers clearly.

## Data migration and compatibility

Short-term:

- existing cases with only `wizard_data` keep working in read mode,
- new requirement flow activates only when an intake snapshot exists.

Mid-term:

- provide a backfill script that reads `wizard_data`,
- generates first intake snapshot and requirement set for active draft/pending cases,
- logs migration provenance.

## Testing plan

### Unit tests

- rule evaluation by tax year and input permutations,
- intake normalization,
- upload validation,
- requirement progress aggregation,
- status transition guards.

### Integration tests

- create draft -> save intake -> generate requirements,
- upload file -> finalize -> review approve/reject,
- intake change -> regenerate requirements preserving valid approved items,
- user isolation through RLS.

### UI tests

- wizard conditional visibility,
- case detail requirement rendering,
- upload error handling,
- admin review actions,
- dashboard progress calculations.

## Definition of done for phase 2

- backend owns checklist truth,
- backend owns upload validation and persistence,
- checklist is tax-year and origin-country aware,
- client sees real progress and requirement help,
- internal team can review a case professionally from within the product,
- old fake upload and fake activity behavior is removed from the tax-return path.
