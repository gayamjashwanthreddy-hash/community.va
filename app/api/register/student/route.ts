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
      university,
      branch,
      studyYear,
      city,
      interests,
      reason,
      password,
    } = body;

    // Server-side validation
    if (!fullName || !email || !mobile || !collegeName || !branch || !studyYear || !city || !reason || !password) {
      return NextResponse.json(
        { success: false, message: "Please fill in all required fields." },
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
    const reference = generateApplicationReference("STU");

    // 1. Create or retrieve Supabase Auth User
    let userId: string;
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-verify or send confirmation depending on setup
      user_metadata: { full_name: fullName, role: "STUDENT" },
    });

    if (authError) {
      // If user already exists, check if we can associate
      if (authError.message.toLowerCase().includes("already registered")) {
        return NextResponse.json(
          { success: false, message: "An account with this email already exists. Please log in first." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, message: authError.message || "Failed to create user account." },
        { status: 400 }
      );
    }

    userId = authData.user.id;

    // 2. Insert into profiles table
    const { error: profileError } = await adminSupabase.from("profiles").upsert({
      id: userId,
      full_name: fullName,
      email,
      mobile,
      role: "STUDENT",
    });

    if (profileError) {
      console.error("[Profile Creation Error]", profileError);
    }

    // 3. Insert student application
    const { data: studentRecord, error: studentError } = await adminSupabase
      .from("students")
      .insert({
        user_id: userId,
        application_reference: reference,
        college_name: collegeName,
        university: university || null,
        branch,
        study_year: studyYear,
        city: city || "Hyderabad",
        interests: Array.isArray(interests) ? interests : [],
        reason,
        status: "PENDING",
      })
      .select("id")
      .single();

    if (studentError) {
      console.error("[Student App Error]", studentError);
      return NextResponse.json(
        { success: false, message: "Error saving student application data." },
        { status: 500 }
      );
    }

    // 4. Record initial status history audit
    await adminSupabase.from("application_status_history").insert({
      application_type: "STUDENT",
      application_id: studentRecord.id,
      previous_status: null,
      new_status: "PENDING",
      changed_by: userId,
      admin_note: "Initial student registration submission.",
    });

    // 5. Send confirmation emails
    await sendApplicationReceivedEmail({
      type: "STUDENT",
      fullName,
      applicantEmail: email,
      reference,
      institutionOrOrg: collegeName,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Student registration submitted successfully!",
        reference,
        redirectUrl: "/dashboard/student",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("[Register Student Exception]", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
