import { getBootstrapFeedPerformers } from "@/lib/feed/getBootstrapFeedPerformers";

export const dynamic = "force-dynamic";

/**
 * Primes the per-request bootstrap cache and anchors home SSR.
 * The feed UI + slide 0 markup are rendered via {@link HomeFeedServerBridge} in the layout.
 */
export default async function HomePage() {
  await getBootstrapFeedPerformers();
  return null;
}
