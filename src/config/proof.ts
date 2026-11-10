/**
 * Social proof content, in the order it appears down the page.
 * Anything left empty is hidden, so the page never shows placeholders.
 */

/** Block B: Danube's published track record (danubeproperties.com, Nov 2026). */
export const TRACK_RECORD = [
  { value: "1993", label: "Danube founded" },
  { value: "32", label: "Projects launched in Dubai" },
  { value: "16", label: "Projects handed over" },
  { value: "1%", label: "Monthly payment plan, 0% interest" },
];

/**
 * Block C: completed buildings. These are Danube's published images; replace
 * with real handover photographs when you have them, then set
 * DELIVERY_CAPTION_REAL_PHOTOS to true for the stronger caption.
 */
export const DELIVERED = [
  { name: "Jewelz", area: "Arjan", image: "/media/delivered/jewelz.webp" },
  { name: "Gemz", area: "Al Furjan", image: "/media/delivered/gemz.webp" },
  { name: "Resortz", area: "Arjan", image: "/media/delivered/resortz.webp" },
  { name: "Glamz", area: "Al Furjan", image: "/media/delivered/glamz.webp" },
];
export const DELIVERY_CAPTION_REAL_PHOTOS = false;

/**
 * Block D: excerpts of Google reviews published on danubeproperties.com.
 * Confirm with Danube marketing that you may republish them.
 */
export const REVIEWS = [
  { quote: "Danube is one of the most stable developers in Dubai.", name: "BENU Pathre", context: "Investor" },
  { quote: "Their team was incredibly transparent, keeping every promise.", name: "Ahmed Moscow", context: "Homeowner" },
  {
    quote: "Whatever was promised has been delivered even beating the expectations.",
    name: "Ishika Ganjoo",
    context: "Gemz homeowner",
  },
];

/**
 * Block E: Nigerian clients who bought with Danube. Real people only, with
 * signed consent. The block stays hidden until at least one entry exists.
 * video: a .mp4 in /public/media/testimonials, or leave empty for text only.
 */
export type Testimonial = {
  headline: string;
  name: string;
  city: string;
  profession: string;
  doubt: string;
  decision: string;
  result: string;
  photo?: string;
  video?: string;
};
export const NIGERIAN_TESTIMONIALS: Testimonial[] = [];

/**
 * Block F: blurred paperwork screenshots (reservation form, Oqood, receipt).
 * Hidden until filled. Always blur personal data.
 */
export const PROCESS_SCREENSHOTS: { image: string; caption: string }[] = [];
