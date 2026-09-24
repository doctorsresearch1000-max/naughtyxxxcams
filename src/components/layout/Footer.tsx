import Link from "next/link";
import { SlushyBrandLogo } from "@/components/brand/SlushyBrandLogo";

type FooterLink = { href: string; label: string };

type FooterColumnProps = {
  title: string;
  links: FooterLink[];
};

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div className="min-w-0 break-words">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
        {title}
      </h3>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="inline-block text-xs leading-snug text-neutral-400 transition-colors hover:text-[#39FF14]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const LIVE_CATEGORIES: FooterLink[] = [
  { href: "/explore?cat=latinas", label: "Latina Models" },
  { href: "/explore?cat=verified", label: "Verified 18+" },
  { href: "/explore?cat=milf", label: "MILF & Mature" },
  { href: "/explore?cat=petite", label: "Petite & E-girls" },
  { href: "/explore?cat=cosplay", label: "Cosplay" },
  { href: "/explore?cat=couples", label: "Couples" },
  { href: "/explore?cat=trans", label: "Trans Models" },
  { href: "/explore?cat=alt", label: "Alt & Goth" },
];

const SHOW_TYPES: FooterLink[] = [
  { href: "/explore?show=private", label: "Private 1-on-1" },
  { href: "/explore?show=lovense", label: "Interactive Toys" },
  { href: "/explore?show=vip", label: "VIP & Lingerie" },
  { href: "/explore?show=asmr", label: "Live ASMR" },
  { href: "/explore?show=gaming", label: "Gaming Streams" },
  { href: "/explore?show=debut", label: "New Model Debuts" },
];

const EXPLORE_LINKS: FooterLink[] = [
  { href: "/", label: "Home Feed" },
  { href: "/explore", label: "Discover Models" },
  { href: "/following", label: "Following" },
  { href: "/explore?filter=free", label: "Free Cams" },
  { href: "/telegram", label: "Telegram Mini App" },
  { href: "/guides", label: "Guides & Tips" },
];

const LEGAL_LINKS: FooterLink[] = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/dmca", label: "DMCA Notice" },
  { href: "/usc-2257", label: "18 U.S.C. 2257" },
  { href: "/report", label: "Report Content" },
  { href: "/contact", label: "Contact" },
  { href: "/affiliates", label: "Affiliate Disclosure" },
];

export function Footer() {
  return (
    <footer
      className="relative isolate z-0 mt-12 shrink-0 overflow-hidden border-t border-white/10 bg-[#0A0A0A] text-sm text-neutral-400"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 lg:px-10">
        <div
          className="grid grid-cols-1 gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-10 lg:gap-y-0"
        >
          {/* Column 1 — Brand (full row on mobile, dedicated column on desktop) */}
          <div className="flex min-w-0 flex-col gap-4 sm:col-span-2 lg:col-span-1 lg:max-w-[240px]">
            <div className="flex flex-col items-start gap-3">
              <SlushyBrandLogo variant="compact" href="/" className="max-w-full" />
              <span
                className="inline-flex rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
              >
                18+ Adults Only
              </span>
            </div>
            <p className="text-xs leading-relaxed text-neutral-400">
              Naughty XXX Cams is a mobile-first live webcam directory powered by
              verified Streamate performers in HD. Browse trending rooms, save
              favorites, and jump into chat in seconds.
            </p>
          </div>

          <FooterColumn title="Live Categories" links={LIVE_CATEGORIES} />
          <FooterColumn title="Show Types" links={SHOW_TYPES} />
          <FooterColumn title="Explore" links={EXPLORE_LINKS} />
          <FooterColumn title="Legal & Support" links={LEGAL_LINKS} />
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="max-w-4xl text-xs leading-relaxed text-neutral-500">
            © 2026 Naughty XXX Cams. All rights reserved. All models were 18
            years of age or older at the time of depiction. Trademarks belong to
            their respective owners. This site contains affiliate links (
            <Link
              href="/affiliates"
              className="text-neutral-400 underline underline-offset-2 hover:text-[#39FF14]"
            >
              learn more
            </Link>
            ); we may earn a commission at no extra cost to you.
          </p>
        </div>
      </div>

      <div
        className="h-[calc(4.5rem+env(safe-area-inset-bottom,0px))]"
        aria-hidden
      />
    </footer>
  );
}
