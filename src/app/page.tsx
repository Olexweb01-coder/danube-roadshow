import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Statement from "@/components/Statement";
import Delivered from "@/components/Delivered";
import Projects from "@/components/Projects";
import SocialProof from "@/components/SocialProof";
import EventInfo from "@/components/EventInfo";
import SeatValue from "@/components/SeatValue";
import Faq from "@/components/Faq";
import Register from "@/components/Register";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

/**
 * Build order follows the conversion blueprint:
 * hero → track record + belief reframe + benefits → delivery proof →
 * projects with pricing → reviews and stories → programme → seat value →
 * FAQ → registration → final CTA.
 */
export default function Page() {
  return (
    <>
      <a className="skip-link" href="#register">
        Skip to registration
      </a>
      <SmoothScroll />
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
        <Statement />
        <Delivered />
        <Projects />
        <SocialProof />
        <EventInfo />
        <SeatValue />
        <Faq />
        <Register />
        <FinalCta />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
