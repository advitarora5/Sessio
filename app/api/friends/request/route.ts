import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

function safeUsername(email: string | undefined, id: string) {
  return email ? `${email.split("@")[0]}_${id.slice(0, 8)}` : id.slice(0, 12);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    identifier?: string;
  } | null;
  const identifier = body?.identifier?.trim();

  if (!identifier) {
    return NextResponse.json({ error: "Enter a username." }, { status: 400 });
  }

  const service = createServiceClient();
  await service.from("profiles").upsert({
    id: user.id,
    full_name: user.user_metadata.full_name ?? user.email?.split("@")[0] ?? null,
    username: safeUsername(user.email, user.id),
  });

  const normalized = identifier.toLowerCase().replace(/^@/, "");
  const { data: target } = await service
    .from("profiles")
    .select("id, username, full_name")
    .ilike("username", normalized)
    .neq("id", user.id)
    .maybeSingle();

  if (!target) {
    return NextResponse.json(
      { error: "No Sessio profile found for that username." },
      { status: 404 },
    );
  }

  const direct = {
    user_id: user.id,
    friend_id: target.id,
    status: "pending" as const,
  };
  const { error } = await service
    .from("friendships")
    .upsert(direct, { onConflict: "user_id,friend_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ friend_id: target.id });
}
