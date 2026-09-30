export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import type { Metadata } from "next";
import { FollowingPageView } from "@/components/following/FollowingPageView";
import { SecondaryRouteShell } from "@/components/layout/SecondaryRouteShell";
import {
  EMPTY_FOLLOWING_PAGE_DATA,
  getFollowingPageData,
} from "@/lib/following/followingPageData";

export const metadata: Metadata = {
  title: "Following & Saved Live Models",
  description:
    "Models you follow, nearby live streams, and one-tap access to Streamate rooms from your NaughtyXxxCams library.",
};

export default async function FollowingPage() {
  let data: Awaited<ReturnType<typeof getFollowingPageData>>;
  try {
    data = await getFollowingPageData();
  } catch {
    data = EMPTY_FOLLOWING_PAGE_DATA;
  }

  return (
    <SecondaryRouteShell>
      <FollowingPageView {...data} />
    </SecondaryRouteShell>
  );
}
