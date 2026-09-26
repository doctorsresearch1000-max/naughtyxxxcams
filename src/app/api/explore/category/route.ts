import { resolveExploreCategory } from "@/lib/explore/exploreCatalog";
import {
  fetchCategoryPerformers,
  fetchExploreMasterPool,
} from "@/lib/explore/fetchCategoryPerformers";
import { EXPLORE_DISPLAY_LIMIT } from "@/lib/explore/exploreLimits";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cat = searchParams.get("cat");
  const category = resolveExploreCategory(cat);

  const masterPool = await fetchExploreMasterPool();
  const { performers, total } = await fetchCategoryPerformers(category, {
    size: EXPLORE_DISPLAY_LIMIT,
    masterPool,
  });

  return Response.json(
    {
      cat: category?.slug ?? null,
      total,
      performers,
    },
    {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
      },
    },
  );
}
