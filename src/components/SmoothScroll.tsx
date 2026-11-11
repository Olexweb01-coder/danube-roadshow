"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** Sent by the registration pop-up when it opens and closes. */
export const SCROLL_LOCK = "danube:scroll-lock";
export const SCROLL_UNLOCK = "danube:scroll-unlock";

/**
 * Lenis smooth scrolling. Skipped for people who prefer reduced motion, and
 * on touch devices where native momentum scrolling already feels right.
 * In-page links glide via `anchors`. Pauses while the registration pop-up
 * is open, so the wheel can't scroll the page behind it.
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

    const pause = () => lenis.stop();
    const resume = () => lenis.start();
    window.addEventListener(SCROLL_LOCK, pause);
    window.addEventListener(SCROLL_UNLOCK, resume);

    return () => {
      window.removeEventListener(SCROLL_LOCK, pause);
      window.removeEventListener(SCROLL_UNLOCK, resume);
      lenis.destroy();
    };
  }, []);

  return null;
}
