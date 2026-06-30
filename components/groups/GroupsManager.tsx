"use client";

import { GroupCard } from "@/components/groups/GroupCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";
import Link from "next/link";
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
  const [course, setCourse] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function createGroup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const response = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        visibility,
        password: visibility === "private" ? password : undefined,
        course: course || undefined,
      }),
    });
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
      group?: { id: number };
    } | null;

    if (!response.ok || !payload?.group) {
      setMessage(payload?.error ?? "Something went wrong.");
      setIsSubmitting(false);
      return;
    }

    router.push(`/groups/${payload.group.id}`);
  }

  async function joinByInviteCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const response = await fetch("/api/groups/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invite_code: inviteCode }),
    });
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    if (!response.ok) {
      setMessage(payload?.error ?? "Something went wrong.");
      setIsSubmitting(false);
      return;
    }

    setInviteCode("");
    setMessage("Group joined.");
    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/groups/discover"
          className="focus-ring flex items-center justify-center rounded-lg border border-dashed border-border p-5 text-sm font-medium text-muted-foreground transition hover:border-primary/60 hover:text-foreground sm:col-span-2"
        >
          Browse public groups to find/join →
        </Link>
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
            <form onSubmit={createGroup} className="grid gap-3">
              <Label htmlFor="group-name">Name</Label>
              <Input
                id="group-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="CS 225 Grind Squad"
                required
              />
              <Label htmlFor="group-course">Course (optional)</Label>
              <Input
                id="group-course"
                value={course}
                onChange={(event) => setCourse(event.target.value)}
                placeholder="CS 225"
              />
              <Label>Visibility</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={visibility === "public" ? "default" : "outline"}
                  className={cn("w-full")}
                  onClick={() => setVisibility("public")}
                >
                  Public
                </Button>
                <Button
                  type="button"
                  variant={visibility === "private" ? "default" : "outline"}
                  className={cn("w-full")}
                  onClick={() => setVisibility("private")}
                >
                  Private
                </Button>
              </div>
              {visibility === "private" ? (
                <>
                  <Label htmlFor="group-password">Password</Label>
                  <PasswordInput
                    id="group-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 6 characters"
                    minLength={6}
                    required
                  />
                </>
              ) : null}
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !name.trim() ||
                  (visibility === "private" && password.length < 6)
                }
              >
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
            <form onSubmit={joinByInviteCode} className="grid gap-3">
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
