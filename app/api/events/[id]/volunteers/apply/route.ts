import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required to apply as an event volunteer." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      motivation,
      experience,
      preferredResponsibilities,
      availability,
      additionalInfo,
    } = body;

    // Validation
    if (!motivation || motivation.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Please provide your motivation for volunteering." },
        { status: 400 }
      );
    }

    if (!availability || availability.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Please specify your availability." },
        { status: 400 }
      );
    }

    if (!Array.isArray(preferredResponsibilities) || preferredResponsibilities.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please select at least one preferred responsibility." },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // 1. Verify Event exists
    const { data: event, error: evtErr } = await adminClient
      .from("events")
      .select("id, title, status")
      .eq("id", eventId)
      .single();

    if (evtErr || !event) {
      return NextResponse.json(
        { success: false, message: "Target event does not exist." },
        { status: 404 }
      );
    }

    // 2. Check for duplicate active applications
    const { data: existingApp } = await adminClient
      .from("event_volunteer_applications")
      .select("id, status")
      .eq("event_id", eventId)
      .eq("volunteer_id", user.id)
      .single();

    if (existingApp && !["REJECTED", "WITHDRAWN"].includes(existingApp.status)) {
      return NextResponse.json(
        {
          success: false,
          message: `You already have an active volunteer application for this event (${existingApp.status}).`,
        },
        { status: 409 }
      );
    }

    // 3. Upsert or Insert Application
    const appData = {
      event_id: eventId,
      volunteer_id: user.id,
      motivation: motivation.trim(),
      experience: experience ? experience.trim() : null,
      preferred_responsibilities: preferredResponsibilities,
      assigned_responsibilities: [], // Must remain empty until admin approves
      availability: availability.trim(),
      additional_info: additionalInfo ? additionalInfo.trim() : null,
      status: "PENDING",
      rejection_reason: null,
      updated_at: new Date().toISOString(),
    };

    let savedApp;
    if (existingApp) {
      const { data, error } = await adminClient
        .from("event_volunteer_applications")
        .update(appData)
        .eq("id", existingApp.id)
        .select()
        .single();
      if (error) throw error;
      savedApp = data;
    } else {
      const { data, error } = await adminClient
        .from("event_volunteer_applications")
        .insert(appData)
        .select()
        .single();
      if (error) throw error;
      savedApp = data;
    }

    // 4. Record in Audit Trail
    await adminClient.from("event_volunteer_history").insert({
      application_id: savedApp.id,
      previous_status: existingApp?.status || "NONE",
      new_status: "PENDING",
      assigned_responsibilities: [],
      changed_by: user.id,
      notes: "Volunteer submitted event application.",
    });

    return NextResponse.json({
      success: true,
      message: "Your application to volunteer has been submitted and is under review.",
      application: savedApp,
    });
  } catch (err: unknown) {
    console.error("[Volunteer Application POST Error]", err);
    return NextResponse.json(
      { success: false, message: "Failed to submit event volunteer application." },
      { status: 500 }
    );
  }
}
