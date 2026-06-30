"use client";

import IntroAnimation from "@/components/ui/scroll-morph-hero";
import { motion, type Variants } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Flame,
  TimerReset,
} from "lucide-react";

const kpis = [
  { label: "Total Focus Time This Week", value: "8h 35m", delta: "+18%", icon: Clock3 },
  { label: "Sessions Completed", value: "11", delta: "+3", icon: BarChart3 },
  { label: "Avg Session Length", value: "47m", delta: "+6%", icon: TimerReset },
  { label: "% Goals Hit", value: "82%", delta: "+9 pts", icon: CheckCircle2 },
];

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function DashboardPreviewHero() {
  return (
    <section id="product" className="bg-pageBg px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-borderSubtle bg-white px-3 py-1 text-xs font-medium text-[#0F223A] shadow-sm">
              <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              A week of Sessio
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#0F223A] sm:text-4xl md:text-5xl">
              See the week you actually showed up.
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Scroll the preview to watch your dashboard, campus map, and focus
              sessions come together.
            </p>
          </div>
        </motion.div>

        <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* Left — animated KPI cards */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <motion.div
                  key={kpi.label}
                  variants={item}
                  whileHover={{ y: -3 }}
                  className="rounded-2xl border border-borderSubtle/70 bg-cardBg p-6 shadow-[0_1px_6px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_14px_36px_rgba(15,34,58,0.12)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[13px] font-medium text-muted-foreground">
                        {kpi.label}
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-[#0F223A]">
                        {kpi.value}
                      </p>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[#0F223A]">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-green-600">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {kpi.delta} vs last week
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Right — scroll-morph showcase (Higgsfield imagery) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-[440px] overflow-hidden rounded-2xl border border-borderSubtle shadow-[0_30px_80px_rgba(15,34,58,0.18)] sm:h-[560px] lg:h-auto lg:min-h-[560px]"
          >
            <IntroAnimation />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
