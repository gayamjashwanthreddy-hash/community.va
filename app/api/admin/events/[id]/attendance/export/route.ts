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
      return new NextResponse("Unauthorized: Authentication required", { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "ADMIN") {
      return new NextResponse("Unauthorized: Administrator privileges required", { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "ALL"; // 'ALL' | 'CHECKED_IN' | 'NOT_CHECKED_IN' | 'VERIFIED_PAYMENT'

    // Fetch Event
    const { data: event, error: evtErr } = await adminClient
      .from("events")
      .select("id, title, is_paid")
      .eq("id", eventId)
      .single();

    if (evtErr || !event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Fetch Registrations with Payments
    const { data: registrations } = await adminClient
      .from("event_registrations")
      .select("*, payment:event_payments(*)")
      .eq("event_id", eventId)
      .order("registered_at", { ascending: false });

    // Fetch Attendance
    const { data: attendanceList } = await adminClient
      .from("event_attendance")
      .select("*, volunteer:checked_in_by(full_name, email)")
      .eq("event_id", eventId);

    const attendanceMap = new Map((attendanceList || []).map((a) => [a.registration_id, a]));

    // Filter participants based on criteria
    let rows = (registrations || []).map((r) => {
      const att = attendanceMap.get(r.id);
      const pay = Array.isArray(r.payment) ? r.payment[0] : r.payment;

      const collegeAnswer =
        r.answers?.college ||
        r.answers?.["College / University Name"] ||
        r.answers?.college_name ||
        "—";

      return {
        eventName: event.title,
        registrationId: r.registration_number,
        name: r.participant_name,
        email: r.participant_email,
        phone: r.participant_phone || "—",
        college: collegeAnswer,
        registeredAt: new Date(r.registered_at).toLocaleString("en-IN"),
        paymentStatus: pay?.payment_status || (event.is_paid ? "PAYMENT_PENDING" : "NOT_REQUIRED"),
        attendanceStatus: att ? "CHECKED_IN" : "NOT_CHECKED_IN",
        checkInTime: att ? new Date(att.checked_in_at).toLocaleString("en-IN") : "—",
        volunteer: (att?.volunteer as any)?.full_name || "—",
      };
    });

    if (filter === "CHECKED_IN") {
      rows = rows.filter((r) => r.attendanceStatus === "CHECKED_IN");
    } else if (filter === "NOT_CHECKED_IN") {
      rows = rows.filter((r) => r.attendanceStatus === "NOT_CHECKED_IN");
    } else if (filter === "VERIFIED_PAYMENT") {
      rows = rows.filter((r) => r.paymentStatus === "VERIFIED" || r.paymentStatus === "NOT_REQUIRED");
    }

    // Generate CSV String
    const headers = [
      "Event Name",
      "Registration ID",
      "Participant Name",
      "Email",
      "Phone",
      "College / Institution",
      "Registration Date",
      "Payment Status",
      "Attendance Status",
      "Check-in Timestamp",
      "Checked-in By Volunteer",
    ];

    const escapeCsv = (str: string) => `"${String(str || "").replace(/"/g, '""')}"`;

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        [
          escapeCsv(row.eventName),
          escapeCsv(row.registrationId),
          escapeCsv(row.name),
          escapeCsv(row.email),
          escapeCsv(row.phone),
          escapeCsv(row.college),
          escapeCsv(row.registeredAt),
          escapeCsv(row.paymentStatus),
          escapeCsv(row.attendanceStatus),
          escapeCsv(row.checkInTime),
          escapeCsv(row.volunteer),
        ].join(",")
      ),
    ].join("\r\n");

    const dateSlug = new Date().toISOString().slice(0, 10);
    const filename = `attendance-${event.id.slice(0, 8)}-${filter.toLowerCase()}-${dateSlug}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    console.error("[Attendance Export Error]", err);
    return new NextResponse("Server error exporting attendance", { status: 500 });
  }
}
