import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { buildFollowersLabel } from "@/lib/profile/profilePresentation";

/** Single follower count source for profile (heart + chips). */
export function profileFollowersLabel(
  performer: CrackPerformer | undefined,
  fallbackLabel: string,
): string {
  if (performer) return buildFollowersLabel(performer);
  return fallbackLabel;
}
