"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

type JoinPublicGroupButtonProps = {
  groupId: number;
};

export function JoinPublicGroupButton({ groupId }: JoinPublicGroupButtonProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function joinGroup() {
    setIsJoining(true);
    setError(null);

    const response = await fetch(`/api/groups/${groupId}/join`, {
      method: "POST",
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(payload?.error ?? "Could not join this group.");
      setIsJoining(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="grid gap-2">
      <Button type="button" onClick={joinGroup} disabled={isJoining}>
        Join group
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
