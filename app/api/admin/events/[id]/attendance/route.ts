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
        { success: false, message: "Unauthorized: Admin privileges required." },
        { status: 403 }
      );
    }

    // 1. Fetch Event
    const { data: event, error: evtErr } = await adminClient
      .from("events")
      .select("id, title, is_paid, fee_amount, capacity, venue, event_start, event_end, status")
      .eq("id", eventId)
      .single();

    if (evtErr || !event) {
      return NextResponse.json(
        { success: false, message: "Event not found." },
        { status: 404 }
      );
    }

    // 2. Fetch all Registrations with Payments and Team Members
    const { data: registrations } = await adminClient
      .from("event_registrations")
      .select(`
        *,
        payment:event_payments(*),
        team_members:event_team_members(*)
      `)
      .eq("event_id", eventId)
      .order("registered_at", { ascending: false });

    const allRegs = registrations || [];

    // 3. Fetch all Attendance records joined with volunteer
    const { data: attendanceList } = await adminClient
      .from("event_attendance")
      .select(`
        *,
        volunteer:checked_in_by(full_name, email)
      `)
      .eq("event_id", eventId)
      .order("checked_in_at", { ascending: false });

    const attendanceMap = new Map((attendanceList || []).map((a) => [a.registration_id, a]));

    // 4. Fetch Scan Logs joined with volunteer
    const { data: scanLogs } = await adminClient
      .from("event_scan_logs")
      .select(`
        *,
        volunteer:scanned_by(full_name, email)
      `)
      .eq("event_id", eventId)
      .order("scanned_at", { ascending: false })
      .limit(200);

    // 5. Fetch Approved Event Volunteers
    const { data: volunteers } = await adminClient
      .from("event_volunteer_applications")
      .select(`
        *,
        profiles:volunteer_id(full_name, email)
      `)
      .eq("event_id", eventId)
      .eq("status", "APPROVED");

    const approvedVolunteersCount = (volunteers || []).length;

    // 6. Compute Real Database Metrics
    const totalRegistrations = allRegs.length;
    let eligibleParticipants = 0;
    let pendingPaymentCount = 0;
    let verifiedPaymentCount = 0;

    for (const r of allRegs) {
      const pay = Array.isArray(r.payment) ? r.payment[0] : r.payment;
      if (!event.is_paid) {
        if (r.registration_status !== "CANCELLED") {
          eligibleParticipants++;
        }
      } else {
        if (pay && pay.payment_status === "VERIFIED") {
          eligibleParticipants++;
          verifiedPaymentCount++;
        } else if (!pay || pay.payment_status === "PAYMENT_PENDING" || pay.payment_status === "PAYMENT_SUBMITTED") {
          pendingPaymentCount++;
        }
      }
    }

    const totalCheckedIn = (attendanceList || []).length;
    const notYetCheckedIn = Math.max(0, eligibleParticipants - totalCheckedIn);

    const successfulScans = (scanLogs || []).filter((s) => s.scan_result === "CHECK-IN SUCCESSFUL" || s.scan_result === "SUCCESS").length;
    const failedScans = (scanLogs || []).filter((s) => s.scan_result !== "CHECK-IN SUCCESSFUL" && s.scan_result !== "SUCCESS").length;

    const attendancePercentage = eligibleParticipants > 0 
      ? Number(((totalCheckedIn / eligibleParticipants) * 100).toFixed(1))
      : 0;

    // 7. Volunteer Activity Statistics
    const volunteerStatsMap = new Map<string, { name: string; email: string; scans: number; successful: number; failed: number }>();

    for (const log of scanLogs || []) {
      const volId = log.scanned_by;
      const volName = (log.volunteer as any)?.full_name || "Volunteer";
      const volEmail = (log.volunteer as any)?.email || "—";

      if (!volunteerStatsMap.has(volId)) {
        volunteerStatsMap.set(volId, { name: volName, email: volEmail, scans: 0, successful: 0, failed: 0 });
      }

      const st = volunteerStatsMap.get(volId)!;
      st.scans++;
      if (log.scan_result === "CHECK-IN SUCCESSFUL" || log.scan_result === "SUCCESS") {
        st.successful++;
      } else {
        st.failed++;
      }
    }

    const volunteerActivity = Array.from(volunteerStatsMap.values());

    // 8. Enriched Participant Records with Attendance Status
    const enrichedParticipants = allRegs.map((r) => {
      const attendance = attendanceMap.get(r.id);
      const pay = Array.isArray(r.payment) ? r.payment[0] : r.payment;

      return {
        id: r.id,
        registration_number: r.registration_number,
        participant_name: r.participant_name,
        participant_email: r.participant_email,
        participant_phone: r.participant_phone,
        is_team_registration: Boolean(r.is_team_registration),
        team_name: r.team_name || null,
        team_members_count: (r.team_members || []).length,
        team_members: r.team_members || [],
        answers: r.answers,
        registered_at: r.registered_at,
        payment_status: pay?.payment_status || (event.is_paid ? "PAYMENT_PENDING" : "NOT_REQUIRED"),
        is_checked_in: Boolean(attendance),
        checked_in_at: attendance?.checked_in_at || null,
        check_in_method: attendance?.check_in_method || null,
        checked_in_by: (attendance?.volunteer as any)?.full_name || null,
      };
    });

    return NextResponse.json({
      success: true,
      event,
      stats: {
        totalRegistrations,
        eligibleParticipants,
        totalCheckedIn,
        notYetCheckedIn,
        pendingPayment: pendingPaymentCount,
        verifiedPayment: verifiedPaymentCount,
        successfulScans,
        failedScans,
        approvedEventVolunteers: approvedVolunteersCount,
        attendancePercentage,
      },
      participants: enrichedParticipants,
      scanLogs: scanLogs || [],
      volunteerActivity,
    });
  } catch (err: unknown) {
    console.error("[Admin Attendance GET Error]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error retrieving attendance metrics." },
      { status: 500 }
    );
  }
}
