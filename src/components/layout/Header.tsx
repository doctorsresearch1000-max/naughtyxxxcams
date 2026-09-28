"use client";

import { usePathname } from "next/navigation";
import { SlushyBrandLogo } from "@/components/brand/SlushyBrandLogo";
import { DesktopHeaderNav } from "@/components/layout/DesktopHeaderNav";
import { GlobalMenu } from "@/components/layout/GlobalMenu";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header
      className={`pointer-events-none absolute left-0 right-0 top-0 z-[60] flex min-h-[var(--app-header-height)] items-center justify-between gap-3 px-4 py-2.5 lg:px-6 lg:[position:sticky] ${
        isHome
          ? "border-b-0 bg-gradient-to-b from-black/80 via-black/35 to-transparent backdrop-blur-[2px] lg:border-b lg:border-white/10 lg:bg-[#0A0A0A]/90 lg:from-[#0A0A0A] lg:via-[#0A0A0A] lg:to-[#0A0A0A]"
          : "border-b border-white/10 bg-[#0A0A0A]/75 backdrop-blur-md"
      }`}
    >
      <div className="pointer-events-auto flex min-w-0 shrink items-center gap-3">
        <SlushyBrandLogo variant="header" href="/" />
      </div>
      <DesktopHeaderNav />
      <div className="pointer-events-auto flex shrink-0 items-center gap-2 lg:hidden">
        <GlobalMenu />
      </div>
      <div className="pointer-events-auto hidden shrink-0 items-center gap-2 lg:flex">
        <GlobalMenu />
      </div>
    </header>
  );
}
