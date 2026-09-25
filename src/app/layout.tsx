import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { AppChrome } from "@/components/layout/AppChrome";

const GA_MEASUREMENT_ID = "G-3RHSY9JWVC";
import { AppProviders } from "@/components/layout/AppProviders";
import { ConditionalSiteChrome } from "@/components/layout/ConditionalSiteChrome";
import { Header } from "@/components/layout/Header";
import { ExploreBootstrapWarm } from "@/components/explore/ExploreBootstrapWarm";
import { PersistedHomeFeed } from "@/components/layout/PersistedHomeFeed";
import { SecondaryPageLayer } from "@/components/layout/SecondaryPageLayer";
import "./globals.css";

export const metadata: Metadata = {
  title: "NaughtyXxxCams — Live Feed",
  description: "Immersive TikTok-style live cam experience (UI mock).",
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
          <Header />
          <ConditionalSiteChrome>
            <PersistedHomeFeed />
            <SecondaryPageLayer>{children}</SecondaryPageLayer>
          </ConditionalSiteChrome>
        </div>
        <AppChrome />
        </AppProviders>
      </body>
    </html>
  );
}
