"use client";

import { SlushyBrandLogo } from "@/components/brand/SlushyBrandLogo";
import { DesktopHeaderNav } from "@/components/layout/DesktopHeaderNav";
import { GlobalMenu } from "@/components/layout/GlobalMenu";
import { HeaderMobileSearch } from "@/components/layout/HeaderMobileSearch";

export function Header() {
  return (
    <header
      className="pointer-events-none sticky top-0 z-50 w-full border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-md"
    >
      {/* Mobile: hamburger | logo center | search right */}
      <div className="pointer-events-auto flex h-14 items-center px-3 lg:hidden">
        <div className="w-11 shrink-0">
          <GlobalMenu />
        </div>
        <div className="flex min-w-0 flex-1 justify-center px-2">
          <SlushyBrandLogo variant="header" href="/" />
        </div>
        <div className="flex w-11 shrink-0 justify-end">
          <HeaderMobileSearch />
        </div>
      </div>

      {/* Desktop */}
      <div className="pointer-events-auto hidden h-14 items-center gap-2 px-4 lg:flex lg:gap-3">
        <GlobalMenu />
        <SlushyBrandLogo variant="header" href="/" />
        <DesktopHeaderNav />
      </div>
    </header>
  );
}
