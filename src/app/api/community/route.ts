import { NextResponse } from "next/server";
import { sendToSheet } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Marks a registration as "joined community" once the guest taps the invite. */
export async function POST(req: Request) {
  let id = "";
  try {
    const body = await req.json();
    id = typeof body?.id === "string" ? body.id.trim() : "";
  } catch {
    /* fall through */
  }
  if (!/^DR-[A-Z0-9]{6}$/.test(id)) {
    return NextResponse.json({ ok: false, error: "Invalid registration ID." }, { status: 400 });
  }
  const result = await sendToSheet({ action: "community", id, timestamp: new Date().toISOString() });
  // The guest has already been sent to WhatsApp; never block them on this.
  return NextResponse.json({ ok: result.ok });
}
