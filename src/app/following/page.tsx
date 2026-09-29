export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import type { Metadata } from "next";
import { FollowingPageView } from "@/components/following/FollowingPageView";
import { SecondaryRouteShell } from "@/components/layout/SecondaryRouteShell";
import { getFollowingPageData } from "@/lib/following/followingPageData";

export const metadata: Metadata = {
  title: "Following — Your Live Models | NaughtyXXXCams",
  description:
    "Models you follow, nearby live streams, and one-tap access to Streamate rooms.",
};

export default async function FollowingPage() {
  let data: Awaited<ReturnType<typeof getFollowingPageData>>;
  try {
    data = await getFollowingPageData();
  } catch {
    data = {
      nearby: [],
      liveCards: [],
      liveGrid: [],
      offline: [],
      liveCount: 0,
      followedTotal: 0,
    };
  }

  return (
    <SecondaryRouteShell>
      <FollowingPageView {...data} />
    </SecondaryRouteShell>
  );
}
