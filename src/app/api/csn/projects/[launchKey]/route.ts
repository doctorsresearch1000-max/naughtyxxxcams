import { NextResponse } from "next/server";
import { loadConsoleApi, requireConsoleAuth } from "@/lib/csn-console/load-csn";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ launchKey: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    await requireConsoleAuth(request);
    const { launchKey } = await params;
    const api = await loadConsoleApi();
    const view = await api.getProjectConsoleView(decodeURIComponent(launchKey));
    return NextResponse.json(view);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg.includes("No autorizado") || msg.includes("CSN_CONSOLE_TOKEN") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
