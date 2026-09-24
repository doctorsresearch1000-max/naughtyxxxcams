"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavIconProps = {
  active: boolean;
};

const iconClass = (active: boolean) =>
  `transition-transform duration-150 ${active ? "scale-110" : "scale-100"}`;

const stroke = (active: boolean) => (active ? 2.25 : 1.85);

function NavIconHome({ active }: NavIconProps) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={iconClass(active)}
    >
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth={stroke(active)}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavIconExplore({ active }: NavIconProps) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={iconClass(active)}
    >
      <circle
        cx="11"
        cy="11"
        r="7"
        stroke="currentColor"
        strokeWidth={stroke(active)}
      />
      <path
        d="M20 20l-4-4"
        stroke="currentColor"
        strokeWidth={stroke(active)}
        strokeLinecap="round"
      />
    </svg>
  );
}

function NavIconFollowing({ active }: NavIconProps) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={iconClass(active)}
    >
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        stroke="currentColor"
        strokeWidth={stroke(active)}
        strokeLinecap="round"
      />
      <circle
        cx="9"
        cy="7"
        r="3.5"
        stroke="currentColor"
        strokeWidth={stroke(active)}
      />
      <path
        d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth={stroke(active)}
        strokeLinecap="round"
      />
    </svg>
  );
}

function NavIconProfile({ active }: NavIconProps) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={iconClass(active)}
    >
      <circle
        cx="12"
        cy="8"
        r="3.5"
        stroke="currentColor"
        strokeWidth={stroke(active)}
      />
      <path
        d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5"
        stroke="currentColor"
        strokeWidth={stroke(active)}
        strokeLinecap="round"
      />
    </svg>
  );
}

const NAV_ITEMS = [
  { label: "Home", href: "/", Icon: NavIconHome },
  { label: "Explore", href: "/explore", Icon: NavIconExplore },
  { label: "Following", href: "/following", Icon: NavIconFollowing },
  { label: "Profile", href: "/profile", Icon: NavIconProfile },
] as const;

const inactiveText = "text-neutral-400 group-active:text-neutral-200";
const activeText = "text-[#39FF14]";

export default function BottomNav() {
  const pathname = usePathname();

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
        className="mx-3 mb-1 flex h-[54px] items-stretch justify-around rounded-2xl border border-white/[0.06] bg-[#0A0A0A]/92 shadow-[0_-4px_24px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const { Icon } = item;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className="group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 transition-colors duration-150"
              style={{ touchAction: "manipulation" }}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={`flex h-7 items-center justify-center ${
                  isActive ? activeText : inactiveText
                }`}
              >
                <Icon active={isActive} />
              </span>
              <span
                className={`text-[10px] font-semibold tracking-wide ${
                  isActive ? activeText : inactiveText
                }`}
              >
                {item.label}
              </span>
              <span
                className={`absolute -bottom-0.5 h-0.5 w-5 rounded-full bg-[#39FF14] transition-all duration-200 ${
                  isActive ? "scale-100 opacity-100" : "scale-50 opacity-0"
                }`}
                aria-hidden
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
