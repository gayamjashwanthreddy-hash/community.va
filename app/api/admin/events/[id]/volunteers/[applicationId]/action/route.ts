import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendVolunteerDecisionEmail } from "@/lib/brevo";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; applicationId: string }> }
) {
  try {
    const { id: eventId, applicationId } = await params;

    // Verify Admin authentication
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      action, // 'APPROVE' | 'REJECT' | 'REVOKE' | 'UNDER_REVIEW'
      assignedResponsibilities, // array of responsibilities
      rejectionReason,
      internalNotes,
    } = body;

    if (!action || !["APPROVE", "REJECT", "REVOKE", "UNDER_REVIEW"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Invalid action. Must be APPROVE, REJECT, REVOKE, or UNDER_REVIEW." },
        { status: 400 }
      );
    }

    // 1. Fetch current application record with event and volunteer profiles
    const { data: appRecord, error: fetchErr } = await adminClient
      .from("event_volunteer_applications")
      .select(`
        *,
        event:events(id, title),
        profiles:volunteer_id(full_name, email)
      `)
      .eq("id", applicationId)
      .eq("event_id", eventId)
      .single();

    if (fetchErr || !appRecord) {
      return NextResponse.json(
        { success: false, message: "Volunteer application not found for this event." },
        { status: 404 }
      );
    }

    const previousStatus = appRecord.status;
    let newStatus: string = previousStatus;
    let newResponsibilities = appRecord.assigned_responsibilities || [];

    if (action === "APPROVE") {
      newStatus = "APPROVED";
      // Ensure assigned responsibilities is provided
      if (Array.isArray(assignedResponsibilities) && assignedResponsibilities.length > 0) {
        newResponsibilities = assignedResponsibilities;
      } else if (newResponsibilities.length === 0) {
        newResponsibilities = ["GENERAL_SUPPORT"];
      }
    } else if (action === "REJECT") {
      newStatus = "REJECTED";
      newResponsibilities = [];
    } else if (action === "REVOKE") {
      newStatus = "REJECTED";
      newResponsibilities = [];
    } else if (action === "UNDER_REVIEW") {
      newStatus = "UNDER_REVIEW";
    }

    // 2. Perform DB update
    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      assigned_responsibilities: newResponsibilities,
      internal_notes: internalNotes || appRecord.internal_notes,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (action === "REJECT" || action === "REVOKE") {
      updatePayload.rejection_reason = rejectionReason || "Capacity reached or role reassigned.";
    }

    const { data: updatedApp, error: updateErr } = await adminClient
      .from("event_volunteer_applications")
      .update(updatePayload)
      .eq("id", applicationId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ success: false, message: updateErr.message }, { status: 500 });
    }

    // 3. Record Audit Trail
    await adminClient.from("event_volunteer_history").insert({
      application_id: applicationId,
      previous_status: previousStatus,
      new_status: newStatus,
      assigned_responsibilities: newResponsibilities,
      changed_by: user.id,
      notes: internalNotes || (action === "REVOKE" ? "Access revoked by admin" : null),
    });

    // 4. Send Brevo Notification Email if decision changed to APPROVED or REJECTED
    const volunteerEmail = (appRecord.profiles as any)?.email;
    const volunteerName = (appRecord.profiles as any)?.full_name || "Volunteer";
    const eventTitle = (appRecord.event as any)?.title || "Community Event";

    if (volunteerEmail && (action === "APPROVE" || action === "REJECT" || action === "REVOKE")) {
      const isApproved = newStatus === "APPROVED";
      const hasScannerRole = newResponsibilities.includes("QR_SCANNING");

      sendVolunteerDecisionEmail({
        volunteerEmail,
        volunteerName,
        eventTitle,
        decision: isApproved ? "APPROVED" : "REJECTED",
        assignedResponsibilities: newResponsibilities,
        rejectionReason: updatePayload.rejection_reason as string,
        scannerAccessGranted: hasScannerRole,
      }).catch((err) => console.error("[Brevo Volunteer Decision Email Error]", err));
    }

    return NextResponse.json({
      success: true,
      message: `Volunteer application successfully updated to ${newStatus}.`,
      application: updatedApp,
    });
  } catch (err: unknown) {
    console.error("[Volunteer Application Action Error]", err);
    return NextResponse.json(
      { success: false, message: "Failed to execute volunteer action." },
      { status: 500 }
    );
  }
}
