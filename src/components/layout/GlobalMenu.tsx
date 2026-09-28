"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  DRAWER_ACCORDION_SECTIONS,
  DRAWER_PRIMARY_LINKS,
} from "@/lib/site/categoryMenu";
import {
  GLOBAL_CONTACT_LINKS,
  GLOBAL_LEGAL_LINKS,
} from "@/lib/site/globalMenuLinks";

function IconMenu({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="text-white"
    >
      {open ? (
        <path
          d="M6 6l12 12M18 6 6 18"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

function DrawerRowIcon({ kind }: { kind?: string }) {
  const stroke = "currentColor";
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    "aria-hidden": true,
  };
  if (kind === "home") {
    return (
      <svg {...common}>
        <path
          d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
          stroke={stroke}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (kind === "female") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="4" stroke={stroke} strokeWidth="1.6" />
        <path d="M12 12v8M9 18h6" stroke={stroke} strokeWidth="1.6" />
      </svg>
    );
  }
  if (kind === "male") {
    return (
      <svg {...common}>
        <circle cx="10" cy="14" r="4" stroke={stroke} strokeWidth="1.6" />
        <path
          d="m14 10 6-6M16 4h4v4"
          stroke={stroke}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (kind === "couples") {
    return (
      <svg {...common}>
        <circle cx="9" cy="10" r="3" stroke={stroke} strokeWidth="1.5" />
        <circle cx="15" cy="10" r="3" stroke={stroke} strokeWidth="1.5" />
        <path d="M6 20c0-3 2.5-5 6-5s6 2 6 5" stroke={stroke} strokeWidth="1.5" />
      </svg>
    );
  }
  if (kind === "explore") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" stroke={stroke} strokeWidth="1.6" />
        <path d="M20 20l-3.5-3.5" stroke={stroke} strokeWidth="1.6" />
      </svg>
    );
  }
  if (kind === "following") {
    return (
      <svg {...common}>
        <path
          d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10Z"
          stroke={stroke}
          strokeWidth="1.6"
        />
      </svg>
    );
  }
  if (kind === "profile") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="4" stroke={stroke} strokeWidth="1.6" />
        <path
          d="M5 20c0-4 3-7 7-7s7 3 7 7"
          stroke={stroke}
          strokeWidth="1.6"
        />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8" stroke={stroke} strokeWidth="1.6" />
      <path d="M12 8v8M8 12h8" stroke={stroke} strokeWidth="1.6" />
    </svg>
  );
}

function isDrawerLinkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function GlobalMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setExpanded(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const panel = open ? (
    <div
      className="fixed inset-0 z-[100001]"
      role="dialog"
      aria-modal="true"
      aria-label="Browse categories"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Close menu"
        onClick={close}
      />
      <aside
        className="absolute left-0 top-0 flex h-full w-[min(100%,300px)] flex-col border-r border-white/10 bg-black shadow-2xl"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
          <button
            type="button"
            onClick={close}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-black"
            aria-label="Close menu"
          >
            <span className="text-lg font-black leading-none text-red-600">×</span>
          </button>
          <p className="text-sm font-bold text-white">Categories</p>
          <span className="w-10" aria-hidden />
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="border-b border-white/10 py-1">
            {DRAWER_PRIMARY_LINKS.map((link) => {
              const active = isDrawerLinkActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={close}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold transition hover:bg-white/5 ${
                      active
                        ? "text-[#39FF14]"
                        : link.href === "/"
                          ? "text-red-400"
                          : "text-white"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <DrawerRowIcon kind={link.icon} />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {DRAWER_ACCORDION_SECTIONS.map((section) => {
            const isOpen = expanded === section.id;
            return (
              <div key={section.id} className="border-b border-white/10">
                <button
                  type="button"
                  onClick={() =>
                    setExpanded(isOpen ? null : section.id)
                  }
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-white hover:bg-white/5"
                  aria-expanded={isOpen}
                >
                  <span>{section.label}</span>
                  <span className="text-zinc-400" aria-hidden>
                    {isOpen ? "▴" : "▾"}
                  </span>
                </button>
                {isOpen ? (
                  <ul className="pb-2">
                    {section.links.map((link) => (
                      <li key={`${section.id}-${link.href}`}>
                        <Link
                          href={link.href}
                          onClick={close}
                          className="block px-4 py-2 pl-8 text-sm text-zinc-300 hover:bg-white/5 hover:text-[#39FF14]"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}

          <div className="px-4 py-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#39FF14]">
              Legal & compliance
            </p>
            <ul className="mb-4 space-y-1">
              {GLOBAL_LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={close}
                    className="block rounded-lg px-2 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-[#39FF14]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#39FF14]">
              DMCA & contact
            </p>
            <ul className="space-y-1">
              {GLOBAL_CONTACT_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={close}
                    className="block break-all rounded-lg px-2 py-2 text-xs text-neutral-400 hover:bg-white/5 hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <p className="border-t border-white/10 px-4 py-3 text-[10px] leading-relaxed text-neutral-500">
          18+ only. All models were 18 or older at depiction.
        </p>
      </aside>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-black/80 transition active:scale-95"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        <IconMenu open={open} />
      </button>
      {mounted && panel ? createPortal(panel, document.body) : null}
    </>
  );
}
