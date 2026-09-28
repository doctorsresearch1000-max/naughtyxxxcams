"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { JerkmateFreePassPill } from "@/components/conversion/JerkmateFreePassPill";
import { IconSearchOutline } from "@/components/icons/LineIcons";
import { dispatchExploreSearch } from "@/lib/explore/exploreSearchSync";

const DESKTOP_LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/following", label: "Following" },
  { href: "/profile", label: "Profile" },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopHeaderNav() {
  const pathname = usePathname();
  const router = useRouter();
  const onExplore = pathname === "/explore" || pathname.startsWith("/explore/");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!onExplore) return;
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") ?? "");
  }, [onExplore, pathname]);

  const submitSearch = useCallback(
    (value: string) => {
      const q = value.trim();
      if (onExplore) {
        dispatchExploreSearch(q);
        const params = new URLSearchParams(window.location.search);
        if (q) params.set("q", q);
        else params.delete("q");
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        return;
      }
      router.push(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
    },
    [onExplore, pathname, router],
  );

  return (
    <div className="pointer-events-auto hidden min-w-0 flex-1 items-center gap-3 lg:flex">
      <nav
        className="flex shrink-0 items-center gap-0.5"
        aria-label="Desktop primary"
      >
        {DESKTOP_LINKS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-2.5 py-2 text-xs font-bold transition hover:bg-white/5 ${
                active ? "text-[#39FF14]" : "text-zinc-300"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <JerkmateFreePassPill className="shrink-0" />

      <div className="relative min-w-0 flex-1 max-w-sm">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
          <IconSearchOutline size={18} className="text-zinc-500" />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            const v = e.target.value;
            setQuery(v);
            if (onExplore) {
              dispatchExploreSearch(v);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitSearch(query);
          }}
          placeholder="Search models, tags..."
          className="h-10 w-full rounded-full border border-white/10 bg-zinc-900/90 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-[#39FF14]/40 focus:ring-1 focus:ring-[#39FF14]/25"
          autoComplete="off"
        />
      </div>
    </div>
  );
}
