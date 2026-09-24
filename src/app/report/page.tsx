import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { SITE_LEGAL } from "@/lib/site/legalContact";

export const metadata: Metadata = {
  title: "Report Content | Naughty XXX Cams",
  description:
    "How to report abusive, illegal, or policy-violating content on Naughty XXX Cams.",
};

export default function ReportPage() {
  const abuseMail = `mailto:${SITE_LEGAL.abuseEmail}?subject=Content%20Report`;

  return (
    <LegalPageLayout
      title="Report Content"
      description="We take reports of illegal or harmful content seriously."
    >
      <p>
        {SITE_LEGAL.brandName} aggregates links to third-party live cam
        platforms. If you see content that violates law or our policies, report
        it using the steps below.
      </p>

      <h2>Report immediately if you see</h2>
      <ul>
        <li>Any person who appears to be under 18 years of age.</li>
        <li>Non-consensual, trafficking-related, or clearly illegal activity.</li>
        <li>Malware, phishing, or deceptive redirects.</li>
        <li>Harassment, threats, or doxxing on this site.</li>
      </ul>

      <h2>How to submit a report</h2>
      <ol>
        <li>
          Email{" "}
          <a href={abuseMail}>{SITE_LEGAL.abuseEmail}</a> with the subject line{" "}
          <strong>Content Report</strong>.
        </li>
        <li>
          Include the page URL on our site, the model or room name, date/time
          (UTC if possible), and a short description.
        </li>
        <li>Attach screenshots only if necessary; do not include illegal material.</li>
      </ol>

      <p>
        For copyright claims, use the{" "}
        <Link href="/dmca">DMCA process</Link> and email{" "}
        <a href={`mailto:${SITE_LEGAL.dmcaEmail}`}>{SITE_LEGAL.dmcaEmail}</a>.
      </p>

      <p className="text-xs text-zinc-500">
        We may forward reports to hosting or affiliate partners when required by
        law or partner policy. Emergency situations: contact local law
        enforcement first.
      </p>
    </LegalPageLayout>
  );
}
