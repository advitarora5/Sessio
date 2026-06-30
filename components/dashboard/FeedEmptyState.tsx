import Image from "next/image";

/**
 * Empty state for the dashboard feed. Uses a Higgsfield-generated illustration
 * (navy/gray/white + amber star) stored in /public/assets/higgsfield.
 */
export function FeedEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-borderSubtle bg-white px-6 py-10 text-center">
      <Image
        src="/assets/higgsfield/feed-empty-state.png"
        alt=""
        width={180}
        height={180}
        className="h-40 w-40 object-contain"
        priority={false}
      />
      <h3 className="mt-3 text-lg font-semibold text-[#0F223A]">
        Your feed is warming up
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Complete a focus session or add study friends to start filling your
        activity feed with sessions and gold stars.
      </p>
    </div>
  );
}
