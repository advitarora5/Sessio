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

export function OnboardingForm({ userId, profile }: OnboardingFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [major, setMajor] = useState(profile?.major ?? "");
  const [year, setYear] = useState(profile?.year ?? "");
  const [studyFocus, setStudyFocus] = useState(profile?.study_focus ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: fullName.trim() || null,
      username: username.trim() || null,
      major: major.trim() || null,
      year: year.trim() || null,
      study_focus: studyFocus.trim() || null,
      role: "STUDENT",
      avatar_url: profile?.avatar_url ?? null,
    });

    if (updateError) {
      setError(updateError.message);
      setIsSaving(false);
      return;
    }

    router.push("/dashboard");
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
                className="focus-ring h-10 rounded-md border border-input bg-background px-3 text-sm"
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
            <Label htmlFor="onboarding-focus">Study focus</Label>
            <Input
              id="onboarding-focus"
              value={studyFocus}
              onChange={(event) => setStudyFocus(event.target.value)}
              placeholder="CS 374, research writing, startup sprint..."
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" size="lg" disabled={isSaving}>
            {isSaving ? "Saving..." : "Continue to dashboard"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
