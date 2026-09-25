import { fetchStreamatePerformers } from "@/lib/crackrevenue/api";
import { filterFeedPerformers } from "@/lib/feed/filterPerformers";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await fetchStreamatePerformers({ size: 36, live: true });
  const performers = filterFeedPerformers(data.performers ?? []);
  return Response.json(
    {
      count: performers.length,
      performers,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60",
      },
    },
  );
}
