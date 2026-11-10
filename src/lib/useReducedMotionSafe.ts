"use client";

import { useEffect, useState } from "react";

/**
 * Like framer-motion's useReducedMotion, but always `false` during the server
 * render and first client render, so markup never mismatches on hydration.
 */
export function useReducedMotionSafe() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduce;
}
