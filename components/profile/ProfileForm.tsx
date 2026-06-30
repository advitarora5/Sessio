"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ProfileFormProps = {
  userId: string;
  profile: Tables<"profiles"> | null;
};

export function ProfileForm({ userId, profile }: ProfileFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [major, setMajor] = useState(profile?.major ?? "");
  const [year, setYear] = useState(profile?.year ?? "");
  const [studyFocus, setStudyFocus] = useState(profile?.study_focus ?? "");
  const [role, setRole] = useState(profile?.role ?? "student");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: fullName.trim() || null,
      username: username.trim() || null,
      major: major.trim() || null,
      year: year.trim() || null,
      study_focus: studyFocus.trim() || null,
      role: role.trim() || null,
      avatar_url: avatarUrl.trim() || null,
    });

    setIsSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Profile saved.");
    router.refresh();
  }

  return (
    <Card className="sessio-card">
      <CardHeader>
        <CardTitle>Edit profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="major">Major</Label>
              <Input
                id="major"
                value={major}
                onChange={(event) => setMajor(event.target.value)}
                placeholder="CS"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="year">Year</Label>
              <select
                id="year"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                className="focus-ring h-9 rounded-md border border-input bg-background px-3 text-sm"
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
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="student"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="study-focus">Study focus</Label>
              <Input
                id="study-focus"
                value={studyFocus}
                onChange={(event) => setStudyFocus(event.target.value)}
                placeholder="Systems, research, MCAT..."
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input
              id="avatar"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://..."
            />
            <div className="grid grid-cols-4 gap-2">
              {["forest", "sprout", "library", "focus"].map((seed) => {
                const url = `https://api.dicebear.com/9.x/initials/svg?seed=${seed}`;
                return (
                  <button
                    key={seed}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className="focus-ring rounded-lg border border-border bg-muted px-3 py-2 text-xs capitalize hover:border-primary"
                  >
                    {seed}
                  </button>
                );
              })}
            </div>
          </div>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          <Button type="submit" disabled={isSaving}>
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
