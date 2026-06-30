import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type DeltaTrend = "up" | "down" | "flat";

/**
 * Resolve a numeric delta into a trend. A positive value is an improvement,
 * a negative value is a decline, and zero is neutral. `invert` flips the
 * meaning for metrics where lower is better (e.g. distractions).
 */
export function trendFromValue(value: number, invert = false): DeltaTrend {
  const signed = invert ? -value : value;
  if (signed > 0) return "up";
  if (signed < 0) return "down";
  return "flat";
}

/** Tailwind text color class for a metric delta (green up / red down / gray flat). */
export function deltaToneClass(trend: DeltaTrend): string {
  switch (trend) {
    case "up":
      return "text-green-600";
    case "down":
      return "text-red-600";
    default:
      return "text-gray-500";
  }
}

/** Matching arrow icon for a trend. */
export function deltaIcon(trend: DeltaTrend): LucideIcon {
  switch (trend) {
    case "up":
      return ArrowUpRight;
    case "down":
      return ArrowDownRight;
    default:
      return Minus;
  }
}
