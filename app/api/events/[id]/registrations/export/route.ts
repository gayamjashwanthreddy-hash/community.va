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
    const questions = event.questions || [];

    // Build CSV Headers
    const headers = [
      "Registration ID",
      "Participant Name",
      "Email Address",
      "Phone Number",
      "Registration Date",
      "Registration Status",
      "Event Fee (INR)",
      "Payment Status",
      "Payment Reference (UTR)",
      ...questions.map(q => `"${q.label.replace(/"/g, '""')}"`)
    ];

    // Build CSV Rows
    const rows = registrations.map(reg => {
      const payment = reg.payment;
      const questionAnswers = questions.map(q => {
        const rawAns = reg.answers[q.id] ?? reg.answers[q.label] ?? "";
        const formatted = Array.isArray(rawAns) ? rawAns.join("; ") : String(rawAns);
        return `"${formatted.replace(/"/g, '""')}"`;
      });

      return [
        `"${reg.registration_number}"`,
        `"${reg.participant_name.replace(/"/g, '""')}"`,
        `"${reg.participant_email.replace(/"/g, '""')}"`,
        `"${reg.participant_phone.replace(/"/g, '""')}"`,
        `"${new Date(reg.registered_at).toLocaleString("en-IN")}"`,
        `"${reg.registration_status}"`,
        `"${payment?.amount ?? (event.is_paid ? event.fee_amount : 0)}"`,
        `"${payment?.payment_status ?? (event.is_paid ? 'PENDING' : 'FREE')}"`,
        `"${payment?.payment_reference ? payment.payment_reference.replace(/"/g, '""') : ''}"`,
        ...questionAnswers
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    const safeSlug = event.slug.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `COMMUNITY_VA_${safeSlug}_participants_${new Date().toISOString().split("T")[0]}.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error("[API /api/events/[id]/registrations/export GET]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to generate CSV export" },
      { status: 500 }
    );
  }
}
