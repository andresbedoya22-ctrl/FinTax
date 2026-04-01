# Data Model Plan

## Data model strategy

Do not replace `cases`, `checklist_items`, and `documents` immediately. Extend the model in a way that:

- keeps current case pages functional during transition,
- introduces normalized requirement and intake structures,
- allows checklist generation and upload/review to become backend-driven,
- supports rule versioning by tax year.

## Recommended model evolution

### Keep

- `profiles`
- `cases`
- `documents`
- `admin_activity_log`
- `notifications`

### Evolve

- repurpose `checklist_items` into a richer requirement table, or
- introduce a new `case_requirements` table and later migrate away from `checklist_items`.

Recommended approach: add new tables instead of overloading `checklist_items` further.

## Proposed tables

### `case_intake_snapshots`

Columns:

- `id UUID PK`
- `case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE`
- `schema_version TEXT NOT NULL`
- `normalization_version TEXT NOT NULL`
- `source TEXT NOT NULL CHECK (source IN ('wizard','admin','migration'))`
- `payload JSONB NOT NULL`
- `derived_facts JSONB NOT NULL DEFAULT '{}'::jsonb`
- `created_by UUID NULL REFERENCES profiles(id)`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`

### `requirement_templates`

Columns:

- `id UUID PK`
- `code TEXT NOT NULL UNIQUE`
- `case_type case_type NOT NULL`
- `category TEXT NOT NULL`
- `title_i18n_key TEXT NOT NULL`
- `description_i18n_key TEXT NULL`
- `help_i18n_key TEXT NULL`
- `evidence_type TEXT NOT NULL`
- `accepted_mime_groups TEXT[] NOT NULL DEFAULT '{}'`
- `max_file_size_mb INTEGER NOT NULL`
- `min_files INTEGER NOT NULL DEFAULT 0`
- `max_files INTEGER NULL`
- `is_blocking BOOLEAN NOT NULL DEFAULT true`
- `active_from_tax_year INTEGER NULL`
- `active_to_tax_year INTEGER NULL`
- `metadata JSONB NOT NULL DEFAULT '{}'::jsonb`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

### `requirement_rule_sets`

Columns:

- `id UUID PK`
- `case_type case_type NOT NULL`
- `tax_year INTEGER NOT NULL`
- `version TEXT NOT NULL`
- `status TEXT NOT NULL CHECK (status IN ('draft','active','retired'))`
- `notes TEXT NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

Unique:

- one active rule set per `(case_type, tax_year)`.

### `requirement_rules`

Columns:

- `id UUID PK`
- `rule_set_id UUID NOT NULL REFERENCES requirement_rule_sets(id) ON DELETE CASCADE`
- `template_id UUID NOT NULL REFERENCES requirement_templates(id) ON DELETE CASCADE`
- `condition_key TEXT NOT NULL`
- `condition_payload JSONB NOT NULL`
- `sort_order INTEGER NOT NULL DEFAULT 0`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`

Note:

- `condition_key` maps to typed backend evaluators. Do not store ad-hoc JS expressions in the DB.

### `case_requirements`

Columns:

- `id UUID PK`
- `case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE`
- `template_id UUID NULL REFERENCES requirement_templates(id)`
- `snapshot_id UUID NOT NULL REFERENCES case_intake_snapshots(id) ON DELETE CASCADE`
- `rule_set_id UUID NOT NULL REFERENCES requirement_rule_sets(id)`
- `requirement_code TEXT NOT NULL`
- `category TEXT NOT NULL`
- `title TEXT NOT NULL`
- `description TEXT NULL`
- `help_content JSONB NULL`
- `status TEXT NOT NULL CHECK (status IN ('pending','uploaded','approved','rejected','waived','not_applicable'))`
- `is_blocking BOOLEAN NOT NULL DEFAULT true`
- `is_document_required BOOLEAN NOT NULL DEFAULT true`
- `min_files INTEGER NOT NULL DEFAULT 0`
- `max_files INTEGER NULL`
- `sort_order INTEGER NOT NULL DEFAULT 0`
- `applicability_reason JSONB NULL`
- `review_notes TEXT NULL`
- `requested_at TIMESTAMPTZ NULL`
- `first_completed_at TIMESTAMPTZ NULL`
- `reviewed_at TIMESTAMPTZ NULL`
- `reviewed_by UUID NULL REFERENCES profiles(id)`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

### `requirement_documents`

Columns:

- `id UUID PK`
- `requirement_id UUID NOT NULL REFERENCES case_requirements(id) ON DELETE CASCADE`
- `document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE`
- `is_primary BOOLEAN NOT NULL DEFAULT true`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`

### `document_upload_sessions`

Columns:

- `id UUID PK`
- `case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE`
- `requirement_id UUID NULL REFERENCES case_requirements(id)`
- `user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE`
- `intended_filename TEXT NOT NULL`
- `mime_type TEXT NOT NULL`
- `file_size_bytes BIGINT NOT NULL`
- `storage_path TEXT NOT NULL`
- `status TEXT NOT NULL CHECK (status IN ('issued','uploaded','expired','finalized','cancelled'))`
- `expires_at TIMESTAMPTZ NOT NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`

### `case_events`

Columns:

- `id UUID PK`
- `case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE`
- `actor_type TEXT NOT NULL CHECK (actor_type IN ('user','admin','system'))`
- `actor_id UUID NULL REFERENCES profiles(id)`
- `event_type TEXT NOT NULL`
- `visibility TEXT NOT NULL CHECK (visibility IN ('internal','client','both'))`
- `payload JSONB NOT NULL DEFAULT '{}'::jsonb`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`

## Recommended additions to existing tables

### `cases`

Add:

- `origin_country_code TEXT NULL`
- `residency_pattern TEXT NULL`
- `filing_route TEXT NULL`
- `active_rule_set_id UUID NULL REFERENCES requirement_rule_sets(id)`
- `current_intake_snapshot_id UUID NULL REFERENCES case_intake_snapshots(id)`
- `requirements_completion_ratio NUMERIC(5,2) NULL`
- `blocking_requirements_count INTEGER NOT NULL DEFAULT 0`
- `last_client_submission_at TIMESTAMPTZ NULL`
- `last_requirement_refresh_at TIMESTAMPTZ NULL`

### `documents`

Add:

- `upload_session_id UUID NULL REFERENCES document_upload_sessions(id)`
- `storage_provider TEXT NOT NULL DEFAULT 'supabase_storage'`
- `storage_bucket TEXT NULL`
- `storage_object_key TEXT NULL`
- `sha256_checksum TEXT NULL`
- `upload_state TEXT NOT NULL DEFAULT 'uploaded'`
- `replaced_by_document_id UUID NULL REFERENCES documents(id)`
- `deleted_at TIMESTAMPTZ NULL`
- `deleted_by UUID NULL REFERENCES profiles(id)`

## Derived facts contract

The checklist engine should evaluate `derived_facts`, not raw UI payload shape.

Recommended `derived_facts` families:

- `filing.tax_year`
- `filing.route`
- `filing.first_declaration_with_fintax`
- `residency.was_registered_full_year_in_nl`
- `residency.has_registration_interruption`
- `residency.requires_origin_income_certificate`
- `household.has_children_registered_same_address`
- `income.has_employment`
- `income.employer_count`
- `income.has_uwv`
- `income.has_transitievergoeding`
- `income.has_zzp`
- `income.zzp_hours_over_1225`
- `housing.has_mortgage`
- `housing.has_svn_loan`
- `debts.has_consumer_loans`
- `assets.has_foreign_accounts`
- `assets.has_crypto`
- `deductions.has_medical_costs`

## Migration approach

1. Create new normalized tables.
2. Add non-breaking columns to `cases` and `documents`.
3. Add RLS policies for new tables.
4. Keep existing `checklist_items` reads untouched until new endpoints/UI are ready.
5. Switch UI to `case_requirements`.
6. Decommission `checklist_items` only after cutover and verification.

## RLS strategy

### User access

Users may:

- read own `case_intake_snapshots` if required for case UI,
- read own `case_requirements`,
- create own `document_upload_sessions`,
- read own `documents`,
- insert own `documents`,
- read client-visible `case_events`.

Users may not:

- mark requirements approved/rejected,
- edit review notes,
- mutate internal visibility events,
- rebind documents across cases.

### Admin access

Admins may:

- manage `case_requirements`,
- review `documents`,
- insert internal and client-visible `case_events`,
- update case summary fields,
- waive requirements with reason.

## Why this model supports the requested business rules

It supports:

- tax-year aware rule activation,
- generic Europe origin-country handling,
- personalized checklist generation,
- real uploads per requirement,
- contextual “how to obtain it” help,
- serious internal review with auditability.
