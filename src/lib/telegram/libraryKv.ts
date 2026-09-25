import type { UserLibrary } from "@/lib/user/userLibrary";

type KvLike = {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string) => Promise<void>;
};

function kvKey(userId: number): string {
  return `nx:tg-library:${userId}`;
}

export async function readTelegramLibraryFromKv(
  kv: KvLike | undefined,
  userId: number,
): Promise<UserLibrary | null> {
  if (!kv) return null;
  try {
    const raw = await kv.get(kvKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as UserLibrary;
  } catch {
    return null;
  }
}

export async function writeTelegramLibraryToKv(
  kv: KvLike | undefined,
  userId: number,
  library: UserLibrary,
): Promise<void> {
  if (!kv) return;
  try {
    await kv.put(kvKey(userId), JSON.stringify(library));
  } catch {
    /* ignore */
  }
}

export async function getWorkersKv(): Promise<KvLike | undefined> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    const kv = (ctx.env as { NEXT_CACHE_WORKERS_KV?: KvLike })
      .NEXT_CACHE_WORKERS_KV;
    return kv;
  } catch {
    return undefined;
  }
}
