import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const adminClient = createAdminClient();

    if (user) {
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
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "volunteers"; // 'students' | 'volunteers' | 'colleges' | 'partners'
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = adminClient.from(type).select("*, profiles:user_id(full_name, email, mobile)");

    if (status && status !== "ALL") {
      query = query.eq("status", status);
    }

    if (search) {
      if (type === "colleges") {
        query = query.ilike("institution_name", `%${search}%`);
      } else if (type === "partners") {
        query = query.ilike("organization_name", `%${search}%`);
      } else {
        query = query.ilike("college_name", `%${search}%`);
      }
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    console.error("[Admin Applications Fetch Error]", err);
    return NextResponse.json(
      { success: false, message: "Error fetching application records." },
      { status: 500 }
    );
  }
}
