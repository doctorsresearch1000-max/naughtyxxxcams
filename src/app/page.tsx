import type { Metadata } from "next";
import { getBootstrapFeedPerformers } from "@/lib/feed/getBootstrapFeedPerformers";
import { normalizeSeoDescription } from "@/lib/seo/metadataHelpers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live Adult Cam Shows & HD Models",
  description: normalizeSeoDescription(
    "Scroll live HD cam shows, tap into Streamate rooms, and explore model profiles on NaughtyXxxCams. Mobile-first feed with categories, favorites, and verified 18+ performers.",
  ),
};

/**
 * Primes the per-request bootstrap cache and anchors home SSR.
 * Home tube catalog UI is rendered via {@link HomeFeedServerBridge} in the layout.
 */
export default async function HomePage() {
  await getBootstrapFeedPerformers();
  return null;
}
