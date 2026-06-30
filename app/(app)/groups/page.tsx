import { GroupsManager } from "@/components/groups/GroupsManager";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function GroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id);
  const memberGroupIds = (memberships ?? []).map((membership) => membership.group_id);

  // invite_code is column-locked from the authenticated role (see
  // 20260630193000_groups_overhaul.sql), so confirmed members fetch it via
  // the service client rather than the RLS-scoped one used above.
  const service = createServiceClient();
  const { data: groups } =
    memberGroupIds.length > 0
      ? await service
          .from("groups")
          .select("id, name, invite_code")
          .in("id", memberGroupIds)
          .order("created_at", { ascending: false })
      : { data: [] };
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
