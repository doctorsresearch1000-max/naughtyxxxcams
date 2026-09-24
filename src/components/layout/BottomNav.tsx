"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { label: "Home", href: "/", icon: "🔥" },
    { label: "Explore", href: "/explore", icon: "🔍" },
    { label: "Following", href: "/following", icon: "⭐" },
    { label: "Profile", href: "/profile", icon: "👤" },
  ];

  const nav = (
    <nav
      className="pointer-events-auto fixed bottom-0 left-0 right-0 z-[99999] mx-auto flex h-16 w-full max-w-md items-center justify-around border-t border-white/10 bg-black/95 backdrop-blur-md"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
      }}
      aria-label="Primary"
    >
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            className={`pointer-events-auto flex h-full min-w-0 flex-1 flex-col items-center justify-center text-xs transition-colors hover:text-white ${
              isActive ? "font-bold text-[#39FF14]" : "text-gray-400"
            }`}
            style={{ touchAction: "manipulation" }}
          >
            <span className="mb-0.5 text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  if (!mounted) return null;
  return createPortal(nav, document.body);
}
