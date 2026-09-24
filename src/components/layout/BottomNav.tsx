"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { fetchExploreBootstrap } from "@/lib/explore/exploreClientCache";
import {
  IconFollowingOutline,
  IconHomeFilled,
  IconHomeOutline,
  IconProfileOutline,
  IconSearchOutline,
} from "@/components/icons/LineIcons";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: "home" as const },
  { label: "Explore", href: "/explore", icon: "explore" as const },
  { label: "Following", href: "/following", icon: "following" as const },
  { label: "Profile", href: "/profile", icon: "profile" as const },
];

function NavGlyph({
  kind,
  active,
}: {
  kind: (typeof NAV_ITEMS)[number]["icon"];
  active: boolean;
}) {
  const className = "block";
  const size = 26;
  const stroke = 1.65;

  if (kind === "home") {
    return active ? (
      <IconHomeFilled className={className} size={size} />
    ) : (
      <IconHomeOutline className={className} size={size} strokeWidth={stroke} />
    );
  }
  if (kind === "explore") {
    return (
      <IconSearchOutline className={className} size={size} strokeWidth={stroke} />
    );
  }
  if (kind === "following") {
    return (
      <IconFollowingOutline
        className={className}
        size={size}
        strokeWidth={stroke}
      />
    );
  }
  return (
    <IconProfileOutline className={className} size={size} strokeWidth={stroke} />
  );
}

function isPathActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setPendingPath(null);
  }, [pathname]);

  useEffect(() => {
    void fetchExploreBootstrap().catch(() => {});
  }, []);

  const navigate = useCallback(
    (href: string) => {
      if (isPathActive(pathname, href) && !pendingPath) return;
      setPendingPath(href);
      startTransition(() => {
        router.push(href);
      });
    },
    [pathname, pendingPath, router],
  );

  const displayPath = pendingPath ?? pathname;

  return (
    <nav
      className="pointer-events-auto fixed bottom-0 left-0 right-0 z-[99999] mx-auto w-full max-w-md"
      style={{
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
      }}
      aria-label="Primary navigation"
    >
      <div
        className="mx-3 mb-1 flex h-[54px] items-stretch justify-around rounded-2xl border border-white/[0.08] bg-[#0A0A0A]/94 shadow-[0_-4px_24px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = isPathActive(displayPath, item.href);

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => navigate(item.href)}
              className="group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1"
              style={{ touchAction: "manipulation" }}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={`flex h-7 items-center justify-center transition-colors duration-100 ${
                  isActive ? "text-[#39FF14]" : "text-neutral-200"
                }`}
              >
                <NavGlyph kind={item.icon} active={isActive} />
              </span>
              <span
                className={`text-[10px] font-semibold tracking-wide transition-colors duration-100 ${
                  isActive ? "text-[#39FF14]" : "text-neutral-200"
                }`}
              >
                {item.label}
              </span>
              <span
                className={`absolute -bottom-0.5 h-0.5 w-5 rounded-full bg-[#39FF14] transition-opacity duration-100 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
