"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/", icon: "🔥" },
    { label: "Explore", href: "/explore", icon: "🔍" },
    { label: "Following", href: "/following", icon: "⭐" },
    { label: "Profile", href: "/profile", icon: "👤" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex h-16 max-w-md items-center justify-around border-t border-white/10 bg-black/90 backdrop-blur-md"
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
            className={`flex h-full w-full flex-col items-center justify-center text-xs transition-colors hover:text-white ${
              isActive ? "font-bold text-[#ec4899]" : "text-gray-400"
            }`}
          >
            <span className="mb-0.5 text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
