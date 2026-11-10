import { EVENT } from "@/config/event";
import RevealText from "./motion/RevealText";

export default function FinalCta() {
  return (
    <section className="final" aria-labelledby="final-heading">
      <div className="container">
        <RevealText id="final-heading" className="display final__title" lines={["Meet Danube in Lagos.", "Own in Dubai."]} />
        <p className="final__sub serif-line">
          {EVENT.dateLabel}. Free entry for registered guests.
        </p>
        <a className="btn btn--solid" href="#register" data-magnetic>
          Reserve my seat
        </a>
      </div>
    </section>
  );
}
