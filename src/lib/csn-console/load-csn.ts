import path from "path";
import { pathToFileURL } from "url";

export async function loadConsoleApi() {
  const modPath = path.join(process.cwd(), "csn-os/lib/console-api.mjs");
  return import(pathToFileURL(modPath).href);
}

export function getAuthHeader(request: Request): string | null {
  return request.headers.get("x-csn-console-token") || request.headers.get("authorization");
}

export async function requireConsoleAuth(request: Request) {
  const api = await loadConsoleApi();
  api.assertConsoleToken(getAuthHeader(request));
}
