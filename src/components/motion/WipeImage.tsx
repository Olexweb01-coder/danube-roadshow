"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { withBase } from "@/lib/basePath";

const EASE = [0.77, 0, 0.18, 1] as const;

/** Image opens like a shutter from the bottom, while the photo eases back from a zoom. */
export default function WipeImage({
  src,
  alt,
  sizes,
  className,
  delay = 0,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={`wipe ${className ?? ""}`}
      initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.3, ease: EASE, delay }}
    >
      <motion.div
        className="wipe__img"
        initial={{ scale: 1.35 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 1.9, ease: [0.16, 1, 0.3, 1], delay }}
      >
        <Image src={withBase(src)} alt={alt} fill sizes={sizes} />
      </motion.div>
    </motion.div>
  );
}
