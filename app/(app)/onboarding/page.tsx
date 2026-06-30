import { OnboardingForm } from "@/components/profile/OnboardingForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div>
        <p className="text-sm font-medium text-primary">Welcome</p>
        <h1 className="mt-2 text-3xl font-semibold">
          Set up just enough context
        </h1>
        <p className="mt-2 text-muted-foreground">
          Sessio works best when your major, year, and focus areas are attached
          to your study sessions.
        </p>
      </div>
      <OnboardingForm userId={user.id} profile={profile ?? null} />
    </div>
  );
}
