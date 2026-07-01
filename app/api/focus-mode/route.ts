import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return NextResponse.redirect(new URL("/auth/login", request.url));

    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const { error } = await supabase
      .from("calendar_events")
      .insert({
        user_id: user.id,
        title: "Deep Work",
        start_time: now.toISOString(),
        end_time: twoHoursLater.toISOString(),
        visibility: "private",
        is_busy_mask: true
      });

    if (error) throw error;

    revalidatePath("/dashboard");
    revalidatePath("/calendar");
    
    // Redirect back to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url), { status: 302 });
  } catch (error) {
    console.error("Focus mode error:", error);
    return NextResponse.redirect(new URL("/dashboard?error=failed", request.url), { status: 302 });
  }
}
