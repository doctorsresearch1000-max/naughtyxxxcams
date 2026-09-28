"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconSearchOutline } from "@/components/icons/LineIcons";

export function HeaderMobileSearch() {
  const pathname = usePathname();
  const onExplore = pathname === "/explore" || pathname.startsWith("/explore/");

  return (
    <Link
      href="/explore"
      className={`pointer-events-auto flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-zinc-900/80 transition active:scale-95 lg:hidden ${
        onExplore ? "text-[#39FF14]" : "text-white"
      }`}
      aria-label="Search and explore"
    >
      <IconSearchOutline size={22} strokeWidth={1.65} />
    </Link>
  );
}
