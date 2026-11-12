import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { EVENT } from "@/config/event";
import { withBase } from "@/lib/basePath";

// Self-hosted (latin subset) so builds never depend on reaching Google Fonts.
const jost = localFont({
  src: "../fonts/jost-variable.woff2",
  weight: "300 500",
  style: "normal",
  variable: "--font-jost",
  display: "swap",
});

const cormorant = localFont({
  src: "../fonts/cormorant-italic.woff2",
  weight: "400",
  style: "italic",
  variable: "--font-cormorant",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://danube-roadshow.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${EVENT.title} | Register to attend`,
  description:
    "Meet Danube Properties in person. See Shahrukhz Residences, Greenz and Bayz 101, get floor plans and the 1% monthly payment plan, and register for your seat.",
  openGraph: {
    title: EVENT.title,
    description: "Three Danube addresses, one event. Register for your seat.",
    images: [{ url: withBase("/media/hero-poster.jpg"), width: 1600, height: 900 }],
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: withBase("/favicon.svg") },
};

export const viewport: Viewport = {
  themeColor: "#061230",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jost.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <head>
        {/*
          'js' turns on the motion layout. If the app hasn't started within 6s
          (blocked or failed scripts), drop back to the plain flowing page so
          there are never long pinned stretches where nothing moves.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(d){d.classList.add('js');setTimeout(function(){if(!d.classList.contains('motion-ready'))d.classList.remove('js')},6000)})(document.documentElement)",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
