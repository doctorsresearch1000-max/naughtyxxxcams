"use client";

import { usePathname } from "next/navigation";

/** Renders routed pages except on home (feed is persisted separately). */
export function SecondaryPageLayer({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname === "/") {
    return null;
  }

  return (
    <div className="relative z-30 min-h-0 flex-1 bg-[#0A0A0A]">{children}</div>
  );
}
