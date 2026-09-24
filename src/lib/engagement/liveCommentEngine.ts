import type { CommentLocale } from "@/lib/engagement/streamCommentLocale";
import bundledPools from "@/data/live-comment-pools.json";

export type LiveCommentKind = "chat" | "tip" | "private";

export type LiveCommentItem = {
  id: string;
  username: string;
  message: string;
  badgeColor: string;
  badgeLabel: string;
  kind: LiveCommentKind;
  locale: CommentLocale;
};

const BADGE_COLORS = ["#39FF14", "#A855F7", "#3B82F6", "#F472B6", "#22D3EE"];

function badgeForUser(username: string): { badgeColor: string; badgeLabel: string } {
  let hash = 0;
  for (let i = 0; i < username.length; i += 1) {
    hash = (hash << 5) - hash + username.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % BADGE_COLORS.length;
  const num = (Math.abs(hash) % 89) + 10;
  return {
    badgeColor: BADGE_COLORS[idx]!,
    badgeLabel: String(num),
  };
}

export type LiveCommentPools = {
  en: string[];
  es: string[];
};

const TIP_SNIPPETS_EN = [
  "tipped 25 tokens",
  "tipped 50 tokens",
  "tipped 80 tokens for that twerk",
  "sent 100 tk — nice show",
  "tipped 35 tokens",
  "dropped 120 tokens",
];

const TIP_SNIPPETS_ES = [
  "envió 25 tokens",
  "tipped 80 tokens por ese twerk",
  "mandó 50 tk",
  "dejó 100 tokens",
  "puso 35 tk",
];

const PRIVATE_CTA_EN = [
  "requested a private room",
  "wants a VIP private show",
  "asked for exclusive private",
  "invited you to private chat",
];

const PRIVATE_CTA_ES = [
  "pidió sala privada",
  "quiere show VIP privado",
  "solicitó chat exclusivo",
  "invitó a privado",
];

const MASKED_USERS_EN = [
  "Guest_4821",
  "Mike92",
  "anon_fan",
  "VIP_Dave",
  "user_7712",
  "TommyX",
  "nightowl",
];

const MASKED_USERS_ES = [
  "Invitado_4821",
  "Carlos92",
  "fan_anon",
  "VIP_Luis",
  "user_7712",
  "NocheX",
  "amigo_hot",
];

const BUNDLED: LiveCommentPools = {
  en: Array.isArray(bundledPools.en) ? bundledPools.en : [],
  es: Array.isArray(bundledPools.es) ? bundledPools.es : [],
};

let poolsCache: LiveCommentPools | null = null;

/** Synchronous access — always available (bundled JSON). */
export function getLiveCommentPoolsSync(): LiveCommentPools {
  return poolsCache ?? BUNDLED;
}

/** Prefer bundled pools; optionally refresh from /public in the background. */
export async function loadLiveCommentPools(): Promise<LiveCommentPools> {
  if (poolsCache) return poolsCache;
  poolsCache = BUNDLED;

  if (typeof window === "undefined") return poolsCache;

  try {
    const res = await fetch("/data/live-comment-pools.json", {
      cache: "no-store",
    });
    if (res.ok) {
      const remote = (await res.json()) as LiveCommentPools;
      if (
        Array.isArray(remote.en) &&
        remote.en.length > 0 &&
        Array.isArray(remote.es) &&
        remote.es.length > 0
      ) {
        poolsCache = remote;
      }
    }
  } catch {
    /* keep bundled */
  }

  return poolsCache;
}

export function preloadLiveCommentPools(): void {
  void loadLiveCommentPools();
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function shuffleCursor(length: number): number[] {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export class LiveCommentScheduler {
  private primary: CommentLocale;
  private en: string[];
  private es: string[];
  private enOrder: number[];
  private esOrder: number[];
  private enPtr = 0;
  private esPtr = 0;
  private tick = 0;

  constructor(pools: LiveCommentPools, primary: CommentLocale) {
    this.primary = primary;
    this.en = pools.en.length > 0 ? pools.en : BUNDLED.en;
    this.es = pools.es.length > 0 ? pools.es : BUNDLED.es;
    this.enOrder = shuffleCursor(this.en.length);
    this.esOrder = shuffleCursor(this.es.length);
  }

  next(): LiveCommentItem {
    this.tick += 1;
    const roll = Math.random();

    if (this.tick % 11 === 0 || roll < 0.06) {
      return this.makeSpecial("tip");
    }
    if (this.tick % 17 === 0 || roll > 0.94) {
      return this.makeSpecial("private");
    }

    const crossLang = Math.random() < 0.12;
    const locale: CommentLocale = crossLang
      ? this.primary === "en"
        ? "es"
        : "en"
      : this.primary;

    const body = locale === "es" ? this.nextEs() : this.nextEn();
    const user =
      locale === "es" ? pick(MASKED_USERS_ES) : pick(MASKED_USERS_EN);

    const badge = badgeForUser(user);
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      kind: "chat",
      locale,
      username: user,
      message: body,
      badgeColor: badge.badgeColor,
      badgeLabel: badge.badgeLabel,
    };
  }

  private nextEn(): string {
    if (this.en.length === 0) return "…";
    const idx = this.enOrder[this.enPtr % this.enOrder.length];
    this.enPtr += 1;
    return this.en[idx] ?? this.en[0];
  }

  private nextEs(): string {
    if (this.es.length === 0) return "…";
    const idx = this.esOrder[this.esPtr % this.esOrder.length];
    this.esPtr += 1;
    return this.es[idx] ?? this.es[0];
  }

  private makeSpecial(kind: "tip" | "private"): LiveCommentItem {
    const locale = this.primary;
    const user =
      locale === "es" ? pick(MASKED_USERS_ES) : pick(MASKED_USERS_EN);
    let snippet: string;
    if (kind === "tip") {
      snippet =
        locale === "es" ? pick(TIP_SNIPPETS_ES) : pick(TIP_SNIPPETS_EN);
    } else {
      snippet =
        locale === "es" ? pick(PRIVATE_CTA_ES) : pick(PRIVATE_CTA_EN);
    }
    const badge = badgeForUser(user);
    return {
      id: `${Date.now()}-${kind}-${Math.random().toString(36).slice(2, 8)}`,
      kind,
      locale,
      username: user,
      message: snippet,
      badgeColor: badge.badgeColor,
      badgeLabel: "★",
    };
  }
}
