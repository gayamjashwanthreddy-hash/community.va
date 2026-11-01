import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashQrToken } from "@/lib/qr";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

    // 1. Authenticate user
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          result: "UNAUTHORIZED_SCANNER",
          message: "Authentication required. Please log in." 
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { qrToken, scanMethod = "CAMERA" } = body;

    if (!qrToken || typeof qrToken !== "string" || qrToken.trim() === "") {
      return NextResponse.json(
        { 
          success: false, 
          result: "INVALID QR CODE",
          message: "Please provide a valid QR pass or token." 
        },
        { status: 400 }
      );
    }

    const cleanToken = qrToken.trim();
    const tokenHash = hashQrToken(cleanToken);
    const adminClient = createAdminClient();

    // 2. Verify Volunteer Authorization for this specific event
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "ADMIN";

    if (!isAdmin) {
      const { data: volunteerApp } = await adminClient
        .from("event_volunteer_applications")
        .select("status, assigned_responsibilities")
        .eq("event_id", eventId)
        .eq("volunteer_id", user.id)
        .single();

      if (
        !volunteerApp ||
        volunteerApp.status !== "APPROVED" ||
        !volunteerApp.assigned_responsibilities?.includes("QR_SCANNING")
      ) {
        // Record unauthorized attempt in scan logs
        await adminClient.from("event_scan_logs").insert({
          event_id: eventId,
          scanned_by: user.id,
          scan_result: "UNAUTHORIZED_SCANNER",
          token_hash: tokenHash,
          scan_method: scanMethod,
          error_message: "User does not have approved QR_SCANNING responsibility for this event.",
        });

        return NextResponse.json(
          {
            success: false,
            result: "UNAUTHORIZED_SCANNER",
            message: "You are not authorized to scan passes for this event. Requires approved QR_SCANNING role.",
          },
          { status: 403 }
        );
      }
    }

    // 3. Try atomic PostgreSQL function `perform_event_check_in`
    try {
      const { data: rpcData, error: rpcError } = await adminClient.rpc(
        "perform_event_check_in",
        {
          p_event_id: eventId,
          p_qr_token: cleanToken,
          p_volunteer_id: user.id,
          p_scan_method: scanMethod,
        }
      );

      if (!rpcError && rpcData) {
        const statusCode = rpcData.success ? 200 : 400;
        return NextResponse.json(rpcData, { status: statusCode });
      }
    } catch (rpcErr) {
      console.warn("[RPC perform_event_check_in error, falling back to TS transaction]:", rpcErr);
    }

    // 4. Fallback atomic server-side transaction in TypeScript
    // Fetch Event
    const { data: event, error: evtErr } = await adminClient
      .from("events")
      .select("id, title, is_paid, fee_amount")
      .eq("id", eventId)
      .single();

    if (evtErr || !event) {
      return NextResponse.json(
        { success: false, result: "WRONG EVENT", message: "Event not found." },
        { status: 404 }
      );
    }

    // Fetch Registration by Token
    const { data: reg, error: regErr } = await adminClient
      .from("event_registrations")
      .select("*, payment:event_payments(*)")
      .eq("qr_token", cleanToken)
      .single();

    if (regErr || !reg) {
      await adminClient.from("event_scan_logs").insert({
        event_id: eventId,
        scanned_by: user.id,
        scan_result: "INVALID QR CODE",
        token_hash: tokenHash,
        scan_method: scanMethod,
        error_message: "Token not found in database.",
      });

      return NextResponse.json(
        { success: false, result: "INVALID QR CODE", message: "Invalid QR code. Registration not found." },
        { status: 404 }
      );
    }

    // Check Wrong Event
    if (reg.event_id !== eventId) {
      await adminClient.from("event_scan_logs").insert({
        event_id: eventId,
        registration_id: reg.id,
        scanned_by: user.id,
        scan_result: "WRONG EVENT",
        token_hash: tokenHash,
        scan_method: scanMethod,
        error_message: "Pass registered for another event.",
      });

      return NextResponse.json(
        { success: false, result: "WRONG EVENT", message: "This pass belongs to a different event." },
        { status: 400 }
      );
    }

    // Check Cancelled
    if (reg.registration_status === "CANCELLED") {
      await adminClient.from("event_scan_logs").insert({
        event_id: eventId,
        registration_id: reg.id,
        scanned_by: user.id,
        scan_result: "REGISTRATION CANCELLED",
        token_hash: tokenHash,
        scan_method: scanMethod,
        error_message: "Registration cancelled.",
      });

      return NextResponse.json(
        { success: false, result: "REGISTRATION CANCELLED", message: "This registration has been cancelled." },
        { status: 400 }
      );
    }

    // Check Payment Verification for Paid Events
    if (event.is_paid) {
      const payment = Array.isArray(reg.payment) ? reg.payment[0] : reg.payment;
      if (!payment || payment.payment_status !== "VERIFIED") {
        await adminClient.from("event_scan_logs").insert({
          event_id: eventId,
          registration_id: reg.id,
          scanned_by: user.id,
          scan_result: "PAYMENT NOT VERIFIED",
          token_hash: tokenHash,
          scan_method: scanMethod,
          error_message: "Payment unverified.",
        });

        return NextResponse.json(
          {
            success: false,
            result: "PAYMENT NOT VERIFIED",
            message: "Payment for this registration has not been verified by an administrator.",
            participantName: reg.participant_name,
            registrationNumber: reg.registration_number,
          },
          { status: 400 }
        );
      }
    }

    // Check Existing Attendance
    const { data: existingAttendance } = await adminClient
      .from("event_attendance")
      .select("id, checked_in_at")
      .eq("event_id", eventId)
      .eq("registration_id", reg.id)
      .single();

    if (existingAttendance) {
      await adminClient.from("event_scan_logs").insert({
        event_id: eventId,
        registration_id: reg.id,
        scanned_by: user.id,
        scan_result: "ALREADY CHECKED IN",
        token_hash: tokenHash,
        scan_method: scanMethod,
        error_message: "Attendee already checked in.",
      });

      return NextResponse.json(
        {
          success: false,
          result: "ALREADY CHECKED IN",
          message: "This participant has already been checked in!",
          participantName: reg.participant_name,
          registrationNumber: reg.registration_number,
          checkedInAt: existingAttendance.checked_in_at,
        },
        { status: 400 }
      );
    }

    // Atomic Insertion into event_attendance
    const { error: attendErr } = await adminClient.from("event_attendance").insert({
      event_id: eventId,
      registration_id: reg.id,
      participant_id: reg.user_id || null,
      checked_in_by: user.id,
      check_in_method: scanMethod === "MANUAL" ? "MANUAL_ENTRY" : "QR_SCAN",
    });

    if (attendErr) {
      if (attendErr.code === "23505") {
        // Concurrency duplicate
        return NextResponse.json(
          {
            success: false,
            result: "ALREADY CHECKED IN",
            message: "Simultaneous check-in detected: already checked in.",
            participantName: reg.participant_name,
            registrationNumber: reg.registration_number,
          },
          { status: 400 }
        );
      }
      throw attendErr;
    }

    // Record Successful Scan
    await adminClient.from("event_scan_logs").insert({
      event_id: eventId,
      registration_id: reg.id,
      scanned_by: user.id,
      scan_result: "CHECK-IN SUCCESSFUL",
      token_hash: tokenHash,
      scan_method: scanMethod,
    });

    return NextResponse.json({
      success: true,
      result: "CHECK-IN SUCCESSFUL",
      message: "Check-in confirmed successfully!",
      participantName: reg.participant_name,
      registrationNumber: reg.registration_number,
      checkedInAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("[Check-In Action Error]", err);
    return NextResponse.json(
      { success: false, result: "SERVER_ERROR", message: "Error performing check-in." },
      { status: 500 }
    );
  }
}
