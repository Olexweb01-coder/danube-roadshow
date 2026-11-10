import { BROKER } from "@/config/event";

/** Social proof block A: who is presenting, and their standing with Danube. */
export default function Credential() {
  return (
    <p className="credential">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/media/logo.png" alt="" width={373} height={20} aria-hidden="true" />
      <span>
        Presented by <strong>{BROKER.name}</strong>, a registered Danube Properties broker
        {BROKER.registration ? <>, registration no. {BROKER.registration}</> : null}
      </span>
    </p>
  );
}
