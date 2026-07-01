import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CalendarClient } from "./CalendarClient";
import { loadCampusSpots } from "@/lib/spots/illini";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  const twoMonthsFuture = new Date();
  twoMonthsFuture.setMonth(twoMonthsFuture.getMonth() + 2);

  const [
    { data: events },
    { data: friendships },
    { data: groups },
    { spots },
    { data: pendingInvites }
  ] = await Promise.all([
    supabase
      .from("calendar_events")
      .select("*, event_rsvps(*)")
      .eq("user_id", user.id)
      .gte("start_time", twoMonthsAgo.toISOString())
      .lte("start_time", twoMonthsFuture.toISOString())
      .order("start_time", { ascending: true })
      .limit(500),
    supabase
      .from("friendships")
      .select("user_id, friend_id, status")
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .eq("status", "accepted"),
    // Only groups the user belongs to may be invited to an event.
    supabase
      .from("group_members")
      .select("groups(id, name)")
      .eq("user_id", user.id),
    loadCampusSpots(supabase),
    supabase
      .from("event_rsvps")
      .select(`
        id,
        event_id,
        status,
        calendar_events (
          title,
          start_time,
          end_time,
          location,
          user_id,
          profiles!user_id (
            full_name,
            username
          )
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "pending")
  ]);

  const friendIds = Array.from(new Set(
    (friendships ?? []).map(f => f.user_id === user.id ? f.friend_id : f.user_id)
  ));

  // Read friend profiles with the service client so ALL friends are returned;
  // the profiles SELECT policy would otherwise hide friends without a session
  // visible to the current user.
  const service = createServiceClient();
  const { data: friendsData } = friendIds.length > 0
    ? await service.from("profiles").select("id, username, full_name").in("id", friendIds)
    : { data: [] };

  const memberGroups = (groups ?? []).flatMap((membership) => {
    const g = (membership as { groups: unknown }).groups as
      | { id: number; name: string }
      | { id: number; name: string }[]
      | null;
    if (!g) return [];
    return Array.isArray(g) ? g : [g];
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">My Schedule</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your study blocks, set visibility, and invite friends.
        </p>
      </div>
      
      <CalendarClient 
        initialEvents={(events ?? []).map((e) => ({
          ...e,
          id: String(e.id),
          location: e.location ?? undefined,
        }))} 
        userId={user.id} 
        friends={(friendsData ?? []).map((f) => ({
          id: f.id,
          username: f.username ?? "",
          full_name: f.full_name ?? "",
        }))}
        groups={memberGroups.map((g) => ({ id: String(g.id), name: g.name }))}
        spots={(spots ?? []).map((s) => ({
          id: s.id,
          name: s.name,
          building: s.area ?? "",
        }))}
        pendingInvites={pendingInvites ?? []}
      />
    </div>
  );
}
