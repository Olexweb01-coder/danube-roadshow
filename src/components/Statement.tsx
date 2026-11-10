"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { TRACK_RECORD } from "@/config/proof";
import { usd } from "@/config/event";
import CountUp from "./motion/CountUp";

const REFRAME = "Don’t wire millions on trust. Meet the developer first.";

const BENEFITS = [
  {
    title: "Talk to the developer, not a middleman",
    body: "Danube’s own sales team answers your questions across the table, with the documents in front of you.",
  },
  {
    title: "See where every payment goes",
    body: "Off-plan purchases are registered with the Dubai Land Department, and you agree the instalment schedule before you pay anything.",
  },
  {
    title: "Pay in stages, from 1% a month",
    body: "Danube’s 1% monthly plan on eligible units, with 0% interest on instalments.",
  },
  {
    title: "Own in a dollar-pegged currency",
    body: "The UAE dirham has been pegged to the US dollar since 1997, so your asset is priced in a currency that holds.",
  },
  {
    title: "A route to UAE residency",
    body: `Property from AED 2 million (about ${usd(2_000_000)}) can make you eligible for the 10-year Golden Visa, subject to UAE requirements.`,
  },
  {
    title: "Fully furnished, ready to live in or let",
    body: "Danube hands over furnished homes, so you can move in, host family, or rent out from day one.",
  },
];

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <motion.span className="statement__word" style={{ opacity }}>
      {children}
    </motion.span>
  );
}

export default function Statement() {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const words = REFRAME.split(" ");

  return (
    <section className="statement" id="reframe" aria-labelledby="reframe-heading">
      <div className="container">
        <p className="eyebrow">Building Dubai since 1993</p>
        <ul className="facts facts--top" role="list">
          {TRACK_RECORD.map((f) => (
            <li key={f.label} className="facts__item">
              <CountUp value={f.value} />
              <span className="facts__label">{f.label}</span>
            </li>
          ))}
        </ul>

        <h2 id="reframe-heading" ref={ref} className="statement__text">
          {reduce
            ? REFRAME
            : words.map((w, i) => (
                <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
                  {w}
                </Word>
              ))}
        </h2>
        <p className="statement__body">
          Most Dubai purchases from Nigeria happen over WhatsApp and screenshots. This weekend you sit across from
          Danube’s team, see the paperwork, and leave knowing exactly where your money goes and when.
        </p>

        <ul className="benefits" role="list">
          {BENEFITS.map((b) => (
            <motion.li
              key={b.title}
              className="benefits__item"
              initial={reduce ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: (BENEFITS.indexOf(b) % 3) * 0.12 }}
            >
              <span className="benefits__line" />
              <h3>{b.title}</h3>
              <p>{b.body}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
