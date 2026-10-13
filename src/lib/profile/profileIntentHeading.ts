import type { ProfileIntentRoute } from "@/lib/seo/model-profile-metadata";

export function parseProfileIntentFromPathname(
  pathname: string,
): ProfileIntentRoute | null {
  const match = pathname.match(/^\/profile\/[^/]+\/(vip|leaks)\/?$/i);
  if (!match) return null;
  const intent = match[1].toLowerCase();
  return intent === "vip" || intent === "leaks" ? intent : null;
}

export function buildProfileIntentPageH1(
  intent: ProfileIntentRoute,
  modelName: string,
): string {
  const name = modelName.trim() || "Model";
  if (intent === "vip") {
    return `VIP private access — ${name}`;
  }
  return `Exclusive media hub — ${name}`;
}
