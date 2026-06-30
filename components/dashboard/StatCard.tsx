import { Card, CardContent } from "@/components/ui/card";
import { deltaIcon, deltaToneClass, type DeltaTrend } from "@/lib/utils/delta";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  delta: string;
  trend?: DeltaTrend;
  icon: LucideIcon;
};

export function StatCard({
  label,
  value,
  delta,
  trend = "flat",
  icon: Icon,
}: StatCardProps) {
  const TrendIcon = deltaIcon(trend);

  return (
    <Card className="rounded-lg border-borderSubtle/70 bg-cardBg shadow-[0_1px_6px_rgba(15,23,42,0.04)]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-medium text-muted-foreground">
              {label}
            </p>
            <p className="mt-3 text-2xl font-semibold text-[#0F223A]">
              {value}
            </p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[#0F223A]">
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <p
          className={`mt-5 inline-flex items-center gap-1 text-xs font-medium ${deltaToneClass(
            trend,
          )}`}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          {delta}
        </p>
      </CardContent>
    </Card>
  );
}
