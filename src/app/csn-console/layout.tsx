import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSN OS — Consola operativa",
  robots: { index: false, follow: false },
};

export default function CsnConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {children}
    </div>
  );
}
