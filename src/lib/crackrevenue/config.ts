export const CRACKREVENUE_TOKEN = process.env.CRACKREVENUE_TOKEN ?? "";

export const CRACKREVENUE_API_KEY = process.env.CRACKREVENUE_API_KEY ?? "";

export const CRACKREVENUE_USER_AGENT =
  process.env.CRACKREVENUE_USER_AGENT ??
  "NaughtyXxxCams/1.0 (+https://naughtyxxxcams.com)";

/** Dominio oficial de extensión (script de integración CrackRevenue). */
export const WIDGET_SCRIPT_BASE =
  process.env.CRACKREVENUE_WIDGET_SCRIPT_URL ??
  "https://widget-ext.crxcr2.com/script";

/** ID de landing del panel CrackRevenue (opcional; sustituye placeholder del script). */
export const CRACKREVENUE_LANDING_ID =
  process.env.CRACKREVENUE_LANDING_ID ?? "";

export const STREAMATE_BRAND = "streamate";

/** Tags documentados en performers-ext (API CrakRevenue). */
export const API_TAG_SLUGS = [
  "anal",
  "athletic",
  "bbw",
  "curvy",
  "dancing",
  "beautiful",
  "black hair",
  "blowjob",
  "bdsm",
  "bondage",
  "deepthroat",
  "dirty talk",
  "big ass",
  "big tits",
  "blond hair",
  "brown hair",
  "dominant",
  "findom",
  "femdom",
  "feet",
  "housewife",
  "kinky",
  "milf",
  "muscular",
  "hairy",
  "masturbation",
  "petite",
  "red hair",
  "skinny",
  "sex toy",
  "squirt",
  "striptease",
  "submissive",
  "tattoos",
] as const;

export const API_ETHNICITY_SLUGS = [
  "caucasian",
  "ebony",
  "hispanic",
  "asian",
  "indian",
  "arab",
  "native american",
] as const;

export const API_AGE_SLUGS = [
  "gc_18_19",
  "gc_20_29",
  "gc_30_39",
  "gc_40_49",
  "gc_50_plus",
] as const;
