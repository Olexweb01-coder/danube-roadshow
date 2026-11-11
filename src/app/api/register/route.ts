import { NextResponse } from "next/server";
import { leadNotes, leadTier, makeId, normalise, validate } from "@/lib/registration";
import { sendToSheet } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const data = normalise(raw);

  // Bots fill the hidden field; pretend success so they move on.
  if (data.company) return NextResponse.json({ ok: true, id: makeId() });

  const errors = validate(data);
  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, error: "Check the highlighted fields.", errors }, { status: 422 });
  }

  const id = makeId();
  const result = await sendToSheet({
    action: "register",
    id,
    timestamp: new Date().toISOString(),
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    location: data.location,
    budget: data.budget,
    budgetOther: data.budgetOther,
    buying: data.buying,
    ready: data.ready,
    notes: leadNotes(data),
    project: data.project,
    consent: data.consent ? "Yes" : "No",
    tier: leadTier(data),
    utmSource: data.utmSource,
    utmMedium: data.utmMedium,
    utmCampaign: data.utmCampaign,
    userAgent: (req.headers.get("user-agent") || "").slice(0, 200),
  });

  if (!result.ok) {
    console.error("[register]", result.error);
    return NextResponse.json(
      { ok: false, error: "We couldn’t save your registration. Try again in a moment." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, id });
}
