import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { connection } from "next/server";

export default async function AuthenticatedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <AppShell>
      <Header user={user} />
      <main className="mx-auto min-w-0 max-w-7xl p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </AppShell>
  );
}
