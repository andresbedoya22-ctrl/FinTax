-- Fix RLS vulnerabilities for profiles, cases, documents
-- By default, FOR ALL allows users to update ANY column without WITH CHECK limits.
-- We must revoke FOR ALL and replace with explicit SELECT, INSERT, UPDATE, DELETE policies.

-- 1. Profiles
DROP POLICY IF EXISTS "Users see own profile" ON public.profiles;
CREATE POLICY "Users select own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Prevent users from updating sensitive profile fields
CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.role = OLD.role;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_protect_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_fields BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.protect_profile_sensitive_fields();

-- 2. Cases
DROP POLICY IF EXISTS "Users see own cases" ON public.cases;
CREATE POLICY "Users select own cases" ON public.cases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own cases" ON public.cases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own cases" ON public.cases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own cases" ON public.cases FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.protect_case_sensitive_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.status = OLD.status;
    NEW.paid_at = OLD.paid_at;
    NEW.stripe_payment_id = OLD.stripe_payment_id;
    NEW.assigned_admin = OLD.assigned_admin;
    NEW.actual_refund = OLD.actual_refund;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_protect_case_fields ON public.cases;
CREATE TRIGGER trg_protect_case_fields BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.protect_case_sensitive_fields();

-- 3. Documents
DROP POLICY IF EXISTS "Users see own documents" ON public.documents;
CREATE POLICY "Users select own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own documents" ON public.documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);

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
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_protect_document_fields ON public.documents;
CREATE TRIGGER trg_protect_document_fields BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.protect_document_sensitive_fields();

-- Support for proper idempotency locking
ALTER TABLE public.stripe_events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed'));
