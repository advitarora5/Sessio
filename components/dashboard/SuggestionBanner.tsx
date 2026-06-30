import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";

type SuggestionBannerProps = {
  title: string;
  detail: string;
  href?: string;
};

export function SuggestionBanner({
  title,
  detail,
  href = "/session/new",
}: SuggestionBannerProps) {
  return (
    <section className="rounded-lg border border-primary/30 bg-primary/10 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Sparkles className="mt-1 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h2 className="font-heading text-lg font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
          </div>
        </div>
        <Button asChild className="rounded-full">
          <Link href={href}>Start now</Link>
        </Button>
      </div>
    </section>
  );
}
