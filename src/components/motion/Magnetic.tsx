"use client";

import { useEffect } from "react";

/** Elements marked data-magnetic lean toward the pointer and spring back. Desktop only. */
export default function Magnetic() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
    const cleanups = els.map((el) => {
      const strength = 0.32;
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      };
      const reset = () => {
        el.style.transform = "";
      };
      el.style.transition = "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), color 0.45s, border-color 0.45s, background-color 0.45s";
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", reset);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", reset);
        reset();
      };
    });
    return () => cleanups.forEach((c) => c());
  }, []);
  return null;
}
