import { SITE_LEGAL } from "@/lib/site/legalContact";

export type GlobalMenuLink = {
  href: string;
  label: string;
  external?: boolean;
};

export const GLOBAL_LEGAL_LINKS: GlobalMenuLink[] = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/dmca", label: "DMCA Policy & Agent" },
  { href: "/usc-2257", label: "18 U.S.C. § 2257 Statement" },
  { href: "/report", label: "Report Content" },
  { href: "/contact", label: "Contact & Support" },
  { href: "/affiliates", label: "Affiliate Disclosure" },
  { href: "/guides", label: "Guides & Tips" },
];

export const GLOBAL_CONTACT_LINKS: GlobalMenuLink[] = [
  {
    href: `mailto:${SITE_LEGAL.dmcaEmail}?subject=DMCA%20Notice`,
    label: `DMCA: ${SITE_LEGAL.dmcaEmail}`,
    external: true,
  },
  {
    href: `mailto:${SITE_LEGAL.abuseEmail}?subject=Content%20Report`,
    label: `Report abuse: ${SITE_LEGAL.abuseEmail}`,
    external: true,
  },
  {
    href: `mailto:${SITE_LEGAL.supportEmail}`,
    label: `Support: ${SITE_LEGAL.supportEmail}`,
    external: true,
  },
];
