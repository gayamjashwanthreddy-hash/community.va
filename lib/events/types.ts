// COMMUNITY.VA — Event Management & Dynamic Registration Types

export type EventStatus = 
  | "DRAFT" 
  | "PUBLISHED" 
  | "REGISTRATION_CLOSED" 
  | "COMPLETED" 
  | "CANCELLED";

export type QuestionType = 
  | "short_text"
  | "long_text"
  | "email"
  | "phone"
  | "number"
  | "dropdown"
  | "checkboxes"
  | "radio"
  | "date"
  | "file_upload";

export type PaymentStatus = 
  | "NOT_REQUIRED"
  | "PAYMENT_PENDING"
  | "PAYMENT_SUBMITTED"
  | "PAYMENT_VERIFIED"
  | "PAYMENT_REJECTED";

export type RegistrationStatus = 
  | "CONFIRMED"
  | "CANCELLED";

export interface EventFormQuestion {
  id: string;
  event_id?: string;
  label: string;
  description?: string;
  question_type: QuestionType;
  is_required: boolean;
  placeholder?: string;
  options?: string[]; // For dropdown, checkboxes, radio
  validation_rules?: {
    min?: number;
    max?: number;
    pattern?: string;
    allowed_extensions?: string[];
  };
  display_order: number;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_path?: string;
  category: string;
  venue: string;
  event_start: string; // ISO date string
  event_end: string;
  registration_start: string;
  registration_end: string;
  capacity: number;
  organizer: string;
  contact_email: string;
  instructions?: string;
  status: EventStatus;
  
  // Payment configuration
  is_paid: boolean;
  fee_amount: number;
  fee_currency: string;
  payment_instructions?: string;
  payment_upi_id?: string;
  payment_payee_name?: string;
  payment_qr_path?: string;
  payment_verification_required: boolean;
  
  created_by?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  // Joined fields
  questions?: EventFormQuestion[];
  registration_count?: number;
  pending_payments_count?: number;
  verified_payments_count?: number;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id?: string | null;
  registration_number: string;
  participant_name: string;
  participant_email: string;
  participant_phone: string;
  answers: Record<string, any>; // keyed by question id or label
  registration_status: RegistrationStatus;
  internal_notes?: string | null;
  registered_at: string;
  updated_at: string;

  // QR Pass & Attendance Fields
  qr_token?: string;
  qr_generated_at?: string;
  is_checked_in?: boolean;
  checked_in_at?: string | null;

  // Joined Payment
  payment?: EventPayment | null;
  event?: EventItem;
}

export type VolunteerResponsibility = 
  | "QR_SCANNING"
  | "PARTICIPANT_CHECK_IN"
  | "REGISTRATION_DESK"
  | "EVENT_COORDINATION"
  | "GENERAL_SUPPORT";

export type VolunteerApplicationStatus = 
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "WITHDRAWN";

export interface EventVolunteerApplication {
  id: string;
  event_id: string;
  volunteer_id: string;
  motivation: string;
  experience?: string | null;
  preferred_responsibilities: VolunteerResponsibility[];
  assigned_responsibilities: VolunteerResponsibility[];
  availability: string;
  additional_info?: string | null;
  status: VolunteerApplicationStatus;
  rejection_reason?: string | null;
  internal_notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;

  // Joined relationships
  profiles?: {
    full_name: string;
    email: string;
    mobile?: string | null;
  };
  event?: EventItem;
}

export interface EventAttendance {
  id: string;
  event_id: string;
  registration_id: string;
  participant_id?: string | null;
  checked_in_by: string;
  checked_in_at: string;
  check_in_method: "QR_SCAN" | "MANUAL_ENTRY";

  // Joined fields
  registration?: EventRegistration;
  volunteer?: {
    full_name: string;
    email: string;
  };
}

export type ScanResultStatus =
  | "CHECK-IN SUCCESSFUL"
  | "ALREADY CHECKED IN"
  | "INVALID QR CODE"
  | "WRONG EVENT"
  | "PAYMENT NOT VERIFIED"
  | "REGISTRATION CANCELLED"
  | "UNAUTHORIZED_SCANNER";

export interface EventScanLog {
  id: string;
  event_id: string;
  registration_id?: string | null;
  scanned_by: string;
  scan_result: string;
  token_hash: string;
  scan_method: "CAMERA" | "MANUAL";
  error_message?: string | null;
  scanned_at: string;

  // Joined
  volunteer?: {
    full_name: string;
    email: string;
  };
  registration?: EventRegistration;
}

export interface EventPayment {
  id: string;
  registration_id: string;
  event_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_reference?: string | null;
  screenshot_path?: string | null;
  payment_status: PaymentStatus;
  rejection_reason?: string | null;
  submitted_at?: string | null;
  verified_at?: string | null;
  verified_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventPaymentHistory {
  id: string;
  payment_id: string;
  previous_status: PaymentStatus;
  new_status: PaymentStatus;
  changed_by?: string | null;
  reason?: string | null;
  created_at: string;
}

export function generateEventRegistrationNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const randomAlpha = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CVA-EVT-${timestamp}-${randomAlpha}`;
}

export function generateEventSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
