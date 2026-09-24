import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { SITE_LEGAL } from "@/lib/site/legalContact";

export const metadata: Metadata = {
  title: "Terms of Service | Naughty XXX Cams",
};

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service">
      <p>Last updated: March 2026</p>
      <p>
        By using {SITE_LEGAL.siteUrl} ({SITE_LEGAL.brandName}), you agree to
        these Terms. You must be at least 18 years old (or the age of majority
        in your jurisdiction).
      </p>
      <h2>Service description</h2>
      <p>
        We provide a directory and discovery interface for third-party adult live
        cam services. We do not host live video on our servers; streams are
        operated by affiliate partners.
      </p>
      <h2>Acceptable use</h2>
      <p>
        You may not use this site for unlawful purposes, to harass others, to
        circumvent age controls, or to scrape or overload our systems.
      </p>
      <h2>Affiliate links</h2>
      <p>
        Outbound links may earn us a commission. See{" "}
        <Link href="/affiliates">Affiliate Disclosure</Link>.
      </p>
      <h2>Disclaimer</h2>
      <p>
        The site is provided &quot;as is&quot; without warranties. We are not
        liable for third-party content or services.
      </p>
      <p>
        Questions:{" "}
        <a href={`mailto:${SITE_LEGAL.legalEmail}`}>{SITE_LEGAL.legalEmail}</a>
      </p>
    </LegalPageLayout>
  );
}
