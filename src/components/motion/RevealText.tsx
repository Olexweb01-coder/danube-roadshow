"use client";

import { motion } from "framer-motion";
import { createElement, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Each line rises out of its own mask when it scrolls into view.
 * Static text in the server render, so nothing is hidden without JavaScript
 * beyond the initial frame.
 */
export default function RevealText({
  as = "h2",
  lines,
  className,
  id,
  delay = 0,
}: {
  as?: "h1" | "h2" | "h3" | "p";
  lines: ReactNode[];
  className?: string;
  id?: string;
  delay?: number;
}) {
  return createElement(
    as,
    { className, id },
    lines.map((line, i) => (
      <span className="mask-line" key={i}>
        <motion.span
          className="mask-line__inner"
          initial={{ y: "105%", rotate: 2 }}
          whileInView={{ y: "0%", rotate: 0 }}
          viewport={{ once: true, margin: "0px 0px -12% 0px" }}
          transition={{ duration: 1.15, ease: EASE, delay: delay + i * 0.1 }}
        >
          {line}
        </motion.span>
      </span>
    )),
  );
}
