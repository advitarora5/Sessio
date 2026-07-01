"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/session/new", label: "Start" },
  { href: "/spots", label: "Spots" },
  { href: "/heatmap", label: "Heatmap" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/groups", label: "Groups" },
  { href: "/friends", label: "Friends" },
  { href: "/feed", label: "Feed" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type HeaderNavProps = {
  hasPendingFriendRequest?: boolean;
};

function NavDot() {
  return (
    <span
      aria-label="Pending friend request"
      className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"
    />
  );
}

export function HeaderNav({ hasPendingFriendRequest = false }: HeaderNavProps) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        const showDot = item.href === "/friends" && hasPendingFriendRequest;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "focus-ring relative rounded-full px-3.5 py-2 text-sm font-medium transition",
              active
                ? "bg-white text-[#0F223A] shadow-sm"
                : "text-slate-200 hover:bg-white/10 hover:text-white",
            )}
          >
            {item.label}
            {showDot ? <NavDot /> : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function HeaderNavMobile({ hasPendingFriendRequest = false }: HeaderNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 pt-1 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Primary mobile"
    >
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        const showDot = item.href === "/friends" && hasPendingFriendRequest;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "focus-ring relative shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition",
              active
                ? "bg-white text-[#0F223A]"
                : "text-slate-200 hover:bg-white/10 hover:text-white",
            )}
          >
            {item.label}
            {showDot ? <NavDot /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
