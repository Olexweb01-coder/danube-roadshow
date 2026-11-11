import { BROKER, EVENT, dataHolders } from "@/config/event";
import RevealText from "./motion/RevealText";

const FAQS = [
  {
    q: "Is the roadshow really free?",
    a: `Yes. Entry is free, but you need to register; capacity is planned for about ${EVENT.dailyCapacity} guests each day and registered guests are admitted first.`,
  },
  {
    q: "How does my money get to Dubai safely?",
    a: "Off-plan payments in Dubai go into the project’s registered escrow account, as Dubai law requires, never into a personal account. Your advisor shows you the account details and payment schedule before you pay.",
  },
  {
    q: "What proof of ownership do I get?",
    a: "An off-plan purchase is registered with the Dubai Land Department (the Oqood registration). Your title deed is issued at handover.",
  },
  {
    q: "Can I reserve a home at the event?",
    a: "Yes, if you’re ready. Your advisor explains the reservation amount and payment steps for the unit you choose. There’s no obligation to buy by attending.",
  },
  {
    q: "Does buying qualify me for a UAE Golden Visa?",
    a: "Property worth AED 2 million or more can make you eligible for the 10-year Golden Visa, subject to UAE requirements. The team will talk you through it.",
  },
  {
    q: "I live abroad or can’t make the dates. Can I still take part?",
    a: "Yes. Register anyway, and we’ll send the price list and floor plans on WhatsApp and arrange a call with an advisor.",
  },
  {
    q: "Can I bring my spouse or business partner?",
    a: "Yes, and we recommend it, especially if you make the decision together. They’re welcome on either day.",
  },
  {
    q: "Who is organising the roadshow?",
    a: BROKER.name
      ? `${BROKER.name}, a registered Danube Properties broker, with Danube Properties’ sales team.`
      : "A registered Danube Properties broker, with Danube Properties’ sales team.",
  },
  {
    q: "What happens to my details?",
    a: `They are used only to arrange your visit and follow up on your enquiry, by ${dataHolders()}. They are never sold or shared with third parties.`,
  },
];

export default function Faq() {
  return (
    <section className="faq" id="faq" aria-labelledby="faq-heading">
      <div className="container faq__grid">
        <div>
          <p className="eyebrow">Before you register</p>
          <RevealText id="faq-heading" className="heading" lines={["Questions", "investors ask us"]} />
        </div>
        <div className="faq__list">
          {FAQS.map((f) => (
            <details key={f.q} className="faq__item">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
