# Target Architecture

## Architectural goal

Replace manual email-based document chasing with a case-centric workflow where:

1. client intake captures structured facts,
2. backend rules derive the required document checklist,
3. clients upload real evidence into controlled storage,
4. internal reviewers process evidence against explicit requirements,
5. case progression is driven by persisted requirement/document state rather than ad-hoc manual interpretation.

## Design principles

- Backend owns truth for checklist applicability, upload state, and review state.
- Frontend may preview requirement expectations, but only persisted backend requirements drive case status.
- Tax year and origin-country logic must be configuration-driven, not copy-driven.
- Checklist generation must be deterministic and repeatable from persisted intake data plus rule version.
- Requirements and documents must be auditable independently.
- Internal review must operate on normalized records, not on free-form `wizard_data` inspection alone.
- PII and tax-sensitive files must flow through least-privilege storage and RLS boundaries.

## Proposed logical architecture

### 1. Client intake layer

Purpose:

- capture structured declaration facts,
- progressively reveal relevant questions,
- save drafts safely,
- submit an intake payload to backend.

Key rule:

- the wizard becomes a client for a case-intake contract; it stops being the primary owner of business logic.

### 2. Case intake service

Purpose:

- validate payload by schema version,
- normalize answers,
- persist canonical case intake snapshot,
- stamp `tax_year`, `origin_country`, `filing_route`, `residency_pattern`,
- trigger checklist generation.

Primary output:

- one canonical intake snapshot per case version,
- one generated requirement set per case version/rule version.

### 3. Checklist generation engine

Purpose:

- evaluate conditional rules against normalized intake data,
- emit persistent requirement rows,
- mark requirements as applicable / not applicable / satisfied by fact / awaiting document,
- attach document guidance and help content.

Key characteristics:

- deterministic,
- versioned,
- rerunnable,
- rule-traceable.

### 4. Document upload service

Purpose:

- issue signed upload targets or controlled upload sessions,
- validate MIME type, extension, size, and ownership,
- create document metadata rows,
- bind evidence to one or more requirement rows,
- expose review-safe download/access patterns.

### 5. Review operations layer

Purpose:

- show case summary and missing blockers,
- review requirement-by-requirement,
- accept/reject documents,
- request re-upload with explicit reasons,
- move case status through review milestones.

### 6. Case event timeline

Purpose:

- record client-visible and internal events from real actions,
- remove fake activity text,
- support audit, support, and operations.

## Canonical workflow

### Client side

1. User starts or opens a tax return case.
2. User selects tax year.
3. User answers applicability questions.
4. Frontend saves draft locally for resilience and server-side for truth.
5. Backend persists normalized intake.
6. Backend generates requirement set.
7. Client sees personalized checklist with real requirement statuses.
8. Client uploads documents per requirement.
9. Client sees real progress by requirement completion and document review state.

### Internal side

1. Reviewer opens case summary.
2. Reviewer sees intake facts, rule-evaluated checklist, uploads, and blockers.
3. Reviewer marks documents approved/rejected or requests more evidence.
4. Reviewer advances case once blocking requirements are satisfied.
5. Submission happens only after case is materially complete and authorization/payment states align.

## Recommended bounded contexts

### Case context

Owns:

- case core identity,
- lifecycle status,
- assigned admin,
- tax year,
- filing route,
- deadlines.

### Intake context

Owns:

- structured answers,
- schema version,
- normalization version,
- derived facts.

### Requirements context

Owns:

- generated checklist rows,
- requirement templates,
- conditional applicability,
- help content references,
- blocking semantics.

### Documents context

Owns:

- upload sessions,
- file metadata,
- storage path conventions,
- review decisions,
- secure retrieval.

### Operations context

Owns:

- admin queues,
- case summary,
- internal notes,
- activity/event log,
- SLA and blocker visibility.

## Case lifecycle proposal

Retain existing statuses but add operational meaning:

- `draft`
  - intake started, checklist may be partially generated.
- `pending_payment`
  - payment needed before full service continuation.
- `pending_authorization`
  - authorization requested and blocking later filing.
- `pending_documents`
  - at least one blocking requirement awaits valid evidence.
- `in_review`
  - all currently blocking evidence submitted; internal review in progress.
- `submitted`
  - declaration submitted.
- `completed`
  - filing process completed.
- `rejected`
  - case cannot continue without major correction or scope reset.

Recommendation:

- keep the database enum unchanged in phase 2 if possible,
- represent finer-grained operational states through requirement/document states and timeline events rather than exploding the main case status enum too early.

## Requirement lifecycle proposal

Each requirement should carry a lifecycle independent of the case:

- `pending`
- `uploaded`
- `approved`
- `rejected`
- `waived`
- `not_applicable`

## Document lifecycle proposal

- `uploading`
- `uploaded`
- `under_review`
- `approved`
- `rejected`
- `replaced`
- `archived`

Current enum only covers part of this; extend in a later migration.

## Storage architecture

Use Supabase Storage or equivalent object storage with a strict bucket strategy:

- bucket: `case-documents`
- path convention:
  - `{user_id}/{case_id}/{requirement_id}/{document_id}-{safe_filename}`

Rules:

- clients never write arbitrary final paths directly,
- upload session endpoint issues controlled path and signed upload permission,
- downloads should use short-lived signed URLs or proxy responses,
- raw storage paths should not be exposed as stable public URLs.

## Source of truth hierarchy

1. database case/intake/requirement/document rows
2. storage objects tied to document rows
3. timeline/audit events
4. local draft cache for resilience only

Local storage must never be the authoritative source for checklist or upload state.

## i18n architecture recommendation

Separate translation responsibilities:

- UI chrome and generic labels remain in `messages/*.json`
- requirement help content and “how to obtain” guidance should live in structured backend-managed templates or versioned configuration files, not only in frontend messages

Reason:

- requirement texts are business content tied to rule/version evolution,
- they need versioning and auditability alongside tax-year changes.

## Why this architecture fits the current repo

It preserves:

- Next.js App Router,
- next-intl routing,
- Supabase auth and RLS model,
- case status stepper foundation,
- admin case operations,
- Stripe flows,
- middleware protections.

It changes:

- checklist truth ownership,
- upload implementation,
- intake persistence contract,
- operational review capabilities.
