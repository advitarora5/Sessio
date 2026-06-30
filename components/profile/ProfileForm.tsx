"use client";

import { UserAvatar } from "@/components/profile/UserAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";
import { Save, Upload } from "lucide-react";
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
  const [role, setRole] = useState(profile?.role ?? "STUDENT");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
      role: role.trim().toUpperCase() || "STUDENT",
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

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setMessage(null);

    if (!file.type.startsWith("image/")) {
      setMessage("Choose an image file for your profile picture.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage("Profile pictures must be 2 MB or smaller.");
      return;
    }

    setIsUploading(true);
    const supabase = createClient();
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const filePath = `${userId}/${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setMessage(uploadError.message);
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = data.publicUrl;
    setAvatarUrl(publicUrl);

    const { error: updateError } = await supabase.from("profiles").upsert({
      id: userId,
      avatar_url: publicUrl,
    });

    setIsUploading(false);
    if (updateError) {
      setMessage(updateError.message);
      return;
    }

    setMessage("Profile picture uploaded.");
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
                className="focus-ring h-9 rounded-md border border-input bg-white px-3 text-sm text-card-foreground"
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
                onChange={(event) => setRole(event.target.value.toUpperCase())}
                placeholder="STUDENT"
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
          <div className="grid gap-4 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-[auto_1fr] sm:items-center">
            <UserAvatar
              name={fullName}
              username={username}
              avatarUrl={avatarUrl}
              size="xl"
            />
            <div className="grid gap-2">
              <Label htmlFor="avatar-file">Profile picture</Label>
              <Input
                id="avatar-file"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WebP, or GIF. Max 2 MB. Without an upload, Sessio uses
                colored initials.
              </p>
              {avatarUrl ? (
                <button
                  type="button"
                  onClick={() => setAvatarUrl("")}
                  className="w-fit text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Use initials instead
                </button>
              ) : null}
            </div>
          </div>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          <Button type="submit" disabled={isSaving || isUploading}>
            {isUploading ? (
              <Upload className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
