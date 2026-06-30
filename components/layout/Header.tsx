import { SessioLogo } from "@/components/brand/SessioLogo";
import { LogoutButton } from "@/components/logout-button";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Sparkles } from "lucide-react";
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
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/85 px-4 py-3 backdrop-blur md:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link href="/dashboard" aria-label="Sessio dashboard">
          <SessioLogo tagline="Deep work, mapped." />
        </Link>
        <div className="flex items-center gap-3">
          <Button asChild className="rounded-full">
            <Link href="/session/new">
              <Sparkles className="h-4 w-4" />
              Start session
            </Link>
          </Button>
          <span className="hidden max-w-36 truncate text-sm text-muted-foreground md:inline">
            {displayName}
          </span>
          <UserAvatar
            name={displayName}
            username={profile?.username}
            avatarUrl={profile?.avatar_url}
            className="hidden sm:inline-flex"
          />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
