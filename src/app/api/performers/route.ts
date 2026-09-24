import { fetchStreamatePerformers } from "@/lib/crackrevenue/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await fetchStreamatePerformers({ size: 24, live: true });
  return Response.json(data);
}
