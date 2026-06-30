import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

function getBrowserKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function createClient() {
  const key = getBrowserKey();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !key) {
    throw new Error("Missing Supabase browser environment variables.");
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
  );
}
