import { GroupFeed, type FeedSession } from "@/components/groups/GroupFeed";
import { Card, CardContent } from "@/components/ui/card";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { formatDuration } from "@/lib/utils/streak";
import { Clock3, Flame, Users } from "lucide-react";
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
    .select("id, name, invite_code")
    .eq("id", groupId)
    .single();

  if (!group) {
    redirect("/groups");
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: sessions } = await supabase
    .from("sessions")
    .select(
      "id, user_id, title, category, start_time, duration_minutes, goal_completed, summary_ai, spots(name), likes(id, user_id)",
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

  let memberCount: number | null = null;
  try {
    const service = createServiceClient();
    const { count } = await service
      .from("group_members")
      .select("id", { count: "exact", head: true })
      .eq("group_id", groupId);
    memberCount = count ?? null;
  } catch {
    memberCount = null;
  }

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
      actorName:
        profile?.full_name ?? profile?.username ?? `Member ${session.user_id.slice(0, 6)}`,
      actorAvatarUrl: profile?.avatar_url ?? null,
      kudosCount: likes.length,
      likedByMe: likes.some((like) => like.user_id === user.id),
    };
  });

  const weekMinutes = feedSessions
    .filter((session) => new Date(session.startedAt) >= weekAgo)
    .reduce((sum, session) => sum + (session.durationMinutes ?? 0), 0);

  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm font-medium text-primary">Group feed</p>
        <h1 className="mt-2 text-3xl font-semibold">{group.name}</h1>
        <p className="mt-2 text-muted-foreground">
          Invite code {group.invite_code}
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
            <p className="mt-3 text-2xl font-semibold">
              {memberCount ?? "Member"}
            </p>
            <p className="text-sm text-muted-foreground">accountability circle</p>
          </CardContent>
        </Card>
      </section>

      <GroupFeed sessions={feedSessions} currentUserId={user.id} />
    </div>
  );
}
