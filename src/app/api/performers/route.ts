import { fetchHomeFeedPerformers } from "@/lib/crackrevenue/fetchHomeFeedPerformers";
import {
  HOME_BOOTSTRAP_TARGET,
  HOME_FEED_MAX_PAGES_CEILING,
  HOME_FEED_MAX_PAGES_DEFAULT,
  HOME_SSR_PERFORMER_CAP,
} from "@/lib/feed/feedLimits";

export const dynamic = "force-dynamic";

function parseMaxPages(raw: string | null, bootstrap: boolean): number {
  if (bootstrap) return 1;
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n) || n < 1) return HOME_FEED_MAX_PAGES_DEFAULT;
  return Math.min(n, HOME_FEED_MAX_PAGES_CEILING);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bootstrap = searchParams.get("bootstrap") === "1";
  const maxPages = parseMaxPages(searchParams.get("maxPages"), bootstrap);

  try {
    const performers = await fetchHomeFeedPerformers({
      maxPages,
      targetCount: bootstrap ? HOME_BOOTSTRAP_TARGET : undefined,
    });

    const capped = bootstrap
      ? performers.slice(0, HOME_SSR_PERFORMER_CAP)
      : performers;

    return Response.json(
      {
        count: capped.length,
        bootstrap,
        performers: capped,
      },
      {
        headers: {
          "Cache-Control": bootstrap
            ? "public, s-maxage=60, stale-while-revalidate=120"
            : "public, s-maxage=60, stale-while-revalidate=180",
        },
      },
    );
  } catch {
    return Response.json(
      {
        count: 0,
        bootstrap,
        performers: [],
        degraded: true,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
        },
      },
    );
  }
}
