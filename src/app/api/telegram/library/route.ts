import { NextResponse } from "next/server";
import type { UserLibrary } from "@/lib/user/userLibrary";
import { getTelegramBotToken } from "@/lib/telegram/config";
import {
  getWorkersKv,
  readTelegramLibraryFromKv,
  writeTelegramLibraryToKv,
} from "@/lib/telegram/libraryKv";
import { verifyTelegramSyncToken } from "@/lib/telegram/syncToken";

export const dynamic = "force-dynamic";

function emptyLibrary(): UserLibrary {
  return { likes: {}, bookmarks: {}, following: {}, history: [], playlists: [] };
}

function authUserId(request: Request): number | null {
  const botToken = getTelegramBotToken();
  if (!botToken) return null;
  const header =
    request.headers.get("x-telegram-sync-token")?.trim() ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ||
    "";
  if (!header) return null;
  return verifyTelegramSyncToken(header, botToken);
}

export async function GET(request: Request) {
  const userId = authUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const kv = await getWorkersKv();
  const library =
    (await readTelegramLibraryFromKv(kv, userId)) ?? emptyLibrary();

  return NextResponse.json({ ok: true, library });
}

export async function PUT(request: Request) {
  const userId = authUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { library?: UserLibrary };
  try {
    body = (await request.json()) as { library?: UserLibrary };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const library = body.library;
  if (!library || typeof library !== "object") {
    return NextResponse.json({ error: "Missing library" }, { status: 400 });
  }

  const kv = await getWorkersKv();
  await writeTelegramLibraryToKv(kv, userId, {
    likes: library.likes ?? {},
    bookmarks: library.bookmarks ?? {},
    following: library.following ?? {},
    history: Array.isArray(library.history) ? library.history : [],
    playlists: Array.isArray(library.playlists) ? library.playlists : [],
  });

  return NextResponse.json({ ok: true });
}
