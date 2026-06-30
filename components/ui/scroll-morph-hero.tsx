"use client";

/**
 * IntroAnimation — a scroll-driven "morph" hero.
 *
 * Lives in components/ui because it is a shared, presentational UI primitive
 * (shadcn convention: all reusable UI building blocks live under components/ui
 * so they are easy to discover and reuse across routes).
 *
 * It is fully self-contained: it renders its OWN internal vertical scroll
 * container, so it animates correctly whether it is dropped into a fixed-height
 * framed box (e.g. the /demo route) or embedded in the marketing landing. As the
 * visitor scrolls/swipes inside the frame, a 3D grid of Sessio cards flips,
 * scales and parallax-shifts to reveal the Higgsfield-generated dashboard,
 * campus map and study imagery.
 */

import { cn } from "@/lib/utils";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type AnimationPhase = "grid" | "morph" | "reveal";

/**
 * Imagery morphed by the animation. These are Higgsfield-generated, on-brand
 * Sessio visuals stored locally in /public/assets/higgsfield so next/image works
 * without remote host configuration. Each entry is paired front/back for the
 * 3D flip.
 */
const IMAGES = [
  { src: "/assets/higgsfield/preview-dashboard.png", label: "Weekly dashboard" },
  { src: "/assets/higgsfield/preview-map.png", label: "Campus study map" },
  { src: "/assets/higgsfield/preview-session.png", label: "Deep-work session" },
  { src: "/assets/higgsfield/feed-empty-state.png", label: "Activity feed" },
] as const;

const CARD_COUNT = 6;

function phaseFromProgress(value: number): AnimationPhase {
  if (value < 0.34) return "grid";
  if (value < 0.7) return "morph";
  return "reveal";
}

type FlipCardProps = {
  index: number;
  progress: MotionValue<number>;
};

function FlipCard({ index, progress }: FlipCardProps) {
  const front = IMAGES[index % IMAGES.length];
  const back = IMAGES[(index + 1) % IMAGES.length];

  // Staggered flip window so cards reveal in sequence as the user scrolls.
  const start = (index / CARD_COUNT) * 0.55;
  const end = Math.min(1, start + 0.5);

  const rotateY = useTransform(progress, [start, end], [0, 180]);
  const scale = useTransform(progress, [0, 0.5, 1], [0.86, 1.02, 0.96]);
  const lift = index % 2 === 0 ? -34 : 34;
  const y = useTransform(progress, [0, 1], [lift, -lift]);
  const cardOpacity = useTransform(
    progress,
    [Math.max(0, start - 0.1), start],
    [0.55, 1],
  );

  return (
    <motion.div
      style={{ y, scale, opacity: cardOpacity }}
      className="relative aspect-square w-full"
    >
      <motion.div
        style={{ rotateY, transformStyle: "preserve-3d" }}
        className="relative h-full w-full"
      >
        {/* Front face */}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
          style={{ backfaceVisibility: "hidden" }}
        >
          <Image
            src={front.src}
            alt={front.label}
            fill
            sizes="(max-width: 768px) 33vw, 200px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F223A]/60 via-transparent to-transparent" />
        </div>
        {/* Back face */}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Image
            src={back.src}
            alt={back.label}
            fill
            sizes="(max-width: 768px) 33vw, 200px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F223A]/60 via-transparent to-transparent" />
        </div>
      </motion.div>
    </motion.div>
  );
}

type IntroAnimationProps = {
  className?: string;
};

export default function IntroAnimation({ className }: IntroAnimationProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [phase, setPhase] = useState<AnimationPhase>("grid");

  const { scrollYProgress } = useScroll({ container: scrollRef });
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.4,
  });

  // Whole-stage depth: a gentle tilt + scale as the grid morphs.
  const stageRotateX = useTransform(progress, [0, 1], [12, -6]);
  const stageScale = useTransform(progress, [0, 0.5, 1], [0.96, 1.03, 1]);
  const trackWidth = useTransform(progress, [0, 1], ["18%", "100%"]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (value) => {
      setPhase(phaseFromProgress(value));
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "relative h-full w-full overflow-y-auto overflow-x-hidden bg-[#0F223A] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      aria-label="Scroll to morph the Sessio preview"
    >
      {/* Pinned stage */}
      <div className="sticky top-0 h-full w-full overflow-hidden">
        {/* Decorative grid backdrop */}
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:46px_46px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.10),transparent_60%)]" />
        </div>

        {/* Header / phase label */}
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-5 py-4 text-white sm:px-6">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-300">
              A week of Sessio
            </p>
            <h3 className="mt-1 text-lg font-semibold sm:text-xl">
              {phase === "grid"
                ? "Your focus, lined up"
                : phase === "morph"
                  ? "Sessions in motion"
                  : "Mapped across campus"}
            </h3>
          </div>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
            Scroll to explore
          </span>
        </div>

        {/* 3D card grid */}
        <div className="absolute inset-0 flex items-center justify-center px-6 py-16">
          <div style={{ perspective: 1200 }} className="w-full max-w-md">
            <motion.div
              style={{
                rotateX: stageRotateX,
                scale: stageScale,
                transformStyle: "preserve-3d",
              }}
              className="grid grid-cols-3 gap-3 sm:gap-4"
            >
              {Array.from({ length: CARD_COUNT }).map((_, index) => (
                <FlipCard key={index} index={index} progress={progress} />
              ))}
            </motion.div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-4 left-5 right-5 z-10 sm:left-6 sm:right-6">
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-white"
              style={{ width: trackWidth }}
            />
          </div>
        </div>
      </div>

      {/* Scroll length: spacer drives the morph range. */}
      <div aria-hidden className="h-[220%]" />
    </div>
  );
}
