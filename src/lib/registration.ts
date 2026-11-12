import { PROPERTIES } from "@/config/properties";

/** Where the guest lives. Asked with the contact details. */
export const LOCATIONS = ["Lagos", "Elsewhere in Nigeria", "Outside Nigeria"] as const;

/** How they heard about the roadshow. Asked with the contact details. */
export const HEARD_FRIEND = "A friend or family member";
export const HEARD_OTHER = "Other";
export const HEARD_FROM = [
  "Social media",
  HEARD_FRIEND,
  "WhatsApp",
  "A Danube agent or broker",
  "Google or a website",
  HEARD_OTHER,
] as const;

/** Question 1. "Other amount" asks the guest to type the figure. */
export const BUDGET_OTHER = "Other amount";
export const BUDGETS = ["$200k – $350k", "$350k – $500k", "$11M and above", BUDGET_OTHER] as const;

/** Question 2: off-plan or completed, instalments or one payment. */
export const BUYING = [
  "Off-plan, paying in instalments",
  "Off-plan, paying in full",
  "A completed home, paying in full",
  "Not sure yet, I’d like advice",
] as const;

/** Question 3: ready to reserve, and who makes the decision. */
export const READY = [
  "Yes, and I make the decision myself",
  "Yes, together with my spouse or business partner",
  "Possibly, once I’ve spoken to others",
  "Not yet, I’m still exploring",
] as const;

/** Project names, for the project a guest was looking at when they opened the form. */
export const PROJECT_NAMES = PROPERTIES.map((p) => p.name);

export type RegistrationInput = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  heardFrom: string;
  /** The friend's name, or where they heard (for "Other"). Empty otherwise. */
  heardDetail: string;
  budget: string;
  /** Only used when budget is "Other amount". */
  budgetOther: string;
  buying: string;
  ready: string;
  consent: boolean;
  /** Project panel the form was opened from; empty otherwise. Never asked. */
  project: string;
  /** Honeypot: must stay empty. */
  company?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

export type FieldErrors = Partial<Record<keyof RegistrationInput, string>>;

/** The fields on each screen of the form, in order. */
export const SCREENS = {
  details: ["fullName", "phone", "email", "location", "heardFrom", "heardDetail"],
  budget: ["budget", "budgetOther"],
  buying: ["buying"],
  ready: ["ready", "consent"],
} as const satisfies Record<string, readonly (keyof RegistrationInput)[]>;
export type Screen = keyof typeof SCREENS;
export const SCREEN_ORDER: Screen[] = ["details", "budget", "buying", "ready"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(v: unknown, max = 160): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function normalise(raw: Record<string, unknown>): RegistrationInput {
  const budget = clean(raw.budget, 40);
  const project = clean(raw.project, 60);
  const heardFrom = clean(raw.heardFrom, 40);
  return {
    fullName: clean(raw.fullName, 100),
    email: clean(raw.email, 120).toLowerCase(),
    phone: clean(raw.phone, 30),
    location: clean(raw.location, 40),
    heardFrom,
    // Only kept when the answer asks for more detail.
    heardDetail: heardFrom === HEARD_FRIEND || heardFrom === HEARD_OTHER ? clean(raw.heardDetail, 80) : "",
    budget,
    // Ignore any typed amount unless "Other amount" is the chosen answer.
    budgetOther: budget === BUDGET_OTHER ? clean(raw.budgetOther, 60) : "",
    buying: clean(raw.buying, 60),
    ready: clean(raw.ready, 60),
    consent: raw.consent === true || raw.consent === "true" || raw.consent === "on",
    project: PROJECT_NAMES.includes(project) ? project : "",
    company: clean(raw.company, 100),
    utmSource: clean(raw.utmSource, 80),
    utmMedium: clean(raw.utmMedium, 80),
    utmCampaign: clean(raw.utmCampaign, 120),
  };
}

const oneOf = (list: readonly string[], v: string) => list.includes(v);

export function validate(d: RegistrationInput, only?: readonly (keyof RegistrationInput)[]): FieldErrors {
  const e: FieldErrors = {};
  if (d.fullName.length < 2) e.fullName = "Enter your full name.";
  const digits = d.phone.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) e.phone = "Enter your WhatsApp number with country code, e.g. +234 803 123 4567.";
  if (!EMAIL_RE.test(d.email)) e.email = "Enter an email like name@example.com.";
  if (!oneOf(LOCATIONS, d.location)) e.location = "Choose where you live.";
  if (!oneOf(HEARD_FROM, d.heardFrom)) e.heardFrom = "Choose how you heard about the roadshow.";
  else if (d.heardFrom === HEARD_FRIEND && d.heardDetail.length < 2) e.heardDetail = "Enter your friend’s name.";
  else if (d.heardFrom === HEARD_OTHER && d.heardDetail.length < 2) e.heardDetail = "Tell us where you heard about it.";
  if (!oneOf(BUDGETS, d.budget)) e.budget = "Choose how much you’re ready to invest.";
  else if (d.budget === BUDGET_OTHER && !/\d/.test(d.budgetOther)) e.budgetOther = "Enter an amount, e.g. $750k.";
  if (!oneOf(BUYING, d.buying)) e.buying = "Choose how you’d like to buy.";
  if (!oneOf(READY, d.ready)) e.ready = "Choose the answer that fits you best.";
  if (!d.consent) e.consent = "Tick the box so the team can contact you.";
  if (!only) return e;
  const scoped: FieldErrors = {};
  for (const k of only) if (e[k]) scoped[k] = e[k];
  return scoped;
}

/**
 * Lead tier, worked out on the server.
 * HOT: $350k or more, and ready to reserve.
 * WARM: ready to reserve at any budget, or $350k or more and "possibly".
 * NURTURE: everyone else.
 */
export function leadTier(d: RegistrationInput): "HOT" | "WARM" | "NURTURE" {
  const big = d.budget === BUDGETS[1] || d.budget === BUDGETS[2];
  const yes = d.ready === READY[0] || d.ready === READY[1];
  const possibly = d.ready === READY[2];
  if (big && yes) return "HOT";
  if (yes || (big && possibly)) return "WARM";
  return "NURTURE";
}

/** Things the sales team should know before calling. */
export function leadNotes(d: RegistrationInput): string {
  const notes: string[] = [];
  if (d.buying === BUYING[2]) notes.push("Wants a completed home (projects on show are off-plan)");
  if (d.budget === BUDGET_OTHER) notes.push("Typed their own amount: check it");
  return notes.join("; ");
}

export function makeId() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = new Uint8Array(6);
  globalThis.crypto.getRandomValues(bytes);
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `DR-${out}`;
}
