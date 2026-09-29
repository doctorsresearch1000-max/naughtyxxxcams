import { PersistedHomeFeed } from "@/components/layout/PersistedHomeFeed";
import {
  getBootstrapFeedPerformers,
  shouldServerBootstrapHomeFeed,
} from "@/lib/feed/getBootstrapFeedPerformers";

/** Injects SSR bootstrap performers into the persisted home feed (home route only). */
export async function HomeFeedServerBridge() {
  const isHome = await shouldServerBootstrapHomeFeed();
  const initialPerformers = isHome ? await getBootstrapFeedPerformers() : [];

  return <PersistedHomeFeed initialPerformers={initialPerformers} />;
}
