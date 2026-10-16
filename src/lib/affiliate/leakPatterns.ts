/** Host / URL fragments that must never appear in public HTML, RSC, or JSON APIs. */
export const AFFILIATE_LEAK_HOST_PATTERNS: RegExp[] = [
  /ajrkmx\d*\.com/i,
  /(?:^|\/\/)(?:[\w-]+\.)*crakrevenue\.com/i,
  /camsk7\.com/i,
  /t\.camsk7/i,
  /jerkmate\.com/i,
  /crxcr2\.com/i,
];

export function textContainsAffiliateLeak(text: string): string | null {
  for (const re of AFFILIATE_LEAK_HOST_PATTERNS) {
    re.lastIndex = 0;
    const m = re.exec(text);
    if (m) return m[0];
  }
  return null;
}
