import { NextResponse } from "next/server";
import {
  dedupeCategories,
  fetchAllExploreCategories,
} from "@/lib/crackrevenue/categories";
import { fetchExploreMasterPool } from "@/lib/explore/fetchCategoryPerformers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [masterPool, categories] = await Promise.all([
      fetchExploreMasterPool(1),
      fetchAllExploreCategories().catch(() => []),
    ]);

    return NextResponse.json(
      {
        masterPool,
        popularCategories: dedupeCategories(categories),
      },
      {
        headers: {
          "Cache-Control": "private, max-age=30, stale-while-revalidate=120",
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
