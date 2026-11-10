import { PROPERTIES } from "@/config/properties";
import { EVENT } from "@/config/event";

/** AED bands (Danube's own) with USD at the fixed peg. */
export const BUDGETS = [
  "AED 1M – 2M (about $270k – $545k)",
  "AED 2M – 3M (about $545k – $815k)",
  "AED 3M – 5M (about $815k – $1.36M)",
  "AED 5M+ (about $1.36M+)",
] as const;
export const UNIT_TYPES = ["Studio", "1 bedroom", "2 bedroom", "3 bedroom", "Villa or townhouse", "Penthouse"] as const;
export const GOALS = [
  "Rental income",
  "Capital growth",
  "UAE Golden Visa",
  "A home for my family",
  "A holiday home",
] as const;
export const PAYMENT = ["Payment plan", "Cash", "Not sure yet"] as const;
export const EXPERIENCE = ["No, this would be my first", "Yes, I own in Dubai already"] as const;
export const TIMELINES = ["Within 60 days", "Within 90 days", "After 90 days", "Just exploring"] as const;
export const GUESTS = ["Just me", "2 people", "3 people", "4 people"] as const;
export const INTERESTS = [...PROPERTIES.map((p) => p.name), "Not sure yet"] as const;
export const DAYS = EVENT.days.map((d) => d.value);

export type RegistrationInput = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  day: string;
  interest: string;
  budget: string;
  unitType: string;
  goal: string;
  payment: string;
  experience: string;
  timeline: string;
  guests: string;
  consent: boolean;
  /** Honeypot: must stay empty. */
  company?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

export type FieldErrors = Partial<Record<keyof RegistrationInput, string>>;

/** Fields on the first screen ("Your seat"); the rest are on "Your goals". */
export const STEP_ONE: (keyof RegistrationInput)[] = ["fullName", "phone", "email", "city", "day"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(v: unknown, max = 160): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function normalise(raw: Record<string, unknown>): RegistrationInput {
  return {
    fullName: clean(raw.fullName, 100),
    email: clean(raw.email, 120).toLowerCase(),
    phone: clean(raw.phone, 30),
    city: clean(raw.city, 80),
    day: clean(raw.day, 40),
    interest: clean(raw.interest, 60),
    budget: clean(raw.budget, 60),
    unitType: clean(raw.unitType, 40),
    goal: clean(raw.goal, 40),
    payment: clean(raw.payment, 40),
    experience: clean(raw.experience, 60),
    timeline: clean(raw.timeline, 40),
    guests: clean(raw.guests, 20),
    consent: raw.consent === true || raw.consent === "true" || raw.consent === "on",
    company: clean(raw.company, 100),
    utmSource: clean(raw.utmSource, 80),
    utmMedium: clean(raw.utmMedium, 80),
    utmCampaign: clean(raw.utmCampaign, 120),
  };
}

const oneOf = (list: readonly string[], v: string) => list.includes(v);

export function validate(d: RegistrationInput, only?: (keyof RegistrationInput)[]): FieldErrors {
  const e: FieldErrors = {};
  if (d.fullName.length < 2) e.fullName = "Enter your full name.";
  if (!EMAIL_RE.test(d.email)) e.email = "Enter an email like name@example.com.";
  const digits = d.phone.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) e.phone = "Enter your number with country code, e.g. +234 803 123 4567.";
  if (d.city.length < 2) e.city = "Enter the city you live in.";
  if (!oneOf(DAYS, d.day)) e.day = "Choose the day you’ll attend.";
  if (!oneOf(INTERESTS, d.interest)) e.interest = "Choose a project.";
  if (!oneOf(BUDGETS, d.budget)) e.budget = "Choose a budget.";
  if (!oneOf(UNIT_TYPES, d.unitType)) e.unitType = "Choose a home type.";
  if (!oneOf(GOALS, d.goal)) e.goal = "Choose your main goal.";
  if (!oneOf(PAYMENT, d.payment)) e.payment = "Choose how you’d like to pay.";
  if (!oneOf(EXPERIENCE, d.experience)) e.experience = "Tell us if you’ve bought in Dubai before.";
  if (!oneOf(TIMELINES, d.timeline)) e.timeline = "Choose a timeline.";
  if (!oneOf(GUESTS, d.guests)) e.guests = "Choose how many are attending.";
  if (!d.consent) e.consent = "Tick the box so the team can contact you.";
  if (!only) return e;
  const scoped: FieldErrors = {};
  for (const k of only) if (e[k]) scoped[k] = e[k];
  return scoped;
}

/**
 * Lead tier from the proposal's on-ground sales strategy.
 * HOT: buying within 90 days with a budget from AED 2M, or paying cash.
 * WARM: buying within 90 days, or a budget from AED 2M.
 * NURTURE: everyone else.
 */
export function leadTier(d: RegistrationInput): "HOT" | "WARM" | "NURTURE" {
  const soon = d.timeline === "Within 60 days" || d.timeline === "Within 90 days";
  const bigBudget = BUDGETS.indexOf(d.budget as (typeof BUDGETS)[number]) >= 1;
  if (soon && (bigBudget || d.payment === "Cash")) return "HOT";
  if (soon || bigBudget) return "WARM";
  return "NURTURE";
}

export function makeId() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = new Uint8Array(6);
  globalThis.crypto.getRandomValues(bytes);
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `DR-${out}`;
}
