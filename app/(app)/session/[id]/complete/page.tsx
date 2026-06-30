import { CompleteSessionForm } from "@/components/session/CompleteSessionForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type SessionCompletePageProps = {
  params: Promise<{ id: string }>;
};

export default async function SessionCompletePage({
  params,
}: SessionCompletePageProps) {
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

  return <CompleteSessionForm session={session} />;
}
