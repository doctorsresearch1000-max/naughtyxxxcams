import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { SITE_LEGAL } from "@/lib/site/legalContact";

export const metadata: Metadata = {
  title: "DMCA Notice & Takedown Policy | Naughty XXX Cams",
  description:
    "Digital Millennium Copyright Act (DMCA) notice procedure and designated agent contact for Naughty XXX Cams.",
};

export default function DmcaPage() {
  const mailto = `mailto:${SITE_LEGAL.dmcaEmail}?subject=DMCA%20Takedown%20Notice`;

  return (
    <LegalPageLayout
      title="DMCA Notice & Takedown Policy"
      description="We respect intellectual property rights and respond to valid DMCA notices promptly."
    >
      <p>
        If you believe content linked or displayed through {SITE_LEGAL.brandName}{" "}
        infringes your copyright, you may submit a notice to our designated DMCA
        agent as described below.
      </p>

      <h2>Designated DMCA agent</h2>
      <ul>
        <li>
          <strong>Agent:</strong> {SITE_LEGAL.dmcaAgentName}
        </li>
        <li>
          <strong>Email (required):</strong>{" "}
          <a href={mailto}>{SITE_LEGAL.dmcaEmail}</a>
        </li>
        <li>
          <strong>Legal correspondence:</strong>{" "}
          <a href={`mailto:${SITE_LEGAL.legalEmail}`}>{SITE_LEGAL.legalEmail}</a>
        </li>
      </ul>

      <h2>Your notice must include</h2>
      <ol>
        <li>Identification of the copyrighted work claimed to be infringed.</li>
        <li>
          Identification of the material claimed to be infringing, with enough
          detail for us to locate it (URL, model name, date/time if applicable).
        </li>
        <li>
          Your contact information (name, address, telephone, and email).
        </li>
        <li>
          A statement that you have a good-faith belief the use is not authorized
          by the copyright owner, its agent, or the law.
        </li>
        <li>
          A statement, under penalty of perjury, that the information in the
          notice is accurate and that you are authorized to act on behalf of the
          copyright owner.
        </li>
        <li>Your physical or electronic signature.</li>
      </ol>

      <p>
        Send completed notices to{" "}
        <a href={mailto}>{SITE_LEGAL.dmcaEmail}</a>. Incomplete notices may
        delay processing.
      </p>

      <h2>Counter-notification</h2>
      <p>
        If you believe material was removed in error, you may submit a
        counter-notification to the same email address with the information
        required under 17 U.S.C. § 512(g).
      </p>

      <p className="text-xs text-zinc-500">
        Third-party live streams are operated by licensed affiliate networks
        (e.g., Streamate). We forward valid notices to the appropriate service
        provider when required.
      </p>
    </LegalPageLayout>
  );
}
