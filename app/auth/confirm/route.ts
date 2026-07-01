import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

/**
 * Auth callback for email links (signup confirmation, magic link, and password
 * recovery). Supabase can deliver these two different ways depending on the
 * email template + auth flow, so we handle both to be resilient:
 *
 *  1. token_hash + type  -> verifyOtp  (works cross-device; the recommended
 *                           `{{ .TokenHash }}` template for @supabase/ssr)
 *  2. code               -> exchangeCodeForSession  (default PKCE redirect)
 *
 * Either path establishes a real session (cookies) *before* the user lands on
 * the destination page, which is what the update-password page needs so that
 * `updateUser({ password })` succeeds instead of failing with a missing
 * session.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      redirect(next);
    }
    redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect(next);
    }
    redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/auth/error?error=${encodeURIComponent("No token hash, type, or code")}`);
}
