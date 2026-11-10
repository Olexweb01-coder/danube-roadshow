import { EVENT } from "@/config/event";

export default function FinalCta() {
  return (
    <section className="final" aria-labelledby="final-heading">
      <div className="container">
        <h2 id="final-heading" className="display final__title">
          Meet Danube in Lagos.
          <br />
          Own in Dubai.
        </h2>
        <p className="final__sub serif-line">
          {EVENT.dateLabel}. Free entry for registered guests.
        </p>
        <a className="btn btn--solid" href="#register">
          Reserve my seat
        </a>
      </div>
    </section>
  );
}
