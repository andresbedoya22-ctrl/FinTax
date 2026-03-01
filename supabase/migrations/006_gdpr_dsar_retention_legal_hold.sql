ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS legal_hold BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS legal_hold_reason TEXT,
  ADD COLUMN IF NOT EXISTS legal_hold_set_at TIMESTAMPTZ;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS legal_hold BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS legal_hold_reason TEXT,
  ADD COLUMN IF NOT EXISTS legal_hold_set_at TIMESTAMPTZ;

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS legal_hold BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS legal_hold_reason TEXT,
  ADD COLUMN IF NOT EXISTS legal_hold_set_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.retention_policies (
  entity_name TEXT PRIMARY KEY,
  retention_days INTEGER NOT NULL CHECK (retention_days > 0),
  enabled BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.retention_policies (entity_name, retention_days, enabled, notes)
VALUES
  ('cases', 2555, true, '7-year fiscal retention baseline'),
  ('payments', 2555, true, '7-year fiscal retention baseline'),
  ('documents', 365, true, 'MVP upload retention'),
  ('notifications', 365, true, 'User notification history')
ON CONFLICT (entity_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.dsar_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('export', 'rectify', 'delete')),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'completed', 'rejected', 'cancelled')),
  requested_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  resolution_notes TEXT,
  due_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsar_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage retention policies" ON public.retention_policies;
CREATE POLICY "Admins manage retention policies" ON public.retention_policies
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users create own dsar requests" ON public.dsar_requests;
CREATE POLICY "Users create own dsar requests" ON public.dsar_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own dsar requests" ON public.dsar_requests;
CREATE POLICY "Users view own dsar requests" ON public.dsar_requests
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage dsar requests" ON public.dsar_requests;
CREATE POLICY "Admins manage dsar requests" ON public.dsar_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
