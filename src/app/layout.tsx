import type { Metadata, Viewport } from "next";
import { AppChrome } from "@/components/layout/AppChrome";
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
        <div className="relative mx-auto min-h-dvh max-w-md bg-black pb-16 [touch-action:pan-y]">
          {children}
        </div>
        <AppChrome />
      </body>
    </html>
  );
}
