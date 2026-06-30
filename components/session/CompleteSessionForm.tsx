"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { formatDuration } from "@/lib/utils/streak";
import type { Tables } from "@/types/database";
import { Check, Sparkles, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useRef } from "react";

type CompleteSessionFormProps = {
  session: Tables<"sessions"> & {
    spots: Pick<Tables<"spots">, "id" | "name" | "area"> | null;
  };
};

export function CompleteSessionForm({ session }: CompleteSessionFormProps) {
  const router = useRouter();
  const [goalCompleted, setGoalCompleted] = useState(true);
  const [notes, setNotes] = useState(session.notes ?? "");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const durationMinutes = useMemo(
    () =>
      Math.max(
        1,
        Math.round((Date.now() - new Date(session.start_time).getTime()) / 60000),
      ),
    [session.start_time],
  );

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image or video file (JPEG, PNG, GIF, WebP, MP4, WebM, MOV)');
        return;
      }
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }
      setMediaFile(file);
      setError(null);
    }
  }

  function removeFile() {
    setMediaFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function uploadMedia(userId: string): Promise<string | null> {
    if (!mediaFile) return null;

    setIsUploading(true);
    const supabase = createClient();

    // Create a unique filename
    const fileExt = mediaFile.name.split('.').pop();
    const fileName = `${userId}/${session.id}_${Date.now()}.${fileExt}`;

    const { data, error: uploadError } = await supabase.storage
      .from('session-media')
      .upload(fileName, mediaFile, {
        cacheControl: '3600',
        upsert: false,
      });

    setIsUploading(false);

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('session-media')
      .getPublicUrl(data.path);

    return publicUrl;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be logged in to complete a session');
      setIsSaving(false);
      return;
    }

    // Upload media if present
    let mediaUrl: string | null = null;
    try {
      if (mediaFile) {
        mediaUrl = await uploadMedia(user.id);
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload media');
      setIsSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("sessions")
      .update({
        status: "completed",
        end_time: new Date().toISOString(),
        duration_minutes: durationMinutes,
        goal_completed: goalCompleted,
        notes: notes.trim() || null,
        media_url: mediaUrl,
      })
      .eq("id", session.id);

    if (updateError) {
      setError(updateError.message);
      setIsSaving(false);
      return;
    }

    await fetch("/api/session-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: session.id }),
    }).catch(() => undefined);

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Nice focus.</h1>
        <p className="mt-2 text-muted-foreground">
          You logged {formatDuration(durationMinutes)}
          {session.spots ? ` at ${session.spots.name}` : ""}. Add the outcome
          before it lands in your dashboard.
        </p>
      </div>

      <Card className="sessio-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Complete session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <Label>Did you achieve your goal?</Label>
              <div className="grid grid-cols-2 gap-2">
                {[true, false].map((value) => (
                  <button
                    key={String(value)}
                    type="button"
                    onClick={() => setGoalCompleted(value)}
                    className={`focus-ring rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                      goalCompleted === value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted/40"
                    }`}
                  >
                    {value ? "Yes" : "Not yet"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="completion-notes">What did you finish?</Label>
              <textarea
                id="completion-notes"
                rows={5}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="focus-ring rounded-md border border-input bg-white px-3 py-2 text-sm text-card-foreground"
                placeholder="A sentence or two is enough."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="session-media">Session photo or video (optional)</Label>
              <p className="text-sm text-muted-foreground">
                Share a photo or timelapse of your study session
              </p>
              {!mediaFile ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="session-media"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4" />
                    Choose file
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-md border border-input bg-muted/40 px-3 py-2">
                  <div className="flex-1 truncate text-sm">
                    {mediaFile.name}
                    <span className="ml-2 text-muted-foreground">
                      ({(mediaFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" size="lg" disabled={isSaving || isUploading}>
              <Check className="h-4 w-4" />
              {isUploading ? "Uploading media..." : isSaving ? "Saving..." : "Save session"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
