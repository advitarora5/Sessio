import { SessioMark } from "@/components/brand/SessioMark";
import { cn } from "@/lib/utils";

type SessioLogoVariant = "navy" | "white";

type SessioLogoProps = {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  /**
   * @deprecated Tagline is no longer rendered. These props are accepted as
   * no-ops so existing call sites keep compiling while we remove them.
   */
  taglineClassName?: string;
  tagline?: string;
  /**
   * `navy` (default) renders the mark + wordmark in navy for light surfaces.
   * `white` renders both in white for navy header/sidebar surfaces.
   */
  variant?: SessioLogoVariant;
  showWordmark?: boolean;
  /** Kept for API compatibility with previous priority-image usage. */
  priority?: boolean;
};

export function SessioLogo({
  className,
  markClassName,
  wordmarkClassName,
  variant = "navy",
  showWordmark = true,
}: SessioLogoProps) {
  const isWhite = variant === "white";

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        className={cn(
          "relative inline-flex h-11 w-11 shrink-0 items-center justify-center",
          markClassName,
        )}
      >
        <SessioMark
          title={showWordmark ? undefined : "Sessio"}
          className={cn(
            "h-full w-auto",
            isWhite ? "text-white" : "text-[#0F223A]",
          )}
        />
      </span>
      {showWordmark ? (
        <span className="min-w-0">
          <span
            className={cn(
              "block text-lg font-semibold leading-none tracking-normal",
              isWhite ? "text-white" : "text-[#0F223A]",
              wordmarkClassName,
            )}
          >
            Sessio
          </span>
        </span>
      ) : null}
    </span>
  );
}
