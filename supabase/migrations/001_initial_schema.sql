-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  bsn_encrypted TEXT,
  nationality TEXT,
  country_of_origin TEXT,
  address_street TEXT,
  address_city TEXT,
  address_postal_code TEXT,
  address_country TEXT DEFAULT 'NL',
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'es')),
  avatar_url TEXT,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  notification_email BOOLEAN DEFAULT true,
  notification_in_app BOOLEAN DEFAULT true,
  onboarding_completed BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- CASES
CREATE TYPE case_type AS ENUM (
  'tax_return_m','tax_return_p','tax_return_c','tax_return_w',
  'btw_declaration','zorgtoeslag','huurtoeslag','kindgebonden_budget','kinderopvangtoeslag'
);
CREATE TYPE case_status AS ENUM (
  'draft','pending_payment','paid','pending_authorization','authorized',
  'in_review','pending_documents','submitted','completed','rejected'
);
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  case_type case_type NOT NULL,
  status case_status DEFAULT 'draft',
  display_name TEXT,
  tax_year INTEGER,
  deadline DATE,
  estimated_refund DECIMAL(10,2),
  actual_refund DECIMAL(10,2),
  wizard_data JSONB DEFAULT '{}',
  wizard_completed BOOLEAN DEFAULT false,
  machtiging_status TEXT DEFAULT 'not_started'
    CHECK (machtiging_status IN ('not_started','requested','code_received','activated','rejected')),
  machtiging_code TEXT,
  stripe_payment_id TEXT,
  assigned_admin UUID,
  notes_internal TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- CHECKLIST ITEMS
CREATE TABLE public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  label_key TEXT,
  description TEXT,
  is_document_upload BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID,
  document_id UUID,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- DOCUMENTS
CREATE TYPE document_status AS ENUM ('uploaded','under_review','approved','rejected');
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  checklist_item_id UUID REFERENCES public.checklist_items(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  status document_status DEFAULT 'uploaded',
  review_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info','success','warning','error','action_required')),
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PAYMENTS
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  case_id UUID NOT NULL REFERENCES public.cases(id),
  stripe_payment_intent_id TEXT NOT NULL,
  stripe_checkout_session_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','succeeded','failed','refunded')),
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ADMIN LOG
CREATE TABLE public.admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  case_id UUID REFERENCES public.cases(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SERVICE PRICING
CREATE TABLE public.service_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_type case_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.service_pricing (case_type, name, description, price) VALUES
  ('tax_return_p','Tax Return - Form P (Residents)','Full-year NL residents',89.00),
  ('tax_return_m','Tax Return - Form M (Migration)','Arrived/left NL during the year',119.00),
  ('tax_return_c','Tax Return - Form C (Non-Residents)','Non-residents with NL income',99.00),
  ('tax_return_w','Tax Return - Self-Employed (ZZP)','Freelancers and entrepreneurs',149.00),
  ('btw_declaration','VAT Declaration (BTW)','Quarterly VAT for self-employed',59.00),
  ('zorgtoeslag','Zorgtoeslag','Healthcare insurance subsidy',39.00),
  ('huurtoeslag','Huurtoeslag','Rental subsidy application',39.00),
  ('kindgebonden_budget','Kindgebonden Budget','Child budget application',39.00),
  ('kinderopvangtoeslag','Kinderopvangtoeslag','Childcare allowance application',39.00);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users see own cases" ON public.cases FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own checklist" ON public.checklist_items FOR SELECT
  USING (case_id IN (SELECT id FROM public.cases WHERE user_id = auth.uid()));
CREATE POLICY "Users see own documents" ON public.documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
