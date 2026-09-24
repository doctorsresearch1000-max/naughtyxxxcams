import type { Metadata, Viewport } from "next";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "NaughtyXxxCams — Live Feed",
  description: "Immersive TikTok-style live cam experience (UI mock).",
};

export const viewport: Viewport = {
  themeColor: "#0B0F19",
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
    <html lang="en">
      <body className="min-h-dvh bg-night">
        <div className="mx-auto min-h-dvh max-w-lg bg-night shadow-2xl shadow-black/40">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
