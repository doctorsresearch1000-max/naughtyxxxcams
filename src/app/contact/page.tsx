import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { SITE_LEGAL } from "@/lib/site/legalContact";

export const metadata: Metadata = {
  title: "Contact Us | Naughty XXX Cams",
  description: "Contact support, legal, and compliance for Naughty XXX Cams.",
};

export default function ContactPage() {
  return (
    <LegalPageLayout
      title="Contact"
      description="Reach the right team for support, compliance, or partnership questions."
    >
      <h2>General support</h2>
      <p>
        Email:{" "}
        <a href={`mailto:${SITE_LEGAL.supportEmail}`}>
          {SITE_LEGAL.supportEmail}
        </a>
      </p>
      <p className="text-zinc-400">
        For account, navigation, or technical issues related to this website.
      </p>

      <h2>Legal & DMCA</h2>
      <p>
        DMCA / copyright:{" "}
        <a href={`mailto:${SITE_LEGAL.dmcaEmail}`}>{SITE_LEGAL.dmcaEmail}</a>
      </p>
      <p>
        Legal inquiries:{" "}
        <a href={`mailto:${SITE_LEGAL.legalEmail}`}>{SITE_LEGAL.legalEmail}</a>
      </p>
      <p>
        Full policy: <Link href="/dmca">DMCA Notice & Takedown</Link>
      </p>

      <h2>Report content</h2>
      <p>
        To report illegal content, underage material, or policy violations, use
        our <Link href="/report">content reporting guidelines</Link> or email{" "}
        <a href={`mailto:${SITE_LEGAL.abuseEmail}`}>{SITE_LEGAL.abuseEmail}</a>.
      </p>

      <h2>Affiliates</h2>
      <p>
        See <Link href="/affiliates">Affiliate Disclosure</Link> for commission
        and partner information.
      </p>
    </LegalPageLayout>
  );
}
