"use client";

import Image from "next/image";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, useState } from "react";
import { PROPERTIES, type Property } from "@/config/properties";
import { usd, whatsappLink } from "@/config/event";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { WhatsAppIcon } from "./Icons";

/**
 * Scroll timeline across the 400svh track (300svh of travel):
 *   0.00–0.20  Shahrukhz holds
 *   0.20–0.42  Greenz slides up over it
 *   0.42–0.60  Greenz holds
 *   0.60–0.82  Bayz 101 slides up
 *   0.82–1.00  Bayz 101 holds, then the page continues
 */
const ENTER: [number, number][] = [
  [0, 0],
  [0.2, 0.42],
  [0.6, 0.82],
];
const LAST = PROPERTIES.length - 1;

function PanelContent({ p }: { p: Property }) {
  return (
    <div className="panel__content">
      <div className="container">
        <div className="panel__body">
          <p className="panel__location">{p.location}</p>
          <h3 className="display panel__name">
            {p.name}
            <span className="panel__by">BY DANUBE</span>
          </h3>
          <p className="panel__tagline serif-line">{p.tagline}</p>
          <p className="panel__summary">{p.summary}</p>
          <dl className="panel__specs">
            <div>
              <dt>Starting from</dt>
              <dd>
                {p.startingPrice}
                <span className="panel__usd">about {usd(p.priceAed)}</span>
              </dd>
            </div>
            <div>
              <dt>Handover</dt>
              <dd>{p.completion}</dd>
            </div>
            <div>
              <dt>Payment plan</dt>
              <dd>{p.paymentPlan}</dd>
            </div>
            <div>
              <dt>Homes</dt>
              <dd>{p.homes}</dd>
            </div>
          </dl>
          <div className="panel__actions">
            <a
              className="btn btn--whatsapp"
              href={whatsappLink(p.enquiryMessage)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Make enquiry about ${p.name} on WhatsApp`}
            >
              <WhatsAppIcon />
              Make enquiry
            </a>
            <a className="btn" href="#register">
              Reserve a seat
            </a>
            <a className="text-link panel__more" href={p.url} target="_blank" rel="noopener noreferrer">
              Project details
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({ p, index, progress }: { p: Property; index: number; progress: MotionValue<number> }) {
  const [start, end] = ENTER[index];
  const next = ENTER[index + 1];

  // Slide in from below (first panel is already in place).
  const y = useTransform(progress, index === 0 ? [0, 1] : [start, end], index === 0 ? ["0%", "0%"] : ["100%", "0%"]);
  // Recede when the next panel arrives.
  const scale = useTransform(progress, next ? next : [1, 1], next ? [1, 0.9] : [1, 1]);
  const dim = useTransform(progress, next ? next : [1, 1], next ? [0, 0.65] : [0, 0]);
  // Slow push-in on the photograph while the panel is on screen.
  const mediaScale = useTransform(progress, [start, next ? next[1] : 1], [1.16, 1.02]);
  const mediaY = useTransform(progress, [start, next ? next[1] : 1], ["-3%", "3%"]);

  return (
    <motion.article
      className="panel"
      style={{ y, scale, zIndex: index + 1 }}
      aria-labelledby={`project-${p.id}`}
    >
      <motion.div className="panel__media" style={{ scale: mediaScale, y: mediaY }}>
        <Image
          src={p.image}
          alt={`${p.name} by Danube, ${p.location}`}
          fill
          sizes="100vw"
          priority={index === 0}
          quality={80}
        />
      </motion.div>
      <div className="panel__shade" />
      <span id={`project-${p.id}`} className="sr-only">
        {p.name}
      </span>
      <PanelContent p={p} />
      <motion.div className="panel__dim" style={{ opacity: dim }} aria-hidden="true" />
    </motion.article>
  );
}

function StaticPanel({ p, index }: { p: Property; index: number }) {
  return (
    <article className="panel" aria-labelledby={`project-${p.id}`}>
      <div className="panel__media">
        <Image src={p.image} alt={`${p.name} by Danube, ${p.location}`} fill sizes="100vw" priority={index === 0} />
      </div>
      <div className="panel__shade" />
      <span id={`project-${p.id}`} className="sr-only">
        {p.name}
      </span>
      <PanelContent p={p} />
    </article>
  );
}

export default function Projects() {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = v < 0.31 ? 0 : v < 0.71 ? 1 : 2;
    setActive((prev) => (prev === i ? prev : Math.min(i, LAST)));
  });

  return (
    <section className="projects" id="projects" aria-labelledby="projects-heading">
      <div className="container projects__intro">
        <div>
          <p className="eyebrow">The three projects on show</p>
          <h2 id="projects-heading" className="heading">
            Your Dubai home,
            <br />
            from 1% a month
          </h2>
        </div>
        <div className="projects__frame">
          <p>
            On a AED 1.2 million home, each 1% instalment is AED 12,000, about {usd(12_000)}. Deposit and schedule
            vary by project; your advisor confirms the exact plan at the roadshow.
          </p>
          <p className="fineprint">US dollar figures use the fixed peg of AED 3.6725 to the dollar.</p>
        </div>
      </div>

      <div ref={trackRef} className={`stack${reduce ? " stack--static" : ""}`}>
        <div className="stack__sticky">
          {reduce
            ? PROPERTIES.map((p, i) => <StaticPanel key={p.id} p={p} index={i} />)
            : PROPERTIES.map((p, i) => <Panel key={p.id} p={p} index={i} progress={scrollYProgress} />)}

          {!reduce && (
            <ol className="rail" aria-label="Projects">
              {PROPERTIES.map((p, i) => (
                <li key={p.id} className="rail__item" data-active={active === i}>
                  {p.name}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
