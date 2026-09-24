import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { SITE_LEGAL } from "@/lib/site/legalContact";

export const metadata: Metadata = {
  title: "Privacy Policy | Naughty XXX Cams",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <p>Last updated: March 2026</p>
      <p>
        {SITE_LEGAL.brandName} respects your privacy. This policy describes what
        we collect on {SITE_LEGAL.siteUrl} and how we use it.
      </p>
      <h2>Information we collect</h2>
      <ul>
        <li>Usage data (pages viewed, device type, approximate region via CDN logs).</li>
        <li>Local storage (e.g., UI preferences such as likes) on your device.</li>
        <li>Communications you send to us by email.</li>
      </ul>
      <h2>How we use information</h2>
      <p>
        To operate and improve the site, prevent abuse, comply with law, and
        respond to support or legal requests.
      </p>
      <h2>Third parties</h2>
      <p>
        Affiliate partners and analytics/CDN providers may process data under
        their own policies when you follow outbound links or load embedded
        content.
      </p>
      <h2>Contact</h2>
      <p>
        Privacy requests:{" "}
        <a href={`mailto:${SITE_LEGAL.legalEmail}`}>{SITE_LEGAL.legalEmail}</a>
      </p>
    </LegalPageLayout>
  );
}
