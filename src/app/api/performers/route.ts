import { fetchHomeFeedPerformers } from "@/lib/crackrevenue/fetchHomeFeedPerformers";

export const dynamic = "force-dynamic";

export async function GET() {
  const performers = await fetchHomeFeedPerformers();
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
