import Link from "next/link";
import { SlushyBrandLogo } from "@/components/brand/SlushyBrandLogo";
import { SITE_LEGAL } from "@/lib/site/legalContact";

type FooterLink = { href: string; label: string };

type FooterColumnProps = {
  title: string;
  links: FooterLink[];
};

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div className="min-w-0">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-white">
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

function FooterLegalColumn() {
  const dmcaMail = `mailto:${SITE_LEGAL.dmcaEmail}?subject=DMCA%20Notice`;
  const abuseMail = `mailto:${SITE_LEGAL.abuseEmail}?subject=Content%20Report`;
  const supportMail = `mailto:${SITE_LEGAL.supportEmail}`;

  const links: FooterLink[] = [
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/dmca", label: "DMCA Policy & Agent" },
    { href: "/usc-2257", label: "18 U.S.C. § 2257 Statement" },
    { href: "/report", label: "Report Content (Guidelines)" },
    { href: "/contact", label: "Contact & Support" },
    { href: "/affiliates", label: "Affiliate Disclosure" },
  ];

  return (
    <div className="min-w-0">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-white">
        Legal & Support
      </h3>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-block text-xs leading-snug text-neutral-400 transition-colors hover:text-[#39FF14]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div
        className="mt-5 space-y-3 rounded-xl border border-white/10 bg-[#1C1C1E]/80 p-3.5"
        aria-label="Compliance contacts"
      >
        <p className="text-[10px] font-bold uppercase tracking-wide text-[#39FF14]">
          Compliance contacts
        </p>
        <p className="text-xs leading-relaxed text-neutral-300">
          <span className="font-semibold text-white">DMCA agent:</span>{" "}
          <a href={dmcaMail} className="break-all text-[#39FF14] hover:underline">
            {SITE_LEGAL.dmcaEmail}
          </a>
        </p>
        <p className="text-xs leading-relaxed text-neutral-300">
          <span className="font-semibold text-white">Report abuse:</span>{" "}
          <Link href="/report" className="text-[#39FF14] hover:underline">
            Reporting guidelines
          </Link>
          {" · "}
          <a href={abuseMail} className="break-all text-neutral-400 hover:text-white">
            {SITE_LEGAL.abuseEmail}
          </a>
        </p>
        <p className="text-xs leading-relaxed text-neutral-300">
          <span className="font-semibold text-white">Support:</span>{" "}
          <a href={supportMail} className="break-all text-[#39FF14] hover:underline">
            {SITE_LEGAL.supportEmail}
          </a>
        </p>
      </div>
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

export function Footer() {
  return (
    <footer
      className="relative z-0 mt-12 shrink-0 border-t border-white/10 bg-[#0A0A0A] text-sm text-neutral-400"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div
          className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-10"
        >
          <div className="min-w-0 sm:col-span-2 lg:col-span-4">
            <div className="flex flex-col items-start gap-3">
              <SlushyBrandLogo
                variant="compact"
                href="/"
                className="max-w-full whitespace-normal"
              />
              <span
                className="inline-flex rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
              >
                18+ Adults Only
              </span>
            </div>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-neutral-400">
              Naughty XXX Cams is a mobile-first live webcam directory powered by
              verified Streamate performers in HD. Browse trending rooms, save
              favorites, and jump into chat in seconds.
            </p>
          </div>

          <div className="min-w-0 lg:col-span-2">
            <FooterColumn title="Live Categories" links={LIVE_CATEGORIES} />
          </div>
          <div className="min-w-0 lg:col-span-2">
            <FooterColumn title="Show Types" links={SHOW_TYPES} />
          </div>
          <div className="min-w-0 lg:col-span-2">
            <FooterColumn title="Explore" links={EXPLORE_LINKS} />
          </div>
          <div className="min-w-0 sm:col-span-2 lg:col-span-2">
            <FooterLegalColumn />
          </div>
        </div>

        <div className="mt-10 space-y-3 border-t border-white/10 pt-8">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <Link href="/dmca" className="text-neutral-400 hover:text-[#39FF14]">
              DMCA
            </Link>
            <span className="text-zinc-700" aria-hidden>|</span>
            <a
              href={`mailto:${SITE_LEGAL.dmcaEmail}`}
              className="break-all text-neutral-400 hover:text-[#39FF14]"
            >
              {SITE_LEGAL.dmcaEmail}
            </a>
            <span className="text-zinc-700" aria-hidden>|</span>
            <Link href="/report" className="text-neutral-400 hover:text-[#39FF14]">
              Report
            </Link>
            <span className="text-zinc-700" aria-hidden>|</span>
            <Link href="/contact" className="text-neutral-400 hover:text-[#39FF14]">
              Contact
            </Link>
          </p>
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
