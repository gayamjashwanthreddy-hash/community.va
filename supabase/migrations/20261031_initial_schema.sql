-- ==============================================================================
-- COMMUNITY.VA — Production Database Schema & Row Level Security (RLS)
-- Location: Hyderabad, India
-- Official Email: community.va@gmail.com
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Custom Enum Types
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

-- 2. Profiles Table (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  mobile TEXT,
  role user_role NOT NULL DEFAULT 'STUDENT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Students Table
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

-- 4. Volunteers Table
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

-- 5. Colleges Table
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

-- 6. Institutional Partners Table (Enquiries/Proposals)
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  application_reference TEXT UNIQUE NOT NULL,
  organization_name TEXT NOT NULL,
  website TEXT,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  organization_type TEXT NOT NULL,
  collaboration_interest TEXT NOT NULL,
  message TEXT NOT NULL,
  status application_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Application Status History (Audit Trail)
CREATE TABLE IF NOT EXISTS public.application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_type TEXT NOT NULL, -- 'STUDENT', 'VOLUNTEER', 'COLLEGE', 'PARTNER'
  application_id UUID NOT NULL,
  previous_status application_status,
  new_status application_status NOT NULL,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  admin_note TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Contact Messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_volunteers_user_id ON public.volunteers(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_status ON public.volunteers(status);
CREATE INDEX IF NOT EXISTS idx_colleges_user_id ON public.colleges(user_id);
CREATE INDEX IF NOT EXISTS idx_colleges_status ON public.colleges(status);
CREATE INDEX IF NOT EXISTS idx_partners_status ON public.partners(status);
CREATE INDEX IF NOT EXISTS idx_status_history_app ON public.application_status_history(application_type, application_id);

-- ==============================================================================
-- HELPER FUNCTIONS
-- ==============================================================================
-- Function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated at auto-update trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_students_updated_at ON public.students;
CREATE TRIGGER set_students_updated_at BEFORE UPDATE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_volunteers_updated_at ON public.volunteers;
CREATE TRIGGER set_volunteers_updated_at BEFORE UPDATE ON public.volunteers
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_colleges_updated_at ON public.colleges;
CREATE TRIGGER set_colleges_updated_at BEFORE UPDATE ON public.colleges
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Users can view their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Users can update non-role profile fields
CREATE POLICY "Users can update own details"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    role = (SELECT role FROM public.profiles WHERE id = auth.uid()) -- Prevents self-escalation
  );

-- Admins can update any profile (including roles)
CREATE POLICY "Admins have full profile access"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- STUDENTS POLICIES
CREATE POLICY "Students can read own record"
  ON public.students FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Students can update own details but not status"
  ON public.students FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND 
    status = (SELECT status FROM public.students WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins have full student access"
  ON public.students FOR ALL
  USING (public.is_admin());

-- VOLUNTEERS POLICIES
CREATE POLICY "Volunteers can read own record"
  ON public.volunteers FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Volunteers can update own profile fields"
  ON public.volunteers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND 
    status = (SELECT status FROM public.volunteers WHERE user_id = auth.uid()) AND
    assigned_division = (SELECT assigned_division FROM public.volunteers WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins have full volunteer access"
  ON public.volunteers FOR ALL
  USING (public.is_admin());

-- COLLEGES POLICIES
CREATE POLICY "Colleges can read own record"
  ON public.colleges FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Colleges can update own details"
  ON public.colleges FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND 
    status = (SELECT status FROM public.colleges WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins have full college access"
  ON public.colleges FOR ALL
  USING (public.is_admin());

-- PARTNERS POLICIES
CREATE POLICY "Partners can read own record"
  ON public.partners FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins have full partner access"
  ON public.partners FOR ALL
  USING (public.is_admin());

-- STATUS HISTORY POLICIES
-- Applicants can only view their own status updates without admin internal notes
CREATE POLICY "Applicants can view own status audit"
  ON public.application_status_history FOR SELECT
  USING (
    public.is_admin() OR
    (application_type = 'STUDENT' AND application_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())) OR
    (application_type = 'VOLUNTEER' AND application_id IN (SELECT id FROM public.volunteers WHERE user_id = auth.uid())) OR
    (application_type = 'COLLEGE' AND application_id IN (SELECT id FROM public.colleges WHERE user_id = auth.uid()))
  );

CREATE POLICY "Admins can insert status history"
  ON public.application_status_history FOR INSERT
  WITH CHECK (public.is_admin());

-- CONTACT MESSAGES POLICIES
CREATE POLICY "Admins can view contact messages"
  ON public.contact_messages FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Anyone can submit contact message"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);
