import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Clock3, Sparkles } from "lucide-react";
import Link from "next/link";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
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
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Clock3 className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-heading text-lg font-semibold">
              Sessio
            </span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Deep work, mapped.
            </span>
          </span>
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
          <span
            aria-hidden="true"
            className="hidden h-9 w-9 rounded-full border border-border bg-muted bg-cover bg-center sm:inline-block"
            style={{
              backgroundImage: profile?.avatar_url
                ? `url(${profile.avatar_url})`
                : undefined,
            }}
          />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
