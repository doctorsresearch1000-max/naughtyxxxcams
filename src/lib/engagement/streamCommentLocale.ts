import type { FeedPerformer } from "@/lib/feed/filterPerformers";

export type CommentLocale = "en" | "es";

const SPANISH_MARKERS = [
  "spanish",
  "español",
  "espanol",
  "latina",
  "latin",
  "mexican",
  "colombian",
  "argent",
  "venezuel",
  "cuban",
  "chile",
  "peruvian",
  "spain",
  "castellano",
];

export function detectStreamCommentLocale(
  performer: FeedPerformer,
): CommentLocale {
  const langs = performer.characteristic?.languages ?? [];
  const langBlob = langs.join(" ").toLowerCase();
  if (SPANISH_MARKERS.some((m) => langBlob.includes(m))) return "es";

  const tags = [
    ...(performer.characteristic?.ethnicities ?? []),
    performer.characteristic?.country ?? "",
    performer.name ?? "",
  ]
    .join(" ")
    .toLowerCase();

  if (SPANISH_MARKERS.some((m) => tags.includes(m))) return "es";

  const primary = langs[0]?.toLowerCase() ?? "";
  if (primary.startsWith("es") || primary.includes("span")) return "es";

  return "en";
}
