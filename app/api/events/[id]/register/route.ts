import { NextRequest, NextResponse } from "next/server";
import { getEventBySlugOrId, registerParticipant } from "@/lib/events/store";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      participantName,
      participantEmail,
      participantPhone,
      answers,
      paymentProofPath,
      paymentReference,
      // Team registration fields
      isTeamRegistration,
      teamName,
      teamMembers,
    } = body;

    // 1. Basic Field Validation
    if (!participantName || !participantEmail || !participantPhone) {
      return NextResponse.json(
        { success: false, message: "Full name, email address, and phone number are required." },
        { status: 400 }
      );
    }

    if (isTeamRegistration && (!teamName || !teamName.trim())) {
      return NextResponse.json(
        { success: false, message: "Team name is required for team registrations." },
        { status: 400 }
      );
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(participantEmail.trim())) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // 2. Fetch Event and Validate Dynamic Questions
    const event = await getEventBySlugOrId(id);
    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    // Validate mandatory questions
    if (event.questions && event.questions.length > 0) {
      for (const q of event.questions) {
        if (q.is_required) {
          const val = answers ? (answers[q.id] ?? answers[q.label]) : undefined;
          if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
            return NextResponse.json(
              { 
                success: false, 
                message: `Please complete mandatory question: "${q.label}"`,
                missingQuestionId: q.id 
              },
              { status: 400 }
            );
          }
        }
      }
    }

    // 3. If paid event, validate payment proof presence
    if (event.is_paid && event.payment_verification_required && !paymentProofPath) {
      return NextResponse.json(
        { success: false, message: "Payment proof screenshot is required for paid events." },
        { status: 400 }
      );
    }

    // 4. Check if current user is logged in
    let userId: string | null = null;
    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) userId = user.id;
    } catch {
      // Guest registration allowed
    }

    // 5. Register in DB/Store
    const result = await registerParticipant({
      eventId: event.id,
      userId,
      participantName: participantName.trim(),
      participantEmail: participantEmail.trim().toLowerCase(),
      participantPhone: participantPhone.trim(),
      answers: answers || {},
      paymentProofPath,
      paymentReference,
      isTeamRegistration: Boolean(isTeamRegistration),
      teamName: teamName ? teamName.trim() : undefined,
      teamMembers: Array.isArray(teamMembers) ? teamMembers : [],
    });

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: result.error || "Registration could not be completed",
          alreadyRegistered: result.alreadyRegistered,
          registration: result.registration
        },
        { status: result.alreadyRegistered ? 409 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Registration successfully completed!",
      registration: result.registration,
    });
  } catch (err: any) {
    console.error("[API /api/events/[id]/register POST]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to process registration" },
      { status: 500 }
    );
  }
}
