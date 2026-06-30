"use client";

import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { CheckCircle2, MapPinned, TimerReset } from "lucide-react";
import { useRef } from "react";

type LinePathProps = {
  d: string;
  progress: MotionValue<number>;
  className?: string;
};

function LinePath({ d, progress, className }: LinePathProps) {
  const pathLength = useTransform(progress, [0, 0.85], [0, 1]);
  const opacity = useTransform(progress, [0, 0.12, 1], [0.2, 1, 1]);

  return (
    <motion.path
      d={d}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="6"
      className={cn("stroke-white", className)}
      style={{ opacity, pathLength }}
    />
  );
}

type Skiper19Props = {
  className?: string;
};

export function Skiper19({ className }: Skiper19Props) {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 90%", "end 35%"],
  });
  const nodeScale = useTransform(scrollYProgress, [0, 0.45, 1], [0.9, 1, 1.04]);

  return (
    <section
      ref={ref}
      className={cn(
        "relative flex h-[360px] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0F223A] px-5 py-5 text-white shadow-[0_24px_60px_rgba(15,34,58,0.45)] sm:h-[420px] sm:px-6",
        className,
      )}
      aria-label="Focus path visualization"
    >
      {/* Scroll-driven stroke: the path draws in as the visitor scrolls the landing hero. */}
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-300">
            How a session flows
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-normal md:text-3xl">
            Focus path
          </h3>
        </div>
        <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
          Scroll to trace
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      <svg
        viewBox="0 0 420 260"
        className="relative z-10 mt-4 min-h-0 flex-1"
        role="img"
        aria-label="Animated path from spot to timer to completed goal"
      >
        <path
          d="M42 184 C106 74 164 48 216 102 C264 152 301 148 374 68"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeLinecap="round"
          strokeWidth="12"
        />
        <LinePath
          d="M42 184 C106 74 164 48 216 102 C264 152 301 148 374 68"
          progress={scrollYProgress}
        />

        <motion.g style={{ scale: nodeScale, transformOrigin: "42px 184px" }}>
          <circle cx="42" cy="184" r="27" fill="white" />
          <foreignObject x="26" y="168" width="32" height="32">
            <MapPinned className="h-8 w-8 text-[#0F223A]" />
          </foreignObject>
        </motion.g>

        <motion.g style={{ scale: nodeScale, transformOrigin: "216px 102px" }}>
          <circle cx="216" cy="102" r="31" fill="rgba(255,255,255,0.94)" />
          <foreignObject x="198" y="84" width="36" height="36">
            <TimerReset className="h-9 w-9 text-[#0F223A]" />
          </foreignObject>
        </motion.g>

        <motion.g style={{ scale: nodeScale, transformOrigin: "374px 68px" }}>
          <circle cx="374" cy="68" r="27" fill="white" />
          <foreignObject x="358" y="52" width="32" height="32">
            <CheckCircle2 className="h-8 w-8 text-[#0F223A]" />
          </foreignObject>
        </motion.g>
      </svg>

      <div className="relative z-10 grid grid-cols-3 gap-2 text-xs text-slate-300">
        <span>Spot</span>
        <span className="text-center">Session</span>
        <span className="text-right">Goal hit</span>
      </div>
    </section>
  );
}
