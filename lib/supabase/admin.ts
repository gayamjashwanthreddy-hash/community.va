import { createClient } from "@supabase/supabase-js";

export function sanitizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return "";
  let clean = rawUrl.trim();
  clean = clean.replace(/\/+$/, "");
  clean = clean.replace(/\/rest\/v1\/?$/i, "");
  clean = clean.replace(/\/+$/, "");
  return clean;
}

export function createAdminClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabaseUrl = sanitizeSupabaseUrl(rawUrl);

  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes("...") || serviceRoleKey.includes("placeholder")) {
    console.warn(
      "[COMMUNITY.VA Supabase Admin] Warning: Missing valid NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    serviceRoleKey || "placeholder-key",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
