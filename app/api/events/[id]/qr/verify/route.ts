import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEventBySlugOrId } from "@/lib/events/store";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { qrToken } = body;

    if (!qrToken || typeof qrToken !== "string" || qrToken.trim() === "") {
      return NextResponse.json(
        { success: false, message: "QR token is required for verification." },
        { status: 400 }
      );
    }

    const event = await getEventBySlugOrId(id);
    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found." },
        { status: 404 }
      );
    }

    const adminClient = createAdminClient();

    // 1. Fetch registration or team member by token
    let reg: any = null;
    let member: any = null;
    let isMemberToken = false;

    // Check if token belongs to individual team member
    const { data: dbMember } = await adminClient
      .from("event_team_members")
      .select("*")
      .eq("qr_token", qrToken.trim())
      .single();

    if (dbMember) {
      member = dbMember;
      isMemberToken = true;
      const { data: parentReg } = await adminClient
        .from("event_registrations")
        .select("*, payment:event_payments(*)")
        .eq("id", dbMember.registration_id)
        .single();
      reg = parentReg;
    } else {
      const { data: dbReg } = await adminClient
        .from("event_registrations")
        .select("*, payment:event_payments(*)")
        .eq("qr_token", qrToken.trim())
        .single();
      reg = dbReg;
    }

    if (!reg) {
      return NextResponse.json(
        { 
          success: false, 
          eligible: false, 
          result: "INVALID_QR_CODE",
          message: "Invalid QR code. No registration found." 
        },
        { status: 404 }
      );
    }

    // 2. Event match check
    if (reg.event_id !== event.id) {
      return NextResponse.json(
        {
          success: false,
          eligible: false,
          result: "WRONG_EVENT",
          message: "This QR code belongs to a different event.",
        },
        { status: 400 }
      );
    }

    // 3. Registration cancellation check
    if (reg.registration_status === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          eligible: false,
          result: "REGISTRATION_CANCELLED",
          message: "This registration was cancelled.",
        },
        { status: 400 }
      );
    }

    // 4. Payment verification check
    const payment = Array.isArray(reg.payment) ? reg.payment[0] : reg.payment;
    if (event.is_paid) {
      if (!payment || payment.payment_status !== "VERIFIED") {
        return NextResponse.json({
          success: false,
          eligible: false,
          result: "PAYMENT_NOT_VERIFIED",
          message: "Payment is pending or not verified by an administrator.",
          paymentStatus: payment?.payment_status || "PAYMENT_PENDING",
          participant: {
            name: isMemberToken ? member.member_name : reg.participant_name,
            teamName: reg.team_name,
            registrationNumber: reg.registration_number,
          },
        });
      }
    }

    // 5. Existing attendance check
    let alreadyCheckedIn = false;
    let checkedInAt: string | null = null;

    if (isMemberToken) {
      const { data: memberAttendance } = await adminClient
        .from("event_attendance")
        .select("*")
        .eq("event_id", event.id)
        .eq("team_member_id", member.id)
        .single();

      if (memberAttendance) {
        alreadyCheckedIn = true;
        checkedInAt = memberAttendance.checked_in_at;
      }
    } else {
      const { data: regAttendance } = await adminClient
        .from("event_attendance")
        .select("*")
        .eq("event_id", event.id)
        .eq("registration_id", reg.id)
        .single();

      if (regAttendance) {
        alreadyCheckedIn = true;
        checkedInAt = regAttendance.checked_in_at;
      }
    }

    if (alreadyCheckedIn) {
      return NextResponse.json({
        success: true,
        eligible: false,
        alreadyCheckedIn: true,
        result: "ALREADY_CHECKED_IN",
        message: isMemberToken ? "Team member has already checked in." : "Participant / Team has already checked in.",
        checkedInAt,
        participant: {
          name: isMemberToken ? member.member_name : reg.participant_name,
          teamName: reg.team_name,
          registrationNumber: reg.registration_number,
        },
      });
    }

    // 6. Eligible for entry
    return NextResponse.json({
      success: true,
      eligible: true,
      result: "ELIGIBLE_FOR_ENTRY",
      message: "Pass is verified and eligible for entry.",
      isTeam: Boolean(reg.is_team_registration),
      teamName: reg.team_name,
      participant: {
        id: isMemberToken ? member.id : reg.id,
        name: isMemberToken ? member.member_name : reg.participant_name,
        email: isMemberToken ? member.email : reg.participant_email,
        phone: isMemberToken ? member.phone : reg.participant_phone,
        registrationNumber: reg.registration_number,
      },
      paymentStatus: payment?.payment_status || "NOT_REQUIRED",
    });
  } catch (err: unknown) {
    console.error("[QR Verification Endpoint Error]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error verifying QR pass." },
      { status: 500 }
    );
  }
}
