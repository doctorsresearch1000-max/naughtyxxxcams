"use client";

import { SlushyBrandLogo } from "@/components/brand/SlushyBrandLogo";
import { DesktopHeaderNav } from "@/components/layout/DesktopHeaderNav";
import { GlobalMenu } from "@/components/layout/GlobalMenu";
import { HeaderMobileSearch } from "@/components/layout/HeaderMobileSearch";

export function Header() {
  return (
    <header
      className="pointer-events-none sticky top-0 z-50 flex h-14 w-full items-center gap-2 border-b border-zinc-800/60 bg-zinc-950/90 px-2 backdrop-blur-md md:px-4 lg:gap-3"
    >
      <div className="pointer-events-auto shrink-0">
        <GlobalMenu />
      </div>

      <div className="pointer-events-auto min-w-0 shrink-0">
        <SlushyBrandLogo variant="header" href="/" />
      </div>

      <DesktopHeaderNav />

      <HeaderMobileSearch />
    </header>
  );
}
