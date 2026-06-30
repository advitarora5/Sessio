import { SessioLogo } from "@/components/brand/SessioLogo";
import { HeaderNav, HeaderNavMobile } from "@/components/layout/HeaderNav";
import { LogoutButton } from "@/components/logout-button";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Bell, Sparkles } from "lucide-react";
import Link from "next/link";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username, avatar_url")
    .eq("id", user?.id ?? "")
    .maybeSingle();
  const displayName =
    profile?.full_name ??
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "Focus";

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0F223A]/95 text-white backdrop-blur supports-[backdrop-filter]:bg-[#0F223A]/90">
      <div className="mx-auto w-full max-w-7xl px-4 py-3 md:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            aria-label="Sessio dashboard"
            className="focus-ring shrink-0 rounded-lg"
          >
            <SessioLogo variant="white" tagline="Deep work, mapped." />
          </Link>

          <HeaderNav />

          <div className="flex items-center gap-2 sm:gap-3">
            <Button asChild className="rounded-full bg-white text-[#0F223A] hover:bg-slate-100">
              <Link href="/session/new">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Start session</span>
              </Link>
            </Button>
            <button
              type="button"
              aria-label="Notifications"
              className="focus-ring hidden h-9 w-9 items-center justify-center rounded-full border border-white/15 text-slate-200 transition hover:bg-white/10 hover:text-white sm:inline-flex"
            >
              <Bell className="h-4 w-4" />
            </button>
            <Link
              href="/profile"
              aria-label="Your profile"
              className="focus-ring rounded-full"
            >
              <UserAvatar
                name={displayName}
                username={profile?.username}
                avatarUrl={profile?.avatar_url}
              />
            </Link>
            <LogoutButton />
          </div>
        </div>

        <HeaderNavMobile />
      </div>
    </header>
  );
}
