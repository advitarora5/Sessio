import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import {
  BarChart3,
  Compass,
  Flame,
  Gauge,
  MapPinned,
  Radio,
  Users,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/session/new", label: "Start", icon: Flame },
  { href: "/spots", label: "Spots", icon: MapPinned },
  { href: "/heatmap", label: "Heatmap", icon: Gauge },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/friends", label: "Friends", icon: UsersRound },
  { href: "/feed", label: "Feed", icon: Radio },
  { href: "/profile", label: "Profile", icon: Compass },
];

type SidebarProps = {
  user: User;
};

export async function Sidebar({ user }: SidebarProps) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("friendships")
    .select("id", { count: "exact", head: true })
    .eq("friend_id", user.id)
    .eq("status", "pending");
  const hasPendingFriendRequest = (count ?? 0) > 0;

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border/80 p-4 md:block">
      <nav className="grid gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const showDot = item.href === "/friends" && hasPendingFriendRequest;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <span className="relative inline-flex">
                <Icon className="h-4 w-4" />
                {showDot ? (
                  <span
                    aria-label="Pending friend request"
                    className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500"
                  />
                ) : null}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
