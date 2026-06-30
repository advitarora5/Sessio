"use client";

import { FeedEmptyState } from "@/components/dashboard/FeedEmptyState";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils/streak";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  MapPinned,
  MessageCircle,
  Share2,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useState } from "react";

export type DashboardFeedItem = {
  id: number;
  actorId: string;
  actorName: string;
  actorUsername?: string | null;
  actorAvatarUrl?: string | null;
  title: string;
  startedAt: string;
  durationMinutes: number | null;
  spotName: string | null;
  goalCompleted: boolean | null;
  distractionFree: boolean | null;
  summary: string | null;
  goldStarsCount: number;
  starredByMe: boolean;
  isOwn: boolean;
};

type StravaFeedProps = {
  items: DashboardFeedItem[];
  currentUserId: string;
};

function relativeTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function StravaFeed({ items, currentUserId }: StravaFeedProps) {
  const [feed, setFeed] = useState(items);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  async function toggleGoldStar(item: DashboardFeedItem) {
    setBusyId(item.id);
    const supabase = createClient();

    if (item.starredByMe) {
      await supabase
        .from("likes")
        .delete()
        .eq("session_id", item.id)
        .eq("user_id", currentUserId);
    } else {
      await supabase
        .from("likes")
        .insert({ session_id: item.id, user_id: currentUserId });
    }

    setFeed((current) =>
      current.map((entry) =>
        entry.id === item.id
          ? {
              ...entry,
              starredByMe: !entry.starredByMe,
              goldStarsCount: entry.starredByMe
                ? Math.max(0, entry.goldStarsCount - 1)
                : entry.goldStarsCount + 1,
            }
          : entry,
      ),
    );
    setBusyId(null);
  }

  async function shareSession(item: DashboardFeedItem) {
    const url = `${window.location.origin}/feed`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      /* user dismissed share sheet */
    }
  }

  if (feed.length === 0) {
    return <FeedEmptyState />;
  }

  return (
    <div className="grid gap-4">
      <AnimatePresence initial={false}>
        {feed.map((item, index) => (
          <motion.article
            key={item.id}
            layout
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: Math.min(index * 0.05, 0.3),
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ y: -2 }}
            className="rounded-2xl border border-borderSubtle/70 bg-cardBg p-5 shadow-[0_1px_6px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_12px_32px_rgba(15,34,58,0.10)]"
          >
            <header className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar
                  name={item.actorName}
                  username={item.actorUsername}
                  avatarUrl={item.actorAvatarUrl}
                  size="md"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#0F223A]">
                    {item.actorName}
                    {item.isOwn ? (
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                        You
                      </span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {relativeTime(item.startedAt)}
                    {item.spotName ? ` · ${item.spotName}` : ""}
                  </p>
                </div>
              </div>
              {item.distractionFree ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-borderSubtle px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  DND
                </span>
              ) : null}
            </header>

            <h3 className="mt-3 text-lg font-semibold text-[#0F223A]">
              {item.title}
            </h3>

            <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-borderSubtle/70 bg-slate-50/60 p-3 text-center">
              <div>
                <p className="flex items-center justify-center gap-1 text-sm font-semibold text-[#0F223A]">
                  <Clock3 className="h-4 w-4 text-[#0F223A]" />
                  {formatDuration(item.durationMinutes)}
                </p>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Focus time
                </p>
              </div>
              <div>
                <p className="flex items-center justify-center gap-1 text-sm font-semibold text-[#0F223A]">
                  <CheckCircle2 className="h-4 w-4 text-[#0F223A]" />
                  {item.goalCompleted ? "100%" : "0%"}
                </p>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Goals hit
                </p>
              </div>
              <div>
                <p className="flex items-center justify-center gap-1 text-sm font-semibold text-[#0F223A]">
                  <MapPinned className="h-4 w-4 text-[#0F223A]" />
                  {item.spotName ? "On map" : "—"}
                </p>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Study spot
                </p>
              </div>
            </div>

            {item.summary ? (
              <p className="mt-3 rounded-lg border border-borderSubtle/70 bg-white p-3 text-sm text-muted-foreground">
                {item.summary}
              </p>
            ) : null}

            <footer className="mt-4 flex items-center gap-1 border-t border-borderSubtle/70 pt-3">
              <button
                type="button"
                onClick={() => toggleGoldStar(item)}
                disabled={busyId === item.id}
                aria-label={
                  item.starredByMe ? "Remove your gold star" : "Give a gold star"
                }
                className={cn(
                  "focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition",
                  item.starredByMe
                    ? "bg-amber-50 text-amber-600"
                    : "text-muted-foreground hover:bg-slate-100 hover:text-[#0F223A]",
                )}
              >
                <Star
                  className={cn(
                    "h-4 w-4",
                    item.starredByMe ? "fill-amber-400 text-amber-500" : "",
                  )}
                />
                {item.goldStarsCount}
              </button>
              <a
                href="/feed"
                className="focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-slate-100 hover:text-[#0F223A]"
              >
                <MessageCircle className="h-4 w-4" />
                Comment
              </a>
              <button
                type="button"
                onClick={() => shareSession(item)}
                className="focus-ring ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-slate-100 hover:text-[#0F223A]"
              >
                <Share2 className="h-4 w-4" />
                {copiedId === item.id ? "Copied" : "Share"}
              </button>
            </footer>
          </motion.article>
        ))}
      </AnimatePresence>
    </div>
  );
}
