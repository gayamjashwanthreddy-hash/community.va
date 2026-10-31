import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes("...") || serviceRoleKey.includes("placeholder")) {
    console.warn("[COMMUNITY.VA Supabase Admin] SUPABASE_SERVICE_ROLE_KEY is not configured. Admin DB operations will run in mock/standby mode.");
  }

  return createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    serviceRoleKey || "placeholder-service-role-key",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
