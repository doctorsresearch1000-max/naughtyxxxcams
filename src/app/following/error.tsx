"use client";

import { FollowingPageView } from "@/components/following/FollowingPageView";
import { SecondaryRouteShell } from "@/components/layout/SecondaryRouteShell";
import { EMPTY_FOLLOWING_PAGE_DATA } from "@/lib/following/followingPageData";

function isBenignFeedError(message: string | undefined): boolean {
  if (!message?.trim()) return true;
  return /connection closed|loading chunk|failed to fetch|network error|aborted/i.test(
    message,
  );
}

/**
 * Route-level recovery: avoid the global error screen on transient Worker/API drops.
 */
export default function FollowingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const showTechnical =
    process.env.NODE_ENV === "development" && !isBenignFeedError(error?.message);

  return (
    <SecondaryRouteShell>
      <div
        className="mb-4 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-left"
        role="alert"
      >
        <p className="text-sm font-semibold text-amber-100">
          Live lists are updating slowly
        </p>
        <p className="mt-1 text-xs leading-relaxed text-amber-200/80">
          Your connection or our live API hiccuped. You can still browse — tap
          refresh to load models again.
        </p>
        {showTechnical ? (
          <p className="mt-2 text-[10px] text-amber-200/60">{error.message}</p>
        ) : null}
        <button
          type="button"
          onClick={() => reset()}
          className="mt-3 rounded-lg bg-[#39FF14] px-4 py-2 text-xs font-bold text-black"
        >
          Try again
        </button>
      </div>
      <FollowingPageView {...EMPTY_FOLLOWING_PAGE_DATA} />
    </SecondaryRouteShell>
  );
}
