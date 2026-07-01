import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId, title, duration, visibility, location, invites, groupIds, startTime } = await request.json();
    if (!title || !userId) {
      return NextResponse.json({ error: "Missing title or user" }, { status: 400 });
    }

    const supabase = await createClient();

    let start_time: Date;
    if (startTime) {
      start_time = new Date(startTime);
    } else {
      start_time = new Date();
      start_time.setHours(start_time.getHours() + 1, 0, 0, 0);
    }
    
    const end_time = new Date(start_time.getTime() + (duration || 90) * 60000);

    const { data: newEvent, error } = await supabase
      .from("calendar_events")
      .insert({
        user_id: userId,
        title,
        location: location || null,
        visibility: visibility || "public",
        start_time: start_time.toISOString(),
        end_time: end_time.toISOString(),
        is_busy_mask: visibility === "private"
      })
      .select()
      .single();

    if (error) throw error;

    // Process invites
    const userIdsToInvite = new Set<string>();

    if (invites && typeof invites === 'string' && invites.trim().length > 0) {
      const usernames = invites.split(",").map(u => u.trim()).filter(Boolean);
      if (usernames.length > 0) {
        const { data: friends } = await supabase
          .from("profiles")
          .select("id")
          .in("username", usernames);

        if (friends) {
          friends.forEach(f => userIdsToInvite.add(f.id));
        }
      }
    }

    if (groupIds && Array.isArray(groupIds) && groupIds.length > 0) {
      const { data: groupMembers } = await supabase
        .from("group_members")
        .select("user_id")
        .in("group_id", groupIds);

      if (groupMembers) {
        groupMembers.forEach(m => userIdsToInvite.add(m.user_id));
      }
    }

    // Exclude the creator themselves if they were accidentally included
    userIdsToInvite.delete(userId);

    if (userIdsToInvite.size > 0) {
      const rsvpInserts = Array.from(userIdsToInvite).map(id => ({
        event_id: newEvent.id,
        user_id: id,
        status: "pending"
      }));
      const { error: rsvpError } = await supabase.from("event_rsvps").insert(rsvpInserts);
      if (rsvpError) {
         console.error("RSVP Insert error:", rsvpError);
      }
    }

    return NextResponse.json({ event: newEvent });
  } catch (err: any) {
    console.error("Manual Schedule error:", err);
    return NextResponse.json({ error: err.message || "Failed to schedule event" }, { status: 500 });
  }
}
