"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  rememberCatalogScroll,
  restoreCatalogScroll,
  type CatalogScrollRoute,
} from "@/lib/navigation/catalogScrollRestore";

function routeFromPath(pathname: string): CatalogScrollRoute | null {
  if (pathname === "/") return "home";
  if (pathname === "/explore" || pathname.startsWith("/explore/")) {
    return "explore";
  }
  return null;
}

/** Saves / restores window scroll when leaving catalog routes for a model profile. */
export function CatalogScrollRestore() {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = pathname;

    const prevRoute = prev ? routeFromPath(prev) : null;
    const nextRoute = routeFromPath(pathname);

    if (
      prevRoute &&
      prev !== pathname &&
      pathname.startsWith("/profile/") &&
      !pathname.includes("/playlists/")
    ) {
      rememberCatalogScroll(prevRoute);
    }

    if (nextRoute && prev?.startsWith("/profile/")) {
      restoreCatalogScroll(nextRoute);
    }
  }, [pathname]);

  return null;
}
