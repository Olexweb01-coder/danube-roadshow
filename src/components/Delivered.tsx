import Image from "next/image";
import { DELIVERED, DELIVERY_CAPTION_REAL_PHOTOS } from "@/config/proof";

/** Social proof block C: buildings Danube has already handed over. */
export default function Delivered() {
  if (!DELIVERED.length) return null;
  return (
    <section className="delivered" aria-labelledby="delivered-heading">
      <div className="container">
        <div className="delivered__head">
          <h2 id="delivered-heading" className="heading">
            {DELIVERY_CAPTION_REAL_PHOTOS ? "Sixteen projects handed over. Keys, not renders." : "Sixteen projects handed over."}
          </h2>
          <p className="muted">
            Before you consider an off-plan home, look at what Danube has already finished and handed to owners.
          </p>
        </div>
        <ul className="delivered__grid" role="list">
          {DELIVERED.map((d) => (
            <li key={d.name} className="delivered__item">
              <div className="delivered__img">
                <Image src={d.image} alt={`${d.name} by Danube, ${d.area}`} fill sizes="(max-width: 760px) 50vw, 25vw" />
              </div>
              <p>
                <strong>{d.name}</strong> <span className="muted">{d.area}, handed over</span>
              </p>
            </li>
          ))}
        </ul>
        {!DELIVERY_CAPTION_REAL_PHOTOS && <p className="fineprint">Images: Danube Properties.</p>}
      </div>
    </section>
  );
}
