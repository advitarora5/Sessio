import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
  }>;
};

function fallbackSummary(session: {
  title: string;
  category: string | null;
  notes: string | null;
  duration_minutes: number | null;
}) {
  const subject = session.category ? `${session.category}: ${session.title}` : session.title;
  const outcome = session.notes?.trim()
    ? session.notes.trim().replace(/\s+/g, " ")
    : "logged a focused deep-work block";

  return `${subject} wrapped after ${session.duration_minutes ?? 0} minutes: ${outcome}.`;
}

function extractSummary(payload: OpenAIResponse) {
  if (payload.output_text) {
    return payload.output_text.trim();
  }

  const text = payload.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter(Boolean)
    .join(" ");

  return text?.trim();
}

async function generateSummary(session: {
  title: string;
  category: string | null;
  notes: string | null;
  duration_minutes: number | null;
}) {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackSummary(session);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-5.5",
        max_output_tokens: 80,
        input: [
          {
            role: "system",
            content:
              "Write one concise, encouraging sentence summarizing a completed study or deep-work session. Do not invent accomplishments.",
          },
          {
            role: "user",
            content: JSON.stringify({
              title: session.title,
              category: session.category,
              notes: session.notes,
              duration_minutes: session.duration_minutes,
            }),
          },
        ],
      }),
    });

    if (!response.ok) {
      return fallbackSummary(session);
    }

    const payload = (await response.json()) as OpenAIResponse;
    return extractSummary(payload) ?? fallbackSummary(session);
  } catch {
    return fallbackSummary(session);
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    session_id?: number;
  } | null;
  const sessionId = Number(body?.session_id);

  if (!Number.isInteger(sessionId)) {
    return NextResponse.json({ error: "Invalid session_id" }, { status: 400 });
  }

  const { data: session, error } = await supabase
    .from("sessions")
    .select("id, user_id, title, category, notes, duration_minutes")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (error || !session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const summary = await generateSummary(session);
  const writer = createServiceClient();
  const { error: updateError } = await writer
    .from("sessions")
    .update({ summary_ai: summary })
    .eq("id", session.id)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ summary });
}
