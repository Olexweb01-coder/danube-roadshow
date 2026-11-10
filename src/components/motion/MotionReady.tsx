"use client";

import { useEffect } from "react";

/** Signals that the app has hydrated, so the CSS safety net can stand down. */
export default function MotionReady() {
  useEffect(() => {
    // If a very slow start already tripped the 6s fallback, the page stays
    // in its plain layout for this visit rather than switching mid-view.
    document.documentElement.classList.add("motion-ready");
  }, []);
  return null;
}
