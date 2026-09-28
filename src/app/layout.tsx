import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { AppChrome } from "@/components/layout/AppChrome";
import { AppProviders } from "@/components/layout/AppProviders";
import { ConditionalSiteChrome } from "@/components/layout/ConditionalSiteChrome";
import { Header } from "@/components/layout/Header";
import { ExploreBootstrapWarm } from "@/components/explore/ExploreBootstrapWarm";
import { HomeFeedWarm } from "@/components/feed/HomeFeedWarm";
import { HomeFeedServerBridge } from "@/components/layout/HomeFeedServerBridge";
import { SecondaryPageLayer } from "@/components/layout/SecondaryPageLayer";
import "./globals.css";

/** GA4 — override via `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Cloudflare / `.env.local`. */
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-CH205SN6QR";

export const metadata: Metadata = {
  title: "NaughtyXxxCams — Live Cams",
  description:
    "Discover verified Streamate models in HD. Browse live cams, explore categories, and official performer profiles on NaughtyXXXCams.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          rel="preconnect"
          href="https://hybridclient.naiadsystems.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://www.streamate.com" />
        <link rel="dns-prefetch" href="https://hybridclient.naiadsystems.com" />
        {/* Google tag (gtag.js) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="beforeInteractive"
        />
        <Script id="google-analytics-gtag" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body className="min-h-dvh bg-black">
        <AppProviders>
        <div className="relative mx-auto flex min-h-dvh max-w-md flex-col bg-black pb-16 [touch-action:pan-y] lg:max-w-none lg:pb-0">
          <ExploreBootstrapWarm />
          <HomeFeedWarm />
          <Header />
          <ConditionalSiteChrome>
            <HomeFeedServerBridge />
            <SecondaryPageLayer>{children}</SecondaryPageLayer>
          </ConditionalSiteChrome>
        </div>
        <AppChrome />
        </AppProviders>
      </body>
    </html>
  );
}
