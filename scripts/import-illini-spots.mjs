import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const dataRoot = path.join(root, "illinispots", "data-pipeline", "data");

function normalizeCoordinatePair([first, second]) {
  return first > -60 && second < -60
    ? { lat: first, lng: second }
    : { lat: second, lng: first };
}

function campusArea(name, lat, lng) {
  if (name.toLowerCase().includes("library")) return "Library";
  if (
    lat >= 40.1105 ||
    /engineering|engr|computer|siebel|loomis|everitt|newmark/i.test(name)
  ) {
    return "Engineering Quad";
  }
  if (lng <= -88.231 || /art|design|huff|wymer/i.test(name)) {
    return "West Campus";
  }
  if (lat <= 40.1045) return "South Campus";
  return "Main Quad";
}

function tagsForSpot(name, hoursText) {
  const tags = new Set(["illini-spots", "campus"]);
  if (name.toLowerCase().includes("library")) {
    tags.add("library");
    tags.add("quiet");
  }
  if (/engineering|engr|computer|siebel|loomis|everitt|newmark/i.test(name)) {
    tags.add("engineering");
  }
  if (/business|design|art|architecture/i.test(name)) {
    tags.add("collaborative");
  }
  if (/11PM|11:59PM|10PM/i.test(hoursText)) tags.add("late-night");
  if (!/weekend LOCKED\/LOCKED/i.test(hoursText)) tags.add("weekend");
  return Array.from(tags);
}

const [geoJsonText, hoursText] = await Promise.all([
  readFile(path.join(dataRoot, "uiuc_buildings.geojson"), "utf8"),
  readFile(path.join(dataRoot, "building_hours.json"), "utf8"),
]);
const geoJson = JSON.parse(geoJsonText);
const hours = JSON.parse(hoursText);

const spots = geoJson.features
  .map((feature) => {
    const name = feature.properties?.name?.trim();
    const coordinates = feature.geometry?.coordinates;
    if (!name || !coordinates) return null;

    const { lat, lng } = normalizeCoordinatePair(coordinates);
    const spotHours = hours[name];
    const readableHours = spotHours
      ? `M-TH ${spotHours["M-TH"] ?? "varies"}, F ${spotHours.F ?? "varies"}, weekend ${spotHours.SAT ?? "varies"}/${spotHours.SUN ?? "varies"}`
      : "campus hours vary";

    return {
      name,
      description: `IlliniSpots campus study building. Hours: ${readableHours}.`,
      area: campusArea(name, lat, lng),
      lat,
      lng,
      tags: tagsForSpot(name, readableHours),
    };
  })
  .filter(Boolean);

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before importing Illini spots.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { error } = await supabase.from("spots").upsert(spots, {
  onConflict: "name",
});

if (error) throw error;

console.log(`Imported ${spots.length} Illini spots.`);
