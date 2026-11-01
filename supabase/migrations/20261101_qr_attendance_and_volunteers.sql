-- ==============================================================================
-- COMMUNITY.VA — Event QR Pass, Volunteer Approval & Attendance System
-- Migration: 20261101_qr_attendance_and_volunteers.sql
-- ==============================================================================

-- 1. Add qr_token to event_registrations if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'event_registrations' 
      AND column_name = 'qr_token'
  ) THEN
    ALTER TABLE public.event_registrations ADD COLUMN qr_token TEXT;
    -- Populate existing records if any
    UPDATE public.event_registrations 
    SET qr_token = 'cva_' || encode(gen_random_bytes(18), 'hex')
    WHERE qr_token IS NULL;
    
    ALTER TABLE public.event_registrations ALTER COLUMN qr_token SET NOT NULL;
    ALTER TABLE public.event_registrations ADD CONSTRAINT uq_event_reg_qr_token UNIQUE (qr_token);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'event_registrations' 
      AND column_name = 'qr_generated_at'
  ) THEN
    ALTER TABLE public.event_registrations ADD COLUMN qr_generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_event_reg_qr_token ON public.event_registrations(qr_token);

-- 2. Event Volunteer Applications Table
CREATE TABLE IF NOT EXISTS public.event_volunteer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  motivation TEXT NOT NULL,
  experience TEXT,
  preferred_responsibilities TEXT[] NOT NULL DEFAULT '{}',
  assigned_responsibilities TEXT[] NOT NULL DEFAULT '{}',
  availability TEXT NOT NULL,
  additional_info TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN'
  rejection_reason TEXT,
  internal_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_event_volunteer_app UNIQUE (event_id, volunteer_id)
);

CREATE INDEX IF NOT EXISTS idx_evt_vol_app_event ON public.event_volunteer_applications(event_id);
CREATE INDEX IF NOT EXISTS idx_evt_vol_app_volunteer ON public.event_volunteer_applications(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_evt_vol_app_status ON public.event_volunteer_applications(status);

-- 3. Event Volunteer Audit Trail
CREATE TABLE IF NOT EXISTS public.event_volunteer_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.event_volunteer_applications(id) ON DELETE CASCADE,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  assigned_responsibilities TEXT[] NOT NULL DEFAULT '{}',
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evt_vol_hist_app ON public.event_volunteer_history(application_id);

-- 4. Event Attendance Table (Unique constraint prevents duplicate check-ins)
CREATE TABLE IF NOT EXISTS public.event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  registration_id UUID NOT NULL REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  checked_in_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_in_method TEXT NOT NULL DEFAULT 'QR_SCAN', -- 'QR_SCAN', 'MANUAL_ENTRY'
  CONSTRAINT uq_event_attendance UNIQUE (event_id, registration_id)
);

CREATE INDEX IF NOT EXISTS idx_evt_attendance_event ON public.event_attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_evt_attendance_reg ON public.event_attendance(registration_id);
CREATE INDEX IF NOT EXISTS idx_evt_attendance_volunteer ON public.event_attendance(checked_in_by);

-- 5. Event Scan Logs Table (Separate audit log for all scans, successful and failed)
CREATE TABLE IF NOT EXISTS public.event_scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  registration_id UUID REFERENCES public.event_registrations(id) ON DELETE SET NULL,
  scanned_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scan_result TEXT NOT NULL, -- 'SUCCESS', 'ALREADY_CHECKED_IN', 'INVALID_TOKEN', 'WRONG_EVENT', 'PAYMENT_NOT_VERIFIED', 'CANCELLED'
  token_hash TEXT NOT NULL, -- Masked or hashed token (never raw token)
  scan_method TEXT NOT NULL DEFAULT 'CAMERA', -- 'CAMERA', 'MANUAL'
  error_message TEXT,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evt_scan_logs_event ON public.event_scan_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_evt_scan_logs_reg ON public.event_scan_logs(registration_id);
CREATE INDEX IF NOT EXISTS idx_evt_scan_logs_volunteer ON public.event_scan_logs(scanned_by);
CREATE INDEX IF NOT EXISTS idx_evt_scan_logs_result ON public.event_scan_logs(scan_result);

-- 6. Trigger for updated_at on event_volunteer_applications
CREATE OR REPLACE TRIGGER set_evt_vol_apps_updated_at 
BEFORE UPDATE ON public.event_volunteer_applications
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. Atomic Participant Check-In Database Function
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
  v_volunteer_approved BOOLEAN;
  v_has_scanner_role BOOLEAN;
  v_reg RECORD;
  v_event RECORD;
  v_payment RECORD;
  v_already_checked_in BOOLEAN;
  v_attendance_id UUID;
  v_token_hash TEXT;
BEGIN
  -- Generate masked token hash for privacy
  v_token_hash := 'sha256:' || encode(digest(p_qr_token, 'sha256'), 'hex');

  -- Step 1: Verify Volunteer permissions
  SELECT 
    (status = 'APPROVED'),
    ('QR_SCANNING' = ANY(assigned_responsibilities))
  INTO v_volunteer_approved, v_has_scanner_role
  FROM public.event_volunteer_applications
  WHERE event_id = p_event_id AND volunteer_id = p_volunteer_id;

  -- Also allow platform ADMIN to scan
  IF NOT FOUND OR (v_volunteer_approved IS NOT TRUE OR v_has_scanner_role IS NOT TRUE) THEN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_volunteer_id AND role = 'ADMIN') THEN
      INSERT INTO public.event_scan_logs (
        event_id, scanned_by, scan_result, token_hash, scan_method, error_message
      ) VALUES (
        p_event_id, p_volunteer_id, 'UNAUTHORIZED_SCANNER', v_token_hash, p_scan_method,
        'Volunteer not approved for QR_SCANNING on this event.'
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

  -- Step 3: Fetch Registration by QR Token
  SELECT * INTO v_reg FROM public.event_registrations WHERE qr_token = p_qr_token;
  IF NOT FOUND THEN
    INSERT INTO public.event_scan_logs (
      event_id, scanned_by, scan_result, token_hash, scan_method, error_message
    ) VALUES (
      p_event_id, p_volunteer_id, 'INVALID_QR_CODE', v_token_hash, p_scan_method,
      'No registration record matches this QR token.'
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
      event_id, registration_id, scanned_by, scan_result, token_hash, scan_method, error_message
    ) VALUES (
      p_event_id, v_reg.id, p_volunteer_id, 'WRONG_EVENT', v_token_hash, p_scan_method,
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
      event_id, registration_id, scanned_by, scan_result, token_hash, scan_method, error_message
    ) VALUES (
      p_event_id, v_reg.id, p_volunteer_id, 'REGISTRATION_CANCELLED', v_token_hash, p_scan_method,
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
        event_id, registration_id, scanned_by, scan_result, token_hash, scan_method, error_message
      ) VALUES (
        p_event_id, v_reg.id, p_volunteer_id, 'PAYMENT_NOT_VERIFIED', v_token_hash, p_scan_method,
        'Payment status is pending or not verified.'
      );

      RETURN jsonb_build_object(
        'success', false,
        'result', 'PAYMENT_NOT_VERIFIED',
        'message', 'Payment has not been verified by an administrator.',
        'participantName', v_reg.participant_name,
        'registrationNumber', v_reg.registration_number
      );
    END IF;
  END IF;

  -- Step 7: Check if already checked in
  SELECT EXISTS (
    SELECT 1 FROM public.event_attendance 
    WHERE event_id = p_event_id AND registration_id = v_reg.id
  ) INTO v_already_checked_in;

  IF v_already_checked_in THEN
    INSERT INTO public.event_scan_logs (
      event_id, registration_id, scanned_by, scan_result, token_hash, scan_method, error_message
    ) VALUES (
      p_event_id, v_reg.id, p_volunteer_id, 'ALREADY_CHECKED_IN', v_token_hash, p_scan_method,
      'Participant was already checked in.'
    );

    RETURN jsonb_build_object(
      'success', false,
      'result', 'ALREADY_CHECKED_IN',
      'message', 'Participant has already checked in!',
      'participantName', v_reg.participant_name,
      'registrationNumber', v_reg.registration_number
    );
  END IF;

  -- Step 8: Atomic Insert into event_attendance
  BEGIN
    INSERT INTO public.event_attendance (
      event_id, registration_id, participant_id, checked_in_by, check_in_method
    ) VALUES (
      p_event_id, v_reg.id, v_reg.user_id, p_volunteer_id, p_scan_method
    ) RETURNING id INTO v_attendance_id;
  EXCEPTION WHEN unique_violation THEN
    -- Concurrency safety: simultaneous scan caught by unique constraint
    INSERT INTO public.event_scan_logs (
      event_id, registration_id, scanned_by, scan_result, token_hash, scan_method, error_message
    ) VALUES (
      p_event_id, v_reg.id, p_volunteer_id, 'ALREADY_CHECKED_IN', v_token_hash, p_scan_method,
      'Simultaneous scan caught by database unique constraint.'
    );

    RETURN jsonb_build_object(
      'success', false,
      'result', 'ALREADY_CHECKED_IN',
      'message', 'Participant was just checked in concurrently!',
      'participantName', v_reg.participant_name,
      'registrationNumber', v_reg.registration_number
    );
  END;

  -- Step 9: Log Successful Scan
  INSERT INTO public.event_scan_logs (
    event_id, registration_id, scanned_by, scan_result, token_hash, scan_method
  ) VALUES (
    p_event_id, v_reg.id, p_volunteer_id, 'SUCCESS', v_token_hash, p_scan_method
  );

  RETURN jsonb_build_object(
    'success', true,
    'result', 'CHECK-IN SUCCESSFUL',
    'message', 'Check-in confirmed successfully!',
    'participantName', v_reg.participant_name,
    'registrationNumber', v_reg.registration_number,
    'checkedInAt', NOW()
  );
END;
$$;

-- 8. Row Level Security Policies

-- Event Volunteer Applications
ALTER TABLE public.event_volunteer_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to event_volunteer_applications"
ON public.event_volunteer_applications FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Volunteers can view their own event applications"
ON public.event_volunteer_applications FOR SELECT
USING (auth.uid() = volunteer_id);

CREATE POLICY "Volunteers can submit their own event applications"
ON public.event_volunteer_applications FOR INSERT
WITH CHECK (auth.uid() = volunteer_id);

-- Event Attendance
ALTER TABLE public.event_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to event_attendance"
ON public.event_attendance FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Approved scanning volunteers can read attendance for their event"
ON public.event_attendance FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.event_volunteer_applications
    WHERE event_id = public.event_attendance.event_id
      AND volunteer_id = auth.uid()
      AND status = 'APPROVED'
      AND 'QR_SCANNING' = ANY(assigned_responsibilities)
  )
);

-- Event Scan Logs
ALTER TABLE public.event_scan_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to event_scan_logs"
ON public.event_scan_logs FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Approved scanning volunteers can insert scan logs"
ON public.event_scan_logs FOR INSERT
WITH CHECK (auth.uid() = scanned_by);
