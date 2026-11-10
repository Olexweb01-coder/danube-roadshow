"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Fragment, useEffect, useRef, useState } from "react";
import { EVENT } from "@/config/event";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { useIntroDone } from "@/lib/intro";
import Credential from "./Credential";

const EASE = [0.22, 1, 0.36, 1] as const;
const LINES = ["Meet Danube in Lagos.", "Own in Dubai."];

function useInset(progress: MotionValue<number>) {
  return useTransform(progress, (p) => {
    // Keeps closing all the way to the hand-off, so the frame never sits still.
    const t = Math.min(1, Math.max(0, p));
    const e = 1 - Math.pow(1 - t, 3);
    const side = 6 * e;
    const top = 10 * e;
    return `inset(${top}% ${side}% ${top * 0.55}% ${side}% round ${Math.round(e * 28)}px)`;
  });
}

/** Headline split into characters that resolve out of blur, one after another. */
function SplitHeadline({ show, xs }: { show: boolean; xs?: MotionValue<string>[] }) {
  let i = 0;
  return (
    <h1 className="display hero__title" aria-label={LINES.join(" ")}>
      {LINES.map((line, li) => (
        <motion.span className="hero__title-line" key={line} aria-hidden="true" style={xs ? { x: xs[li] } : undefined}>
          {line.split(" ").map((word, wi, words) => (
            <Fragment key={wi}>
            <span className="hero__word">
              {word.split("").map((ch) => {
                const idx = i++;
                return (
                  <motion.span
                    key={idx}
                    className="hero__char"
                    initial={{ y: "70%", opacity: 0, filter: "blur(14px)" }}
                    animate={show ? { y: "0%", opacity: 1, filter: "blur(0px)" } : undefined}
                    transition={{ duration: 1.1, ease: EASE, delay: 0.15 + li * 0.18 + idx * 0.028 }}
                  >
                    {ch}
                  </motion.span>
                );
              })}
            </span>
            {wi < words.length - 1 ? " " : null}
            </Fragment>
          ))}
        </motion.span>
      ))}
    </h1>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotionSafe();
  const introDone = useIntroDone();
  const show = introDone || reduce;
  const [src, setSrc] = useState<string | null>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const clipPath = useInset(scrollYProgress);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const line1X = useTransform(scrollYProgress, [0, 0.7], ["0%", "-8%"]);
  const line2X = useTransform(scrollYProgress, [0, 0.7], ["0%", "6%"]);
  const contentY = useTransform(scrollYProgress, [0, 0.7], [0, -120]);
  const contentOpacity = useTransform(scrollYProgress, [0.05, 0.6], [1, 0]);
  const shade = useTransform(scrollYProgress, [0, 0.8], [0, 0.55]);

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

  return (
    <section ref={ref} className="hero" id="top" aria-label="Danube Dubai Roadshow, Lagos">
      <div className="hero__sticky">
        <motion.div className="hero__frame" style={reduce ? undefined : { clipPath }}>
          {/* Slow settle on load, then a push-in tied to scroll. */}
          <motion.div
            className="hero__settle"
            initial={{ scale: 1.22 }}
            animate={show ? { scale: 1 } : undefined}
            transition={{ duration: 3.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.video
              ref={videoRef}
              className="hero__media"
              style={reduce ? undefined : { scale: mediaScale }}
              poster="/media/hero-poster.jpg"
              muted
              loop
              playsInline
              autoPlay
              preload="auto"
              aria-hidden="true"
              src={src ?? undefined}
            />
          </motion.div>
          <div className="hero__shade" />
          <motion.div className="hero__night" style={reduce ? undefined : { opacity: shade }} />
        </motion.div>

        {/* Letterbox bars retract as the film "starts". */}
        <motion.div
          className="letterbox letterbox--top"
          initial={{ scaleY: 1 }}
          animate={show ? { scaleY: 0 } : undefined}
          transition={{ duration: 1.4, ease: EASE, delay: 0.1 }}
          aria-hidden="true"
        />
        <motion.div
          className="letterbox letterbox--bottom"
          initial={{ scaleY: 1 }}
          animate={show ? { scaleY: 0 } : undefined}
          transition={{ duration: 1.4, ease: EASE, delay: 0.1 }}
          aria-hidden="true"
        />

        <motion.div className="hero__content" style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}>
          <div className="container">
            <motion.p
              className="hero__kicker"
              initial={{ opacity: 0, x: -16 }}
              animate={show ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 1, ease: EASE, delay: 0.1 }}
            >
              <span className="hero__kicker-rule" />
              Danube Properties in {EVENT.city}, {EVENT.dateLabel}
            </motion.p>

            <SplitHeadline show={show} xs={reduce ? undefined : [line1X, line2X]} />

            <motion.p
              className="hero__sub"
              initial={{ opacity: 0, y: 18 }}
              animate={show ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 1.1, ease: EASE, delay: 1.05 }}
            >
              Danube’s sales team brings three of its newest Dubai addresses to Lagos for one weekend. See the floor
              plans, get your payment plan in dollars, and reserve before anyone else.
            </motion.p>

            <motion.div
              className="hero__action"
              initial={{ opacity: 0, y: 18 }}
              animate={show ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 1.1, ease: EASE, delay: 1.2 }}
            >
              <p className="micro">Free entry. About {EVENT.dailyCapacity} seats a day, registered guests first.</p>
              <div className="hero__ctas">
                <a className="btn btn--solid" href="#register" data-magnetic>
                  Reserve my seat
                </a>
                <a className="btn" href="#projects" data-magnetic>
                  See the three projects
                </a>
              </div>
              <p className="micro micro--quiet">Takes under a minute. No payment, no obligation to buy.</p>
            </motion.div>

            <motion.div
              className="hero__row"
              initial={{ opacity: 0 }}
              animate={show ? { opacity: 1 } : undefined}
              transition={{ duration: 1.2, ease: EASE, delay: 1.4 }}
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

        <motion.div className="scroll-cue-wrap" style={reduce ? undefined : { opacity: contentOpacity }}>
          <motion.a
            href="#reframe"
            className="scroll-cue"
            aria-label="Scroll to continue"
            initial={{ opacity: 0 }}
            animate={show ? { opacity: 1 } : undefined}
            transition={{ duration: 1, delay: 1.8 }}
          >
            <span className="scroll-cue__line" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
