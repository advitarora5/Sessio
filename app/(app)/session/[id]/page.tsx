import { SessionTimer } from "@/components/session/SessionTimer";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type SessionTimerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SessionTimerPage({
  params,
}: SessionTimerPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: session } = await supabase
    .from("sessions")
    .select("*, spots(id, name, area)")
    .eq("id", Number(id))
    .single();

  if (!session || session.user_id !== user.id || session.status !== "active") {
    redirect("/dashboard");
  }

  return <SessionTimer session={session} />;
}
