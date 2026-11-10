"use client";

import { useEffect, useState } from "react";
import { EVENT } from "@/config/event";
import { INTRO_DONE, INTRO_MS } from "@/lib/intro";

const KEY = "danube-intro-seen";

/**
 * Opening curtain. Pure CSS keyframes drive it, so even if JavaScript is
 * slow it lifts on its own. Shown once per browser session; skipped for
 * reduced motion.
 */
export default function Intro() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const finish = () => {
      (window as unknown as { __introDone?: boolean }).__introDone = true;
      window.dispatchEvent(new Event(INTRO_DONE));
    };
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* private mode */
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduce) {
      setGone(true);
      finish();
      return;
    }
    const t1 = window.setTimeout(finish, INTRO_MS - 450);
    const t2 = window.setTimeout(() => setGone(true), INTRO_MS + 400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (gone) return null;

  return (
    <div className="intro" aria-hidden="true">
      <div className="intro__inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="intro__logo" src="/media/logo.png" alt="" width={373} height={20} />
        <span className="intro__rule" />
        <span className="intro__line">
          {EVENT.city}, {EVENT.shortDate}
        </span>
      </div>
    </div>
  );
}
