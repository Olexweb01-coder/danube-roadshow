import { BROKER, brokerLabel } from "@/config/event";
import { withBase } from "@/lib/basePath";

export default function Footer() {
  const year = new Date().getFullYear();
  const contact = [BROKER.address, BROKER.email].filter(Boolean);
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBase("/media/logo.png")} alt="Danube Properties" width={373} height={20} loading="lazy" />
            <p>
              Presented by {brokerLabel()}
              {BROKER.name ? ", a registered Danube Properties broker" : ""}
              {BROKER.registration ? `, registration no. ${BROKER.registration}` : ""}.
              {contact.length > 0 && (
                <>
                  <br />
                  {BROKER.address}
                  {BROKER.address && BROKER.email ? ". " : ""}
                  {BROKER.email && <a href={`mailto:${BROKER.email}`}>{BROKER.email}</a>}
                </>
              )}
            </p>
          </div>
          <nav className="footer__links" aria-label="Danube Properties">
            <a href="https://danubeproperties.com" target="_blank" rel="noopener noreferrer">danubeproperties.com</a>
            <a href="https://danubeproperties.com/1-payment-plan/" target="_blank" rel="noopener noreferrer">1% payment plan</a>
            <a href="https://danubeproperties.com/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy policy</a>
            <a href="https://danubeproperties.com/terms-conditions/" target="_blank" rel="noopener noreferrer">Terms and conditions</a>
          </nav>
        </div>
        <div className="footer__bottom">
          <span>© {year} Danube Properties. All rights reserved.</span>
          <span>
            Prices, handover dates and payment plans are indicative and subject to change. US dollar figures are
            approximate. Golden Visa eligibility is subject to UAE requirements.
          </span>
        </div>
      </div>
    </footer>
  );
}
