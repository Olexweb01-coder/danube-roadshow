"use client";

import Image from "next/image";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue, type Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { PROPERTIES, type Property } from "@/config/properties";
import { usd, whatsappLink } from "@/config/event";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { withBase } from "@/lib/basePath";
import { WhatsAppIcon } from "./Icons";
import RevealText from "./motion/RevealText";

/**
 * Scroll timeline across the 320svh track (220svh of travel). Something is
 * always moving: each curtain takes most of the travel, with only short holds.
 *   0.00–0.06  first panel holds
 *   0.06–0.44  second panel opens over it
 *   0.44–0.56  hold
 *   0.56–0.94  third panel opens
 *   0.94–1.00  hold, then the page continues
 */
const ENTER: [number, number][] = [
  [0, 0],
  [0.06, 0.44],
  [0.56, 0.94],
];
/** The panel whose curtain is more than half open is the active one. */
const activeAt = (v: number) => (v < 0.25 ? 0 : v < 0.75 ? 1 : 2);
const LAST = PROPERTIES.length - 1;

const EASE = [0.22, 1, 0.36, 1] as const;
const cascade: Variants = {
  hide: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
};
const rise: Variants = {
  hide: { opacity: 0, y: 36, transition: { duration: 0.4, ease: EASE } },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};
const maskRise: Variants = {
  hide: { y: "105%", transition: { duration: 0.4, ease: EASE } },
  show: { y: "0%", transition: { duration: 1.1, ease: EASE } },
};

function PanelContent({ p, index, state }: { p: Property; index: number; state?: "show" | "hide" }) {
  const animated = state !== undefined;
  const M = animated ? motion.div : "div";
  const props = (v: Variants) => (animated ? { variants: v } : {});
  return (
    <div className="panel__content">
      <div className="container">
        <motion.div
          className="panel__body"
          variants={animated ? cascade : undefined}
          initial={animated ? "hide" : undefined}
          animate={state}
        >
          <M className="panel__location" {...props(rise)}>
            <span className="panel__count">
              {String(index + 1).padStart(2, "0")}
              <span className="muted"> / {String(PROPERTIES.length).padStart(2, "0")}</span>
            </span>
            {p.location}
          </M>
          <h3 className="display panel__name">
            <span className="mask-line">
              <M className="mask-line__inner" {...props(maskRise)}>
                {p.name}
              </M>
            </span>
            <M className="panel__by" {...props(rise)}>
              BY DANUBE
            </M>
          </h3>
          <M {...props(rise)}>
            <p className="panel__tagline serif-line">{p.tagline}</p>
            <p className="panel__summary">{p.summary}</p>
          </M>
          <M {...props(rise)}>
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
          </M>
          <M className="panel__actions" {...props(rise)}>
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
          </M>
        </motion.div>
      </div>
    </div>
  );
}

function Panel({
  p,
  index,
  progress,
  state,
}: {
  p: Property;
  index: number;
  progress: MotionValue<number>;
  state: "show" | "hide";
}) {
  const [start, end] = ENTER[index];
  const next = ENTER[index + 1];

  // Curtain wipe: the new panel opens upward from the bottom edge.
  const clipPath = useTransform(progress, (v) => {
    if (index === 0) return "inset(0% 0% 0% 0%)";
    const t = Math.min(1, Math.max(0, (v - start) / (end - start)));
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    return `inset(${(1 - e) * 100}% 0% 0% 0%)`;
  });
  // Recede when the next panel arrives.
  const scale = useTransform(progress, next ? next : [1, 1], next ? [1, 0.9] : [1, 1]);
  const dim = useTransform(progress, next ? next : [1, 1], next ? [0, 0.7] : [0, 0]);
  // Photograph eases back from a zoom as the curtain opens, then keeps drifting.
  const mediaScale = useTransform(
    progress,
    index === 0 ? [0, next ? next[1] : 1] : [start, end, next ? next[1] : 1],
    index === 0 ? [1.08, 1.0] : [1.4, 1.08, 1.0],
  );
  const mediaY = useTransform(progress, [start, next ? next[1] : 1], ["-2%", "3%"]);

  return (
    <motion.article
      className="panel"
      style={{ clipPath, scale, zIndex: index + 1 }}
      aria-labelledby={`project-${p.id}`}
    >
      <motion.div className="panel__media" style={{ scale: mediaScale, y: mediaY }} data-cursor="view">
        <Image
          src={withBase(p.image)}
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
      <PanelContent p={p} index={index} state={state} />
      <motion.div className="panel__dim" style={{ opacity: dim }} aria-hidden="true" />
    </motion.article>
  );
}

function StaticPanel({ p, index }: { p: Property; index: number }) {
  return (
    <article className="panel" aria-labelledby={`project-${p.id}`}>
      <div className="panel__media">
        <Image src={withBase(p.image)} alt={`${p.name} by Danube, ${p.location}`} fill sizes="100vw" priority={index === 0} />
      </div>
      <div className="panel__shade" />
      <span id={`project-${p.id}`} className="sr-only">
        {p.name}
      </span>
      <PanelContent p={p} index={index} />
    </article>
  );
}

export default function Projects() {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  // "On screen" comes from the same scroll signal as the active panel, so the
  // two can never disagree (a separate observer could lag under load).
  const { scrollYProgress: band } = useScroll({ target: trackRef, offset: ["start 0.65", "end 0.35"] });
  const [inView, setInView] = useState(false);
  useMotionValueEvent(band, "change", (v) => setInView(v > 0 && v < 1));
  useEffect(() => {
    const v = band.get();
    setInView(v > 0 && v < 1);
  }, [band]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = activeAt(v);
    setActive((prev) => (prev === i ? prev : Math.min(i, LAST)));
  });

  return (
    <section className="projects" id="projects" aria-labelledby="projects-heading">
      <div className="container projects__intro">
        <div>
          <p className="eyebrow">The three projects on show</p>
          <RevealText id="projects-heading" className="heading" lines={["Your Dubai home,", "from 1% a month"]} />
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
            : PROPERTIES.map((p, i) => (
                <Panel
                  key={p.id}
                  p={p}
                  index={i}
                  progress={scrollYProgress}
                  state={inView && active === i ? "show" : "hide"}
                />
              ))}

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
