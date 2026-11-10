"use client";

import { animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/** Counts the number in `value` up from zero when seen. Keeps any suffix ("%", "+"). */
export default function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const m = value.match(/^(\d+)(.*)$/);
  const target = m ? parseInt(m[1], 10) : NaN;
  const suffix = m ? m[2] : "";
  // Years don't count; only small figures do.
  const counts = !Number.isNaN(target) && target < 1000;
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (!counts || !inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const controls = animate(0, target, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setShown(`${Math.round(v)}${suffix}`),
    });
    return () => controls.stop();
  }, [counts, inView, target, suffix]);

  return (
    <span ref={ref} className="facts__value">
      {shown}
    </span>
  );
}
