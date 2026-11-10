"use client";

import { useEffect } from "react";

/** Signals that the app has hydrated, so the CSS safety net can stand down. */
export default function MotionReady() {
  useEffect(() => {
    // Re-enable motion even if a very slow start tripped the 6s fallback.
    document.documentElement.classList.add("js", "motion-ready");
  }, []);
  return null;
}
