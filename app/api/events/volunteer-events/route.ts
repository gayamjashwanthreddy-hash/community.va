import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const adminClient = createAdminClient();

    // 1. Get user profile
    const { data: profile } = await adminClient
      .from("profiles")
      .select("id, full_name, email, mobile, role")
      .eq("id", user.id)
      .single();

    // 2. Fetch published upcoming events
    const { data: events, error: evtErr } = await adminClient
      .from("events")
      .select("id, title, slug, category, venue, event_start, event_end, status")
      .eq("status", "PUBLISHED")
      .is("deleted_at", null)
      .order("event_start", { ascending: true });

    if (evtErr) {
      return NextResponse.json({ success: false, message: evtErr.message }, { status: 500 });
    }

    // 3. Fetch existing volunteer applications for this user
    const { data: applications } = await adminClient
      .from("event_volunteer_applications")
      .select("*")
      .eq("volunteer_id", user.id);

    const appMap = new Map((applications || []).map((app) => [app.event_id, app]));

    const eventsWithStatus = (events || []).map((evt) => {
      const myApp = appMap.get(evt.id) || null;
      return {
        ...evt,
        myApplication: myApp,
      };
    });

    return NextResponse.json({
      success: true,
      profile,
      events: eventsWithStatus,
    });
  } catch (err: unknown) {
    console.error("[Volunteer Events GET Error]", err);
    return NextResponse.json(
      { success: false, message: "Error fetching event opportunities." },
      { status: 500 }
    );
  }
}
