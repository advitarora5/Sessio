"use client";

import { SessionCard } from "@/components/session/SessionCard";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UsersRound, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FriendProfile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

type FriendshipItem = {
  id: number;
  profile: FriendProfile;
  status: "pending" | "accepted" | "blocked";
};

type FriendFeedSession = {
  id: number;
  title: string;
  category: string | null;
  durationMinutes: number | null;
  spotName: string | null;
  startedAt: string;
  goalCompleted: boolean | null;
  summary: string | null;
  actorId: string;
  mediaUrl: string | null;
  actorName: string;
  actorUsername: string | null;
  actorAvatarUrl: string | null;
  distractionFree: boolean | null;
};

type FriendsManagerProps = {
  accepted: FriendshipItem[];
  incoming: FriendshipItem[];
  outgoing: FriendshipItem[];
  feed: FriendFeedSession[];
};

function displayName(profile: FriendProfile) {
  return profile.full_name ?? profile.username ?? "Sessio friend";
}

export function FriendsManager({
  accepted,
  incoming,
  outgoing,
  feed,
}: FriendsManagerProps) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function requestFriend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const response = await fetch("/api/friends/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }),
    });
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    if (!response.ok) {
      setMessage(payload?.error ?? "Could not send request.");
      return;
    }

    setIdentifier("");
    setMessage("Friend request sent.");
    router.refresh();
  }

  async function updateFriendship(id: number, action: "accepted" | "delete") {
    setBusyId(id);
    const response = await fetch(`/api/friends/${id}`, {
      method: action === "delete" ? "DELETE" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: action === "delete" ? undefined : JSON.stringify({ status: action }),
    });

    setBusyId(null);
    if (!response.ok) {
      setMessage("Could not update this request.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="grid gap-4">
        <Card className="sessio-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersRound className="h-5 w-5 text-primary" />
              Friends
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {accepted.length > 0 ? (
              accepted.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                >
                  <Link
                    href={`/friends/${friend.profile.id}`}
                    className="focus-ring flex items-center gap-3 rounded"
                  >
                    <UserAvatar
                      name={friend.profile.full_name}
                      username={friend.profile.username}
                      avatarUrl={friend.profile.avatar_url}
                    />
                    <div>
                      <p className="font-medium">{displayName(friend.profile)}</p>
                      <p className="text-sm text-muted-foreground">
                        @{friend.profile.username ?? friend.profile.id.slice(0, 8)}
                      </p>
                    </div>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateFriendship(friend.id, "delete")}
                    disabled={busyId === friend.id}
                  >
                    Remove
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Add a friend to see their public focus sessions here.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="sessio-card">
          <CardHeader>
            <CardTitle>Friend sessions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {feed.length > 0 ? (
              feed.map((session) => (
                <SessionCard
                  key={session.id}
                  title={session.title}
                  actorName={session.actorName}
                  actorUsername={session.actorUsername}
                  actorAvatarUrl={session.actorAvatarUrl}
                  actorHref={`/friends/${session.actorId}`}
                  category={session.category}
                  durationMinutes={session.durationMinutes}
                  spotName={session.spotName}
                  startedAt={session.startedAt}
                  goalCompleted={session.goalCompleted}
                  summary={session.summary}
                  mediaUrl={session.mediaUrl}
                  distractionFree={session.distractionFree}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Accepted friends with public completed sessions will appear here.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <aside className="grid h-fit gap-4">
        <Card className="sessio-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Add friend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={requestFriend} className="grid gap-3">
              <Label htmlFor="friend-username">Username</Label>
              <Input
                id="friend-username"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="advit_1234abcd"
                required
              />
              <Button type="submit">Send request</Button>
              {message ? (
                <p className="text-sm text-muted-foreground">{message}</p>
              ) : null}
            </form>
          </CardContent>
        </Card>

        <Card className="sessio-card">
          <CardHeader>
            <CardTitle>Pending requests</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {incoming.length > 0 ? (
              incoming.map((request) => (
                <div key={request.id} className="rounded-lg border border-border p-3">
                  <p className="font-medium">{displayName(request.profile)}</p>
                  <p className="text-sm text-muted-foreground">
                    @{request.profile.username}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateFriendship(request.id, "accepted")}
                      disabled={busyId === request.id}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateFriendship(request.id, "delete")}
                      disabled={busyId === request.id}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No pending requests.
              </p>
            )}
          </CardContent>
        </Card>

        {outgoing.length > 0 ? (
          <Card className="sessio-card">
            <CardHeader>
              <CardTitle>Sent requests</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {outgoing.map((request) => (
                <p key={request.id} className="text-sm text-muted-foreground">
                  Waiting on {displayName(request.profile)}
                </p>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </aside>
    </div>
  );
}
