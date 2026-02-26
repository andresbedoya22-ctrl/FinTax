-- Enable RLS on remaining sensitive tables
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_pricing ENABLE ROW LEVEL SECURITY;

-- Helper admin check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Public pricing is intentionally readable on landing and checkout previews
DROP POLICY IF EXISTS "Public read service pricing" ON public.service_pricing;
CREATE POLICY "Public read service pricing"
ON public.service_pricing
FOR SELECT
USING (true);

-- Admin activity log is admin-only
DROP POLICY IF EXISTS "Admin only admin_activity_log" ON public.admin_activity_log;
CREATE POLICY "Admin only admin_activity_log"
ON public.admin_activity_log
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Stripe webhook idempotency support
CREATE UNIQUE INDEX IF NOT EXISTS payments_stripe_checkout_session_id_unique
ON public.payments (stripe_checkout_session_id)
WHERE stripe_checkout_session_id IS NOT NULL;

