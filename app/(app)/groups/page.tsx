import { GroupsManager } from "@/components/groups/GroupsManager";
import { createClient } from "@/lib/supabase/server";

export default async function GroupsPage() {
  const supabase = await createClient();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: groups } = await supabase
    .from("groups")
    .select("id, name, invite_code")
    .order("created_at", { ascending: false });
  const groupIds = (groups ?? []).map((group) => group.id);
  const { data: sessions } =
    groupIds.length > 0
      ? await supabase
          .from("sessions")
          .select("group_id, duration_minutes")
          .in("group_id", groupIds)
          .eq("status", "completed")
          .gte("start_time", weekAgo.toISOString())
      : { data: [] };

  const groupsWithStats = (groups ?? []).map((group) => {
    const groupSessions = (sessions ?? []).filter(
      (session) => session.group_id === group.id,
    );
    return {
      ...group,
      focusMinutes: groupSessions.reduce(
        (sum, session) => sum + (session.duration_minutes ?? 0),
        0,
      ),
      sessionCount: groupSessions.length,
    };
  });

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-medium text-primary">Study squads</p>
        <h1 className="mt-2 text-3xl font-semibold">Groups</h1>
        <p className="mt-2 text-muted-foreground">
          Create a focus squad, join by invite code, and keep effort visible.
        </p>
      </div>
      <GroupsManager groups={groupsWithStats} />
    </div>
  );
}
