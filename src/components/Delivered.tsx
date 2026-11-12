"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { DELIVERED, DELIVERY_CAPTION_REAL_PHOTOS, TRACK_RECORD } from "@/config/proof";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { withBase } from "@/lib/basePath";
import RevealText from "./motion/RevealText";

const handedOver = Number(TRACK_RECORD.find((t) => /handed/i.test(t.label))?.value ?? DELIVERED.length);

/**
 * Social proof block C as a pinned horizontal gallery: the section holds
 * still while the buildings travel past, driven by vertical scroll.
 */
export default function Delivered() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const distance = useRef(0);
  const [height, setHeight] = useState<string>("300vh");
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    if (reduce) return;
    // Measure the pinned box itself (it uses svh, which ignores the phone
    // address bar), so the section height never jumps while scrolling.
    let lastWidth = -1;
    const measure = () => {
      const track = trackRef.current;
      const sticky = stickyRef.current;
      if (!track || !sticky) return;
      distance.current = Math.max(0, track.scrollWidth - sticky.clientWidth);
      setHeight(`${Math.round(distance.current + sticky.clientHeight)}px`);
    };
    const onResize = () => {
      // Phones fire resize when the address bar slides; only width matters here.
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      measure();
    };
    onResize();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [reduce]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, (p) => -p * distance.current);

  if (!DELIVERED.length) return null;
  const remaining = Math.max(0, handedOver - DELIVERED.length);

  const cards = (
    <>
      <div className="gallery__intro">
        <p className="eyebrow">Proof of delivery</p>
        <RevealText
          id="delivered-heading"
          className="heading gallery__title"
          lines={
            DELIVERY_CAPTION_REAL_PHOTOS
              ? ["Sixteen projects", "handed over.", "Keys, not renders."]
              : ["Sixteen projects", "handed over."]
          }
        />
        <p className="muted gallery__lead">
          Before you consider an off-plan home, look at what Danube has already finished and handed to owners.
        </p>
      </div>
      {DELIVERED.map((d, i) => (
        <figure key={d.name} className="gallery__card" data-cursor="view">
          <div className="gallery__img">
            <Image src={withBase(d.image)} alt={`${d.name} by Danube, ${d.area}`} fill sizes="(max-width: 760px) 80vw, 46vw" />
          </div>
          <figcaption>
            <span className="gallery__index">{String(i + 1).padStart(2, "0")}</span>
            <span className="gallery__name">{d.name}</span>
            <span className="muted">{d.area}, handed over</span>
          </figcaption>
        </figure>
      ))}
      {remaining > 0 && (
        <a className="gallery__more" href="https://danubeproperties.com/portfolio/" target="_blank" rel="noopener noreferrer">
          <span className="gallery__more-num">+{remaining}</span>
          <span>more handed over. See the full portfolio.</span>
        </a>
      )}
    </>
  );

  if (reduce) {
    return (
      <section className="gallery gallery--static" aria-labelledby="delivered-heading">
        <div className="gallery__track gallery__track--static">{cards}</div>
        {!DELIVERY_CAPTION_REAL_PHOTOS && <p className="fineprint container">Images: Danube Properties.</p>}
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="gallery" style={{ height }} aria-labelledby="delivered-heading">
      <div className="gallery__sticky" ref={stickyRef}>
        <motion.div ref={trackRef} className="gallery__track" style={{ x }}>
          {cards}
        </motion.div>
        <div className="gallery__foot container">
          <div className="gallery__progress" aria-hidden="true">
            <motion.span style={{ scaleX: scrollYProgress }} />
          </div>
          {!DELIVERY_CAPTION_REAL_PHOTOS && <p className="fineprint">Images: Danube Properties.</p>}
        </div>
      </div>
    </section>
  );
}
