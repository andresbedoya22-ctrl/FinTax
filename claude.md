# 🚀 FINTAX — ULTRA PROMPT PARA CLAUDE CODE
## Construir todos los flujos funcionales de FinTax sobre el codebase existente

---

## INSTRUCCIÓN PRINCIPAL

Este proyecto ya tiene un codebase base con Next.js 14, TypeScript, Tailwind CSS, next-intl, y una landing page construida. Tu trabajo es **construir TODOS los flujos funcionales completos** sobre lo que ya existe, sin romper nada. Antes de crear cualquier archivo nuevo, **lee el codebase existente completo** para entender la estructura, convenciones de naming, configuraciones actuales, y componentes ya creados.

### ⚠️ REGLAS CRÍTICAS
1. **PRIMERO LEE** todo el contenido de `src/`, `messages/`, `public/`, `middleware.ts`, `package.json`, `tailwind.config.ts`, y `next.config.ts` antes de escribir una sola línea
2. **RESPETA** la estructura de carpetas existente, naming conventions, y patrones ya establecidos
3. **REUTILIZA** componentes, utilidades, y estilos que ya existan
4. **EXTIENDE** los archivos de i18n en `messages/` — no crees nueva estructura de i18n
5. **MANTÉN** el middleware existente y extiéndelo si es necesario
6. **NO** borres ni reescribas componentes que ya funcionan (como la landing page)
7. Cuando necesites instalar paquetes nuevos, usa el package manager que ya está configurado (revisa si es npm, pnpm, o yarn mirando el lockfile)

---

## CONTEXTO DEL PROYECTO

FinTax es una plataforma fintech web dirigida a internacionales viviendo en los Países Bajos que necesitan ayuda con impuestos holandeses (declaración de renta), toeslagen (subsidios del gobierno). El servicio se ofrece en múltiples idiomas (EN, ES) con un modelo freemium: el usuario puede explorar gratis, ver estimados de lo que podría recibir, y paga antes de que el equipo FinTax realice el trámite por él.

**IMPORTANTE — SISTEMA DE MACHTIGING**: FinTax actúa como intermediario (gemachtigde) ante la Belastingdienst. El usuario NO nos da sus credenciales de DigiD. El proceso oficial es:
1. FinTax envía solicitud de machtiging vía software con certificado PKIoverheid a través de Digipoort
2. Belastingdienst/Logius envía carta física al cliente con código de activación
3. Cliente comparte el código con FinTax (por la app o email)
4. FinTax activa la machtiging con ese código → queda autorizado para actuar en nombre del cliente
5. La machtiging puede ser por año fiscal específico o doorlopend (continua)

---

## STACK TÉCNICO

Mantener lo que ya está configurado y agregar:

```
# YA EXISTENTE (no reinstalar):
Framework:       Next.js 14 (App Router)
Lenguaje:        TypeScript
Styling:         Tailwind CSS
i18n:            next-intl (ya en messages/)
Icons:           Lucide React (ya instalado)

# AGREGAR (instalar estos paquetes):
UI Components:   shadcn/ui (npx shadcn@latest init, tema dark)
Auth:            @supabase/supabase-js + @supabase/ssr
Database:        Supabase PostgreSQL (configurar proyecto en supabase.com)
Storage:         Supabase Storage
Pagos:           stripe + @stripe/stripe-js
State:           zustand
Forms:           react-hook-form + @hookform/resolvers + zod
Server State:    @tanstack/react-query
Email:           resend (para notificaciones por email)
```

---

## BASE DE DATOS (Supabase PostgreSQL)

Crear archivo `supabase/migrations/001_initial_schema.sql`:

```sql
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
```

---

## FLUJOS DETALLADOS

### FLUJO 1: AUTH (Supabase)

- `src/lib/supabase/client.ts` — createBrowserClient
- `src/lib/supabase/server.ts` — createServerClient
- Extend `middleware.ts` for auth (keep existing i18n logic intact)
- Register: Google OAuth + email/password, terms checkbox → creates profile → onboarding
- Login: Google OAuth + email/password, forgot password → redirect `/dashboard`
- Onboarding (first time): select language, select needs → redirect dashboard
- Route protection: `/dashboard/*` = auth required, `/admin/*` = admin role required

### FLUJO 2: DASHBOARD

Layout with sidebar (Logo, avatar, nav: Dashboard/Tax Returns/Subsidies/Settings, help link) + topbar (title, case selector, 🔔 notifications, profile dropdown with theme/language/logout, language switcher).

**REMOVE from mock**: "MEER" duplicate section, "@floober/Voltoai", "A" icon, people icon, settings ⚙️ on case card.

3 Cards: Case Overview (status, deadline, services list, review button, arrow→case), Checklist (progress bar, dynamic items, upload modal), Refund Estimate (total, service breakdown bar chart, dropdown filter, desglose, "Get Estimate" button).

### FLUJO 3: TAX RETURNS (`/[locale]/tax-return`)

Service cards: Form P €89, Form M €119, Form C €99, ZZP €149, BTW €59. Each with "Start"/"Continue".

Wizard (Form P example): Step 1 Personal → Step 2 Employment → Step 3 Housing → Step 4 Assets Box 3 → Step 5 Deductions → Step 6 Summary+Estimate+Pay → Step 7 Post-payment (machtiging instructions, code field, document upload checklist). Saves wizard_data JSONB on every step.

### FLUJO 4: SUBSIDIES (`/[locale]/benefits`)

Hero: "Check your eligibility". Universal wizard: Step 1 Personal → Step 2 Income → Step 3 Assets → Step 4 Housing → Step 5 Health Insurance → Step 6 Children → Step 7 Results.

**2026 Rules hardcoded:**
- Zorgtoeslag: 18+, NL resident, zorgverzekering, income ≤€40,857/€51,142, vermogen ≤€146,011/€184,633, max €1,574/€3,010 year
- Huurtoeslag: 18+, zelfstandige woonruimte, rental agreement, vermogen ≤€38,479/€76,958, NO max rent since 2026, calc up to €932.93/€498.20
- Kindgebonden: children <18, kinderbijslag, vermogen ≤€146,011/€184,633, full up to €29,736/€39,141, 7.60% reduction
- Kinderopvangtoeslag: registered childcare, both parents work, ≤€56,413 = 96%, max hourly €10.25/€9.12/€7.53

Results show ✅/❌ per toeslag with estimate. "Apply through FinTax — €39" per toeslag. Bundle pricing. Post-payment: machtiging + doc uploads.

### FLUJO 5: CASE DETAIL (`/[locale]/tax-return/[caseId]` or `/[locale]/benefits/[caseId]`)

Header: name + status + deadline. Tabs: Overview (summary, estimate, timeline), Documents (list+upload drag-drop, PDF/JPG/PNG max 10MB, Supabase Storage), Authorization (machtiging status+code input), Activity (log).

### FLUJO 6: SETTINGS (`/[locale]/settings`)

Profile, Security, Notifications (toggle email/in-app), Language, Appearance (dark/light), Billing (history), Data & Privacy.

### FLUJO 7: NOTIFICATIONS

Bell icon → dropdown list, mark read, badge. Email via Resend on: status change, doc review, action required, payment confirmed, case completed. Configurable per user.

### FLUJO 8: ADMIN (`/[locale]/admin`)

Dashboard KPIs, case management (view wizard data, review docs approve/reject, change status, notes, assign admin, notify client), user management, pricing editor.

### FLUJO 9: STRIPE

Checkout Session: payment_method_types ['ideal','card'], metadata {case_id, user_id, case_type}. Webhooks: `checkout.session.completed` → update case + payment record + notify. `payment_intent.payment_failed` → notify. iDEAL as primary payment method.

---

## ELIGIBILITY CALCULATOR

File `src/lib/constants/toeslagen-rules.ts` with all 2026 rules as typed constants.
File `src/lib/utils/eligibility-calculator.ts` — takes wizard data, returns per-toeslag eligibility + estimated amounts.

---

## i18n

Extend existing `messages/en.json` and `messages/es.json`. ALL user-visible strings via translations. Follow existing key conventions.

---

## BUILD ORDER

1. Dependencies + shadcn + Supabase setup + auth + middleware
2. Dashboard layout + 3 cards + notifications + settings
3. Tax return pages + wizard + case detail + doc upload
4. Subsidies pages + eligibility wizard + results
5. Stripe integration + webhooks
6. Admin panel
7. Email notifications + polish + responsive QA

## CODE RULES

- TypeScript strict, NO `any`
- Server Components default, `'use client'` only when needed
- Zod for ALL form validation
- Error boundaries + loading.tsx + error.tsx per route
- ALL text via i18n
- Supabase RLS, never expose service_role to client
- Wizard saves JSONB on every step

## ENV VARS (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
```
