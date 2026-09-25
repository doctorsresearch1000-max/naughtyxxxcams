import { fetchHomeFeedPerformers } from "@/lib/crackrevenue/fetchHomeFeedPerformers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bootstrap = searchParams.get("bootstrap") === "1";

  const performers = await fetchHomeFeedPerformers(
    bootstrap ? { maxPages: 1 } : undefined,
  );

  return Response.json(
    {
      count: performers.length,
      bootstrap,
      performers,
    },
    {
      headers: {
        "Cache-Control": bootstrap
          ? "public, s-maxage=15, stale-while-revalidate=45"
          : "public, s-maxage=20, stale-while-revalidate=60",
      },
    },
  );
}
