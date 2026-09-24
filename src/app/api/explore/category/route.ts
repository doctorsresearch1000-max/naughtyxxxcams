import { resolveExploreCategory } from "@/lib/explore/categorySlugs";
import { fetchCategoryPerformers } from "@/lib/explore/fetchCategoryPerformers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cat = searchParams.get("cat");
  const category = resolveExploreCategory(cat);

  const { performers, total } = await fetchCategoryPerformers(category, {
    size: 24,
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
