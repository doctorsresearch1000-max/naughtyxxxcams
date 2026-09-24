"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";

const FOOTER_ROUTES = new Set(["/explore", "/following", "/profile"]);

/** Footer SEO solo en rutas secundarias; el header va en el layout raíz. */
export function ConditionalSiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showFooter =
    FOOTER_ROUTES.has(pathname) || pathname.startsWith("/profile/");

  const isHome = pathname === "/";

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col overflow-x-hidden ${isHome ? "" : "pt-[var(--app-header-height)]"}`}
    >
      <div className="relative z-10 min-h-0 flex-1">{children}</div>
      {showFooter ? <Footer /> : null}
    </div>
  );
}
