"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Desktop-only cursor: a dot that tracks exactly and a ring that trails it.
 * The ring swells over links and shows "View" over [data-cursor="view"].
 * Native cursor stays inside form fields.
 */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<"default" | "link" | "view">("default");
  const [down, setDown] = useState(false);
  const [hidden, setHidden] = useState(true);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setHidden(false);
      const t = e.target as Element | null;
      if (t?.closest?.('[data-cursor="view"]') && !t.closest("a,button")) setMode("view");
      else if (t?.closest?.("a,button,summary,[role=tab],label")) setMode("link");
      else setMode("default");
    };
    const leave = () => setHidden(true);
    const press = () => setDown(true);
    const release = () => setDown(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", release);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
    };
  }, [x, y]);

  if (!enabled) return null;

  const size = mode === "view" ? 96 : mode === "link" ? 56 : 34;
  return (
    <>
      <motion.div
        className="cursor-ring"
        data-mode={mode}
        style={{ x: rx, y: ry }}
        animate={{ width: size, height: size, opacity: hidden ? 0 : 1, scale: down ? 0.85 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        aria-hidden="true"
      >
        <span className="cursor-ring__label">View</span>
      </motion.div>
      <motion.div
        className="cursor-dot"
        style={{ x, y }}
        animate={{ opacity: hidden || mode !== "default" ? 0 : 1 }}
        aria-hidden="true"
      />
    </>
  );
}
