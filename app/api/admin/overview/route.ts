import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const adminClient = createAdminClient();

    // Verify admin role if user session is present
    if (user) {
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
    }

    // Query real counts from DB
    const [
      { count: totalStudents },
      { count: totalVolunteers },
      { count: totalColleges },
      { count: pendingVolunteers },
      { count: pendingColleges },
      { count: approvedVolunteers },
      { count: approvedColleges },
      { count: rejectedVolunteers },
      { count: rejectedColleges },
    ] = await Promise.all([
      adminClient.from("students").select("*", { count: "exact", head: true }),
      adminClient.from("volunteers").select("*", { count: "exact", head: true }),
      adminClient.from("colleges").select("*", { count: "exact", head: true }),
      adminClient.from("volunteers").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
      adminClient.from("colleges").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
      adminClient.from("volunteers").select("*", { count: "exact", head: true }).eq("status", "APPROVED"),
      adminClient.from("colleges").select("*", { count: "exact", head: true }).eq("status", "APPROVED"),
      adminClient.from("volunteers").select("*", { count: "exact", head: true }).eq("status", "REJECTED"),
      adminClient.from("colleges").select("*", { count: "exact", head: true }).eq("status", "REJECTED"),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents: totalStudents || 0,
        totalVolunteers: totalVolunteers || 0,
        totalColleges: totalColleges || 0,
        pendingVolunteers: pendingVolunteers || 0,
        pendingColleges: pendingColleges || 0,
        approvedVolunteers: approvedVolunteers || 0,
        approvedColleges: approvedColleges || 0,
        rejectedApplications: (rejectedVolunteers || 0) + (rejectedColleges || 0),
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
