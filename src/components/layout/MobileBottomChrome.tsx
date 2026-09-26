"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { ChatWithModelCta } from "@/components/conversion/ChatWithModelCta";
import { useFeedBottomChrome } from "@/components/layout/FeedBottomChromeContext";
import { fetchExploreBootstrap } from "@/lib/explore/exploreClientCache";
import { preloadLiveCommentPools } from "@/lib/engagement/liveCommentEngine";
import {
  IconHeartFilled,
  IconHeartOutline,
  IconHomeFilled,
  IconHomeOutline,
  IconProfileOutline,
  IconSearchOutline,
} from "@/components/icons/LineIcons";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: "home" as const },
  { label: "Explore", href: "/explore", icon: "explore" as const },
  { label: "Following", href: "/following", icon: "heart" as const },
  { label: "Profile", href: "/profile", icon: "profile" as const },
];

function NavGlyph({
  kind,
  active,
}: {
  kind: (typeof NAV_ITEMS)[number]["icon"];
  active: boolean;
}) {
  const size = 26;
  const stroke = 1.65;
  const activeClass = "text-[#39FF14]";
  const inactiveClass = "text-neutral-200";

  if (kind === "home") {
    return active ? (
      <IconHomeFilled className={activeClass} size={size} />
    ) : (
      <IconHomeOutline
        className={inactiveClass}
        size={size}
        strokeWidth={stroke}
      />
    );
  }
  if (kind === "explore") {
    return (
      <IconSearchOutline
        className={active ? activeClass : inactiveClass}
        size={size}
        strokeWidth={stroke}
      />
    );
  }
  if (kind === "heart") {
    return active ? (
      <IconHeartFilled className={activeClass} size={size} />
    ) : (
      <IconHeartOutline
        className={inactiveClass}
        size={size}
        strokeWidth={stroke}
      />
    );
  }
  return (
    <IconProfileOutline
      className={active ? activeClass : inactiveClass}
      size={size}
      strokeWidth={stroke}
    />
  );
}

function isPathActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Single fixed bottom shell: optional feed CTA + one glass nav pill (video bleeds behind).
 */
export default function MobileBottomChrome() {
  const pathname = usePathname();
  const router = useRouter();
  const { cta } = useFeedBottomChrome();
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const onHomeFeed = pathname === "/";

  useEffect(() => {
    setPendingPath(null);
  }, [pathname]);

  useEffect(() => {
    void fetchExploreBootstrap().catch(() => {});
    preloadLiveCommentPools();
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

  const shellStyle = {
    paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))",
    touchAction: "manipulation" as const,
    WebkitTapHighlightColor: "transparent",
  };

  const navItems = NAV_ITEMS.map((item) => {
    const isActive = isPathActive(displayPath, item.href);

    return (
      <button
        key={item.href}
        type="button"
        onClick={() => navigate(item.href)}
        className="group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1"
        style={{ touchAction: "manipulation" }}
        aria-current={isActive ? "page" : undefined}
        aria-label={item.label}
      >
        <span className="flex h-7 items-center justify-center">
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
  });

  return (
    <div
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-[100000] mx-auto w-full max-w-md lg:hidden"
      data-mobile-bottom-chrome="v1"
      style={shellStyle}
    >
      {onHomeFeed && cta ? (
        <div
          className="pointer-events-auto mb-2 px-3"
          data-feed-bottom-cta="true"
        >
          <ChatWithModelCta
            modelName={cta.modelName}
            affiliateUrl={cta.affiliateUrl}
            visible
          />
        </div>
      ) : null}

      <nav
        className="pointer-events-auto mx-3 mb-1 flex h-[54px] items-stretch justify-around rounded-2xl border border-white/[0.08] bg-[#0A0A0A]/94 shadow-[0_-4px_24px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        data-bottom-nav="v2-heart"
        aria-label="Primary navigation"
      >
        {navItems}
      </nav>
    </div>
  );
}
