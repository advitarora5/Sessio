import { NextResponse } from "next/server";

/** AI session summary — server-only. See docs/implementation_plan.md Phase 7 */
export async function POST() {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
