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
    <div className="min-w-0 break-words lg:col-span-1">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
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
          <a href={dmcaMail} className="text-[#39FF14] hover:underline">
            {SITE_LEGAL.dmcaEmail}
          </a>
        </p>
        <p className="text-xs leading-relaxed text-neutral-300">
          <span className="font-semibold text-white">Report abuse:</span>{" "}
          <Link href="/report" className="text-[#39FF14] hover:underline">
            Reporting guidelines
          </Link>
          {" · "}
          <a href={abuseMail} className="text-neutral-400 hover:text-white">
            {SITE_LEGAL.abuseEmail}
          </a>
        </p>
        <p className="text-xs leading-relaxed text-neutral-300">
          <span className="font-semibold text-white">Support:</span>{" "}
          <a href={supportMail} className="text-[#39FF14] hover:underline">
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
      className="relative isolate z-0 mt-12 shrink-0 overflow-hidden border-t border-white/10 bg-[#0A0A0A] text-sm text-neutral-400"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 lg:px-10">
        <p className="mb-8 rounded-xl border border-white/10 bg-[#1C1C1E]/60 px-4 py-3 text-xs leading-relaxed text-neutral-400">
          <span className="font-semibold text-zinc-200">Accessibility note:</span>{" "}
          The home feed uses infinite scroll, so the footer sits below the feed.
          Legal, DMCA, and contact links are always available on{" "}
          <Link href="/explore" className="text-[#39FF14] hover:underline">
            Discover
          </Link>
          ,{" "}
          <Link href="/following" className="text-[#39FF14] hover:underline">
            Following
          </Link>
          ,{" "}
          <Link href="/profile" className="text-[#39FF14] hover:underline">
            Profile
          </Link>
          , and on dedicated pages such as{" "}
          <Link href="/dmca" className="text-[#39FF14] hover:underline">
            /dmca
          </Link>{" "}
          and{" "}
          <Link href="/contact" className="text-[#39FF14] hover:underline">
            /contact
          </Link>
          .
        </p>

        <div
          className="grid grid-cols-1 gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-10 lg:gap-y-0"
        >
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
          <FooterLegalColumn />
        </div>

        <div className="mt-12 space-y-3 border-t border-white/10 pt-8">
          <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <Link href="/dmca" className="text-neutral-400 hover:text-[#39FF14]">
              DMCA
            </Link>
            <span className="text-zinc-700" aria-hidden>|</span>
            <a
              href={`mailto:${SITE_LEGAL.dmcaEmail}`}
              className="text-neutral-400 hover:text-[#39FF14]"
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
