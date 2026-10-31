-- ==============================================================================
-- COMMUNITY.VA — Event Management, Dynamic Registration & Payment Verification
-- Schema & RLS Policies
-- ==============================================================================

-- 1. Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  cover_image_path TEXT,
  category TEXT NOT NULL DEFAULT 'Technology & Innovation',
  venue TEXT NOT NULL,
  event_start TIMESTAMPTZ NOT NULL,
  event_end TIMESTAMPTZ NOT NULL,
  registration_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  registration_end TIMESTAMPTZ NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 100,
  organizer TEXT NOT NULL DEFAULT 'COMMUNITY.VA',
  contact_email TEXT NOT NULL DEFAULT 'community.va@gmail.com',
  instructions TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'PUBLISHED', 'REGISTRATION_CLOSED', 'COMPLETED', 'CANCELLED'
  is_paid BOOLEAN NOT NULL DEFAULT false,
  fee_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  fee_currency TEXT NOT NULL DEFAULT 'INR',
  payment_instructions TEXT,
  payment_upi_id TEXT,
  payment_payee_name TEXT,
  payment_qr_path TEXT,
  payment_verification_required BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 2. Dynamic Form Questions Table
CREATE TABLE IF NOT EXISTS public.event_form_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT,
  question_type TEXT NOT NULL DEFAULT 'short_text',
  is_required BOOLEAN NOT NULL DEFAULT false,
  placeholder TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  validation_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Event Registrations Table
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  registration_number TEXT UNIQUE NOT NULL,
  participant_name TEXT NOT NULL,
  participant_email TEXT NOT NULL,
  participant_phone TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  registration_status TEXT NOT NULL DEFAULT 'CONFIRMED', -- 'CONFIRMED', 'CANCELLED'
  internal_notes TEXT,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_event_participant UNIQUE (event_id, participant_email)
);

-- 4. Event Payments Table
CREATE TABLE IF NOT EXISTS public.event_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL UNIQUE REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_method TEXT NOT NULL DEFAULT 'UPI',
  payment_reference TEXT,
  screenshot_path TEXT,
  payment_status TEXT NOT NULL DEFAULT 'NOT_REQUIRED', -- 'NOT_REQUIRED', 'PAYMENT_PENDING', 'PAYMENT_SUBMITTED', 'PAYMENT_VERIFIED', 'PAYMENT_REJECTED'
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Event Payment History (Audit Trail)
CREATE TABLE IF NOT EXISTS public.event_payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.event_payments(id) ON DELETE CASCADE,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Event Email Notifications Table
CREATE TABLE IF NOT EXISTS public.event_email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'FAILED'
  resend_message_id TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_events_status_deleted ON public.events(status, deleted_at);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_event_questions_event_id ON public.event_form_questions(event_id, display_order);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON public.event_registrations(participant_email);
CREATE INDEX IF NOT EXISTS idx_event_payments_registration ON public.event_payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_event_payments_status ON public.event_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_event_payment_history_payment ON public.event_payment_history(payment_id);
CREATE INDEX IF NOT EXISTS idx_event_notifications_reg ON public.event_email_notifications(registration_id);

-- Auto Updated_At triggers
DROP TRIGGER IF EXISTS set_events_updated_at ON public.events;
CREATE TRIGGER set_events_updated_at BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_event_questions_updated_at ON public.event_form_questions;
CREATE TRIGGER set_event_questions_updated_at BEFORE UPDATE ON public.event_form_questions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_event_registrations_updated_at ON public.event_registrations;
CREATE TRIGGER set_event_registrations_updated_at BEFORE UPDATE ON public.event_registrations
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_event_payments_updated_at ON public.event_payments;
CREATE TRIGGER set_event_payments_updated_at BEFORE UPDATE ON public.event_payments
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_form_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_email_notifications ENABLE ROW LEVEL SECURITY;

-- 1. Events Policies
-- Public can view published non-deleted events
CREATE POLICY "Public can view published events"
  ON public.events FOR SELECT
  USING (status = 'PUBLISHED' AND deleted_at IS NULL);

-- Admins have full access to events
CREATE POLICY "Admins have full event access"
  ON public.events FOR ALL
  USING (public.is_admin());

-- 2. Questions Policies
-- Public can view questions for published events
CREATE POLICY "Public can view questions for published events"
  ON public.event_form_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_form_questions.event_id
        AND events.status = 'PUBLISHED'
        AND events.deleted_at IS NULL
    )
  );

-- Admins have full question access
CREATE POLICY "Admins have full question access"
  ON public.event_form_questions FOR ALL
  USING (public.is_admin());

-- 3. Event Registrations Policies
-- Anyone can create a registration
CREATE POLICY "Public can register for published events"
  ON public.event_registrations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_registrations.event_id
        AND events.status = 'PUBLISHED'
        AND events.deleted_at IS NULL
    )
  );

-- Participants can read own registration if logged in
CREATE POLICY "Users can read own event registration"
  ON public.event_registrations FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    public.is_admin()
  );

-- Admins have full registration access
CREATE POLICY "Admins have full registration access"
  ON public.event_registrations FOR ALL
  USING (public.is_admin());

-- 4. Event Payments Policies
-- Anyone can insert payment proof attached to their registration
CREATE POLICY "Participants can insert payment records"
  ON public.event_payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.event_registrations
      WHERE event_registrations.id = event_payments.registration_id
    )
  );

-- Participants can read their own payment status
CREATE POLICY "Participants can read own payment"
  ON public.event_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.event_registrations
      WHERE event_registrations.id = event_payments.registration_id
        AND (event_registrations.user_id = auth.uid() OR public.is_admin())
    )
  );

-- Admins have full payment access (including update/verify)
CREATE POLICY "Admins have full payment access"
  ON public.event_payments FOR ALL
  USING (public.is_admin());

-- 5. Payment History & Notification Policies
CREATE POLICY "Admins have full payment history access"
  ON public.event_payment_history FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins have full notification access"
  ON public.event_email_notifications FOR ALL
  USING (public.is_admin());

-- ==============================================================================
-- STORAGE CONFIGURATION (Supabase Storage Buckets)
-- ==============================================================================
-- 1. Insert buckets if storage schema exists
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('event-public-assets', 'event-public-assets', true),
  ('event-payment-proofs', 'event-payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Public can view public event assets (covers, QR codes)
CREATE POLICY "Public can read event public assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-public-assets');

-- Admins can manage public event assets
CREATE POLICY "Admins can manage event public assets"
  ON storage.objects FOR ALL
  USING (bucket_id = 'event-public-assets' AND public.is_admin());

-- Participants can upload payment proofs to private bucket
CREATE POLICY "Participants can upload payment proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'event-payment-proofs');

-- Only admins can read payment proofs
CREATE POLICY "Admins can read payment proofs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-payment-proofs' AND public.is_admin());
