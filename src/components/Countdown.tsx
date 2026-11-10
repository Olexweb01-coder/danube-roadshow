"use client";

import { useEffect, useState } from "react";
import { EVENT } from "@/config/event";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60) };
}

/** Live countdown to doors opening. Renders nothing until mounted so the server and client agree. */
export default function Countdown({ compact = false }: { compact?: boolean }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  if (now === null) return <span className="countdown" aria-hidden="true" />;

  const start = Date.parse(EVENT.startsAt);
  const end = Date.parse(EVENT.endsAt);
  let text: string;
  if (now >= end) text = "Thank you for coming";
  else if (now >= start) text = `Happening now in ${EVENT.city}`;
  else {
    const { d, h, m } = parts(start - now);
    text = compact
      ? `${d}d ${String(h).padStart(2, "0")}h to go`
      : `${EVENT.city} in ${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
  }

  return (
    <span className="countdown" role="timer" aria-live="off">
      <span className="countdown__dot" aria-hidden="true" />
      {text}
    </span>
  );
}
