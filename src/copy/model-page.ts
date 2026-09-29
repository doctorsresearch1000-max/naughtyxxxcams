/**
 * Model page copy templates (SEO + conversion).
 * URLs unchanged — content generation only.
 */

export const affiliateClaims = {
  verifiedProfile: "Verified profile",
  /** Only surface when affiliate program terms allow. */
  freeToWatch: null as string | null,
  noSignup: null as string | null,
} as const;

export const modelPageFaqBank = [
  {
    id: "live-now",
    q: (name: string) => `Is ${name} live right now?`,
    a: (name: string, live: boolean) =>
      live
        ? `Yes — ${name} is broadcasting live. Tap “Watch live” to open the official room.`
        : `${name} is offline. Save the profile to check back later.`,
  },
  {
    id: "language",
    q: (name: string) => `What language does ${name} speak?`,
    a: (_name: string, _live: boolean, language?: string) =>
      language
        ? `Chat is available in ${language}.`
        : "Language details are shown on the profile when provided by the broadcaster.",
  },
  {
    id: "country",
    q: (name: string) => `Where is ${name} from?`,
    a: (_name: string, _live: boolean, _lang?: string, country?: string) =>
      country ? `Profile lists ${country} as the broadcaster region.` : "Region is listed on the profile when available.",
  },
  {
    id: "private",
    q: (name: string) => `How do I go private with ${name}?`,
    a: (name: string) =>
      `Open ${name}'s live room via the primary button — private options are inside the official player.`,
  },
] as const;

export const introTemplateVariants = [
  (name: string, language: string, country: string, live: boolean) =>
    `${name} streams live in ${language}${country ? ` (${country})` : ""}. ${live ? "Join the public show in one tap." : "Save the profile to catch the next session."}`,
  (name: string, language: string, _country: string, live: boolean) =>
    `Watch ${name} on cam — ${language} chat${live ? " available now" : " when she's online"}.`,
  (name: string, _language: string, country: string, live: boolean) =>
    `${name}${country ? ` from ${country}` : ""} — ${live ? "live HD preview on this page" : "offline; notifications coming soon"}.`,
] as const;
