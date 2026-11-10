"use client";

import { useEffect, useState } from "react";
import Countdown from "./Countdown";

export default function Nav() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav${solid ? " nav--solid" : ""}`}>
      <div className="container nav__inner">
        <a href="#top" className="nav__logo" aria-label="Danube Dubai Roadshow Lagos, back to top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/logo.png" alt="Danube Properties" width={373} height={20} />
        </a>
        <nav className="nav__links" aria-label="Page sections">
          <a className="nav__link" href="#projects">Projects</a>
          <a className="nav__link" href="#event">Programme</a>
          <a className="nav__link" href="#faq">FAQ</a>
          <Countdown />
          <a className="btn btn--solid" href="#register">Reserve my seat</a>
        </nav>
      </div>
    </header>
  );
}
