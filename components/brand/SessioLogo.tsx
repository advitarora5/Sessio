import { cn } from "@/lib/utils";
import Image from "next/image";

type SessioLogoProps = {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  tagline?: string;
  priority?: boolean;
};

export function SessioLogo({
  className,
  markClassName,
  wordmarkClassName,
  tagline,
  priority = false,
}: SessioLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        className={cn(
          "relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-emerald-100 bg-white shadow-[0_1px_6px_rgba(16,185,129,0.12)]",
          markClassName,
        )}
      >
        <Image
          src="/images/sessio-logo-mark.png"
          alt="Sessio"
          fill
          priority={priority}
          sizes="64px"
          className="object-contain"
        />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block font-heading text-lg font-semibold leading-none text-emerald-950",
            wordmarkClassName,
          )}
        >
          Sessio
        </span>
        {tagline ? (
          <span className="mt-1 hidden text-xs text-muted-foreground sm:block">
            {tagline}
          </span>
        ) : null}
      </span>
    </span>
  );
}
