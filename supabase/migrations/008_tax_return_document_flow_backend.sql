ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS origin_country_code TEXT,
  ADD COLUMN IF NOT EXISTS residency_pattern TEXT,
  ADD COLUMN IF NOT EXISTS filing_route TEXT,
  ADD COLUMN IF NOT EXISTS current_intake_snapshot_id UUID,
  ADD COLUMN IF NOT EXISTS active_rule_set_id UUID,
  ADD COLUMN IF NOT EXISTS requirements_completion_ratio NUMERIC(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS blocking_requirements_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS requirements_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS last_client_submission_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_requirement_refresh_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'requirement_type'
  ) THEN
    CREATE TYPE public.requirement_type AS ENUM ('info', 'document', 'boolean', 'date', 'list', 'confirmation');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'requirement_status'
  ) THEN
    CREATE TYPE public.requirement_status AS ENUM ('pending', 'uploaded', 'approved', 'rejected', 'waived', 'not_applicable');
  END IF;
END
$$;

ALTER TYPE public.document_status ADD VALUE IF NOT EXISTS 'uploading';
ALTER TYPE public.document_status ADD VALUE IF NOT EXISTS 'replaced';
ALTER TYPE public.document_status ADD VALUE IF NOT EXISTS 'archived';

CREATE TABLE IF NOT EXISTS public.case_intake_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  schema_version TEXT NOT NULL,
  normalization_version TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('wizard', 'admin', 'migration', 'api')),
  payload JSONB NOT NULL,
  derived_facts JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS case_intake_snapshots_case_created_idx
  ON public.case_intake_snapshots (case_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.requirement_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  case_type case_type NOT NULL,
  section TEXT NOT NULL,
  requirement_type public.requirement_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  accepted_mime_types TEXT[] NOT NULL DEFAULT '{}'::text[],
  max_file_size_bytes BIGINT NOT NULL DEFAULT 10485760,
  min_files INTEGER NOT NULL DEFAULT 0,
  max_files INTEGER,
  is_blocking BOOLEAN NOT NULL DEFAULT true,
  active_from_tax_year INTEGER,
  active_to_tax_year INTEGER,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT requirement_templates_file_bounds CHECK (max_files IS NULL OR max_files >= min_files)
);

CREATE INDEX IF NOT EXISTS requirement_templates_case_type_idx
  ON public.requirement_templates (case_type, section, code);

CREATE TABLE IF NOT EXISTS public.requirement_help_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_code TEXT NOT NULL UNIQUE,
  version TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.requirement_rule_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_type case_type NOT NULL,
  tax_year INTEGER NOT NULL,
  version TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'retired')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS requirement_rule_sets_active_unique_idx
  ON public.requirement_rule_sets (case_type, tax_year)
  WHERE status = 'active';

CREATE TABLE IF NOT EXISTS public.requirement_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_set_id UUID NOT NULL REFERENCES public.requirement_rule_sets(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.requirement_templates(id) ON DELETE CASCADE,
  condition_key TEXT NOT NULL,
  condition_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  cardinality_key TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS requirement_rules_rule_set_idx
  ON public.requirement_rules (rule_set_id, sort_order);

CREATE TABLE IF NOT EXISTS public.case_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.requirement_templates(id),
  snapshot_id UUID NOT NULL REFERENCES public.case_intake_snapshots(id) ON DELETE CASCADE,
  rule_set_id UUID NOT NULL REFERENCES public.requirement_rule_sets(id),
  requirement_code TEXT NOT NULL,
  instance_key TEXT NOT NULL DEFAULT 'default',
  section TEXT NOT NULL,
  requirement_type public.requirement_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  help_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  status public.requirement_status NOT NULL DEFAULT 'pending',
  is_blocking BOOLEAN NOT NULL DEFAULT true,
  is_document_required BOOLEAN NOT NULL DEFAULT true,
  min_files INTEGER NOT NULL DEFAULT 0,
  max_files INTEGER,
  accepted_mime_types TEXT[] NOT NULL DEFAULT '{}'::text[],
  max_file_size_bytes BIGINT NOT NULL DEFAULT 10485760,
  sort_order INTEGER NOT NULL DEFAULT 0,
  applicability_reason JSONB NOT NULL DEFAULT '{}'::jsonb,
  answer_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  customer_note TEXT,
  availability_status TEXT NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'not_yet_available')),
  availability_note TEXT,
  availability_marked_at TIMESTAMPTZ,
  review_notes TEXT,
  rejection_reason TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_completed_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT case_requirements_file_bounds CHECK (max_files IS NULL OR max_files >= min_files)
);

CREATE UNIQUE INDEX IF NOT EXISTS case_requirements_case_code_instance_idx
  ON public.case_requirements (case_id, requirement_code, instance_key);

CREATE INDEX IF NOT EXISTS case_requirements_case_section_idx
  ON public.case_requirements (case_id, section, sort_order);

CREATE INDEX IF NOT EXISTS case_requirements_case_status_idx
  ON public.case_requirements (case_id, status, is_blocking);

CREATE TABLE IF NOT EXISTS public.document_upload_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES public.case_requirements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  intended_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'case-documents',
  storage_path TEXT NOT NULL UNIQUE,
  replaces_document_id UUID REFERENCES public.documents(id),
  status TEXT NOT NULL CHECK (status IN ('issued', 'uploaded', 'expired', 'finalized', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finalized_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS document_upload_sessions_case_idx
  ON public.document_upload_sessions (case_id, requirement_id, created_at DESC);

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS upload_session_id UUID REFERENCES public.document_upload_sessions(id),
  ADD COLUMN IF NOT EXISTS storage_provider TEXT NOT NULL DEFAULT 'supabase_storage',
  ADD COLUMN IF NOT EXISTS storage_bucket TEXT,
  ADD COLUMN IF NOT EXISTS storage_object_key TEXT,
  ADD COLUMN IF NOT EXISTS sha256_checksum TEXT,
  ADD COLUMN IF NOT EXISTS upload_state TEXT NOT NULL DEFAULT 'uploaded' CHECK (upload_state IN ('uploading', 'uploaded', 'finalized', 'replaced', 'deleted')),
  ADD COLUMN IF NOT EXISTS replaced_by_document_id UUID REFERENCES public.documents(id),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS documents_case_created_idx
  ON public.documents (case_id, created_at DESC);

CREATE INDEX IF NOT EXISTS documents_case_status_idx
  ON public.documents (case_id, status, upload_state);

CREATE TABLE IF NOT EXISTS public.requirement_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id UUID NOT NULL REFERENCES public.case_requirements(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (requirement_id, document_id)
);

CREATE INDEX IF NOT EXISTS requirement_documents_requirement_idx
  ON public.requirement_documents (requirement_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.case_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'admin', 'system')),
  actor_id UUID REFERENCES public.profiles(id),
  event_type TEXT NOT NULL,
  visibility TEXT NOT NULL CHECK (visibility IN ('internal', 'client', 'both')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS case_events_case_created_idx
  ON public.case_events (case_id, created_at DESC);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'case-documents',
  'case-documents',
  false,
  26214400,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

ALTER TABLE public.case_intake_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirement_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirement_help_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirement_rule_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirement_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_upload_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirement_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users select own intake snapshots" ON public.case_intake_snapshots;
CREATE POLICY "Users select own intake snapshots"
ON public.case_intake_snapshots
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.cases
    WHERE cases.id = case_intake_snapshots.case_id
      AND cases.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins manage intake snapshots" ON public.case_intake_snapshots;
CREATE POLICY "Admins manage intake snapshots"
ON public.case_intake_snapshots
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated read requirement metadata" ON public.requirement_templates;
CREATE POLICY "Authenticated read requirement metadata"
ON public.requirement_templates
FOR SELECT
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins manage requirement metadata" ON public.requirement_templates;
CREATE POLICY "Admins manage requirement metadata"
ON public.requirement_templates
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated read requirement help content" ON public.requirement_help_content;
CREATE POLICY "Authenticated read requirement help content"
ON public.requirement_help_content
FOR SELECT
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins manage requirement help content" ON public.requirement_help_content;
CREATE POLICY "Admins manage requirement help content"
ON public.requirement_help_content
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated read rule sets" ON public.requirement_rule_sets;
CREATE POLICY "Authenticated read rule sets"
ON public.requirement_rule_sets
FOR SELECT
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins manage rule sets" ON public.requirement_rule_sets;
CREATE POLICY "Admins manage rule sets"
ON public.requirement_rule_sets
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated read requirement rules" ON public.requirement_rules;
CREATE POLICY "Authenticated read requirement rules"
ON public.requirement_rules
FOR SELECT
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins manage requirement rules" ON public.requirement_rules;
CREATE POLICY "Admins manage requirement rules"
ON public.requirement_rules
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users read own case requirements" ON public.case_requirements;
CREATE POLICY "Users read own case requirements"
ON public.case_requirements
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.cases
    WHERE cases.id = case_requirements.case_id
      AND cases.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins manage case requirements" ON public.case_requirements;
CREATE POLICY "Admins manage case requirements"
ON public.case_requirements
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users manage own upload sessions" ON public.document_upload_sessions;
CREATE POLICY "Users manage own upload sessions"
ON public.document_upload_sessions
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own upload sessions" ON public.document_upload_sessions;
CREATE POLICY "Users insert own upload sessions"
ON public.document_upload_sessions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.cases
    WHERE cases.id = document_upload_sessions.case_id
      AND cases.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users update own upload sessions" ON public.document_upload_sessions;
CREATE POLICY "Users update own upload sessions"
ON public.document_upload_sessions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage upload sessions" ON public.document_upload_sessions;
CREATE POLICY "Admins manage upload sessions"
ON public.document_upload_sessions
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users read own requirement documents" ON public.requirement_documents;
CREATE POLICY "Users read own requirement documents"
ON public.requirement_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.case_requirements cr
    JOIN public.cases c ON c.id = cr.case_id
    WHERE cr.id = requirement_documents.requirement_id
      AND c.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins manage requirement documents" ON public.requirement_documents;
CREATE POLICY "Admins manage requirement documents"
ON public.requirement_documents
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users read client-visible case events" ON public.case_events;
CREATE POLICY "Users read client-visible case events"
ON public.case_events
FOR SELECT
USING (
  visibility IN ('client', 'both')
  AND EXISTS (
    SELECT 1
    FROM public.cases
    WHERE cases.id = case_events.case_id
      AND cases.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins manage case events" ON public.case_events;
CREATE POLICY "Admins manage case events"
ON public.case_events
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users manage own case document objects" ON storage.objects;
CREATE POLICY "Users manage own case document objects"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'case-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'case-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Admins manage case document objects" ON storage.objects;
CREATE POLICY "Admins manage case document objects"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'case-documents'
  AND public.is_admin()
)
WITH CHECK (
  bucket_id = 'case-documents'
  AND public.is_admin()
);

ALTER TABLE public.cases
  DROP CONSTRAINT IF EXISTS cases_current_intake_snapshot_id_fkey,
  DROP CONSTRAINT IF EXISTS cases_active_rule_set_id_fkey;

ALTER TABLE public.cases
  ADD CONSTRAINT cases_current_intake_snapshot_id_fkey
    FOREIGN KEY (current_intake_snapshot_id) REFERENCES public.case_intake_snapshots(id) ON DELETE SET NULL,
  ADD CONSTRAINT cases_active_rule_set_id_fkey
    FOREIGN KEY (active_rule_set_id) REFERENCES public.requirement_rule_sets(id) ON DELETE SET NULL;

UPDATE public.cases
SET origin_country_code = UPPER(LEFT(profiles.country_of_origin, 2))
FROM public.profiles
WHERE cases.user_id = profiles.id
  AND cases.origin_country_code IS NULL
  AND profiles.country_of_origin IS NOT NULL;

CREATE OR REPLACE FUNCTION public.protect_case_sensitive_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.status = OLD.status;
    NEW.tax_year = OLD.tax_year;
    NEW.origin_country_code = OLD.origin_country_code;
    NEW.residency_pattern = OLD.residency_pattern;
    NEW.filing_route = OLD.filing_route;
    NEW.paid_at = OLD.paid_at;
    NEW.stripe_payment_id = OLD.stripe_payment_id;
    NEW.assigned_admin = OLD.assigned_admin;
    NEW.actual_refund = OLD.actual_refund;
    NEW.current_intake_snapshot_id = OLD.current_intake_snapshot_id;
    NEW.active_rule_set_id = OLD.active_rule_set_id;
    NEW.requirements_completion_ratio = OLD.requirements_completion_ratio;
    NEW.blocking_requirements_count = OLD.blocking_requirements_count;
    NEW.requirements_summary = OLD.requirements_summary;
    NEW.last_requirement_refresh_at = OLD.last_requirement_refresh_at;
    NEW.last_client_submission_at = OLD.last_client_submission_at;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_document_sensitive_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.status = OLD.status;
    NEW.review_notes = OLD.review_notes;
    NEW.reviewed_by = OLD.reviewed_by;
    NEW.reviewed_at = OLD.reviewed_at;
    NEW.upload_session_id = OLD.upload_session_id;
    NEW.storage_provider = OLD.storage_provider;
    NEW.storage_bucket = OLD.storage_bucket;
    NEW.storage_object_key = OLD.storage_object_key;
    NEW.sha256_checksum = OLD.sha256_checksum;
    NEW.upload_state = OLD.upload_state;
    NEW.replaced_by_document_id = OLD.replaced_by_document_id;
    NEW.deleted_at = OLD.deleted_at;
    NEW.deleted_by = OLD.deleted_by;
  END IF;
  RETURN NEW;
END;
$$;
