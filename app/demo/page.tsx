"use client";

import IntroAnimation from "@/components/ui/scroll-morph-hero";

export default function Demo() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-pageBg p-8">
      <div className="relative h-[800px] w-full max-w-2xl overflow-hidden rounded-lg border">
        <IntroAnimation />
      </div>
    </div>
  );
}
