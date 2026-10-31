import { NextRequest, NextResponse } from "next/server";
import { getEventBySlugOrId, getEventRegistrations } from "@/lib/events/store";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify admin
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

    const event = await getEventBySlugOrId(id);
    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    const registrations = await getEventRegistrations(event.id);

    const { searchParams } = new URL(request.url);
    const paymentStatus = searchParams.get("paymentStatus");
    const search = searchParams.get("search")?.toLowerCase();

    let filtered = [...registrations];

    if (paymentStatus && paymentStatus !== "ALL") {
      filtered = filtered.filter(r => r.payment?.payment_status === paymentStatus);
    }

    if (search) {
      filtered = filtered.filter(r =>
        r.participant_name.toLowerCase().includes(search) ||
        r.participant_email.toLowerCase().includes(search) ||
        r.registration_number.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      event,
      registrations: filtered,
      totalCount: registrations.length,
      filteredCount: filtered.length,
    });
  } catch (err: any) {
    console.error("[API /api/events/[id]/registrations GET]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
