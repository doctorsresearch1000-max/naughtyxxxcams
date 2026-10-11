import { NextResponse } from "next/server";
import { getAuthHeader, loadConsoleApi, requireConsoleAuth } from "@/lib/csn-console/load-csn";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireConsoleAuth(request);
    const api = await loadConsoleApi();
    const health = await api.consoleHealth();
    return NextResponse.json(health);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg.includes("No autorizado") || msg.includes("CSN_CONSOLE_TOKEN") ? 401 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}

/** Comprueba token sin exponer datos sensibles (solo ok/error). */
export async function POST(request: Request) {
  try {
    const api = await loadConsoleApi();
    api.assertConsoleToken(getAuthHeader(request));
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ ok: false, error: msg }, { status: 401 });
  }
}
