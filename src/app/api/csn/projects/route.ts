import { NextResponse } from "next/server";
import { loadConsoleApi, requireConsoleAuth } from "@/lib/csn-console/load-csn";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireConsoleAuth(request);
    const api = await loadConsoleApi();
    const grouped = await api.listProjectsGrouped();
    return NextResponse.json(grouped);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg.includes("No autorizado") || msg.includes("CSN_CONSOLE_TOKEN") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requireConsoleAuth(request);
    const body = await request.json();
    if (!body.siteName?.trim()) {
      return NextResponse.json({ error: "Nombre del proyecto obligatorio" }, { status: 400 });
    }
    const api = await loadConsoleApi();
    const created = await api.createProjectFromForm(body);
    return NextResponse.json(created);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg.includes("No autorizado") || msg.includes("CSN_CONSOLE_TOKEN") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
