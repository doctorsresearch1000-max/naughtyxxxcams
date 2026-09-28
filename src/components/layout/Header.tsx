"use client";

import { SlushyBrandLogo } from "@/components/brand/SlushyBrandLogo";
import { DesktopHeaderNav } from "@/components/layout/DesktopHeaderNav";
import { GlobalMenu } from "@/components/layout/GlobalMenu";

export function Header() {
  return (
    <header
      className="pointer-events-none sticky top-0 z-40 flex w-full min-h-[var(--app-header-height)] items-center justify-between gap-3 border-b border-zinc-800/60 bg-zinc-950/85 px-3 py-2 backdrop-blur-md sm:px-4 lg:px-6"
    >
      <div className="pointer-events-auto min-w-0 shrink-0">
        <SlushyBrandLogo variant="header" href="/" />
      </div>

      <DesktopHeaderNav />

      <div className="pointer-events-auto shrink-0">
        <GlobalMenu />
      </div>
    </header>
  );
}
