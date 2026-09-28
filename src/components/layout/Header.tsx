"use client";

import { SlushyBrandLogo } from "@/components/brand/SlushyBrandLogo";
import { JerkmateFreePassPill } from "@/components/conversion/JerkmateFreePassPill";
import { DesktopHeaderNav } from "@/components/layout/DesktopHeaderNav";
import { GlobalMenu } from "@/components/layout/GlobalMenu";

export function Header() {
  return (
    <header
      className="pointer-events-none sticky top-0 z-40 flex w-full min-h-[var(--app-header-height)] items-center gap-2 border-b border-zinc-800/60 bg-zinc-950/85 px-3 py-2 backdrop-blur-md sm:gap-3 sm:px-4 lg:px-6"
    >
      <div className="pointer-events-auto min-w-0 shrink-0">
        <SlushyBrandLogo variant="header" href="/" />
      </div>

      <div className="pointer-events-auto flex min-w-0 flex-1 items-center justify-center lg:hidden">
        <JerkmateFreePassPill />
      </div>

      <DesktopHeaderNav />

      <div className="pointer-events-auto shrink-0">
        <GlobalMenu />
      </div>
    </header>
  );
}
