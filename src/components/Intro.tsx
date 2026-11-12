"use client";

import { useEffect, useState } from "react";
import { EVENT } from "@/config/event";
import { INTRO_DONE } from "@/lib/intro";
import { withBase } from "@/lib/basePath";

const KEY = "danube-intro-seen";
/** How long the logo holds before the curtain lifts, counted from page start. */
const HOLD_MS = 1450;
const LIFT_MS = 750;

/**
 * Decided once per page load. React may run effects twice in development;
 * reading and writing the flag again on the second run would wrongly treat
 * this visit as a repeat.
 */
let decided: { skip: boolean } | null = null;
function decideOnce() {
  if (decided) return decided;
  let seen = false;
  try {
    seen = sessionStorage.getItem(KEY) === "1";
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* private mode or sandboxed preview */
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  decided = { skip: seen || reduce };
  return decided;
}

/**
 * Opening curtain. With scripts available it stays up until the app is ready
 * (however long that takes), then lifts as the hero animates in. Without
 * scripts, CSS lifts it on a timer. Shown once per browser session.
 */
export default function Intro() {
  const [lift, setLift] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const finish = () => {
      (window as unknown as { __introDone?: boolean }).__introDone = true;
      window.dispatchEvent(new Event(INTRO_DONE));
    };
    // Repeat visit or reduced motion: lift right away.
    const wait = decideOnce().skip ? 0 : Math.max(0, HOLD_MS - performance.now());
    const t1 = window.setTimeout(() => {
      setLift(true);
      finish();
    }, wait);
    const t2 = window.setTimeout(() => setGone(true), wait + LIFT_MS + 100);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (gone) return null;

  return (
    <div className={`intro${lift ? " intro--lift" : ""}`} aria-hidden="true">
      <div className="intro__inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="intro__logo" src={withBase("/media/logo.png")} alt="" width={373} height={20} />
        <span className="intro__rule" />
        <span className="intro__line">
          {EVENT.city}, {EVENT.shortDate}
        </span>
      </div>
    </div>
  );
}
