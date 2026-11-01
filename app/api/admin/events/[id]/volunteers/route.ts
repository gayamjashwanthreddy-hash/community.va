import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

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
        { success: false, message: "Unauthorized: Administrator privileges required." },
        { status: 403 }
      );
    }

    // 1. Fetch Event details
    const { data: event, error: evtErr } = await adminClient
      .from("events")
      .select("id, title, slug, venue, event_start, event_end, status")
      .eq("id", eventId)
      .single();

    if (evtErr || !event) {
      return NextResponse.json(
        { success: false, message: "Event not found." },
        { status: 404 }
      );
    }

    // 2. Fetch Volunteer Applications joined with profile
    const { data: applications, error: appErr } = await adminClient
      .from("event_volunteer_applications")
      .select(`
        *,
        profiles:volunteer_id(full_name, email, mobile)
      `)
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (appErr) {
      return NextResponse.json({ success: false, message: appErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      event,
      applications: applications || [],
    });
  } catch (err: unknown) {
    console.error("[Admin Event Volunteers GET Error]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error fetching event volunteers." },
      { status: 500 }
    );
  }
}
