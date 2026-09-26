import { NextResponse } from "next/server";
import { fetchExploreMasterPool } from "@/lib/explore/fetchCategoryPerformers";
import { EXPLORE_MASTER_POOL_PAGES } from "@/lib/explore/exploreLimits";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const masterPool = await fetchExploreMasterPool(EXPLORE_MASTER_POOL_PAGES);

    return NextResponse.json(
      {
        masterPool,
        popularCategories: [],
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { masterPool: [], popularCategories: [] },
      { status: 200 },
    );
  }
}
