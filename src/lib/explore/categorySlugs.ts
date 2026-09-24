export type CategoryApiFilter = {
  tags?: string;
  ethnicities?: string;
  ages?: string;
};

export const EXPLORE_CATEGORY_SLUGS = [
  "latinas",
  "verified",
  "milf",
  "petite",
  "cosplay",
  "couples",
  "trans",
  "alt",
] as const;

export type ExploreCategorySlug = (typeof EXPLORE_CATEGORY_SLUGS)[number];

export type ExploreCategoryConfig = {
  slug: ExploreCategorySlug;
  label: string;
  headline: string;
  seoTitle: string;
  seoDescription: string;
  api: CategoryApiFilter;
  /** Filtro adicional en cliente sobre tags del performer. */
  clientMatch?: string[];
};

export const EXPLORE_CATEGORY_MAP: Record<ExploreCategorySlug, ExploreCategoryConfig> =
  {
    latinas: {
      slug: "latinas",
      label: "Latinas",
      headline: "Modelos Latinas en vivo",
      seoTitle: "Cams Latinas en Vivo — Modelos Hispanic Streamate | NaughtyXXXCams",
      seoDescription:
        "Explora modelos latinas en HD verificadas en Streamate. Filtra por categoría, entra a salas en vivo y guarda tus favoritas en NaughtyXXXCams.",
      api: { ethnicities: "hispanic" },
    },
    verified: {
      slug: "verified",
      label: "18+ Verificadas",
      headline: "Chicas 18+ verificadas",
      seoTitle: "Chicas 18+ Verificadas en Vivo — Webcams HD | NaughtyXXXCams",
      seoDescription:
        "Directorio de modelos adultas verificadas mayores de 18 años. Transmisiones en vivo, perfiles oficiales y alertas cuando tu favorita conecta.",
      api: {},
      clientMatch: ["gc_18_19", "gc_20_29", "young", "verified"],
    },
    milf: {
      slug: "milf",
      label: "MILF",
      headline: "Cams MILF y maduras",
      seoTitle: "Cams MILF & Maduras en Vivo — Streamate HD | NaughtyXXXCams",
      seoDescription:
        "Las mejores MILF y modelos maduras en transmisión en vivo. Chat, shows privados y perfiles SEO con galería y traits.",
      api: { tags: "milf" },
    },
    petite: {
      slug: "petite",
      label: "Petite",
      headline: "Modelos Petite & E-girls",
      seoTitle: "Modelos Petite en Vivo — E-girls Streamate | NaughtyXXXCams",
      seoDescription:
        "Descubre modelos petite y e-girls en cámara HD. Scroll rápido, perfiles únicos y enlaces directos a salas en vivo.",
      api: { tags: "petite" },
      clientMatch: ["skinny", "petite"],
    },
    cosplay: {
      slug: "cosplay",
      label: "Cosplay",
      headline: "Streamers Cosplay",
      seoTitle: "Cams Cosplay en Vivo — Roleplay & Fantasy | NaughtyXXXCams",
      seoDescription:
        "Modelos con estética cosplay, disfraces y roleplay en vivo. Filtra por categoría y entra al chat en segundos.",
      api: { tags: "dancing" },
      clientMatch: ["cosplay", "costume", "roleplay", "anime"],
    },
    couples: {
      slug: "couples",
      label: "Parejas",
      headline: "Cams en pareja",
      seoTitle: "Cams en Pareja en Vivo — Shows a Dúo | NaughtyXXXCams",
      seoDescription:
        "Parejas y dúos en transmisión en vivo. Explora shows compartidos, chat interactivo y perfiles verificados.",
      api: { tags: "kinky" },
      clientMatch: ["couple", "couples", "duo", "pair"],
    },
    trans: {
      slug: "trans",
      label: "Trans",
      headline: "Modelos Trans",
      seoTitle: "Modelos Trans en Vivo — Webcams HD | NaughtyXXXCams",
      seoDescription:
        "Descubre modelos trans en vivo con perfiles estructurados, tags y enlaces a salas autorizadas de la red Streamate.",
      api: { tags: "beautiful" },
      clientMatch: ["trans", "tgirl", "ts"],
    },
    alt: {
      slug: "alt",
      label: "Alt & Goth",
      headline: "Modelos Alt & Goth",
      seoTitle: "Modelos Alt & Goth en Vivo — Tattoo & Kinky | NaughtyXXXCams",
      seoDescription:
        "Estética alternativa, goth, tatuajes y vibes kinky en cámara. Filtra modelos alt y entra al vivo al instante.",
      api: { tags: "tattoos" },
      clientMatch: ["goth", "alt", "tattoo", "piercing", "emo"],
    },
  };

const SLUG_SET = new Set<string>(EXPLORE_CATEGORY_SLUGS);

export function isExploreCategorySlug(
  value: string | undefined | null,
): value is ExploreCategorySlug {
  if (!value) return false;
  return SLUG_SET.has(value.toLowerCase());
}

export function resolveExploreCategory(
  catParam?: string | null,
): ExploreCategoryConfig | null {
  if (!catParam) return null;
  const key = catParam.toLowerCase();
  if (!isExploreCategorySlug(key)) return null;
  return EXPLORE_CATEGORY_MAP[key];
}

export function getDefaultExploreSeo() {
  return {
    title: "Explorar Modelos en Vivo — Streamate HD | NaughtyXXXCams",
    description:
      "Descubre modelos en tendencia, filtra por categoría y accede a transmisiones en vivo optimizadas para móvil en NaughtyXXXCams.",
    headline: "Descubrir",
    subline: "Encuentra salas según tu categoría preferida",
  };
}
