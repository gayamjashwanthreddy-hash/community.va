-- ==============================================================================
-- COMMUNITY.VA — ALL-IN-ONE MASTER SCHEMA FOR FRESH SUPABASE PROJECT
-- Location: Hyderabad, India
-- Official Email: community.va@gmail.com
-- ==============================================================================

-- Step 1: Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Custom Enum Types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('STUDENT', 'VOLUNTEER', 'COLLEGE', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 3: Profiles Table (MUST BE FIRST because other tables reference it)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'Community Member',
  email TEXT NOT NULL UNIQUE,
  mobile TEXT,
  role user_role NOT NULL DEFAULT 'STUDENT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 4: Admin Function (Depends on profiles table)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Updated At Auto-timestamp Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Core Community Tables
-- Students Table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_reference TEXT UNIQUE NOT NULL,
  college_name TEXT NOT NULL,
  university TEXT,
  branch TEXT NOT NULL,
  study_year TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Hyderabad',
  interests TEXT[] NOT NULL DEFAULT '{}',
  reason TEXT NOT NULL,
  status application_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Volunteers Table
CREATE TABLE IF NOT EXISTS public.volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_reference TEXT UNIQUE NOT NULL,
  college_name TEXT NOT NULL,
  branch TEXT NOT NULL,
  study_year TEXT NOT NULL,
  preferred_divisions TEXT[] NOT NULL DEFAULT '{}',
  experience TEXT,
  skills TEXT NOT NULL,
  availability TEXT NOT NULL,
  motivation TEXT NOT NULL,
  assigned_division TEXT,
  status application_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Colleges Table
CREATE TABLE IF NOT EXISTS public.colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_reference TEXT UNIQUE NOT NULL,
  institution_name TEXT NOT NULL,
  institution_type TEXT NOT NULL,
  website TEXT,
  college_email TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  designation TEXT NOT NULL,
  mobile TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Hyderabad',
  state TEXT NOT NULL DEFAULT 'Telangana',
  student_strength TEXT,
  collaboration_areas TEXT[] NOT NULL DEFAULT '{}',
  additional_information TEXT,
  status application_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partners Table
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  application_reference TEXT UNIQUE NOT NULL,
  organization_name TEXT NOT NULL,
  website TEXT,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  partnership_type TEXT NOT NULL,
  proposal_details TEXT NOT NULL,
  status application_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Application Status Audit History
CREATE TABLE IF NOT EXISTS public.application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_type TEXT NOT NULL,
  application_id UUID NOT NULL,
  previous_status application_status NOT NULL,
  new_status application_status NOT NULL,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contact Messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'UNREAD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 7: Events Management Tables
-- Events Table
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
  status TEXT NOT NULL DEFAULT 'DRAFT',
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

-- Dynamic Form Questions Table
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

-- Event Registrations Table
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  registration_number TEXT UNIQUE NOT NULL,
  participant_name TEXT NOT NULL,
  participant_email TEXT NOT NULL,
  participant_phone TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  registration_status TEXT NOT NULL DEFAULT 'CONFIRMED',
  internal_notes TEXT,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_event_participant UNIQUE (event_id, participant_email)
);

-- Event Payments Table
CREATE TABLE IF NOT EXISTS public.event_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL UNIQUE REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_method TEXT NOT NULL DEFAULT 'UPI',
  payment_reference TEXT,
  screenshot_path TEXT,
  payment_status TEXT NOT NULL DEFAULT 'NOT_REQUIRED',
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Event Payment Audit Trail
CREATE TABLE IF NOT EXISTS public.event_payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.event_payments(id) ON DELETE CASCADE,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Event Email Notifications Tracking
CREATE TABLE IF NOT EXISTS public.event_email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'PENDING',
  resend_message_id TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 8: Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_user_id ON public.volunteers(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_status ON public.volunteers(status);
CREATE INDEX IF NOT EXISTS idx_colleges_user_id ON public.colleges(user_id);
CREATE INDEX IF NOT EXISTS idx_colleges_status ON public.colleges(status);
CREATE INDEX IF NOT EXISTS idx_events_status_deleted ON public.events(status, deleted_at);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_event_questions_event_id ON public.event_form_questions(event_id, display_order);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON public.event_registrations(participant_email);
CREATE INDEX IF NOT EXISTS idx_event_payments_registration ON public.event_payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_event_payments_status ON public.event_payments(payment_status);

-- Step 9: Triggers (Using PostgreSQL 14+ CREATE OR REPLACE TRIGGER)
CREATE OR REPLACE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_students_updated_at BEFORE UPDATE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_volunteers_updated_at BEFORE UPDATE ON public.volunteers
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_colleges_updated_at BEFORE UPDATE ON public.colleges
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_events_updated_at BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_event_questions_updated_at BEFORE UPDATE ON public.event_form_questions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_event_registrations_updated_at BEFORE UPDATE ON public.event_registrations
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_event_payments_updated_at BEFORE UPDATE ON public.event_payments
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto create profile on auth signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Community Member'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'STUDENT')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 10: Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_form_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_email_notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own details" ON public.profiles;
CREATE POLICY "Users can update own details"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins have full profile access" ON public.profiles;
CREATE POLICY "Admins have full profile access"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- STUDENTS
DROP POLICY IF EXISTS "Students can read own record" ON public.students;
CREATE POLICY "Students can read own record"
  ON public.students FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Students can insert own record" ON public.students;
CREATE POLICY "Students can insert own record"
  ON public.students FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins have full student access" ON public.students;
CREATE POLICY "Admins have full student access"
  ON public.students FOR ALL
  USING (public.is_admin());

-- VOLUNTEERS
DROP POLICY IF EXISTS "Volunteers can read own record" ON public.volunteers;
CREATE POLICY "Volunteers can read own record"
  ON public.volunteers FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Volunteers can insert own record" ON public.volunteers;
CREATE POLICY "Volunteers can insert own record"
  ON public.volunteers FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins have full volunteer access" ON public.volunteers;
CREATE POLICY "Admins have full volunteer access"
  ON public.volunteers FOR ALL
  USING (public.is_admin());

-- COLLEGES
DROP POLICY IF EXISTS "Colleges can read own record" ON public.colleges;
CREATE POLICY "Colleges can read own record"
  ON public.colleges FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Colleges can insert own record" ON public.colleges;
CREATE POLICY "Colleges can insert own record"
  ON public.colleges FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins have full college access" ON public.colleges;
CREATE POLICY "Admins have full college access"
  ON public.colleges FOR ALL
  USING (public.is_admin());

-- PARTNERS & CONTACT
DROP POLICY IF EXISTS "Anyone can insert partners" ON public.partners;
CREATE POLICY "Anyone can insert partners" ON public.partners FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view partners" ON public.partners;
CREATE POLICY "Admins can view partners" ON public.partners FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can insert contact message" ON public.contact_messages;
CREATE POLICY "Anyone can insert contact message" ON public.contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins have full contact access" ON public.contact_messages;
CREATE POLICY "Admins have full contact access" ON public.contact_messages FOR ALL USING (public.is_admin());

-- EVENTS
DROP POLICY IF EXISTS "Public can view published events" ON public.events;
CREATE POLICY "Public can view published events"
  ON public.events FOR SELECT
  USING (status = 'PUBLISHED' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Admins have full event access" ON public.events;
CREATE POLICY "Admins have full event access"
  ON public.events FOR ALL
  USING (public.is_admin());

-- QUESTIONS
DROP POLICY IF EXISTS "Public can view questions for published events" ON public.event_form_questions;
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

DROP POLICY IF EXISTS "Admins have full question access" ON public.event_form_questions;
CREATE POLICY "Admins have full question access"
  ON public.event_form_questions FOR ALL
  USING (public.is_admin());

-- REGISTRATIONS
DROP POLICY IF EXISTS "Public can register for published events" ON public.event_registrations;
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

DROP POLICY IF EXISTS "Users can read own event registration" ON public.event_registrations;
CREATE POLICY "Users can read own event registration"
  ON public.event_registrations FOR SELECT
  USING ((auth.uid() IS NOT NULL AND user_id = auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Admins have full registration access" ON public.event_registrations;
CREATE POLICY "Admins have full registration access"
  ON public.event_registrations FOR ALL
  USING (public.is_admin());

-- PAYMENTS
DROP POLICY IF EXISTS "Participants can insert payment records" ON public.event_payments;
CREATE POLICY "Participants can insert payment records"
  ON public.event_payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.event_registrations
      WHERE event_registrations.id = event_payments.registration_id
    )
  );

DROP POLICY IF EXISTS "Participants can read own payment" ON public.event_payments;
CREATE POLICY "Participants can read own payment"
  ON public.event_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.event_registrations
      WHERE event_registrations.id = event_payments.registration_id
        AND (event_registrations.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Admins have full payment access" ON public.event_payments;
CREATE POLICY "Admins have full payment access"
  ON public.event_payments FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins have full payment history access" ON public.event_payment_history;
CREATE POLICY "Admins have full payment history access"
  ON public.event_payment_history FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins have full notification access" ON public.event_email_notifications;
CREATE POLICY "Admins have full notification access"
  ON public.event_email_notifications FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins have full application history access" ON public.application_status_history;
CREATE POLICY "Admins have full application history access"
  ON public.application_status_history FOR ALL
  USING (public.is_admin());

-- Step 11: Seed Official Live Events
INSERT INTO public.events (
  id,
  title,
  slug,
  description,
  category,
  venue,
  event_start,
  event_end,
  registration_start,
  registration_end,
  capacity,
  organizer,
  contact_email,
  instructions,
  status,
  is_paid,
  fee_amount,
  fee_currency,
  payment_instructions,
  payment_upi_id,
  payment_payee_name,
  payment_qr_path,
  payment_verification_required
)
VALUES
(
  'e0000000-0000-0000-0000-000000000001',
  'COMMUNITY.VA Innovation Hackathon 2026',
  'community-va-innovation-hackathon-2026',
  'A 36-hour sprint uniting student developers, designers, and problem solvers to build software tackling urban, educational, and sustainability challenges in Hyderabad.',
  'Technology & Innovation',
  'T-Hub Phase 2 & Virtual Hub, Hyderabad',
  '2026-11-20 09:00:00+00',
  '2026-11-21 21:00:00+00',
  '2026-10-01 00:00:00+00',
  '2026-11-15 23:59:59+00',
  250,
  'COMMUNITY.VA Tech Division',
  'community.va@gmail.com',
  'Bring your student ID card, laptops, chargers, and enthusiasm. Refreshments, meals, Wi-Fi and mentorship provided.',
  'PUBLISHED',
  true,
  199.00,
  'INR',
  'Scan the official COMMUNITY.VA UPI QR code below using Google Pay, PhonePe, or Paytm. Submit the transaction screenshot and UTR number below.',
  'community.va@okaxis',
  'COMMUNITY VA YOUTH FORUM',
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
  true
),
(
  'e0000000-0000-0000-0000-000000000002',
  'Youth Leadership & Public Speaking Masterclass',
  'youth-leadership-and-public-speaking-masterclass',
  'An intensive interactive workshop focusing on stage presence, impromptu speaking, elevator pitches, and leading student organizations with empathy.',
  'Personal Development',
  'Ravindra Bharathi Mini Hall, Lakdikapul, Hyderabad',
  '2026-11-28 14:00:00+00',
  '2026-11-28 18:30:00+00',
  '2026-10-10 00:00:00+00',
  '2026-11-26 18:00:00+00',
  120,
  'COMMUNITY.VA Personal Growth Division',
  'community.va@gmail.com',
  'Formal or smart-casual attire recommended. Notepad, workbook, and tea included.',
  'PUBLISHED',
  false,
  0.00,
  'INR',
  null,
  null,
  null,
  null,
  false
),
(
  'e0000000-0000-0000-0000-000000000003',
  'Youth Acoustic & Open Mic Night',
  'youth-acoustic-open-mic-night',
  'An open stage for student vocalists, musicians, poets, and storytellers to perform in a supportive, energetic environment.',
  'Events & Entertainment',
  'Lamakaan Cultural Space, Banjara Hills, Hyderabad',
  '2026-12-05 17:30:00+00',
  '2026-12-05 21:00:00+00',
  '2026-10-20 00:00:00+00',
  '2026-12-03 23:59:59+00',
  90,
  'COMMUNITY.VA Cultural Division',
  'community.va@gmail.com',
  'Acoustic instruments only. Performance slots confirmed via email 48 hours prior.',
  'PUBLISHED',
  false,
  0.00,
  'INR',
  null,
  null,
  null,
  null,
  false
)
ON CONFLICT (id) DO NOTHING;

-- Dynamic Questions for Hackathon
INSERT INTO public.event_form_questions (
  event_id,
  label,
  description,
  question_type,
  is_required,
  placeholder,
  options,
  display_order
)
VALUES
(
  'e0000000-0000-0000-0000-000000000001',
  'College / University Name',
  'Enrolled institution in Telangana or AP',
  'short_text',
  true,
  'e.g. JNTU Hyderabad / CBIT / VNR VJIET',
  '[]'::jsonb,
  1
),
(
  'e0000000-0000-0000-0000-000000000001',
  'Branch & Study Year',
  'Current academic progression',
  'dropdown',
  true,
  null,
  '["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduated / Masters"]'::jsonb,
  2
),
(
  'e0000000-0000-0000-0000-000000000001',
  'Primary Technical Skills',
  'Select your main strengths',
  'checkboxes',
  false,
  null,
  '["Frontend (React/Next.js)", "Backend (Node/Python/Go)", "AI/ML & Data Science", "Mobile Apps (Flutter)", "UI/UX Design"]'::jsonb,
  3
),
(
  'e0000000-0000-0000-0000-000000000001',
  'T-Shirt Size for Hackathon Kit',
  'Official participant kit size',
  'radio',
  true,
  null,
  '["S", "M", "L", "XL", "XXL"]'::jsonb,
  4
)
ON CONFLICT DO NOTHING;
