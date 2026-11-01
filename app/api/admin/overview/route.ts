import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const adminClient = createAdminClient();

    // Strictly verify admin session
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required. Please log in as an administrator." },
        { status: 401 }
      );
    }

    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    // Query real counts directly from DB
    const [
      { count: totalStudents },
      { count: totalVolunteers },
      { count: totalColleges },
      { count: pendingStudents },
      { count: pendingVolunteers },
      { count: pendingColleges },
      { count: approvedStudents },
      { count: approvedVolunteers },
      { count: approvedColleges },
      { count: rejectedStudents },
      { count: rejectedVolunteers },
      { count: rejectedColleges },
      { count: totalEvents },
      { count: totalEventRegistrations },
      { count: totalEventAttendance },
    ] = await Promise.all([
      adminClient.from("students").select("*", { count: "exact", head: true }),
      adminClient.from("volunteers").select("*", { count: "exact", head: true }),
      adminClient.from("colleges").select("*", { count: "exact", head: true }),
      adminClient.from("students").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
      adminClient.from("volunteers").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
      adminClient.from("colleges").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
      adminClient.from("students").select("*", { count: "exact", head: true }).eq("status", "APPROVED"),
      adminClient.from("volunteers").select("*", { count: "exact", head: true }).eq("status", "APPROVED"),
      adminClient.from("colleges").select("*", { count: "exact", head: true }).eq("status", "APPROVED"),
      adminClient.from("students").select("*", { count: "exact", head: true }).eq("status", "REJECTED"),
      adminClient.from("volunteers").select("*", { count: "exact", head: true }).eq("status", "REJECTED"),
      adminClient.from("colleges").select("*", { count: "exact", head: true }).eq("status", "REJECTED"),
      adminClient.from("events").select("*", { count: "exact", head: true }).is("deleted_at", null),
      adminClient.from("event_registrations").select("*", { count: "exact", head: true }),
      adminClient.from("event_attendance").select("*", { count: "exact", head: true }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents: totalStudents || 0,
        totalVolunteers: totalVolunteers || 0,
        totalColleges: totalColleges || 0,
        pendingStudents: pendingStudents || 0,
        pendingVolunteers: pendingVolunteers || 0,
        pendingColleges: pendingColleges || 0,
        approvedStudents: approvedStudents || 0,
        approvedVolunteers: approvedVolunteers || 0,
        approvedColleges: approvedColleges || 0,
        rejectedApplications: (rejectedStudents || 0) + (rejectedVolunteers || 0) + (rejectedColleges || 0),
        totalEvents: totalEvents || 0,
        totalEventRegistrations: totalEventRegistrations || 0,
        totalEventAttendance: totalEventAttendance || 0,
      },
    });
  } catch (err: unknown) {
    console.error("[Admin Overview Error]", err);
    return NextResponse.json(
      { success: false, message: "Error loading administration metrics." },
      { status: 500 }
    );
  }
}
