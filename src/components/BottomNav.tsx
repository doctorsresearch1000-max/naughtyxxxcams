"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, User, Users } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/following", label: "Following", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 z-50 w-full border-t border-cyan/10 bg-[#0B0F19]/90 backdrop-blur-md"
      aria-label="Primary"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                  active ? "text-magenta" : "text-slate-400 hover:text-cyan"
                }`}
              >
                <Icon
                  className={`h-6 w-6 ${active ? "drop-shadow-neon" : ""}`}
                  strokeWidth={active ? 2.5 : 2}
                  aria-hidden
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
