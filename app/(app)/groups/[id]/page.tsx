import { GroupFeed, type FeedSession } from "@/components/groups/GroupFeed";
import { GroupMembers } from "@/components/groups/GroupMembers";
import { JoinPublicGroupButton } from "@/components/groups/JoinPublicGroupButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { formatDuration } from "@/lib/utils/streak";
import { Clock3, Flame, Lock, Users } from "lucide-react";
import { redirect } from "next/navigation";

type GroupFeedPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GroupFeedPage({ params }: GroupFeedPageProps) {
  const { id } = await params;
  const groupId = Number(id);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: group } = await supabase
    .from("groups")
    .select("id, name, visibility, course, owner_id")
    .eq("id", groupId)
    .maybeSingle();

  if (!group) {
    redirect("/groups");
  }

  const { data: isMember } = await supabase.rpc("is_group_member", {
    p_group_id: groupId,
  });

  if (!isMember) {
    return (
      <div className="grid gap-6">
        <section>
          <p className="text-sm font-medium text-primary">Group</p>
          <h1 className="mt-2 text-3xl font-semibold">{group.name}</h1>
          {group.course ? (
            <p className="mt-2 text-muted-foreground">Course: {group.course}</p>
          ) : null}
        </section>
        <Card className="sessio-card">
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <p className="text-muted-foreground">
              You&apos;re not a member of this group yet.
            </p>
            <JoinPublicGroupButton groupId={groupId} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // invite_code is column-locked from the authenticated role, so it's only
  // fetched here once membership has already been confirmed above.
  const service = createServiceClient();
  const { data: groupWithInvite } = await service
    .from("groups")
    .select("invite_code")
    .eq("id", groupId)
    .maybeSingle();

  const { data: memberRows } = await supabase
    .from("group_members")
    .select("user_id, role")
    .eq("group_id", groupId);
  const memberUserIds = (memberRows ?? []).map((row) => row.user_id);
  const { data: memberProfiles } =
    memberUserIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", memberUserIds)
      : { data: [] };
  const memberProfileById = new Map(
    (memberProfiles ?? []).map((profile) => [profile.id, profile]),
  );
  const members = (memberRows ?? []).map((row) => {
    const profile = memberProfileById.get(row.user_id);
    return {
      id: row.user_id,
      full_name: profile?.full_name ?? null,
      username: profile?.username ?? null,
      avatar_url: profile?.avatar_url ?? null,
      role: row.role,
    };
  });

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: sessions } = await supabase
    .from("sessions")
    .select(
      "id, user_id, title, category, start_time, duration_minutes, distraction_free, goal_completed, summary_ai, media_url, spots(name), likes(id, user_id)",
    )
    .eq("group_id", groupId)
    .eq("status", "completed")
    .neq("visibility", "private")
    .order("start_time", { ascending: false })
    .limit(30);

  const userIds = Array.from(new Set((sessions ?? []).map((session) => session.user_id)));
  const { data: profiles } =
    userIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", userIds)
      : { data: [] };
  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  const feedSessions: FeedSession[] = (sessions ?? []).map((session) => {
    const profile = profileById.get(session.user_id);
    const likes = session.likes ?? [];
    return {
      id: session.id,
      title: session.title,
      category: session.category,
      durationMinutes: session.duration_minutes,
      spotName: session.spots?.name ?? null,
      startedAt: session.start_time,
      goalCompleted: session.goal_completed,
      summary: session.summary_ai,
      mediaUrl: session.media_url,
      actorName:
        profile?.full_name ?? profile?.username ?? `Member ${session.user_id.slice(0, 6)}`,
      actorUsername: profile?.username ?? null,
      actorAvatarUrl: profile?.avatar_url ?? null,
      goldStarsCount: likes.length,
      starredByMe: likes.some((like) => like.user_id === user.id),
      distractionFree: session.distraction_free,
    };
  });

  const weekMinutes = feedSessions
    .filter((session) => new Date(session.startedAt) >= weekAgo)
    .reduce((sum, session) => sum + (session.durationMinutes ?? 0), 0);

  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm font-medium text-primary">Group feed</p>
        <h1 className="mt-2 flex flex-wrap items-center gap-3 text-3xl font-semibold">
          {group.name}
          {group.visibility === "private" ? (
            <Badge variant="outline">
              <Lock className="mr-1 h-3 w-3" />
              Private
            </Badge>
          ) : (
            <Badge variant="secondary">Public</Badge>
          )}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {group.course ? `${group.course} · ` : ""}
          Invite code {groupWithInvite?.invite_code ?? "—"}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="sessio-card">
          <CardContent className="p-5">
            <Clock3 className="h-5 w-5 text-primary" />
            <p className="mt-3 text-2xl font-semibold">
              {formatDuration(weekMinutes)}
            </p>
            <p className="text-sm text-muted-foreground">group focus this week</p>
          </CardContent>
        </Card>
        <Card className="sessio-card">
          <CardContent className="p-5">
            <Flame className="h-5 w-5 text-primary" />
            <p className="mt-3 text-2xl font-semibold">{feedSessions.length}</p>
            <p className="text-sm text-muted-foreground">recent sessions</p>
          </CardContent>
        </Card>
        <Card className="sessio-card">
          <CardContent className="p-5">
            <Users className="h-5 w-5 text-primary" />
            <p className="mt-3 text-2xl font-semibold">{members.length}</p>
            <p className="text-sm text-muted-foreground">accountability circle</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <GroupFeed sessions={feedSessions} currentUserId={user.id} />
        <GroupMembers
          groupId={groupId}
          members={members}
          currentUserId={user.id}
          isOwner={group.owner_id === user.id}
        />
      </section>
    </div>
  );
}
