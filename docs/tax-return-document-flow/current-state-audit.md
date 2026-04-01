# Current State Audit

Date: 2026-04-01
Branch audited: `main` -> blueprint authored on `feat/tax-return-docflow-blueprint`

## Executive assessment

FinTax already has the skeleton of a tax-return case workspace:

- authenticated case pages exist,
- tax-return intake wizard exists,
- case detail screen exists,
- tax-return status stepper and transitions exist,
- case/checklist/document tables exist in Supabase,
- admin case operations exist,
- i18n coverage exists for user-facing copy.

However, the current declaration flow is not yet a production-grade document collection workflow. The largest gaps are:

- wizard persistence is local-storage-first and only partially mirrored to `cases.wizard_data`,
- there is no checklist generation engine,
- there is no real document upload backend,
- there is no document review workflow with structured internal operations,
- there is no data model for requirement templates, conditional rules, or per-requirement help,
- tax year exists only as a field, not as a rules driver,
- country of origin exists only on `profiles`, not as a case fact used by tax-return rules,
- wizard and case-detail surfaces duplicate responsibility instead of sharing one case workflow.

## What already exists and is reusable

### Reusable frontend assets

- `src/components/fintax/flows/TaxReturnFlow.tsx`
  - multi-step intake shell with progress header and step orchestration.
- `src/components/fintax/flows/tax-return/wizard.ts`
  - typed wizard schema, normalization helpers, default values, step field mapping.
- `src/components/fintax/flows/CaseDetailView.tsx`
  - authenticated case workspace shell with tabs for overview, documents, authorization, and activity.
- `src/domain/cases/status-stepper.ts`
  - user-facing stepper mapping for case lifecycle.
- `src/domain/cases/status-transitions.ts`
  - explicit allowed status transitions for admin operations.
- `src/components/fintax/dashboard/DashboardOverview.tsx`
  - dashboard visualizations for checklist progress, active case summary, and case history.

### Reusable backend/domain assets

- `src/app/api/cases/route.ts`
  - authenticated case listing endpoint.
- `src/app/api/cases/[id]/route.ts`
  - authenticated case detail endpoint.
- `src/app/api/cases/[id]/checklist/route.ts`
  - authenticated checklist retrieval endpoint.
- `src/app/api/cases/draft/route.ts`
  - draft case creation endpoint.
- `src/app/api/admin/cases/route.ts`
  - admin case listing endpoint with profile joins.
- `src/app/api/admin/cases/[id]/route.ts`
  - admin status/note assignment endpoint and activity logging.
- `supabase/migrations/001_initial_schema.sql`
  - base tables for `cases`, `checklist_items`, `documents`, `notifications`, `payments`, `admin_activity_log`.
- `supabase/migrations/007_security_and_idempotency_fixes.sql`
  - tighter RLS for profiles/cases/documents and trigger-based protection of sensitive document fields.

### Reusable domain concepts

- `cases.status`
  - already models draft, pending docs, review, submission, completion.
- `checklist_items`
  - basic per-case requirement surface.
- `documents`
  - basic per-case/per-user uploaded file surface.
- `admin_activity_log`
  - usable base for internal audit events.

These are sufficient building blocks for a real implementation, but not sufficient alone.

## Current flow behavior

### Tax-return wizard

`TaxReturnFlow.tsx`:

- runs entirely client-side,
- stores progress in local storage under keys like `fintax-tax-${service}`,
- creates a draft case only when the user reaches past identity,
- updates `cases.wizard_data` opportunistically via Supabase client in `persistWizardSnapshot`,
- does not submit a full structured intake contract to the backend,
- does not create or refresh checklist items,
- does not create document requests,
- does not expose backend-driven progress.

`src/lib/wizards/persistence.ts`:

- persists sanitized data locally,
- nulls `bsn` before persistence,
- updates `cases.wizard_data` directly from the browser,
- does not lock or version the intake structure,
- does not prevent partial shape drift between wizard versions.

### Wizard schema

`src/components/fintax/flows/tax-return/wizard.ts` currently captures:

- full name,
- BSN,
- tax year,
- coarse residency type,
- filing status / partner flag,
- broad income profile,
- broad housing / assets / deductions,
- simple submission preferences.

It does not capture the business-critical inputs required by the target flow:

- first declaration with FinTax,
- first NL registration date,
- registration interruption periods,
- re-establishment date in NL,
- date of emigration / deregistration,
- whether registered in NL for the full tax year,
- country of origin for the relevant fiscal year,
- origin-country income certificate need,
- child registration on same address,
- structured multiple employers,
- UWV/transitievergoeding/ZZP sub-flows,
- 1225-hour confirmation for self-employed cases,
- mortgage/SVN/consumer debt details as structured switches,
- bank/savings accounts split by NL vs foreign,
- crypto values on both 01/01 and 31/12,
- requirement-level “how to obtain it” guidance.

### Checklist UX

There are two checklist representations today:

1. `TaxReturnDocumentChecklist.tsx`
2. `CaseDetailView.tsx` plus `DashboardOverview.tsx`

`TaxReturnDocumentChecklist.tsx`:

- is a derived UI-only checklist from form values,
- does not use backend checklist records,
- does not represent real document requests,
- has no requirement IDs, statuses, evidence binding, or internal review state.

`CaseDetailView.tsx` checklist:

- renders backend `checklist_items`,
- assumes checklist already exists,
- only shows label and completion,
- has no notion of requirement category, mandatory/optional state, blocking state, due state, or missing reason,
- has no contextual guidance,
- has no document binding UI.

This is a real duplication gap: the wizard displays a faux checklist, while the case detail displays persisted checklist items. There is no shared requirement engine or shared requirement model.

### Case detail and documents

`CaseDetailView.tsx` documents tab currently:

- accepts files in the browser,
- filters locally by MIME and file size,
- creates in-memory `Document` objects with `local/...` paths,
- stores them only in React state,
- does not call any upload API,
- does not write to Supabase storage,
- does not create document database rows,
- does not attach uploads to checklist items,
- does not persist after refresh.

This is the clearest fake persistence in the current flow.

### Authorization / machtiging

The repo does have authorization copy and case fields:

- `cases.machtiging_status`
- `cases.machtiging_code`
- `CaseDetailView` authorization tab

But current UI only renders an input. No save endpoint exists for the activation code, and no explicit DigiD integration exists. Current repo supports authorization messaging, not an automated DigiD flow.

### Admin operations

`AdminScreen.tsx` plus `api/admin/cases/*` already provide:

- case listing,
- status changes,
- internal notes,
- assign-to-self,
- activity log entry on update,
- email notification on selected admin updates.

This is reusable but too generic for serious document review because it lacks:

- checklist/request review queue,
- document review queue,
- per-document rejection reasons,
- reviewer decision history,
- internal structured intake summary,
- blocking reasons,
- SLA / due-state indicators,
- rule evaluation provenance.

## Current data model assessment

### What exists

Current tables relevant to this flow:

- `profiles`
- `cases`
- `checklist_items`
- `documents`
- `notifications`
- `admin_activity_log`

### What is too generic

`cases.wizard_data JSONB` currently absorbs most intake meaning. That is useful for early iteration, but too generic for production because:

- it makes rules opaque,
- it weakens validation/versioning,
- it prevents targeted querying,
- it couples UI field shape to backend state,
- it makes internal review hard to reason about,
- it offers no schema versioning or evidence lineage.

`checklist_items` is also too generic for the target because it stores only:

- label,
- label key,
- description,
- upload flag,
- completion flag,
- linked document id,
- sort order.

It does not store:

- requirement code,
- source rule,
- requirement category,
- blocking severity,
- conditional state,
- applicability reason,
- help content,
- document cardinality,
- accepted MIME classes,
- accepted count range,
- review status,
- missing explanation,
- requester/reviewer timestamps.

### What is currently only persisted locally or effectively fake

- wizard progress: local storage first, partial DB mirror second,
- document uploads: React state only,
- checklist inside wizard: derived/fake,
- activity list in case detail: static translation strings, not real events,
- authorization code submission: UI only, no persistence route.

## Tax year support: current state vs target need

### What exists

- `cases.tax_year`
- wizard `filing.taxYear`
- dashboard/history rendering of tax year

### What is missing

- tax-year constrained supported values from backend,
- tax-year aware requirement templates,
- tax-year aware help content,
- tax-year aware rules for checklist generation,
- tax-year aware document labels,
- tax-year aware cutoff logic,
- tax-year aware migration/residency questions.

Current implementation treats tax year as display metadata, not as a rules dimension.

## Country of origin support: current state vs target need

### What exists

- `profiles.country_of_origin`

### What is missing

- case-scoped origin-country field,
- distinction between nationality, origin country, and non-NL tax residence,
- per-tax-year relevance,
- country-specific evidence generation,
- use of the field in checklist rules,
- “certificate of income from origin country” requirement logic.

Current state is not Spain-hardcoded, but it also is not operationally implemented.

## Internal review readiness

Current repo is not yet ready for serious internal review. Missing pieces:

- structured intake normalization for admins,
- canonical checklist/request history,
- canonical document list per requirement,
- review decisions per document and per requirement,
- request/rejection comments,
- event timeline based on real state changes,
- explicit “ready for internal review” gate,
- explicit “blocked by missing document X” markers,
- distinction between client-uploaded evidence and internally produced outputs.

## API map gaps

### Existing endpoints

- `GET /api/cases`
- `GET /api/cases/:id`
- `GET /api/cases/:id/checklist`
- `POST /api/cases/draft`
- `GET /api/admin/cases`
- `PATCH /api/admin/cases/:id`

### Missing endpoints required by target flow

- case intake save/update endpoint with schema validation,
- checklist generation / refresh endpoint,
- requirement detail endpoint,
- document upload session endpoint,
- document metadata create/finalize endpoint,
- document list endpoint,
- document delete/replace endpoint,
- document review endpoint,
- authorization code save endpoint,
- case event timeline endpoint,
- internal review summary endpoint,
- admin requirement queue endpoint,
- admin document queue endpoint.

### Endpoint inconsistency already present

`useTaxSummary.ts` calls `/api/cases/:id/tax-summary`, but that route does not exist in `src/app/api`. The hook currently falls back to case data after a failed fetch. This confirms current backend/API drift.

## Risks already visible in current state

### Security/integrity

- client-driven direct updates to `cases.wizard_data` can create schema drift and uncontrolled partial writes,
- no production upload endpoint means no authoritative server-side MIME/type/size validation,
- no documented Supabase storage bucket policy for documents,
- document records are modeled, but upload transport and scanning pipeline do not exist,
- sensitive business logic is currently frontend-driven in wizard normalization.

### UX

- user sees checklist-like UI before a real checklist exists,
- user can “upload” files that disappear on refresh,
- case detail progress can diverge from wizard expectations,
- timeline/activity panel implies operational events that are not actually tracked.

### Data/privacy

- sensitive tax facts remain embedded in generic `wizard_data`,
- country-of-origin and residency logic are not case-scoped,
- internal review state is not normalized,
- no explicit document retention/replace/archive handling by requirement.

## Conclusion

The repo has a strong enough baseline to implement a serious tax-return document collection workflow without starting over. The right path is a controlled evolution:

- keep the existing case lifecycle foundation,
- replace fake checklist and fake upload behavior with backend-owned requirement records and file lifecycle,
- promote tax year and origin-country inputs into canonical case intake data,
- add a rules engine that emits persistent requirement rows,
- give internal operations a first-class review surface backed by auditable events.
