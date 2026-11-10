/**
 * Roadshow details. Edit and redeploy; every section reads from here.
 * Saturday is the masterclass and investment day; Sunday is the grand finale.
 * Confirm both with the venue before launch.
 */
export const EVENT = {
  title: "Danube Dubai Roadshow, Lagos",
  city: "Lagos",
  venue: "Venue to be confirmed",
  dateLabel: "Sat 12 & Sun 13 December 2026",
  shortDate: "12–13 December",
  days: [
    { value: "Saturday 12 December", label: "Saturday 12 December", hours: "10:00 am – 9:00 pm" },
    { value: "Sunday 13 December", label: "Sunday 13 December", hours: "2:00 pm – 9:00 pm" },
    { value: "Either day", label: "Either day is fine", hours: "" },
  ],
  timeLabel: "Sat 10 am – 9 pm, Sun 2 pm – 9 pm",
  /** Doors open on day one, Lagos time (WAT, UTC+1). Drives the countdown. */
  startsAt: "2026-12-12T10:00:00+01:00",
  endsAt: "2026-12-13T21:00:00+01:00",
  /** Planned capacity per day, from the proposal. */
  dailyCapacity: 200,
} as const;

/**
 * The registered Danube broker presenting the event. Every field is optional:
 * leave one empty and the page simply leaves it out.
 */
export const BROKER = {
  /** Company name. Empty: the page says "a registered Danube Properties broker". */
  name: "",
  /** Dubai broker registration (ORN/RERA). Empty to hide. */
  registration: "",
  address: "",
  email: "",
  /** Hours promised in the "we reply within" line. */
  replyWithinHours: 2,
};

/** "Acme Realty" or, with no name set, "a registered Danube Properties broker". */
export const brokerLabel = () => BROKER.name || "a registered Danube Properties broker";
/** Who handles personal data: "Danube Properties and Acme Realty" / "...and its registered broker". */
export const dataHolders = () =>
  BROKER.name ? `Danube Properties and ${BROKER.name}` : "Danube Properties and its registered broker";

/** WhatsApp number that receives property enquiries (digits only, with country code). */
export const ENQUIRY_WHATSAPP = "971585398610";

/** WhatsApp community invite link. Set NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL in Vercel. */
export const COMMUNITY_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL || "https://chat.whatsapp.com/";

export function whatsappLink(message: string) {
  return `https://wa.me/${ENQUIRY_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

/** AED is pegged to the US dollar at 3.6725. */
export const AED_PER_USD = 3.6725;
export function usd(aed: number) {
  const v = aed / AED_PER_USD;
  if (v >= 1_000_000) return `$${(Math.round(v / 10_000) / 100).toFixed(2).replace(/0$/, "")}M`;
  const step = v < 10_000 ? 10 : 1000;
  return `$${(Math.round(v / step) * step).toLocaleString("en-US")}`;
}
