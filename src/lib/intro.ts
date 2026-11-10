"use client";

import { useEffect, useState } from "react";

/** Fired when the opening curtain has lifted (or was skipped). */
export const INTRO_DONE = "danube:intro-done";
/** Total length of the opening curtain on a first visit. */
export const INTRO_MS = 1900;

/** True once the intro is out of the way. Falls back to true after 3.2s no matter what. */
export function useIntroDone() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if ((window as unknown as { __introDone?: boolean }).__introDone) {
      setDone(true);
      return;
    }
    const on = () => setDone(true);
    window.addEventListener(INTRO_DONE, on);
    const t = window.setTimeout(on, 3200);
    return () => {
      window.removeEventListener(INTRO_DONE, on);
      window.clearTimeout(t);
    };
  }, []);
  return done;
}
