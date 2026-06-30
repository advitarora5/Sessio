import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  delta: string;
  trend?: "up" | "down" | "flat";
  icon: LucideIcon;
};

export function StatCard({
  label,
  value,
  delta,
  trend = "flat",
  icon: Icon,
}: StatCardProps) {
  const TrendIcon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;

  return (
    <Card className="rounded-lg border-border/70 bg-white shadow-[0_1px_6px_rgba(15,23,42,0.03)]">
      <CardContent className="p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-medium text-muted-foreground">
              {label}
            </p>
            <p className="mt-3 text-2xl font-semibold text-emerald-950">
              {value}
            </p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-primary">
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <p
          className={`mt-5 inline-flex items-center gap-1 text-xs font-medium ${
            trend === "down"
              ? "text-amber-700"
              : trend === "up"
                ? "text-emerald-700"
                : "text-muted-foreground"
          }`}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          {delta}
        </p>
      </CardContent>
    </Card>
  );
}
