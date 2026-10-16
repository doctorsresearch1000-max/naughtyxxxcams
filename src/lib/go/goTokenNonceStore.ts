const TTL_MS = 120_000;

type Entry = { expiresAt: number };

const memoryStore = new Map<string, Entry>();

function prune(now: number): void {
  for (const [key, entry] of memoryStore) {
    if (entry.expiresAt <= now) memoryStore.delete(key);
  }
}

/** Single-use nonce: returns false if already consumed or expired. */
export function consumeGoTokenNonce(nonce: string): boolean {
  const now = Date.now();
  prune(now);
  const key = nonce.trim();
  if (!key) return false;
  const hit = memoryStore.get(key);
  if (!hit || hit.expiresAt <= now) return false;
  memoryStore.delete(key);
  return true;
}

export function registerGoTokenNonce(nonce: string, ttlMs = TTL_MS): void {
  const now = Date.now();
  prune(now);
  memoryStore.set(nonce.trim(), { expiresAt: now + ttlMs });
}
