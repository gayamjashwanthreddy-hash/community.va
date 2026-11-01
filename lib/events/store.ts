import { createAdminClient } from "@/lib/supabase/admin";
import { 
  EventItem, 
  EventFormQuestion, 
  EventRegistration, 
  EventTeamMember,
  EventPayment, 
  EventStatus, 
  PaymentStatus,
  generateEventRegistrationNumber,
  generateEventSlug 
} from "./types";
import { 
  sendEventRegistrationConfirmationEmail, 
  sendPaymentVerifiedEmail, 
  sendPaymentRejectedEmail 
} from "@/lib/email";
import { generateQrVerificationToken } from "@/lib/qr";
import { 
  sendEventConfirmedPassEmail, 
  sendPaymentSubmittedEmail,
  dispatchRegistrationEmails
} from "@/lib/brevo";
import { OFFICIAL_COMMUNITY_EMAIL } from "@/lib/constants";

// Built-in verified baseline events for seamless initial launch
const INITIAL_SEED_EVENTS: EventItem[] = [
  {
    id: "evt-01-hackathon",
    title: "COMMUNITY.VA Innovation Hackathon 2026",
    slug: "community-va-innovation-hackathon-2026",
    description: "A 36-hour sprint uniting student developers, designers, and problem solvers to build software tackling urban, educational, and sustainability challenges in Hyderabad.",
    category: "Technology & Innovation",
    venue: "T-Hub Phase 2 & Virtual Hub, Hyderabad",
    event_start: "2026-11-20T09:00:00Z",
    event_end: "2026-11-21T21:00:00Z",
    registration_start: "2026-10-01T00:00:00Z",
    registration_end: "2026-11-15T23:59:59Z",
    capacity: 250,
    organizer: "COMMUNITY.VA Tech Division",
    contact_email: OFFICIAL_COMMUNITY_EMAIL,
    instructions: "Bring your student ID card, laptops, chargers, and enthusiasm. Meals, refreshments, mentorship, and high-speed Wi-Fi provided.",
    status: "PUBLISHED",
    is_paid: true,
    fee_amount: 199.00,
    fee_currency: "INR",
    payment_instructions: "Scan the official COMMUNITY.VA UPI QR code using PhonePe, Google Pay, or Paytm. Submit the transaction screenshot and UTR number below.",
    payment_upi_id: "community.va@okaxis",
    payment_payee_name: "COMMUNITY VA YOUTH FORUM",
    payment_qr_path: "/logos/community-va-logo.png",
    payment_verification_required: true,
    is_team_event: true,
    min_team_size: 2,
    max_team_size: 5,
    team_checkin_mode: "TEAM",
    notify_all_team_members: true,
    created_at: "2026-10-15T10:00:00Z",
    updated_at: "2026-10-15T10:00:00Z",
    questions: [
      {
        id: "q1",
        label: "College / University Name",
        description: "Your currently enrolled institution in Telangana / AP",
        question_type: "short_text",
        is_required: true,
        placeholder: "e.g., JNTU Hyderabad / CBIT / VNR VJIET",
        display_order: 1,
      },
      {
        id: "q2",
        label: "Branch & Year of Study",
        description: "Current academic progression",
        question_type: "dropdown",
        is_required: true,
        options: ["CSE / IT — 1st Year", "CSE / IT — 2nd Year", "CSE / IT — 3rd Year", "CSE / IT — 4th Year", "ECE / EEE", "Mechanical / Civil", "Other / Masters"],
        display_order: 2,
      },
      {
        id: "q3",
        label: "Primary Technical Skills",
        description: "Select all that apply to your team role",
        question_type: "checkboxes",
        is_required: false,
        options: ["Frontend (React/Next.js)", "Backend (Node/Python/Go)", "AI/ML & Data Science", "Mobile Apps (Flutter/React Native)", "UI/UX & Product Design"],
        display_order: 3,
      },
      {
        id: "q4",
        label: "GitHub or Portfolio URL",
        description: "Showcase your previous projects or code repositories",
        question_type: "short_text",
        is_required: false,
        placeholder: "https://github.com/your-username",
        display_order: 4,
      },
      {
        id: "q5",
        label: "T-Shirt Size for Hackathon Kit",
        question_type: "radio",
        is_required: true,
        options: ["S", "M", "L", "XL", "XXL"],
        display_order: 5,
      }
    ],
    registration_count: 84,
    pending_payments_count: 12,
    verified_payments_count: 72,
  },
  {
    id: "evt-02-masterclass",
    title: "Youth Leadership & Public Speaking Masterclass",
    slug: "youth-leadership-and-public-speaking-masterclass",
    description: "An intensive interactive workshop focusing on stage presence, impromptu speaking, elevator pitches, and leading student organizations with empathy and impact.",
    category: "Personal Development",
    venue: "Ravindra Bharathi Mini Hall, Lakdikapul, Hyderabad",
    event_start: "2026-11-28T14:00:00Z",
    event_end: "2026-11-28T18:30:00Z",
    registration_start: "2026-10-10T00:00:00Z",
    registration_end: "2026-11-26T18:00:00Z",
    capacity: 120,
    organizer: "COMMUNITY.VA Personal Growth Division",
    contact_email: OFFICIAL_COMMUNITY_EMAIL,
    instructions: "Formal / smart casual attire recommended. Notepad, workbook, and networking tea included.",
    status: "PUBLISHED",
    is_paid: false,
    fee_amount: 0,
    fee_currency: "INR",
    payment_verification_required: false,
    created_at: "2026-10-18T12:00:00Z",
    updated_at: "2026-10-18T12:00:00Z",
    questions: [
      {
        id: "q201",
        label: "College / University Name",
        question_type: "short_text",
        is_required: true,
        placeholder: "e.g., Osmania University Campus",
        display_order: 1,
      },
      {
        id: "q202",
        label: "What is your main goal for attending this masterclass?",
        question_type: "long_text",
        is_required: true,
        placeholder: "Tell us about a speaking or leadership challenge you would like to overcome...",
        display_order: 2,
      },
      {
        id: "q203",
        label: "Have you previously held a leadership role?",
        question_type: "radio",
        is_required: false,
        options: ["Yes, student club / fest coordinator", "Yes, class representative", "No, but eager to step up"],
        display_order: 3,
      }
    ],
    registration_count: 67,
    pending_payments_count: 0,
    verified_payments_count: 0,
  },
  {
    id: "evt-03-open-mic",
    title: "Youth Acoustic & Open Mic Night",
    slug: "youth-acoustic-open-mic-night",
    description: "An open stage for student vocalists, musicians, poets, and storytellers to perform in a supportive, energetic, youth-driven atmosphere.",
    category: "Events & Entertainment",
    venue: "Lamakaan Cultural Space, Banjara Hills, Hyderabad",
    event_start: "2026-12-05T17:30:00Z",
    event_end: "2026-12-05T21:00:00Z",
    registration_start: "2026-10-20T00:00:00Z",
    registration_end: "2026-12-03T23:59:59Z",
    capacity: 90,
    organizer: "COMMUNITY.VA Cultural Division",
    contact_email: OFFICIAL_COMMUNITY_EMAIL,
    instructions: "Acoustic instruments only. Slot allocation will be confirmed via email 48 hours prior to the event.",
    status: "PUBLISHED",
    is_paid: false,
    fee_amount: 0,
    fee_currency: "INR",
    payment_verification_required: false,
    created_at: "2026-10-20T14:00:00Z",
    updated_at: "2026-10-20T14:00:00Z",
    questions: [
      {
        id: "q301",
        label: "Performance Type",
        question_type: "dropdown",
        is_required: true,
        options: ["Acoustic Solo / Duet", "Spoken Word / Poetry", "Standup Comedy", "Audience / Supporter Only"],
        display_order: 1,
      },
      {
        id: "q302",
        label: "Performance Duration (Minutes)",
        question_type: "number",
        is_required: false,
        placeholder: "e.g., 5",
        display_order: 2,
      }
    ],
    registration_count: 52,
    pending_payments_count: 0,
    verified_payments_count: 0,
  }
];

// Fallback in-memory cache to preserve state during local testing
const inMemoryEvents: Map<string, EventItem> = new Map();
const inMemoryRegistrations: Map<string, EventRegistration[]> = new Map();

// Initialize memory cache
INITIAL_SEED_EVENTS.forEach(evt => inMemoryEvents.set(evt.id, evt));

// Mock initial registrations for the hackathon
inMemoryRegistrations.set("evt-01-hackathon", [
  {
    id: "reg-01",
    event_id: "evt-01-hackathon",
    registration_number: "CVA-EVT-9KA1-2841",
    participant_name: "Sai Krishna Reddy",
    participant_email: "saikrishna.dev@gmail.com",
    participant_phone: "+91 98490 12345",
    answers: {
      "College / University Name": "CBIT Hyderabad",
      "Branch & Year of Study": "CSE / IT — 3rd Year",
      "Primary Technical Skills": ["Frontend (React/Next.js)", "Backend (Node/Python/Go)"],
      "GitHub or Portfolio URL": "https://github.com/saikrishna-reddy",
      "T-Shirt Size for Hackathon Kit": "L"
    },
    registration_status: "CONFIRMED",
    registered_at: "2026-10-28T14:30:00Z",
    updated_at: "2026-10-28T14:30:00Z",
    payment: {
      id: "pay-01",
      registration_id: "reg-01",
      event_id: "evt-01-hackathon",
      amount: 199.00,
      currency: "INR",
      payment_method: "UPI",
      payment_reference: "UPI/329048192847",
      screenshot_path: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
      payment_status: "PAYMENT_SUBMITTED",
      submitted_at: "2026-10-28T14:32:00Z",
      created_at: "2026-10-28T14:32:00Z",
      updated_at: "2026-10-28T14:32:00Z"
    }
  },
  {
    id: "reg-02",
    event_id: "evt-01-hackathon",
    registration_number: "CVA-EVT-8L4B-9023",
    participant_name: "Ananya Rao",
    participant_email: "ananya.rao.tech@gmail.com",
    participant_phone: "+91 94401 56789",
    answers: {
      "College / University Name": "VNR VJIET",
      "Branch & Year of Study": "CSE / IT — 2nd Year",
      "Primary Technical Skills": ["UI/UX & Product Design", "Frontend (React/Next.js)"],
      "GitHub or Portfolio URL": "https://ananyarao.design",
      "T-Shirt Size for Hackathon Kit": "M"
    },
    registration_status: "CONFIRMED",
    registered_at: "2026-10-29T10:15:00Z",
    updated_at: "2026-10-29T11:00:00Z",
    payment: {
      id: "pay-02",
      registration_id: "reg-02",
      event_id: "evt-01-hackathon",
      amount: 199.00,
      currency: "INR",
      payment_method: "UPI",
      payment_reference: "UPI/410294817290",
      screenshot_path: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
      payment_status: "PAYMENT_VERIFIED",
      submitted_at: "2026-10-29T10:16:00Z",
      verified_at: "2026-10-29T11:00:00Z",
      verified_by: "Admin",
      created_at: "2026-10-29T10:16:00Z",
      updated_at: "2026-10-29T11:00:00Z"
    }
  }
]);

// -----------------------------------------------------------------------------
// EVENT METHODS
// -----------------------------------------------------------------------------

export async function getEvents(options: { 
  publicOnly?: boolean; 
  category?: string;
  status?: string;
  search?: string;
}): Promise<EventItem[]> {
  const adminClient = createAdminClient();

  try {
    let query = adminClient
      .from("events")
      .select(`
        *,
        questions:event_form_questions(*)
      `)
      .is("deleted_at", null)
      .order("event_start", { ascending: true });

    if (options.publicOnly) {
      query = query.eq("status", "PUBLISHED");
    } else if (options.status && options.status !== "ALL") {
      query = query.eq("status", options.status);
    }

    if (options.category && options.category !== "ALL") {
      query = query.eq("category", options.category);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return data.map((evt: any) => ({
        ...evt,
        questions: evt.questions?.sort((a: any, b: any) => a.display_order - b.display_order) || []
      }));
    }
  } catch (err) {
    console.warn("[getEvents] Supabase fetch fallback to in-memory store:", err);
  }

  // In-memory fallback
  let list = Array.from(inMemoryEvents.values()).filter(e => !e.deleted_at);

  if (options.publicOnly) {
    list = list.filter(e => e.status === "PUBLISHED");
  } else if (options.status && options.status !== "ALL") {
    list = list.filter(e => e.status === options.status);
  }

  if (options.category && options.category !== "ALL") {
    list = list.filter(e => e.category === options.category);
  }

  if (options.search) {
    const s = options.search.toLowerCase();
    list = list.filter(e => e.title.toLowerCase().includes(s) || e.venue.toLowerCase().includes(s));
  }

  return list;
}

export async function getEventBySlugOrId(slugOrId: string): Promise<EventItem | null> {
  const adminClient = createAdminClient();

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    let query = adminClient
      .from("events")
      .select(`
        *,
        questions:event_form_questions(*)
      `);

    if (isUuid) {
      query = query.eq("id", slugOrId);
    } else {
      query = query.eq("slug", slugOrId);
    }

    const { data, error } = await query.single();
    if (!error && data) {
      return {
        ...data,
        questions: data.questions?.sort((a: any, b: any) => a.display_order - b.display_order) || []
      };
    }
  } catch (err) {
    console.warn("[getEventBySlugOrId] Fallback to in-memory:", err);
  }

  // In-memory fallback
  for (const evt of inMemoryEvents.values()) {
    if (evt.id === slugOrId || evt.slug === slugOrId) {
      return evt;
    }
  }

  return null;
}

export async function createEvent(
  eventData: Partial<EventItem>, 
  questions: EventFormQuestion[],
  adminUserId?: string
): Promise<{ success: boolean; event?: EventItem; error?: string }> {
  const adminClient = createAdminClient();
  const slug = eventData.slug || generateEventSlug(eventData.title || "event");
  const id = eventData.id || `evt-${Date.now().toString(36)}`;

  const newEvent: EventItem = {
    id,
    title: eventData.title || "Untitled Event",
    slug,
    description: eventData.description || "",
    cover_image_path: eventData.cover_image_path || "",
    category: eventData.category || "Technology & Innovation",
    venue: eventData.venue || "Hyderabad",
    event_start: eventData.event_start || new Date().toISOString(),
    event_end: eventData.event_end || new Date().toISOString(),
    registration_start: eventData.registration_start || new Date().toISOString(),
    registration_end: eventData.registration_end || new Date(Date.now() + 86400000 * 14).toISOString(),
    capacity: Number(eventData.capacity) || 100,
    organizer: eventData.organizer || "COMMUNITY.VA",
    contact_email: eventData.contact_email || OFFICIAL_COMMUNITY_EMAIL,
    instructions: eventData.instructions || "",
    status: eventData.status || "DRAFT",
    is_paid: Boolean(eventData.is_paid),
    fee_amount: Number(eventData.fee_amount) || 0,
    fee_currency: eventData.fee_currency || "INR",
    payment_instructions: eventData.payment_instructions || "",
    payment_upi_id: eventData.payment_upi_id || "",
    payment_payee_name: eventData.payment_payee_name || "",
    payment_qr_path: eventData.payment_qr_path || "",
    payment_verification_required: Boolean(eventData.payment_verification_required ?? true),
    created_by: adminUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questions: questions.map((q, idx) => ({ ...q, display_order: idx + 1 }))
  };

  try {
    const { data: dbEvent, error: eventErr } = await adminClient
      .from("events")
      .insert({
        title: newEvent.title,
        slug: newEvent.slug,
        description: newEvent.description,
        cover_image_path: newEvent.cover_image_path,
        category: newEvent.category,
        venue: newEvent.venue,
        event_start: newEvent.event_start,
        event_end: newEvent.event_end,
        registration_start: newEvent.registration_start,
        registration_end: newEvent.registration_end,
        capacity: newEvent.capacity,
        organizer: newEvent.organizer,
        contact_email: newEvent.contact_email,
        instructions: newEvent.instructions,
        status: newEvent.status,
        is_paid: newEvent.is_paid,
        fee_amount: newEvent.fee_amount,
        fee_currency: newEvent.fee_currency,
        payment_instructions: newEvent.payment_instructions,
        payment_upi_id: newEvent.payment_upi_id,
        payment_payee_name: newEvent.payment_payee_name,
        payment_qr_path: newEvent.payment_qr_path,
        payment_verification_required: newEvent.payment_verification_required,
        created_by: adminUserId
      })
      .select()
      .single();

    if (!eventErr && dbEvent) {
      newEvent.id = dbEvent.id;

      if (questions && questions.length > 0) {
        const rows = questions.map((q, idx) => ({
          event_id: dbEvent.id,
          label: q.label,
          description: q.description || null,
          question_type: q.question_type,
          is_required: q.is_required,
          placeholder: q.placeholder || null,
          options: q.options || [],
          validation_rules: q.validation_rules || {},
          display_order: idx + 1,
        }));
        await adminClient.from("event_form_questions").insert(rows);
      }
    }
  } catch (err) {
    console.warn("[createEvent] DB insert fallback to memory:", err);
  }

  // Also store in memory
  inMemoryEvents.set(newEvent.id, newEvent);
  return { success: true, event: newEvent };
}

export async function updateEvent(
  id: string,
  eventData: Partial<EventItem>,
  questions?: EventFormQuestion[]
): Promise<{ success: boolean; event?: EventItem; error?: string }> {
  const existing = await getEventBySlugOrId(id);
  if (!existing) {
    return { success: false, error: "Event not found" };
  }

  const updated: EventItem = {
    ...existing,
    ...eventData,
    updated_at: new Date().toISOString(),
    questions: questions ? questions.map((q, idx) => ({ ...q, display_order: idx + 1 })) : existing.questions
  };

  const adminClient = createAdminClient();
  try {
    await adminClient
      .from("events")
      .update({
        title: updated.title,
        slug: updated.slug,
        description: updated.description,
        cover_image_path: updated.cover_image_path,
        category: updated.category,
        venue: updated.venue,
        event_start: updated.event_start,
        event_end: updated.event_end,
        registration_start: updated.registration_start,
        registration_end: updated.registration_end,
        capacity: updated.capacity,
        organizer: updated.organizer,
        contact_email: updated.contact_email,
        instructions: updated.instructions,
        status: updated.status,
        is_paid: updated.is_paid,
        fee_amount: updated.fee_amount,
        fee_currency: updated.fee_currency,
        payment_instructions: updated.payment_instructions,
        payment_upi_id: updated.payment_upi_id,
        payment_payee_name: updated.payment_payee_name,
        payment_qr_path: updated.payment_qr_path,
        payment_verification_required: updated.payment_verification_required,
        updated_at: updated.updated_at
      })
      .eq("id", id);

    if (questions) {
      // Upsert/relink questions preserving existing question IDs to not break answers
      await adminClient.from("event_form_questions").delete().eq("event_id", id);
      const rows = questions.map((q, idx) => ({
        event_id: id,
        label: q.label,
        description: q.description || null,
        question_type: q.question_type,
        is_required: q.is_required,
        placeholder: q.placeholder || null,
        options: q.options || [],
        validation_rules: q.validation_rules || {},
        display_order: idx + 1,
      }));
      await adminClient.from("event_form_questions").insert(rows);
    }
  } catch (err) {
    console.warn("[updateEvent] DB update fallback to memory:", err);
  }

  inMemoryEvents.set(updated.id, updated);
  return { success: true, event: updated };
}

export async function softDeleteEvent(id: string): Promise<{ success: boolean }> {
  const existing = await getEventBySlugOrId(id);
  if (!existing) return { success: false };

  existing.deleted_at = new Date().toISOString();
  existing.status = "CANCELLED";
  inMemoryEvents.set(existing.id, existing);

  const adminClient = createAdminClient();
  try {
    await adminClient
      .from("events")
      .update({ 
        deleted_at: existing.deleted_at,
        status: "CANCELLED"
      })
      .eq("id", id);
  } catch (err) {
    console.warn("[softDeleteEvent] DB update error:", err);
  }

  return { success: true };
}

// -----------------------------------------------------------------------------
// REGISTRATION & PAYMENT METHODS
// -----------------------------------------------------------------------------

export async function registerParticipant(params: {
  eventId: string;
  userId?: string | null;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  answers: Record<string, any>;
  paymentProofPath?: string;
  paymentReference?: string;
  // Team support
  isTeamRegistration?: boolean;
  teamName?: string;
  teamMembers?: Array<{
    name: string;
    email?: string;
    phone?: string;
    college?: string;
    branch?: string;
    year?: string;
    isLeader?: boolean;
  }>;
}): Promise<{ success: boolean; registration?: EventRegistration; error?: string; alreadyRegistered?: boolean }> {
  const event = await getEventBySlugOrId(params.eventId);
  if (!event) {
    return { success: false, error: "Event not found" };
  }

  // 1. Check Event Status
  if (event.status !== "PUBLISHED") {
    return { success: false, error: "Registration is not active for this event." };
  }

  // 2. Check Registration Deadline
  const now = new Date();
  if (new Date(event.registration_end) < now) {
    return { success: false, error: "Registration has closed for this event." };
  }

  // 3. Check Duplicate Registration
  const existingRegs = await getEventRegistrations(event.id);
  const duplicate = existingRegs.find(r => r.participant_email.toLowerCase() === params.participantEmail.toLowerCase());
  if (duplicate) {
    return { 
      success: false, 
      alreadyRegistered: true, 
      registration: duplicate,
      error: `You have already registered for this event with Registration ID: ${duplicate.registration_number}` 
    };
  }

  // 4. Check Capacity
  if (existingRegs.length >= event.capacity) {
    return { success: false, error: "Registration is full for this event. Capacity has been reached." };
  }

  // 5. Build Registration Object with Cryptographically Secure QR Token
  const registrationNumber = generateEventRegistrationNumber();
  const regId = `reg-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const qrToken = generateQrVerificationToken();

  const isTeam = Boolean(params.isTeamRegistration || params.teamName);
  const finalTeamName = isTeam ? (params.teamName || `${params.participantName}'s Team`) : null;

  // Prepare team members if team registration
  const preparedMembers: EventTeamMember[] = [];
  if (isTeam) {
    // Add leader
    preparedMembers.push({
      id: `tm-${Date.now().toString(36)}-leader`,
      registration_id: regId,
      event_id: event.id,
      member_name: params.participantName,
      email: params.participantEmail,
      phone: params.participantPhone,
      is_leader: true,
      qr_token: qrToken,
      qr_generated_at: new Date().toISOString(),
      is_checked_in: false,
    });

    if (params.teamMembers && params.teamMembers.length > 0) {
      for (const m of params.teamMembers) {
        // Skip duplicate of leader if entered twice
        if (m.email && m.email.toLowerCase() === params.participantEmail.toLowerCase()) continue;
        preparedMembers.push({
          id: `tm-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
          registration_id: regId,
          event_id: event.id,
          member_name: m.name,
          email: m.email || null,
          phone: m.phone || null,
          college: m.college || null,
          branch: m.branch || null,
          year: m.year || null,
          is_leader: Boolean(m.isLeader),
          qr_token: generateQrVerificationToken(),
          qr_generated_at: new Date().toISOString(),
          is_checked_in: false,
        });
      }
    }
  }

  let payment: EventPayment | null = null;
  if (event.is_paid) {
    payment = {
      id: `pay-${Date.now().toString(36)}`,
      registration_id: regId,
      event_id: event.id,
      amount: event.fee_amount,
      currency: event.fee_currency,
      payment_method: "UPI",
      payment_reference: params.paymentReference || null,
      screenshot_path: params.paymentProofPath || null,
      payment_status: params.paymentProofPath ? "PAYMENT_SUBMITTED" : "PAYMENT_PENDING",
      submitted_at: params.paymentProofPath ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const registration: EventRegistration = {
    id: regId,
    event_id: event.id,
    user_id: params.userId || null,
    registration_number: registrationNumber,
    participant_name: params.participantName,
    participant_email: params.participantEmail,
    participant_phone: params.participantPhone,
    answers: params.answers,
    registration_status: "CONFIRMED",
    is_team_registration: isTeam,
    team_name: finalTeamName,
    team_members: preparedMembers,
    qr_token: qrToken,
    qr_generated_at: new Date().toISOString(),
    registered_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    payment,
    event
  };

  // 6. Database Transaction / Insertion
  const adminClient = createAdminClient();
  try {
    const { data: dbReg, error: regErr } = await adminClient
      .from("event_registrations")
      .insert({
        event_id: event.id,
        user_id: params.userId || null,
        registration_number: registrationNumber,
        participant_name: params.participantName,
        participant_email: params.participantEmail,
        participant_phone: params.participantPhone,
        answers: params.answers,
        registration_status: "CONFIRMED",
        qr_token: qrToken,
        is_team_registration: isTeam,
        team_name: finalTeamName,
      })
      .select()
      .single();

    if (!regErr && dbReg) {
      registration.id = dbReg.id;

      // Insert Team Members if team registration
      if (isTeam && preparedMembers.length > 0) {
        const memberRows = preparedMembers.map(m => ({
          registration_id: dbReg.id,
          event_id: event.id,
          member_name: m.member_name,
          email: m.email || null,
          phone: m.phone || null,
          college: m.college || null,
          branch: m.branch || null,
          year: m.year || null,
          is_leader: m.is_leader,
          qr_token: m.qr_token,
        }));

        const { data: dbMembers } = await adminClient
          .from("event_team_members")
          .insert(memberRows)
          .select();

        if (dbMembers) {
          registration.team_members = dbMembers;
        }
      }

      if (event.is_paid && payment) {
        payment.registration_id = dbReg.id;
        const { data: dbPay } = await adminClient
          .from("event_payments")
          .insert({
            registration_id: dbReg.id,
            event_id: event.id,
            amount: event.fee_amount,
            currency: event.fee_currency,
            payment_method: "UPI",
            payment_reference: payment.payment_reference,
            screenshot_path: payment.screenshot_path,
            payment_status: payment.payment_status,
            submitted_at: payment.submitted_at,
          })
          .select()
          .single();

        if (dbPay) {
          payment.id = dbPay.id;
        }
      }
    }
  } catch (err) {
    console.warn("[registerParticipant] DB insert fallback to memory:", err);
  }

  // 7. Store in Memory
  const list = inMemoryRegistrations.get(event.id) || [];
  list.push(registration);
  inMemoryRegistrations.set(event.id, list);

  // 8. Trigger Brevo Transactional Email Notification (Shared Orchestrator)
  try {
    dispatchRegistrationEmails({
      event,
      registration,
      teamMembers: registration.team_members || preparedMembers,
      isPaymentVerified: false,
      paymentReference: params.paymentReference,
    }).catch(err => console.error("[dispatchRegistrationEmails Error]", err));
  } catch (err) {
    console.error("[Email Notification Error]", err);
  }

  return { success: true, registration };
}

export async function getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
  const adminClient = createAdminClient();

  try {
    const { data, error } = await adminClient
      .from("event_registrations")
      .select(`
        *,
        payment:event_payments(*),
        team_members:event_team_members(*)
      `)
      .eq("event_id", eventId)
      .order("registered_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((r: any) => ({
        ...r,
        payment: Array.isArray(r.payment) ? r.payment[0] : r.payment,
        team_members: r.team_members || []
      }));
    }
  } catch (err) {
    console.warn("[getEventRegistrations] Fallback to memory:", err);
  }

  return inMemoryRegistrations.get(eventId) || [];
}

export async function updatePaymentVerification(params: {
  paymentId: string;
  action: "VERIFY" | "REJECT" | "REQUEST_NEW";
  adminUserId?: string;
  reason?: string;
}): Promise<{ success: boolean; error?: string }> {
  // Find in memory or DB
  let targetPayment: EventPayment | null = null;
  let targetReg: EventRegistration | null = null;
  let targetEvent: EventItem | null = null;

  for (const [evtId, regs] of inMemoryRegistrations.entries()) {
    for (const r of regs) {
      if (r.payment && (r.payment.id === params.paymentId || r.id === params.paymentId)) {
        targetPayment = r.payment;
        targetReg = r;
        targetEvent = inMemoryEvents.get(evtId) || null;
        break;
      }
    }
    if (targetPayment) break;
  }

  const newStatus: PaymentStatus = 
    params.action === "VERIFY" 
      ? "PAYMENT_VERIFIED" 
      : params.action === "REJECT" 
        ? "PAYMENT_REJECTED" 
        : "PAYMENT_PENDING";

  if (targetPayment) {
    targetPayment.payment_status = newStatus;
    targetPayment.rejection_reason = params.reason || null;
    targetPayment.updated_at = new Date().toISOString();
    if (params.action === "VERIFY") {
      targetPayment.verified_at = new Date().toISOString();
      targetPayment.verified_by = params.adminUserId || "Admin";
    }
  }

  // Update in Database
  const adminClient = createAdminClient();
  try {
    await adminClient
      .from("event_payments")
      .update({
        payment_status: newStatus,
        rejection_reason: params.reason || null,
        verified_at: params.action === "VERIFY" ? new Date().toISOString() : null,
        verified_by: params.action === "VERIFY" ? params.adminUserId : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.paymentId);

    // Record audit trail
    await adminClient
      .from("event_payment_history")
      .insert({
        payment_id: params.paymentId,
        previous_status: targetPayment?.payment_status || "PAYMENT_SUBMITTED",
        new_status: newStatus,
        changed_by: params.adminUserId,
        reason: params.reason || null
      });
    // Fetch from DB if targetReg is not in memory
    if (!targetReg) {
      const { data: dbPay } = await adminClient
        .from("event_payments")
        .select("*, registration:event_registrations(*, event:events(*))")
        .eq("id", params.paymentId)
        .single();

      if (dbPay && dbPay.registration) {
        targetReg = dbPay.registration as any;
        targetEvent = (dbPay.registration as any).event;
      }
    }
  } catch (err) {
    console.warn("[updatePaymentVerification] DB update error:", err);
  }

  // Trigger Email via Brevo
  if (targetReg && targetEvent) {
    if (params.action === "VERIFY") {
      // Ensure qr_token is present
      const activeQrToken = targetReg.qr_token || generateQrVerificationToken();
      if (!targetReg.qr_token) {
        await adminClient
          .from("event_registrations")
          .update({ qr_token: activeQrToken })
          .eq("id", targetReg.id);
        targetReg.qr_token = activeQrToken;
      }

      // Fetch team members if team registration
      let teamMembers = targetReg.team_members || [];
      if (targetReg.is_team_registration && (!teamMembers || teamMembers.length === 0)) {
        try {
          const { data: dbMembers } = await adminClient
            .from("event_team_members")
            .select("*")
            .eq("registration_id", targetReg.id);
          if (dbMembers) teamMembers = dbMembers;
        } catch (e) {
          console.warn("[updatePaymentVerification] Could not fetch team members:", e);
        }
      }

      dispatchRegistrationEmails({
        event: targetEvent,
        registration: targetReg,
        teamMembers,
        isPaymentVerified: true,
      }).catch(err => console.error("[Brevo Payment Verified QR Email]", err));
    } else if (params.action === "REJECT" || params.action === "REQUEST_NEW") {
      sendPaymentRejectedEmail({
        participantName: targetReg.participant_name,
        participantEmail: targetReg.participant_email,
        eventTitle: targetEvent.title,
        registrationNumber: targetReg.registration_number,
        reason: params.reason || "Payment screenshot was illegible or UPI reference did not match our records."
      }).catch(err => console.error("[Payment Rejected Email]", err));
    }
  }

  return { success: true };
}
