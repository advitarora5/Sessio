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

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border/80 p-4 md:block">
      <nav className="grid gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
