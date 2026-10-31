import { NextRequest, NextResponse } from "next/server";
import { getEventBySlugOrId, updateEvent, softDeleteEvent } from "@/lib/events/store";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await getEventBySlugOrId(id);

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (err: any) {
    console.error("[API /api/events/[id] GET]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to retrieve event" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check admin auth
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

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

    const result = await updateEvent(id, eventData, questions);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || "Failed to update event" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      event: result.event,
    });
  } catch (err: any) {
    console.error("[API /api/events/[id] PUT]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

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

    const result = await softDeleteEvent(id);

    return NextResponse.json({
      success: result.success,
      message: result.success ? "Event archived successfully" : "Event not found",
    });
  } catch (err: any) {
    console.error("[API /api/events/[id] DELETE]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
