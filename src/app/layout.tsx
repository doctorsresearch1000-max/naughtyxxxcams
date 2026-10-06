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
import { CatalogScrollRestore } from "@/components/navigation/CatalogScrollRestore";
import "./globals.css";

/** GA4 — override via `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Cloudflare / `.env.local`. */
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-CH205SN6QR";

export const metadata: Metadata = {
  title: {
    template: "%s | NaughtyXxxCams",
    default: "NaughtyXxxCams — Live Adult Cam Shows",
  },
  description:
    "Watch verified Streamate models in HD on NaughtyXxxCams — live cam discovery, categories, and official performer profiles.",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "235x235" }],
    apple: [{ url: "/icon.png", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
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
        <CatalogScrollRestore />
        <div className="relative mx-auto flex min-h-dvh w-full max-w-full flex-col bg-black pb-16 [touch-action:pan-y] lg:pb-0">
          <ExploreBootstrapWarm />
          <HomeFeedWarm />
          <Header />
          <div className="flex min-h-0 flex-1 flex-col overflow-x-clip overflow-x-hidden">
            <ConditionalSiteChrome>
              <HomeFeedServerBridge />
              <SecondaryPageLayer>{children}</SecondaryPageLayer>
            </ConditionalSiteChrome>
          </div>
        </div>
        <AppChrome />
        </AppProviders>
      </body>
    </html>
  );
}
