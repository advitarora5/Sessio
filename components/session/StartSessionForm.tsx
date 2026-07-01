"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { Tables, TablesInsert } from "@/types/database";
import { MapPinned, Play, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type SpotOption = Pick<Tables<"spots">, "id" | "name" | "area" | "tags">;
type GroupOption = Pick<Tables<"groups">, "id" | "name">;

type StartSessionFormProps = {
  spots: SpotOption[];
  groups: GroupOption[];
  defaultSpotId?: number;
  suggestedSpot?: SpotOption | null;
  spotsSource?: "supabase" | "imported" | "fallback";
};

const durations = [45, 60, 90, 120];
const categories = ["Course", "Research", "Startup", "Reading", "Other"];

export function StartSessionForm({
  spots,
  groups,
  defaultSpotId,
  suggestedSpot,
  spotsSource = "supabase",
}: StartSessionFormProps) {
  const router = useRouter();
  const initialSpotId = defaultSpotId ?? suggestedSpot?.id ?? spots[0]?.id;
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [targetDuration, setTargetDuration] = useState(45);
  const [customDuration, setCustomDuration] = useState("");
  const [spotId, setSpotId] = useState(initialSpotId?.toString() ?? "");
  // Private by default — a private session always passes the sessions INSERT
  // RLS policy since it isn't tied to a group the user may not belong to.
  const [visibility, setVisibility] =
    useState<Tables<"sessions">["visibility"]>("private");
  const [distractionFree, setDistractionFree] = useState(true);
  const [groupId, setGroupId] = useState(groups[0]?.id.toString() ?? "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedSpot = useMemo(
    () => spots.find((spot) => spot.id.toString() === spotId),
    [spotId, spots],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.push("/auth/login");
      return;
    }

    const payload: TablesInsert<"sessions"> = {
      user_id: user.id,
      title: title.trim(),
      category,
      target_duration_minutes: targetDuration,
      distraction_free: distractionFree,
      spot_id: spotId ? Number(spotId) : null,
      group_id: visibility === "group" && groupId ? Number(groupId) : null,
      visibility,
      start_time: new Date().toISOString(),
      status: "active",
      notes: notes.trim() || null,
    };

    const { data, error: insertError } = await supabase
      .from("sessions")
      .insert(payload)
      .select("id")
      .single();

    if (insertError || !data) {
      setError(insertError?.message ?? "Could not start the session.");
      setIsSubmitting(false);
      return;
    }

    router.push(`/session/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Card className="sessio-card">
        <CardHeader>
          <CardTitle className="text-2xl">Set your focus intention</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="title">What are you working on?</Label>
            <Input
              id="title"
              placeholder="CS 225 MP debugging"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`focus-ring rounded-full border px-3 py-2 text-sm transition ${
                    category === item
                      ? "border-[#0F223A] bg-[#0F223A] text-white"
                      : "border-border bg-white text-[#0F223A] hover:border-[#0F223A]/40 hover:bg-slate-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Target duration</Label>
            <div className="grid grid-cols-4 gap-2">
              {durations.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => setTargetDuration(minutes)}
                  className={`focus-ring rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                    targetDuration === minutes
                      ? "border-[#0F223A] bg-[#0F223A] text-white"
                      : "border-border bg-white text-[#0F223A] hover:border-[#0F223A]/40 hover:bg-slate-50"
                  }`}
                >
                  {minutes}m
                </button>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
              <Input
                type="number"
                min={15}
                max={240}
                value={customDuration}
                onChange={(event) => {
                  setCustomDuration(event.target.value);
                  const nextDuration = Number(event.target.value);
                  if (Number.isFinite(nextDuration) && nextDuration >= 15) {
                    setTargetDuration(nextDuration);
                  }
                }}
                placeholder="Custom minutes"
                aria-label="Custom duration in minutes"
              />
              <p className="text-xs text-muted-foreground">
                Deep work defaults start at 45 minutes.
              </p>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="spot">Study spot</Label>
            <select
              id="spot"
              value={spotId}
              onChange={(event) => setSpotId(event.target.value)}
              className="focus-ring h-10 rounded-md border border-input bg-white px-3 text-sm text-card-foreground"
            >
              {spots.map((spot) => (
                <option key={spot.id} value={spot.id}>
                  {spot.name}
                  {spot.area ? ` - ${spot.area}` : ""}
                </option>
              ))}
            </select>
            {suggestedSpot ? (
              <p className="text-sm text-muted-foreground">
                Suggested: {suggestedSpot.name}
              </p>
            ) : null}
            {spotsSource === "fallback" ? (
              <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Showing IlliniSpots fallback data. Run{" "}
                <code>npm run import:illini-spots</code> to persist these spots
                before saving spot-linked sessions.
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="visibility">Visibility</Label>
            <select
              id="visibility"
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value as Tables<"sessions">["visibility"])
              }
              className="focus-ring h-10 rounded-md border border-input bg-white px-3 text-sm text-card-foreground"
            >
              <option value="private">Private</option>
              <option value="group">Group</option>
              <option value="public">Public</option>
            </select>
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-border bg-white p-4 text-sm">
            <Checkbox
              checked={distractionFree}
              onCheckedChange={(checked) => setDistractionFree(checked === true)}
              aria-label="Enable distraction-free mode"
              className="mt-0.5"
            />
            <span>
              <span className="block font-medium text-[#0F223A]">
                Distraction-free mode
              </span>
              <span className="mt-1 block text-slate-600">
                Adds a DND tag to the completed session.
              </span>
            </span>
          </label>

          {visibility === "group" && groups.length > 0 ? (
            <div className="grid gap-2">
              <Label htmlFor="group">Share with group</Label>
              <select
                id="group"
                value={groupId}
                onChange={(event) => setGroupId(event.target.value)}
                className="focus-ring h-10 rounded-md border border-input bg-white px-3 text-sm text-card-foreground"
              >
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes before starting</Label>
            <textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="What would make this session a win?"
              className="focus-ring rounded-md border border-input bg-white px-3 py-2 text-sm text-card-foreground"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" size="lg" disabled={isSubmitting}>
            <Play className="h-4 w-4" />
            {isSubmitting ? "Starting..." : "Start Session"}
          </Button>
        </CardContent>
      </Card>

      <Card className="sessio-card h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Session preview
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Goal</p>
            <p className="mt-1 text-xl font-semibold">
              {title.trim() || "Untitled focus block"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{category}</Badge>
            <Badge variant="outline">{targetDuration} minutes</Badge>
            <Badge variant="outline">{visibility}</Badge>
            {distractionFree ? <Badge variant="outline">DND</Badge> : null}
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <MapPinned className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">
                  {selectedSpot?.name ?? "Pick a campus spot"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedSpot?.area ?? "Your stats will improve once spots are logged."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
