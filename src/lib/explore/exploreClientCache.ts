import type { CrackPerformer } from "@/lib/crackrevenue/api";
import type { ExploreCategory } from "@/lib/crackrevenue/categories";

const STORAGE_KEY = "nx-explore-bootstrap-v1";
const MAX_AGE_MS = 10 * 60 * 1000;

export type ExploreBootstrapPayload = {
  masterPool: CrackPerformer[];
  popularCategories: ExploreCategory[];
};

type Stored = {
  at: number;
  data: ExploreBootstrapPayload;
};

let memoryCache: Stored | null = null;

function readStorage(): Stored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (!parsed?.data || Date.now() - parsed.at > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function readExploreBootstrapCache(): ExploreBootstrapPayload | null {
  if (memoryCache && Date.now() - memoryCache.at <= MAX_AGE_MS) {
    return memoryCache.data;
  }
  const stored = readStorage();
  if (!stored) return null;
  memoryCache = stored;
  return stored.data;
}

export function writeExploreBootstrapCache(data: ExploreBootstrapPayload): void {
  const stored: Stored = { at: Date.now(), data };
  memoryCache = stored;
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    /* quota */
  }
}

export async function fetchExploreBootstrap(
  init?: RequestInit,
): Promise<ExploreBootstrapPayload> {
  const res = await fetch("/api/explore/bootstrap", {
    ...init,
    cache: "default",
  });
  const json = (await res.json()) as Partial<ExploreBootstrapPayload>;
  const payload: ExploreBootstrapPayload = {
    masterPool: Array.isArray(json.masterPool) ? json.masterPool : [],
    popularCategories: Array.isArray(json.popularCategories)
      ? json.popularCategories
      : [],
  };
  writeExploreBootstrapCache(payload);
  return payload;
}
