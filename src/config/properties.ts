/**
 * Featured projects. Figures are taken from danubeproperties.com (Nov 2026).
 * Re-check prices and completion dates before the event.
 */
export type Property = {
  id: string;
  name: string;
  tagline: string;
  location: string;
  summary: string;
  startingPrice: string;
  priceAed: number;
  completion: string;
  paymentPlan: string;
  homes: string;
  image: string;
  detailImage: string;
  enquiryMessage: string;
  url: string;
};

const ALL: Property[] = [
  {
    id: "shahrukhz-residences",
    name: "Shahrukhz Residences",
    tagline: "A new icon of waterfront luxury",
    location: "Dubai Maritime City",
    summary:
      "Fully furnished sea-facing residences and penthouses, two minutes from Port Rashid and ten from Burj Khalifa, with the Infinity 33 beach club and a rooftop King’s Club Deck.",
    startingPrice: "AED 1.65M",
    priceAed: 1_650_000,
    completion: "Q4 2029",
    paymentPlan: "30/70",
    homes: "Studio to 3 bedroom, penthouses",
    image: "/media/shahrukhz.webp",
    detailImage: "/media/shahrukhz-3.webp",
    enquiryMessage:
      "Hello Danube team, I saw Shahrukhz Residences (Dubai Maritime City) on the Lagos Roadshow page and I’d like the price list, floor plans and payment plan details.",
    url: "https://danubeproperties.com/portfolio/shahrukhz-residences/",
  },
  {
    id: "greenz",
    name: "Greenz",
    tagline: "Where every day feels like a retreat",
    location: "Academic City, Dubai",
    summary:
      "768 fully furnished townhouses and villas with Italian Dolce Vita interiors, a dancing fountain, beach hub and ten sports courts, one minute from Emirates Road.",
    startingPrice: "AED 3.8M",
    priceAed: 3_800_000,
    completion: "Q4 2029",
    paymentPlan: "1% monthly",
    homes: "3, 4 and 5 bedroom villas",
    image: "/media/greenz.webp",
    detailImage: "/media/greenz-2.webp",
    enquiryMessage:
      "Hello Danube team, I saw Greenz villas (Academic City) on the Lagos Roadshow page and I’d like the price list, villa layouts and payment plan details.",
    url: "https://danubeproperties.com/portfolio/greenz-by-danube/",
  },
  {
    id: "bayz101",
    name: "Bayz 101",
    tagline: "Your home in the sky",
    location: "Business Bay, Dubai",
    summary:
      "One of the tallest residential towers in the city, with panoramic views of Burj Khalifa and Downtown from fully furnished homes in the heart of Business Bay.",
    startingPrice: "AED 1.175M",
    priceAed: 1_175_000,
    completion: "June 2028",
    paymentPlan: "30/60",
    homes: "Studio to 4 bedroom",
    image: "/media/bayz101.webp",
    detailImage: "/media/skyline.jpg",
    enquiryMessage:
      "Hello Danube team, I saw Bayz 101 (Business Bay) on the Lagos Roadshow page and I’d like the price list, floor plans and payment plan details.",
    url: "https://danubeproperties.com/portfolio/bayz101/",
  },
];

/** Shown in ascending price order so the lowest entry point is seen first. */
export const PROPERTIES = [...ALL].sort((a, b) => a.priceAed - b.priceAed);
