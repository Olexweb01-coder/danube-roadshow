"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import RevealText from "./motion/RevealText";
import { NIGERIAN_TESTIMONIALS, PROCESS_SCREENSHOTS, REVIEWS } from "@/config/proof";

/**
 * Social proof blocks D (homeowner reviews), E (Nigerian investors) and
 * F (process paperwork). E and F render only once real content is added
 * in src/config/proof.ts.
 */
export default function SocialProof() {
  return (
    <section className="proof proof--light" aria-labelledby="proof-heading">
      <div className="container">
        <p className="eyebrow">Google reviews of Danube</p>
        <RevealText id="proof-heading" className="heading" lines={["What Danube", "homeowners say"]} />
        <ul className="reviews" role="list">
          {REVIEWS.map((r, i) => (
            <motion.li
              key={r.name}
              className="review"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: i * 0.14 }}
            >
              <span className="review__mark" aria-hidden="true">“</span>
              <blockquote>
                <p>“{r.quote}”</p>
              </blockquote>
              <p className="review__who">
                <strong>{r.name}</strong>
                <span>{r.context}, Google review</span>
              </p>
            </motion.li>
          ))}
        </ul>

        {NIGERIAN_TESTIMONIALS.length > 0 && (
          <div className="stories">
            <h2 className="heading">Nigerians who already own with Danube</h2>
            <ul className="stories__list" role="list">
              {NIGERIAN_TESTIMONIALS.map((t) => (
                <li key={t.name} className="story">
                  {t.video ? (
                    <video className="story__media" src={t.video} poster={t.photo} controls playsInline preload="none" />
                  ) : t.photo ? (
                    <div className="story__media">
                      <Image src={t.photo} alt={t.name} fill sizes="(max-width: 760px) 100vw, 33vw" />
                    </div>
                  ) : null}
                  <p className="story__headline">“{t.headline}”</p>
                  <p className="story__who">
                    {t.name}, {t.city}, {t.profession}
                  </p>
                  <dl className="story__arc">
                    <div>
                      <dt>The worry</dt>
                      <dd>{t.doubt}</dd>
                    </div>
                    <div>
                      <dt>What changed</dt>
                      <dd>{t.decision}</dd>
                    </div>
                    <div>
                      <dt>The result</dt>
                      <dd>{t.result}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </div>
        )}

        {PROCESS_SCREENSHOTS.length > 0 && (
          <div className="paperwork">
            <h2 className="heading">What you receive after you reserve</h2>
            <ul className="paperwork__list" role="list">
              {PROCESS_SCREENSHOTS.map((s) => (
                <li key={s.image}>
                  <div className="paperwork__img">
                    <Image src={s.image} alt={s.caption} fill sizes="(max-width: 760px) 100vw, 33vw" />
                  </div>
                  <p>{s.caption}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
