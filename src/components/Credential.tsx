import { BROKER } from "@/config/event";
import { withBase } from "@/lib/basePath";

/** Social proof block A: who is presenting, and their standing with Danube. */
export default function Credential() {
  return (
    <p className="credential">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={withBase("/media/logo.png")} alt="" width={373} height={20} aria-hidden="true" />
      <span>
        {BROKER.name ? (
          <>
            Presented by <strong>{BROKER.name}</strong>, a registered Danube Properties broker
          </>
        ) : (
          <>
            Presented by a <strong>registered Danube Properties broker</strong>
          </>
        )}
        {BROKER.registration ? <>, registration no. {BROKER.registration}</> : null}
      </span>
    </p>
  );
}
