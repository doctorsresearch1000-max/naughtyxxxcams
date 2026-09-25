import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { AppChrome } from "@/components/layout/AppChrome";
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
      <body className="min-h-dvh bg-black">
        <AppProviders>
        <div className="relative mx-auto flex min-h-dvh max-w-md flex-col bg-black pb-16 [touch-action:pan-y]">
          <ExploreBootstrapWarm />
          <Header />
          <ConditionalSiteChrome>
            <PersistedHomeFeed />
            <SecondaryPageLayer>{children}</SecondaryPageLayer>
          </ConditionalSiteChrome>
        </div>
        <AppChrome />
        </AppProviders>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CH205SN6QR"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CH205SN6QR');
          `}
        </Script>
      </body>
    </html>
  );
}
