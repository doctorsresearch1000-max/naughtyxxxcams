import type { CommentLocale } from "@/lib/engagement/streamCommentLocale";

export type LiveCommentKind = "chat" | "tip" | "private";

export type LiveCommentItem = {
  id: string;
  text: string;
  kind: LiveCommentKind;
  locale: CommentLocale;
};

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

let poolsCache: LiveCommentPools | null = null;

export async function loadLiveCommentPools(): Promise<LiveCommentPools> {
  if (poolsCache) return poolsCache;
  const res = await fetch("/data/live-comment-pools.json", { cache: "force-cache" });
  if (!res.ok) throw new Error("comment pools unavailable");
  poolsCache = (await res.json()) as LiveCommentPools;
  return poolsCache;
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
    this.en = pools.en;
    this.es = pools.es;
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
    const locale: CommentLocale =
      crossLang
        ? this.primary === "en"
          ? "es"
          : "en"
        : this.primary;

    const body = locale === "es" ? this.nextEs() : this.nextEn();
    const user = locale === "es" ? pick(MASKED_USERS_ES) : pick(MASKED_USERS_EN);

    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      kind: "chat",
      locale,
      text: `${user}: ${body}`,
    };
  }

  private nextEn(): string {
    const idx = this.enOrder[this.enPtr % this.enOrder.length];
    this.enPtr += 1;
    return this.en[idx] ?? this.en[0] ?? "…";
  }

  private nextEs(): string {
    const idx = this.esOrder[this.esPtr % this.esOrder.length];
    this.esPtr += 1;
    return this.es[idx] ?? this.es[0] ?? "…";
  }

  private makeSpecial(kind: "tip" | "private"): LiveCommentItem {
    const locale = this.primary;
    const user = locale === "es" ? pick(MASKED_USERS_ES) : pick(MASKED_USERS_EN);
    let snippet: string;
    if (kind === "tip") {
      snippet = locale === "es" ? pick(TIP_SNIPPETS_ES) : pick(TIP_SNIPPETS_EN);
    } else {
      snippet = locale === "es" ? pick(PRIVATE_CTA_ES) : pick(PRIVATE_CTA_EN);
    }
    return {
      id: `${Date.now()}-${kind}-${Math.random().toString(36).slice(2, 8)}`,
      kind,
      locale,
      text: `${user} ${snippet}`,
    };
  }
}
