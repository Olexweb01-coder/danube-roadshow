"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { useEffect, useRef, useState } from "react";
import { EVENT } from "@/config/event";
import Credential from "./Credential";

const EASE = [0.22, 1, 0.36, 1] as const;

function useInset(progress: MotionValue<number>) {
  return useTransform(progress, (p) => {
    const t = Math.min(1, Math.max(0, p / 0.75));
    const side = 5 * t;
    const top = 9 * t;
    return `inset(${top}% ${side}% ${top * 0.6}% ${side}% round ${Math.round(t * 22)}px)`;
  });
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotionSafe();
  const [src, setSrc] = useState<string | null>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const clipPath = useInset(scrollYProgress);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1.12, 1]);
  const contentY = useTransform(scrollYProgress, [0, 0.7], [0, -90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  // Pick the right cut after mount (portrait crop on phones) so the server
  // render never ships both files.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 700px) and (orientation: portrait)");
    const pick = () => setSrc(mq.matches ? "/media/hero-mobile.mp4" : "/media/hero.mp4");
    pick();
    mq.addEventListener("change", pick);
    return () => mq.removeEventListener("change", pick);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    v.muted = true;
    v.load();
    if (reduce) {
      v.pause();
      return;
    }
    v.play().catch(() => {
      /* Autoplay blocked (low-power mode): the poster stays. */
    });
  }, [src, reduce]);

  const lines = ["Meet Danube in Lagos.", "Own in Dubai."];

  return (
    <section ref={ref} className="hero" id="top" aria-label="Danube Properties Roadshow">
      <div className="hero__sticky">
        <motion.div className="hero__frame" style={reduce ? undefined : { clipPath }}>
          <motion.video
            ref={videoRef}
            className="hero__media"
            style={reduce ? undefined : { scale: mediaScale }}
            poster="/media/hero-poster.jpg"
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            aria-hidden="true"
            src={src ?? undefined}
          />
          <div className="hero__shade" />
        </motion.div>

        <motion.div className="hero__content" style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}>
          <div className="container">
            <motion.p
              className="hero__kicker"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
            >
              Danube Properties in {EVENT.city}, {EVENT.dateLabel}
            </motion.p>

            <h1 className="display hero__title">
              {lines.map((line, i) => (
                <span className="hero__title-line" key={line}>
                  <motion.span
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 1.25, ease: EASE, delay: 0.35 + i * 0.14 }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              className="hero__sub"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 0.8 }}
            >
              Danube’s sales team brings three of its newest Dubai addresses to Lagos for one weekend. See the floor
              plans, get your payment plan in dollars, and reserve before anyone else.
            </motion.p>

            <motion.div
              className="hero__action"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 0.95 }}
            >
              <p className="micro">
                Free entry. About {EVENT.dailyCapacity} seats a day, registered guests first.
              </p>
              <div className="hero__ctas">
                <a className="btn btn--solid" href="#register">
                  Reserve my seat
                </a>
                <a className="btn" href="#projects">
                  See the three projects
                </a>
              </div>
              <p className="micro micro--quiet">Takes under a minute. No payment, no obligation to buy.</p>
            </motion.div>

            <motion.div
              className="hero__row"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.1, ease: EASE, delay: 1.1 }}
            >
              <dl className="hero__facts">
                <div>
                  <dt>Dates</dt>
                  <dd>{EVENT.shortDate}</dd>
                </div>
                <div>
                  <dt>Venue</dt>
                  <dd>{EVENT.venue}</dd>
                </div>
                <div>
                  <dt>Doors</dt>
                  <dd>{EVENT.timeLabel}</dd>
                </div>
              </dl>
              <Credential />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
