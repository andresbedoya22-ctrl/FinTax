CREATE TABLE IF NOT EXISTS public.stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin only stripe_events" ON public.stripe_events;
CREATE POLICY "Admin only stripe_events"
ON public.stripe_events
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

ALTER TABLE public.cases
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.case_paid_at_integrity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.paid_at IS NULL THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.payments p
    WHERE p.case_id = NEW.id
      AND p.status = 'succeeded'
  ) THEN
    RAISE EXCEPTION 'paid_at_requires_succeeded_payment';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_case_paid_at_integrity ON public.cases;
CREATE TRIGGER trg_case_paid_at_integrity
BEFORE INSERT OR UPDATE ON public.cases
FOR EACH ROW
EXECUTE FUNCTION public.case_paid_at_integrity();
