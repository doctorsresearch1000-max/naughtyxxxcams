import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { SITE_LEGAL } from "@/lib/site/legalContact";

export const metadata: Metadata = {
  title: "18 U.S.C. § 2257 Compliance | Naughty XXX Cams",
};

export default function Usc2257Page() {
  return (
    <LegalPageLayout title="18 U.S.C. § 2257 Record-Keeping Statement">
      <p>
        {SITE_LEGAL.brandName} is a promotional and directory website. We do not
        produce visual depictions of sexually explicit conduct. Live performances
        are streamed by third-party networks and individual performers who are
        responsible for their own compliance programs.
      </p>
      <p>
        For record-keeping inquiries related to content on linked platforms,
        contact the producing party or the affiliate network named on the
        destination site.
      </p>
      <p>
        Site compliance contact:{" "}
        <a href={`mailto:${SITE_LEGAL.legalEmail}`}>{SITE_LEGAL.legalEmail}</a>
      </p>
    </LegalPageLayout>
  );
}
