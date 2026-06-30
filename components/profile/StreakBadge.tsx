import { Flame } from "lucide-react";

type StreakBadgeProps = {
  streak: number;
  size?: "default" | "large";
};

export function StreakBadge({ streak, size = "default" }: StreakBadgeProps) {
  const active = streak > 0;

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-full border px-5 py-3 font-semibold shadow-sm ${
        active
          ? "border-slate-300 bg-slate-100 text-[#0F223A]"
          : "border-border bg-card text-muted-foreground"
      } ${size === "large" ? "text-lg" : "text-sm"}`}
    >
      <span
        className={`flex items-center justify-center rounded-full ${
          active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        } ${size === "large" ? "h-10 w-10" : "h-7 w-7"}`}
      >
        <Flame className={size === "large" ? "h-5 w-5" : "h-4 w-4"} />
      </span>
      {active
        ? `${streak}-day streak`
        : "Streak not started yet"}
    </div>
  );
}
