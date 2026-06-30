import { ProfileForm } from "@/components/profile/ProfileForm";
import { StreakBadge } from "@/components/profile/StreakBadge";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { computeStreak, formatDuration } from "@/lib/utils/streak";
import { Clock3, Layers3, Users } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: sessions }, { data: groups }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id ?? "")
        .maybeSingle(),
      supabase
        .from("sessions")
        .select("id, start_time, status, duration_minutes")
        .eq("user_id", user?.id ?? "")
        .eq("status", "completed")
        .order("start_time", { ascending: false }),
      supabase.from("groups").select("id, name, invite_code").order("name"),
    ]);

  const totalMinutes = (sessions ?? []).reduce(
    (sum, session) => sum + (session.duration_minutes ?? 0),
    0,
  );
  const streak = computeStreak(sessions ?? []);
  const profileMeta = [
    profile?.major ?? "Add your major",
    profile?.year ?? "Add year",
    profile?.role ?? "STUDENT",
  ].join(" / ");

  return (
    <div className="grid gap-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Training log</p>
          <h1 className="mt-2 text-3xl font-semibold">
            {profile?.full_name ?? user?.email?.split("@")[0] ?? "Your profile"}
          </h1>
          <p className="mt-2 text-muted-foreground">{profileMeta}</p>
          {profile?.study_focus ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Focus: {profile.study_focus}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-4">
          <UserAvatar
            name={profile?.full_name}
            username={profile?.username}
            avatarUrl={profile?.avatar_url}
            size="xl"
          />
          <StreakBadge streak={streak} size="large" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="sessio-card">
          <CardContent className="p-5">
            <Clock3 className="h-5 w-5 text-primary" />
            <p className="mt-3 text-2xl font-semibold">
              {formatDuration(totalMinutes)}
            </p>
            <p className="text-sm text-muted-foreground">total focused</p>
          </CardContent>
        </Card>
        <Card className="sessio-card">
          <CardContent className="p-5">
            <Layers3 className="h-5 w-5 text-primary" />
            <p className="mt-3 text-2xl font-semibold">
              {sessions?.length ?? 0}
            </p>
            <p className="text-sm text-muted-foreground">completed sessions</p>
          </CardContent>
        </Card>
        <Card className="sessio-card">
          <CardContent className="p-5">
            <Users className="h-5 w-5 text-primary" />
            <p className="mt-3 text-2xl font-semibold">{groups?.length ?? 0}</p>
            <p className="text-sm text-muted-foreground">groups joined</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <ProfileForm userId={user?.id ?? ""} profile={profile ?? null} />
        <Card className="sessio-card h-fit">
          <CardContent className="grid gap-3 p-5">
            <h2 className="text-xl font-semibold">Groups</h2>
            {(groups ?? []).length > 0 ? (
              groups?.map((group) => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="focus-ring rounded-lg border border-border bg-muted/30 p-3 text-sm transition hover:border-primary/60"
                >
                  <span className="font-medium">{group.name}</span>
                  <span className="ml-2 text-muted-foreground">
                    {group.invite_code}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Join a group to share public effort with friends.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
