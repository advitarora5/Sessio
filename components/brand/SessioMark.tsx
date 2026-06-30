import { cn } from "@/lib/utils";

type SessioMarkProps = {
  className?: string;
  title?: string;
};

/**
 * Sessio logo mark: four staggered, stacked blocks (each with a knocked-out
 * "handle" pill so the background shows through). The mark is drawn with
 * `currentColor`, so set the color via a text utility:
 *   - navy on light surfaces  -> text-[#0F223A]
 *   - white on navy surfaces  -> text-white
 * The background is fully transparent in every case.
 */
export function SessioMark({ className, title }: SessioMarkProps) {
  const blocks = [
    { x: 16, y: 3 },
    { x: 19, y: 20 },
    { x: 3, y: 37 },
    { x: 15, y: 54 },
  ];

  return (
    <svg
      viewBox="0 0 56 75"
      fill="none"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn("text-[#0F223A]", className)}
    >
      <mask id="sessio-mark-knockout" maskUnits="userSpaceOnUse">
        <rect width="56" height="75" fill="black" />
        {blocks.map((block) => (
          <rect
            key={`b-${block.x}-${block.y}`}
            x={block.x}
            y={block.y}
            width="34"
            height="15"
            rx="4.5"
            fill="white"
          />
        ))}
        {blocks.map((block) => (
          <rect
            key={`p-${block.x}-${block.y}`}
            x={block.x + 6}
            y={block.y + 5.3}
            width="13"
            height="3.8"
            rx="1.9"
            fill="black"
          />
        ))}
      </mask>
      <rect
        width="56"
        height="75"
        fill="currentColor"
        mask="url(#sessio-mark-knockout)"
      />
    </svg>
  );
}
