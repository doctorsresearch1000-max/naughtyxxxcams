export type TelegramLoginPrompt = {
  /** Short subtitle under the title (legacy callers may pass only this string). */
  reason?: string;
  title?: string;
  description?: string;
  edgeAttached?: boolean;
  ctaLabel?: string;
};

export function normalizeLoginPrompt(
  prompt: string | TelegramLoginPrompt,
): TelegramLoginPrompt {
  if (typeof prompt === "string") {
    return { reason: prompt };
  }
  return prompt;
}
