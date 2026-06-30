import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

type WeeklyStreakWidgetProps = {
  weeks: number;
  days: boolean[];
};

const dayInitials = ["M", "T", "W", "T", "F", "S", "S"];

export function WeeklyStreakWidget({ weeks, days }: WeeklyStreakWidgetProps) {
  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <div className="rounded-xl border border-borderSubtle/70 bg-slate-50/60 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0F223A] text-white">
          <Flame className="h-5 w-5 fill-amber-400 text-amber-400" />
        </span>
        <div>
          <p className="text-2xl font-semibold leading-none text-[#0F223A]">
            {weeks}
          </p>
          <p className="text-xs font-medium text-muted-foreground">
            {weeks === 1 ? "week streak" : "weeks streak"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        {days.map((active, index) => (
          <div
            key={`${dayInitials[index]}-${index}`}
            className="flex flex-col items-center gap-1.5"
          >
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition",
                active
                  ? "bg-[#0F223A] text-white"
                  : "border border-borderSubtle bg-white text-muted-foreground",
                index === todayIndex && !active && "ring-2 ring-[#0F223A]/30",
              )}
            >
              {dayInitials[index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
