import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Guides & Tips | Naughty XXX Cams",
};

export default function GuidesPage() {
  return (
    <LegalPageLayout
      title="Guides & Tips"
      description="Quick tips for browsing live cams safely and finding models you like."
    >
      <ul>
        <li>Use Discover filters to narrow by category and tags.</li>
        <li>Follow models on the Following tab for faster access when they go live.</li>
        <li>Tap a profile for details before joining a partner chat room.</li>
      </ul>
      <p>
        Legal & compliance: <Link href="/dmca">DMCA</Link>,{" "}
        <Link href="/contact">Contact</Link>,{" "}
        <Link href="/report">Report content</Link>.
      </p>
    </LegalPageLayout>
  );
}
