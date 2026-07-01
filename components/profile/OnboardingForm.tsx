"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type OnboardingFormProps = {
  userId: string;
  profile: Tables<"profiles"> | null;
};

const rolePresets = ["STUDENT", "ALUM", "STAFF"];

export function OnboardingForm({ userId, profile }: OnboardingFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [major, setMajor] = useState(profile?.major ?? "");
  const [year, setYear] = useState(profile?.year ?? "");
  const initialRole = (profile?.role ?? "STUDENT").toUpperCase();
  const [role, setRole] = useState(initialRole);
  const [customRole, setCustomRole] = useState(
    rolePresets.includes(initialRole) ? "" : initialRole,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const effectiveRole = customRole.trim()
    ? customRole.trim().toUpperCase()
    : role;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: fullName.trim() || null,
      username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || null,
      major: major.trim() || null,
      year: year.trim() || null,
      role: effectiveRole.trim() || null,
      avatar_url: profile?.avatar_url ?? null,
    });

    if (updateError) {
      setError(updateError.message);
      setIsSaving(false);
      return;
    }

    router.push("/feed");
    router.refresh();
  }

  return (
    <Card className="sessio-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Make your stats meaningful
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="onboarding-name">Name</Label>
              <Input
                id="onboarding-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="onboarding-username">Username</Label>
              <Input
                id="onboarding-username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="DuBistGutGenug67"
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="onboarding-major">Major</Label>
              <Input
                id="onboarding-major"
                value={major}
                onChange={(event) => setMajor(event.target.value)}
                placeholder="Computer Science"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="onboarding-year">Year</Label>
              <select
                id="onboarding-year"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                required
                className="focus-ring h-10 rounded-md border border-input bg-white px-3 text-sm text-card-foreground"
              >
                <option value="">Select year</option>
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Grad">Grad</option>
              </select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Role</Label>
            <div className="flex flex-wrap gap-2">
              {rolePresets.map((option) => {
                const selected = !customRole.trim() && role === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setRole(option);
                      setCustomRole("");
                    }}
                    aria-pressed={selected}
                    className={`focus-ring rounded-full border px-4 py-2 text-sm font-medium transition ${
                      selected
                        ? "border-[#0F223A] bg-[#0F223A] text-white"
                        : "border-input bg-white text-[#0F223A] hover:border-[#0F223A]/40"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            <Input
              id="onboarding-role-custom"
              value={customRole}
              onChange={(event) => setCustomRole(event.target.value)}
              placeholder="Or type a custom role (e.g. TA, Postdoc)"
              className="mt-1"
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" size="lg" disabled={isSaving}>
            {isSaving ? "Saving..." : "Continue to feed"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
