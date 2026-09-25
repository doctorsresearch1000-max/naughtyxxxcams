import { PersistedHomeFeed } from "@/components/layout/PersistedHomeFeed";
import { getBootstrapFeedPerformers } from "@/lib/feed/getBootstrapFeedPerformers";

/** Injects SSR bootstrap performers into the persisted home feed (mobile + desktop). */
export async function HomeFeedServerBridge() {
  const initialPerformers = await getBootstrapFeedPerformers();
  return <PersistedHomeFeed initialPerformers={initialPerformers} />;
}
