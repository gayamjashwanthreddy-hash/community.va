-- =============================================================================
-- COMMUNITY.VA — Migration: Team Event Support, Dynamic Member Roster & Attendance
-- Created: 2026-11-01
-- =============================================================================

-- 1. Add Team Configuration Columns to Events
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS is_team_event BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS min_team_size INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_team_size INTEGER NOT NULL DEFAULT 5,
ADD COLUMN IF NOT EXISTS team_checkin_mode TEXT NOT NULL DEFAULT 'TEAM' 
  CHECK (team_checkin_mode IN ('TEAM', 'INDIVIDUAL')),
ADD COLUMN IF NOT EXISTS notify_all_team_members BOOLEAN NOT NULL DEFAULT true;

-- 2. Add Team Columns to Event Registrations
ALTER TABLE public.event_registrations
ADD COLUMN IF NOT EXISTS is_team_registration BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS team_name TEXT;

CREATE INDEX IF NOT EXISTS idx_event_reg_team_name ON public.event_registrations(team_name);

-- 3. Create Event Team Members Table
CREATE TABLE IF NOT EXISTS public.event_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  college TEXT,
  branch TEXT,
  year TEXT,
  is_leader BOOLEAN NOT NULL DEFAULT false,
  qr_token TEXT UNIQUE,
  qr_generated_at TIMESTAMPTZ DEFAULT NOW(),
  is_checked_in BOOLEAN NOT NULL DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_members_registration ON public.event_team_members(registration_id);
CREATE INDEX IF NOT EXISTS idx_team_members_event ON public.event_team_members(event_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.event_team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_qr_token ON public.event_team_members(qr_token);

-- 4. Enhance Event Attendance Table for Team & Member Check-in
ALTER TABLE public.event_attendance
ADD COLUMN IF NOT EXISTS team_member_id UUID REFERENCES public.event_team_members(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS team_name TEXT;

-- Drop previous unique constraint on (event_id, registration_id) if we need to support individual member check-ins
-- We replace it with conditional unique indexes:
ALTER TABLE public.event_attendance DROP CONSTRAINT IF EXISTS uq_event_registration_attendance;

CREATE UNIQUE INDEX IF NOT EXISTS uq_attendance_registration_only 
ON public.event_attendance(event_id, registration_id) 
WHERE team_member_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_attendance_team_member 
ON public.event_attendance(event_id, team_member_id) 
WHERE team_member_id IS NOT NULL;

-- 5. Enhance Event Scan Logs Table
ALTER TABLE public.event_scan_logs
ADD COLUMN IF NOT EXISTS team_member_id UUID REFERENCES public.event_team_members(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS team_name TEXT;

-- 6. Updated Atomic Check-in PostgreSQL Function Supporting Teams and Members
CREATE OR REPLACE FUNCTION public.perform_event_check_in(
  p_event_id UUID,
  p_qr_token TEXT,
  p_volunteer_id UUID,
  p_scan_method TEXT DEFAULT 'CAMERA'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_volunteer_role TEXT;
  v_assigned_responsibilities TEXT[];
  v_event RECORD;
  v_reg RECORD;
  v_member RECORD;
  v_payment RECORD;
  v_token_hash TEXT;
  v_attendance_id UUID;
  v_already_checked_in BOOLEAN := false;
  v_is_member_token BOOLEAN := false;
BEGIN
  v_token_hash := encode(digest(p_qr_token, 'sha256'), 'hex');

  -- Step 1: Verify Volunteer Authorization
  SELECT role INTO v_volunteer_role FROM public.profiles WHERE id = p_volunteer_id;
  IF v_volunteer_role <> 'ADMIN' THEN
    SELECT assigned_responsibilities INTO v_assigned_responsibilities
    FROM public.event_volunteer_applications
    WHERE event_id = p_event_id 
      AND volunteer_id = p_volunteer_id 
      AND status = 'APPROVED';

    IF v_assigned_responsibilities IS NULL OR NOT ('QR_SCANNING' = ANY(v_assigned_responsibilities)) THEN
      INSERT INTO public.event_scan_logs (
        event_id, scanned_by, scan_result, token_hash, scan_method, error_message
      ) VALUES (
        p_event_id, p_volunteer_id, 'UNAUTHORIZED_SCANNER', v_token_hash, p_scan_method,
        'Volunteer does not hold QR_SCANNING responsibility for this event.'
      );

      RETURN jsonb_build_object(
        'success', false,
        'result', 'UNAUTHORIZED_SCANNER',
        'message', 'You do not have approved QR scanning permissions for this event.'
      );
    END IF;
  END IF;

  -- Step 2: Fetch Event
  SELECT * INTO v_event FROM public.events WHERE id = p_event_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'result', 'WRONG_EVENT', 'message', 'Event not found.');
  END IF;

  -- Step 3: Check if token belongs to an individual team member first
  SELECT * INTO v_member FROM public.event_team_members WHERE qr_token = p_qr_token;
  IF FOUND THEN
    v_is_member_token := true;
    SELECT * INTO v_reg FROM public.event_registrations WHERE id = v_member.registration_id;
  ELSE
    -- Check if token belongs to registration (individual or team leader)
    SELECT * INTO v_reg FROM public.event_registrations WHERE qr_token = p_qr_token;
  END IF;

  IF v_reg IS NULL THEN
    INSERT INTO public.event_scan_logs (
      event_id, scanned_by, scan_result, token_hash, scan_method, error_message
    ) VALUES (
      p_event_id, p_volunteer_id, 'INVALID_QR_CODE', v_token_hash, p_scan_method,
      'No registration or team member record matches this QR token.'
    );

    RETURN jsonb_build_object(
      'success', false,
      'result', 'INVALID_QR_CODE',
      'message', 'Invalid QR code. Record not found.'
    );
  END IF;

  -- Step 4: Check if belongs to current event
  IF v_reg.event_id <> p_event_id THEN
    INSERT INTO public.event_scan_logs (
      event_id, registration_id, team_member_id, team_name, scanned_by, scan_result, token_hash, scan_method, error_message
    ) VALUES (
      p_event_id, v_reg.id, CASE WHEN v_is_member_token THEN v_member.id ELSE NULL END, v_reg.team_name, p_volunteer_id, 'WRONG_EVENT', v_token_hash, p_scan_method,
      'QR pass belongs to another event.'
    );

    RETURN jsonb_build_object(
      'success', false,
      'result', 'WRONG_EVENT',
      'message', 'This pass belongs to a different event.'
    );
  END IF;

  -- Step 5: Check registration status
  IF v_reg.registration_status = 'CANCELLED' THEN
    INSERT INTO public.event_scan_logs (
      event_id, registration_id, team_member_id, team_name, scanned_by, scan_result, token_hash, scan_method, error_message
    ) VALUES (
      p_event_id, v_reg.id, CASE WHEN v_is_member_token THEN v_member.id ELSE NULL END, v_reg.team_name, p_volunteer_id, 'REGISTRATION_CANCELLED', v_token_hash, p_scan_method,
      'Registration was cancelled.'
    );

    RETURN jsonb_build_object(
      'success', false,
      'result', 'REGISTRATION_CANCELLED',
      'message', 'This registration has been cancelled.'
    );
  END IF;

  -- Step 6: Payment verification check for paid events
  IF v_event.is_paid THEN
    SELECT * INTO v_payment FROM public.event_payments WHERE registration_id = v_reg.id;
    IF NOT FOUND OR v_payment.payment_status <> 'VERIFIED' THEN
      INSERT INTO public.event_scan_logs (
        event_id, registration_id, team_member_id, team_name, scanned_by, scan_result, token_hash, scan_method, error_message
      ) VALUES (
        p_event_id, v_reg.id, CASE WHEN v_is_member_token THEN v_member.id ELSE NULL END, v_reg.team_name, p_volunteer_id, 'PAYMENT_NOT_VERIFIED', v_token_hash, p_scan_method,
        'Payment status is pending or not verified.'
      );

      RETURN jsonb_build_object(
        'success', false,
        'result', 'PAYMENT_NOT_VERIFIED',
        'message', 'Payment has not been verified by an administrator.',
        'participantName', CASE WHEN v_is_member_token THEN v_member.member_name ELSE v_reg.participant_name END,
        'teamName', v_reg.team_name,
        'registrationNumber', v_reg.registration_number
      );
    END IF;
  END IF;

  -- Step 7: Check if already checked in
  IF v_is_member_token THEN
    SELECT EXISTS (
      SELECT 1 FROM public.event_attendance 
      WHERE event_id = p_event_id AND team_member_id = v_member.id
    ) INTO v_already_checked_in;
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM public.event_attendance 
      WHERE event_id = p_event_id AND registration_id = v_reg.id AND team_member_id IS NULL
    ) INTO v_already_checked_in;
  END IF;

  IF v_already_checked_in THEN
    INSERT INTO public.event_scan_logs (
      event_id, registration_id, team_member_id, team_name, scanned_by, scan_result, token_hash, scan_method, error_message
    ) VALUES (
      p_event_id, v_reg.id, CASE WHEN v_is_member_token THEN v_member.id ELSE NULL END, v_reg.team_name, p_volunteer_id, 'ALREADY_CHECKED_IN', v_token_hash, p_scan_method,
      'Attendee has already been checked in.'
    );

    RETURN jsonb_build_object(
      'success', false,
      'result', 'ALREADY CHECKED IN',
      'message', 'Attendee has already checked in!',
      'participantName', CASE WHEN v_is_member_token THEN v_member.member_name ELSE v_reg.participant_name END,
      'isTeam', v_reg.is_team_registration,
      'teamName', v_reg.team_name,
      'registrationNumber', v_reg.registration_number
    );
  END IF;

  -- Step 8: Atomic Insert into event_attendance
  BEGIN
    IF v_is_member_token THEN
      INSERT INTO public.event_attendance (
        event_id, registration_id, team_member_id, team_name, participant_id, checked_in_by, check_in_method
      ) VALUES (
        p_event_id, v_reg.id, v_member.id, v_reg.team_name, v_reg.user_id, p_volunteer_id, p_scan_method
      ) RETURNING id INTO v_attendance_id;

      UPDATE public.event_team_members 
      SET is_checked_in = true, checked_in_at = NOW(), checked_in_by = p_volunteer_id 
      WHERE id = v_member.id;
    ELSE
      INSERT INTO public.event_attendance (
        event_id, registration_id, team_name, participant_id, checked_in_by, check_in_method
      ) VALUES (
        p_event_id, v_reg.id, v_reg.team_name, v_reg.user_id, p_volunteer_id, p_scan_method
      ) RETURNING id INTO v_attendance_id;

      -- If it's a team registration with team-level scan, mark all members checked in
      IF v_reg.is_team_registration THEN
        UPDATE public.event_team_members 
        SET is_checked_in = true, checked_in_at = NOW(), checked_in_by = p_volunteer_id 
        WHERE registration_id = v_reg.id;
      END IF;
    END IF;
  EXCEPTION WHEN unique_violation THEN
    INSERT INTO public.event_scan_logs (
      event_id, registration_id, team_member_id, team_name, scanned_by, scan_result, token_hash, scan_method, error_message
    ) VALUES (
      p_event_id, v_reg.id, CASE WHEN v_is_member_token THEN v_member.id ELSE NULL END, v_reg.team_name, p_volunteer_id, 'ALREADY_CHECKED_IN', v_token_hash, p_scan_method,
      'Simultaneous scan caught by database unique constraint.'
    );

    RETURN jsonb_build_object(
      'success', false,
      'result', 'ALREADY CHECKED IN',
      'message', 'Attendee was just checked in concurrently!',
      'participantName', CASE WHEN v_is_member_token THEN v_member.member_name ELSE v_reg.participant_name END,
      'teamName', v_reg.team_name,
      'registrationNumber', v_reg.registration_number
    );
  END;

  -- Step 9: Log Successful Scan
  INSERT INTO public.event_scan_logs (
    event_id, registration_id, team_member_id, team_name, scanned_by, scan_result, token_hash, scan_method
  ) VALUES (
    p_event_id, v_reg.id, CASE WHEN v_is_member_token THEN v_member.id ELSE NULL END, v_reg.team_name, p_volunteer_id, 'SUCCESS', v_token_hash, p_scan_method
  );

  RETURN jsonb_build_object(
    'success', true,
    'result', 'CHECK-IN SUCCESSFUL',
    'message', 'Check-in confirmed successfully!',
    'participantName', CASE WHEN v_is_member_token THEN v_member.member_name ELSE v_reg.participant_name END,
    'isTeam', v_reg.is_team_registration,
    'teamName', v_reg.team_name,
    'registrationNumber', v_reg.registration_number,
    'checkedInAt', NOW()
  );
END;
$$;

-- 7. Row Level Security for event_team_members
ALTER TABLE public.event_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to event_team_members"
ON public.event_team_members FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Public can view team members for registrations"
ON public.event_team_members FOR SELECT
USING (true);

CREATE POLICY "Public can insert team members during registration"
ON public.event_team_members FOR INSERT
WITH CHECK (true);
