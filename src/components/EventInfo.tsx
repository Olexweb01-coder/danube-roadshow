"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { EVENT } from "@/config/event";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

const PROGRAMME = [
  {
    day: "Saturday 12 December",
    short: "Saturday",
    hours: EVENT.days[0].hours,
    note: "Masterclass and investment day",
    items: [
      ["10:00", "Morning masterclass: building global wealth and investing in Dubai property"],
      ["1:00", "Lunch and networking"],
      ["2:00", "Guest registration and welcome"],
      ["2:30", "Why Nigerian investors are looking at Dubai"],
      ["3:45", "Danube Properties presentation"],
      ["4:30", "The projects: Bayz 101, Shahrukhz Residences and Greenz"],
      ["5:15", "Payment plans, ownership process and Q&A with Danube"],
      ["6:30", "Private investor consultations"],
      ["7:30", "Networking and follow-up appointments"],
    ],
  },
  {
    day: "Sunday 13 December",
    short: "Sunday",
    hours: EVENT.days[1].hours,
    note: "Grand investment experience",
    items: [
      ["2:00", "Guest registration and welcome networking"],
      ["2:45", "Why global property matters for wealth"],
      ["3:15", "Danube Properties presentation"],
      ["4:00", "The projects and investment opportunities"],
      ["4:45", "Payment plans, ownership process and investor Q&A"],
      ["5:45", "Private investor consultations"],
      ["6:15", "Live music"],
      ["7:15", "Final consultations"],
      ["8:45", "Closing remarks and group photographs"],
    ],
  },
] as const;

export default function EventInfo() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const [tab, setTab] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const day = PROGRAMME[tab];

  return (
    <section className="event" id="event" aria-labelledby="event-heading">
      <div className="container event__grid">
        <div ref={ref} className="event__image">
          <motion.div className="event__image-inner" style={reduce ? undefined : { y }}>
            <Image
              src="/media/greenz-3.webp"
              alt="Fully furnished living room in a Greenz by Danube villa"
              fill
              sizes="(max-width: 860px) 100vw, 50vw"
            />
          </motion.div>
        </div>
        <div>
          <p className="eyebrow">The weekend</p>
          <h2 id="event-heading" className="heading">
            Two days, planned
            <br />
            around your decision
          </h2>
          <div className="tabs" role="tablist" aria-label="Programme by day">
            {PROGRAMME.map((d, i) => (
              <button
                key={d.day}
                role="tab"
                id={`tab-${i}`}
                aria-selected={tab === i}
                aria-controls="programme-panel"
                className="tabs__tab"
                onClick={() => setTab(i)}
              >
                {d.short}
              </button>
            ))}
          </div>
          <div id="programme-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
            <p className="programme__meta">
              {day.day}, {day.hours}. {day.note}.
            </p>
            <ol className="programme" role="list">
              {day.items.map(([time, what]) => (
                <li key={time + what} className="programme__item">
                  <span className="programme__time">{time}</span>
                  <span>{what}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
