"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { WhatsAppIcon } from "./Icons";
import { whatsappLink } from "@/config/event";

/**
 * General enquiry shortcut. Hidden over the hero, and while the project
 * panels or the registration form are on screen, since both carry their own
 * WhatsApp actions and the button would cover them on phones.
 */
export default function FloatingWhatsApp() {
  const [pastHero, setPastHero] = useState(false);
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 1.2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const targets = [document.querySelector(".stack"), document.getElementById("register")].filter(
      (el): el is Element => !!el,
    );
    const visible = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
        setCovered(visible.size > 0);
      },
      { rootMargin: "-20% 0px -20% 0px" },
    );
    targets.forEach((t) => io.observe(t));

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  const show = pastHero && !covered;

  const href = whatsappLink("Hello Danube team, I’m interested in the Lagos Roadshow and would like to know more.");

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="wa"
          className="float-cta"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
        >
          {/* Phones: slim bottom bar. Desktop: round WhatsApp button only. */}
          <a className="btn btn--solid float-cta__reserve" href="#register">
            Reserve my seat
          </a>
          <a
            className="float-wa"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with the Danube Roadshow team on WhatsApp"
          >
            <WhatsAppIcon />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
