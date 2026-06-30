"use client";

import type { TopSpot } from "@/lib/utils/analytics";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type FocusBySpotChartProps = {
  data: TopSpot[];
};

export function FocusBySpotChart({ data }: FocusBySpotChartProps) {
  const chartData = data.map((spot) => ({
    name: spot.name.length > 18 ? `${spot.name.slice(0, 18)}...` : spot.name,
    score: spot.goalRate,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        Complete sessions with spots to compare productivity.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 18, left: 12, bottom: 0 }}
        >
          <CartesianGrid
            stroke="hsl(var(--border))"
            horizontal={false}
            opacity={0.7}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={112}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.28 }}
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              color: "hsl(var(--foreground))",
            }}
            formatter={(value) => [`${value}% goals hit`, "Productivity"]}
          />
          <Bar
            dataKey="score"
            radius={[0, 8, 8, 0]}
            fill="hsl(var(--primary))"
            barSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
