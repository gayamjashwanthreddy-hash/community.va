import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateApplicationReference } from "@/lib/auth/roles";
import { sendApplicationReceivedEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      institutionName,
      institutionType,
      website,
      collegeEmail,
      contactPerson,
      designation,
      mobile,
      city,
      state,
      studentStrength,
      collaborationAreas,
      additionalInformation,
      password,
    } = body;

    // Server-side validation
    if (!institutionName || !institutionType || !collegeEmail || !contactPerson || !designation || !mobile || !city || !password) {
      return NextResponse.json(
        { success: false, message: "Please fill in all mandatory institutional fields." },
        { status: 400 }
      );
    }

    if (!collaborationAreas || !Array.isArray(collaborationAreas) || collaborationAreas.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please select at least one collaboration area." },
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
    const reference = generateApplicationReference("COL");

    // 1. Create Supabase Auth User for institution representative
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: collegeEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: contactPerson, institution_name: institutionName, role: "COLLEGE" },
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("already registered")) {
        return NextResponse.json(
          { success: false, message: "An institution account with this email is already registered." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, message: authError.message || "Failed to create college account." },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // 2. Insert into profiles with role = 'COLLEGE'
    await adminSupabase.from("profiles").upsert({
      id: userId,
      full_name: `${contactPerson} (${institutionName})`,
      email: collegeEmail,
      mobile,
      role: "COLLEGE",
    });

    // 3. Insert college verification application
    const { data: collegeRecord, error: collegeError } = await adminSupabase
      .from("colleges")
      .insert({
        user_id: userId,
        application_reference: reference,
        institution_name: institutionName,
        institution_type: institutionType,
        website: website || "",
        college_email: collegeEmail,
        contact_person: contactPerson,
        designation,
        mobile,
        city: city || "Hyderabad",
        state: state || "Telangana",
        student_strength: studentStrength || "1000+",
        collaboration_areas: collaborationAreas,
        additional_information: additionalInformation || "",
        status: "PENDING",
      })
      .select("id")
      .single();

    if (collegeError) {
      console.error("[College Record Error]", collegeError);
      return NextResponse.json(
        { success: false, message: "Error saving college verification details." },
        { status: 500 }
      );
    }

    // 4. Record status history audit
    await adminSupabase.from("application_status_history").insert({
      application_type: "COLLEGE",
      application_id: collegeRecord.id,
      previous_status: null,
      new_status: "PENDING",
      changed_by: userId,
      admin_note: `College verification requested for ${institutionName}. Areas: ${collaborationAreas.join(", ")}`,
    });

    // 5. Send confirmation emails
    await sendApplicationReceivedEmail({
      type: "COLLEGE",
      fullName: contactPerson,
      applicantEmail: collegeEmail,
      reference,
      institutionOrOrg: institutionName,
    });

    return NextResponse.json(
      {
        success: true,
        message: "College registration submitted successfully for administrative verification!",
        reference,
        redirectUrl: "/dashboard/college",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("[Register College Exception]", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
