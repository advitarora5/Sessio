"use client";

import { GroupCard } from "@/components/groups/GroupCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

type GroupWithStats = {
  id: number;
  name: string;
  invite_code: string;
  focusMinutes: number;
  sessionCount: number;
};

type GroupsManagerProps = {
  groups: GroupWithStats[];
};

export function GroupsManager({ groups }: GroupsManagerProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitGroup(
    event: React.FormEvent<HTMLFormElement>,
    mode: "create" | "join",
  ) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const response = await fetch(
      mode === "create" ? "/api/groups" : "/api/groups/join",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "create" ? { name } : { invite_code: inviteCode }),
      },
    );
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    if (!response.ok) {
      setMessage(payload?.error ?? "Something went wrong.");
      setIsSubmitting(false);
      return;
    }

    setName("");
    setInviteCode("");
    setMessage(mode === "create" ? "Group created." : "Group joined.");
    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="grid gap-4 sm:grid-cols-2">
        {groups.length > 0 ? (
          groups.map((group) => (
            <GroupCard
              key={group.id}
              id={group.id}
              name={group.name}
              inviteCode={group.invite_code}
              focusMinutes={group.focusMinutes}
              sessionCount={group.sessionCount}
            />
          ))
        ) : (
          <Card className="sessio-card sm:col-span-2">
            <CardContent className="p-6 text-muted-foreground">
              Create or join a group to turn focus into accountability.
            </CardContent>
          </Card>
        )}
      </section>

      <aside className="grid gap-4">
        <Card className="sessio-card">
          <CardHeader>
            <CardTitle>Create group</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(event) => submitGroup(event, "create")} className="grid gap-3">
              <Label htmlFor="group-name">Name</Label>
              <Input
                id="group-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="CS 225 Grind Squad"
                required
              />
              <Button type="submit" disabled={isSubmitting || !name.trim()}>
                Create
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="sessio-card">
          <CardHeader>
            <CardTitle>Join group</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(event) => submitGroup(event, "join")} className="grid gap-3">
              <Label htmlFor="invite-code">Invite code</Label>
              <Input
                id="invite-code"
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                placeholder="A1B2C3"
                required
              />
              <Button type="submit" variant="outline" disabled={isSubmitting || !inviteCode.trim()}>
                Join
              </Button>
            </form>
          </CardContent>
        </Card>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </aside>
    </div>
  );
}
