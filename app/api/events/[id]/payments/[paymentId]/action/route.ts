import { NextRequest, NextResponse } from "next/server";
import { updatePaymentVerification } from "@/lib/events/store";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const { paymentId } = await params;

    // Verify admin
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

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
    const { action, reason } = body;

    if (!["VERIFY", "REJECT", "REQUEST_NEW"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Invalid action. Must be VERIFY, REJECT, or REQUEST_NEW." },
        { status: 400 }
      );
    }

    if (action === "REJECT" && (!reason || reason.trim() === "")) {
      return NextResponse.json(
        { success: false, message: "Please provide a reason for payment rejection." },
        { status: 400 }
      );
    }

    const result = await updatePaymentVerification({
      paymentId,
      action,
      adminUserId,
      reason,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || "Failed to update payment status" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Payment successfully marked as ${action === "VERIFY" ? "Verified" : action === "REJECT" ? "Rejected" : "Pending New Screenshot"}`,
    });
  } catch (err: any) {
    console.error("[API payment action POST]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to process payment action" },
      { status: 500 }
    );
  }
}
