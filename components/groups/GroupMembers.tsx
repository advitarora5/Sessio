"use client";

import { UserAvatar } from "@/components/profile/UserAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Trash2, UserPlus, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Member = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: string;
};

type GroupMembersProps = {
  groupId: number;
  members: Member[];
  currentUserId: string;
  isOwner: boolean;
};

function displayName(member: Member) {
  return member.full_name ?? member.username ?? "Sessio member";
}

export function GroupMembers({
  groupId,
  members,
  currentUserId,
  isOwner,
}: GroupMembersProps) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  async function addMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const response = await fetch(`/api/groups/${groupId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }),
    });
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    if (!response.ok) {
      setMessage(payload?.error ?? "Could not add that person.");
      setIsSubmitting(false);
      return;
    }

    setIdentifier("");
    setMessage("Member added.");
    setIsSubmitting(false);
    router.refresh();
  }

  async function leaveGroup() {
    setIsLeaving(true);
    const supabase = createClient();
    await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", currentUserId);
    router.push("/groups");
  }

  async function deleteGroup() {
    setIsLeaving(true);
    const supabase = createClient();
    await supabase.from("groups").delete().eq("id", groupId);
    router.push("/groups");
  }

  return (
    <Card className="sessio-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UsersRound className="h-5 w-5 text-primary" />
          Members ({members.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={member.full_name}
                  username={member.username}
                  avatarUrl={member.avatar_url}
                  size="sm"
                />
                <div>
                  <p className="text-sm font-medium">{displayName(member)}</p>
                  <p className="text-xs text-muted-foreground">
                    @{member.username ?? member.id.slice(0, 8)}
                  </p>
                </div>
              </div>
              {member.role === "owner" ? (
                <span className="text-xs font-medium text-primary">Owner</span>
              ) : null}
            </div>
          ))}
        </div>

        <form onSubmit={addMember} className="grid gap-3">
          <Label htmlFor="member-username">
            <span className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add a member
            </span>
          </Label>
          <Input
            id="member-username"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="username"
            required
          />
          <Button type="submit" disabled={isSubmitting || !identifier.trim()}>
            Add
          </Button>
          {message ? (
            <p className="text-sm text-muted-foreground">{message}</p>
          ) : null}
        </form>

        {isOwner ? (
          <Button
            type="button"
            variant="destructive"
            onClick={deleteGroup}
            disabled={isLeaving}
          >
            <Trash2 className="h-4 w-4" />
            Delete group
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={leaveGroup} disabled={isLeaving}>
            <LogOut className="h-4 w-4" />
            Leave group
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
