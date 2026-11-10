"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * Giant outlined type that drifts sideways and speeds up with your scroll,
 * reversing when you scroll back up.
 */
export default function Marquee({ text, baseVelocity = -2.2 }: { text: string; baseVelocity?: number }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 300 });
  const factor = useTransform(smooth, [0, 1000], [0, 5], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`);
  const dir = useRef(1);
  const still = useRef(false);
  useEffect(() => {
    still.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useAnimationFrame((_, delta) => {
    if (still.current) return;
    let move = dir.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * f;
    baseX.set(baseX.get() + move);
  });

  return (
    <div className="marquee" aria-hidden="true">
      <motion.div className="marquee__track" style={{ x }}>
        {Array.from({ length: 4 }).flatMap((_, i) =>
          text.split("|").map((t, j) => (
            <span key={`${i}-${j}`} className="marquee__item">
              {t.trim()}
              <span className="marquee__dot" />
            </span>
          )),
        )}
      </motion.div>
    </div>
  );
}
