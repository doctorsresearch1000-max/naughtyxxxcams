"use client";

import { SlushyBrandLogo } from "@/components/brand/SlushyBrandLogo";
import { GlobalMenu } from "@/components/layout/GlobalMenu";

export function Header() {
  return (
    <header
      className="pointer-events-none absolute left-0 right-0 top-0 z-[60] flex min-h-[var(--app-header-height)] items-center justify-between gap-3 border-b border-white/10 bg-[#0A0A0A]/75 px-4 py-2.5 backdrop-blur-md"
    >
      <div className="pointer-events-auto min-w-0 shrink">
        <SlushyBrandLogo variant="header" href="/" />
      </div>
      <div className="pointer-events-auto flex shrink-0 items-center gap-2">
        <GlobalMenu />
      </div>
    </header>
  );
}
