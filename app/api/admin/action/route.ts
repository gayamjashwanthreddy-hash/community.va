import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendVolunteerStatusEmail, sendCollegeStatusEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const adminClient = createAdminClient();

    // Verify Admin Authorization
    if (user) {
      const { data: profile } = await adminClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "ADMIN") {
        return NextResponse.json(
          { success: false, message: "Unauthorized. Admin privileges required." },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const {
      applicationType, // 'VOLUNTEER' | 'COLLEGE' | 'STUDENT'
      applicationId,
      newStatus, // 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW'
      adminNote,
      rejectionReason,
      assignedDivision, // For approved volunteers
    } = body;

    if (!applicationType || !applicationId || !newStatus) {
      return NextResponse.json(
        { success: false, message: "Missing required approval action parameters." },
        { status: 400 }
      );
    }

    const tableName =
      applicationType === "VOLUNTEER"
        ? "volunteers"
        : applicationType === "COLLEGE"
        ? "colleges"
        : "students";

    // 1. Fetch current application record
    const { data: currentApp, error: fetchErr } = await adminClient
      .from(tableName)
      .select("*, profiles:user_id(full_name, email)")
      .eq("id", applicationId)
      .single();

    if (fetchErr || !currentApp) {
      return NextResponse.json(
        { success: false, message: "Application record not found." },
        { status: 404 }
      );
    }

    const previousStatus = currentApp.status;

    // 2. Prepare update payload
    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (applicationType === "VOLUNTEER" && assignedDivision) {
      updatePayload.assigned_division = assignedDivision;
    }

    // 3. Update application in database
    const { error: updateErr } = await adminClient
      .from(tableName)
      .update(updatePayload)
      .eq("id", applicationId);

    if (updateErr) {
      return NextResponse.json(
        { success: false, message: updateErr.message },
        { status: 500 }
      );
    }

    // 4. Record audit trail in application_status_history
    await adminClient.from("application_status_history").insert({
      application_type: applicationType,
      application_id: applicationId,
      previous_status: previousStatus,
      new_status: newStatus,
      changed_by: user ? user.id : null,
      admin_note: adminNote || null,
      rejection_reason: rejectionReason || null,
    });

    // 5. Send automated status notification email
    const applicantName = currentApp.profiles?.full_name || currentApp.contact_person || "Applicant";
    const applicantEmail = currentApp.profiles?.email || currentApp.college_email;

    if (applicantEmail && (newStatus === "APPROVED" || newStatus === "REJECTED")) {
      if (applicationType === "VOLUNTEER") {
        await sendVolunteerStatusEmail({
          fullName: applicantName,
          email: applicantEmail,
          reference: currentApp.application_reference,
          status: newStatus,
          assignedDivision: assignedDivision || currentApp.assigned_division,
          rejectionReason,
        });
      } else if (applicationType === "COLLEGE") {
        await sendCollegeStatusEmail({
          institutionName: currentApp.institution_name,
          contactPerson: currentApp.contact_person || applicantName,
          email: applicantEmail,
          reference: currentApp.application_reference,
          status: newStatus,
          rejectionReason,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Application ${newStatus.toLowerCase()} successfully.`,
      status: newStatus,
    });
  } catch (err: unknown) {
    console.error("[Admin Action Error]", err);
    return NextResponse.json(
      { success: false, message: "Failed to execute administrative action." },
      { status: 500 }
    );
  }
}
