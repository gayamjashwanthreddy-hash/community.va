import { NextRequest, NextResponse } from "next/server";
import { getEvents, createEvent } from "@/lib/events/store";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const publicOnly = searchParams.get("public") === "true";
    const search = searchParams.get("search") || "";

    const events = await getEvents({
      publicOnly,
      category,
      status,
      search,
    });

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (err: any) {
    console.error("[API /api/events GET]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Check Admin Auth
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Verify role if authenticated session exists
    let adminUserId = user?.id;
    if (user) {
      const adminClient = createAdminClient();
      const { data: profile } = await adminClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile && profile.role !== "ADMIN") {
        return NextResponse.json(
          { success: false, message: "Unauthorized. Admin privileges required." },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { eventData, questions } = body;

    if (!eventData || !eventData.title || !eventData.venue || !eventData.event_start) {
      return NextResponse.json(
        { success: false, message: "Title, venue, and event start time are required." },
        { status: 400 }
      );
    }

    const result = await createEvent(eventData, questions || [], adminUserId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || "Failed to create event" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      event: result.event,
    });
  } catch (err: any) {
    console.error("[API /api/events POST]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
