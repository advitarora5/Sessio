"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import Link from "next/link";

export type NotificationItem = {
  id: string;
  text: string;
  href: string;
};

type NotificationsBellProps = {
  items?: NotificationItem[];
};

export function NotificationsBell({ items = [] }: NotificationsBellProps) {
  const hasItems = items.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="focus-ring relative hidden h-9 w-9 items-center justify-center rounded-full border border-white/15 text-slate-200 transition hover:bg-white/10 hover:text-white sm:inline-flex"
        >
          <Bell className="h-4 w-4" />
          {hasItems ? (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-[#0F223A]">
          Notifications
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hasItems ? (
          items.map((item) => (
            <DropdownMenuItem key={item.id} asChild>
              <Link href={item.href} className="cursor-pointer text-[#0F223A]">
                {item.text}
              </Link>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            No new notifications.
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
