import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { SITE_LEGAL } from "@/lib/site/legalContact";

export const metadata: Metadata = {
  title: "Affiliate Disclosure | Naughty XXX Cams",
};

export default function AffiliatesPage() {
  return (
    <LegalPageLayout title="Affiliate Disclosure">
      <p>
        {SITE_LEGAL.brandName} participates in affiliate programs. When you
        click certain links (including model room links) and sign up or purchase
        on a partner site, we may earn a commission at no extra cost to you.
      </p>
      <p>
        Partners may include adult cam networks and related advertisers. We do
        not control third-party billing, refunds, or performer conduct on
        external sites.
      </p>
      <h2>Compliance & legal pages</h2>
      <ul>
        <li><Link href="/terms">Terms of Service</Link></li>
        <li><Link href="/privacy">Privacy Policy</Link></li>
        <li><Link href="/dmca">DMCA Notice</Link></li>
        <li><Link href="/report">Report Content</Link></li>
        <li><Link href="/contact">Contact</Link></li>
      </ul>
      <p>
        Partner inquiries:{" "}
        <a href={`mailto:${SITE_LEGAL.supportEmail}`}>{SITE_LEGAL.supportEmail}</a>
      </p>
    </LegalPageLayout>
  );
}
