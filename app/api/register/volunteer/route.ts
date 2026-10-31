import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateApplicationReference } from "@/lib/auth/roles";
import { sendApplicationReceivedEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      mobile,
      collegeName,
      branch,
      studyYear,
      preferredDivisions,
      experience,
      skills,
      availability,
      motivation,
      password,
    } = body;

    // Server-side validation
    if (!fullName || !email || !mobile || !collegeName || !branch || !studyYear || !skills || !availability || !motivation || !password) {
      return NextResponse.json(
        { success: false, message: "Please fill in all required volunteer application fields." },
        { status: 400 }
      );
    }

    if (!preferredDivisions || !Array.isArray(preferredDivisions) || preferredDivisions.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please select at least one preferred volunteer division." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const reference = generateApplicationReference("VOL");

    // 1. Create Supabase Auth User
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: "VOLUNTEER" },
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("already registered")) {
        return NextResponse.json(
          { success: false, message: "An account with this email already exists. Please log in first." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, message: authError.message || "Failed to create volunteer account." },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // 2. Insert into profiles table with role = 'VOLUNTEER'
    await adminSupabase.from("profiles").upsert({
      id: userId,
      full_name: fullName,
      email,
      mobile,
      role: "VOLUNTEER",
    });

    // 3. Insert volunteer application
    const { data: volunteerRecord, error: volunteerError } = await adminSupabase
      .from("volunteers")
      .insert({
        user_id: userId,
        application_reference: reference,
        college_name: collegeName,
        branch,
        study_year: studyYear,
        preferred_divisions: preferredDivisions,
        experience: experience || "",
        skills,
        availability,
        motivation,
        status: "PENDING",
      })
      .select("id")
      .single();

    if (volunteerError) {
      console.error("[Volunteer App Error]", volunteerError);
      return NextResponse.json(
        { success: false, message: "Error saving volunteer application data." },
        { status: 500 }
      );
    }

    // 4. Record initial status history
    await adminSupabase.from("application_status_history").insert({
      application_type: "VOLUNTEER",
      application_id: volunteerRecord.id,
      previous_status: null,
      new_status: "PENDING",
      changed_by: userId,
      admin_note: "Volunteer registration submitted. Divisions: " + preferredDivisions.join(", "),
    });

    // 5. Send confirmation emails
    await sendApplicationReceivedEmail({
      type: "VOLUNTEER",
      fullName,
      applicantEmail: email,
      reference,
      institutionOrOrg: collegeName,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Volunteer application submitted successfully!",
        reference,
        redirectUrl: "/dashboard/volunteer",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("[Register Volunteer Exception]", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
