import { GroupDiscovery, type DiscoverableGroup } from "@/components/groups/GroupDiscovery";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DiscoverGroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [{ data: publicGroups }, { data: memberships }] = await Promise.all([
    supabase
      .from("groups")
      .select("id, name, course")
      .eq("visibility", "public")
      .order("created_at", { ascending: false }),
    supabase.from("group_members").select("group_id").eq("user_id", user.id),
  ]);

  const memberGroupIds = new Set((memberships ?? []).map((m) => m.group_id));
  const joinableGroups = (publicGroups ?? []).filter(
    (group) => !memberGroupIds.has(group.id),
  );
  const groupIds = joinableGroups.map((group) => group.id);

  const service = createServiceClient();
  const { data: memberRows } =
    groupIds.length > 0
      ? await service.from("group_members").select("group_id").in("group_id", groupIds)
      : { data: [] };
  const memberCountByGroupId = new Map<number, number>();
  (memberRows ?? []).forEach((row) => {
    memberCountByGroupId.set(row.group_id, (memberCountByGroupId.get(row.group_id) ?? 0) + 1);
  });

  const groups: DiscoverableGroup[] = joinableGroups.map((group) => ({
    id: group.id,
    name: group.name,
    course: group.course,
    memberCount: memberCountByGroupId.get(group.id) ?? 0,
  }));

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-medium text-primary">Study squads</p>
        <h1 className="mt-2 text-3xl font-semibold">Discover groups</h1>
        <p className="mt-2 text-muted-foreground">
          Browse public groups, search by class, and join with one click.
        </p>
      </div>
      <GroupDiscovery groups={groups} />
    </div>
  );
}
