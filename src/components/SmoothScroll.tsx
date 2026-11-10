"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Lenis smooth scrolling. Skipped for people who prefer reduced motion, and
 * on touch devices where native momentum scrolling already feels right.
 * In-page links (#register etc.) glide via `anchors`.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      autoRaf: true,
      // The CSS scroll-padding-top already clears the menu bar, so no extra offset here.
      anchors: { duration: 1.4 },
    });

    return () => lenis.destroy();
  }, []);

  return null;
}
