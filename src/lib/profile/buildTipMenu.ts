import type { CrackPerformer } from "@/lib/crackrevenue/api";

export type TipMenuItem = {
  id: string;
  label: string;
  tokens: number;
  highlight?: boolean;
};

const BASE_MENU: Omit<TipMenuItem, "id">[] = [
  { label: "Wave hello", tokens: 5 },
  { label: "PM access (5 min)", tokens: 45 },
  { label: "Toy buzz — low", tokens: 25, highlight: true },
  { label: "Toy buzz — high", tokens: 75, highlight: true },
  { label: "Outfit change", tokens: 120 },
  { label: "Custom fantasy roleplay", tokens: 250 },
  { label: "Private flash", tokens: 180 },
  { label: "Control toy 3 min", tokens: 200, highlight: true },
];

function seedFromPerformer(performer?: CrackPerformer | null): number {
  const key =
    performer?.itemId ||
    performer?.nameClean ||
    performer?.name ||
    "menu";
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function buildTipMenu(
  performer?: CrackPerformer | null,
): TipMenuItem[] {
  const seed = seedFromPerformer(performer);
  const tags = [
    ...(performer?.autoTags ?? []),
    ...(performer?.characteristicsTags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  const hasToy =
    tags.includes("toy") ||
    tags.includes("interactive") ||
    tags.includes("lovense");

  return BASE_MENU
    .filter((item) => {
      if (!item.highlight) return true;
      return hasToy;
    })
    .map((item, index) => ({
      ...item,
      id: `tip-${index}`,
      tokens: item.tokens + (seed % 7) * 2,
    }));
}
