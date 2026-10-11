import { NextResponse } from "next/server";
import { loadConsoleApi, requireConsoleAuth } from "@/lib/csn-console/load-csn";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ launchKey: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    await requireConsoleAuth(request);
    const { launchKey } = await params;
    const body = await request.json().catch(() => ({}));
    const api = await loadConsoleApi();
    const result = await api.generatePromptForLaunchKey(decodeURIComponent(launchKey), {
      phase: body.phase ? Number(body.phase) : undefined,
    });
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg.includes("No autorizado") || msg.includes("CSN_CONSOLE_TOKEN") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
