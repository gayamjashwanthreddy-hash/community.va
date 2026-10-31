import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateApplicationReference } from "@/lib/auth/roles";
import { sendApplicationReceivedEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      organizationName,
      website,
      contactPerson,
      email,
      mobile,
      organizationType,
      collaborationInterest,
      message,
    } = body;

    if (!organizationName || !contactPerson || !email || !mobile || !organizationType || !collaborationInterest || !message) {
      return NextResponse.json(
        { success: false, message: "Please fill in all mandatory collaboration fields." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const reference = generateApplicationReference("PAR");

    // Insert partner inquiry
    const { data: partnerRecord, error: partnerError } = await adminSupabase
      .from("partners")
      .insert({
        application_reference: reference,
        organization_name: organizationName,
        website: website || "",
        contact_person: contactPerson,
        email,
        mobile,
        organization_type: organizationType,
        collaboration_interest: collaborationInterest,
        message,
        status: "PENDING",
      })
      .select("id")
      .single();

    if (partnerError) {
      console.error("[Partner Enquiry Error]", partnerError);
      return NextResponse.json(
        { success: false, message: "Error recording partnership enquiry." },
        { status: 500 }
      );
    }

    // Record audit history
    await adminSupabase.from("application_status_history").insert({
      application_type: "PARTNER",
      application_id: partnerRecord.id,
      previous_status: null,
      new_status: "PENDING",
      admin_note: `Partnership enquiry received from ${organizationName} (${organizationType}).`,
    });

    // Send emails
    await sendApplicationReceivedEmail({
      type: "PARTNER",
      fullName: contactPerson,
      applicantEmail: email,
      reference,
      institutionOrOrg: organizationName,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! Your partnership collaboration proposal has been submitted.",
        reference,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("[Register Partner Exception]", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
