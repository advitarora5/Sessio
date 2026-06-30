import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rsvpId, status } = await request.json();

    if (!rsvpId || !status || !["accepted", "declined"].includes(status)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Ensure the RSVP belongs to the current user
    const { data: rsvp, error: fetchError } = await supabase
      .from("event_rsvps")
      .select("*")
      .eq("id", rsvpId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !rsvp) {
      return NextResponse.json({ error: "RSVP not found" }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from("event_rsvps")
      .update({ status })
      .eq("id", rsvpId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
