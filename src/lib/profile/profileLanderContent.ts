import { PROFILE_COMPETITIVE_GAP_KEYWORDS } from "@/lib/profile/profileCompetitiveGaps";
import { stableVariantIndex } from "@/lib/seo/seoVariants";

type LanderVars = {
  name: string;
  handle: string;
  ethnicity: string;
  language: string;
  bodyType: string;
  liveWord: string;
};

function atHandle(handle: string): string {
  const clean = handle.trim().replace(/^@+/, "");
  return clean ? `@${clean}` : "@model";
}

function rotateKeywords(seed: string): string[] {
  const offset = stableVariantIndex(`${seed}-gap-rot`, PROFILE_COMPETITIVE_GAP_KEYWORDS.length);
  return PROFILE_COMPETITIVE_GAP_KEYWORDS.map(
    (_, i) =>
      PROFILE_COMPETITIVE_GAP_KEYWORDS[
        (i + offset) % PROFILE_COMPETITIVE_GAP_KEYWORDS.length
      ],
  );
}

function chunkKeywords(keywords: string[], chunks: number): string[][] {
  const size = Math.ceil(keywords.length / chunks);
  const out: string[][] = [];
  for (let i = 0; i < chunks; i += 1) {
    out.push(keywords.slice(i * size, (i + 1) * size));
  }
  return out;
}

function phraseList(chunk: string[], max = 4): string {
  return chunk.slice(0, max).join(", ");
}

export function buildProfileLanderH1(vars: LanderVars): string {
  const handle = atHandle(vars.handle);
  const live = vars.liveWord.includes("live");
  if (live) {
    return `${vars.name} (${handle}) — live HD cam, public chat & gallery`;
  }
  return `${vars.name} (${handle}) — Telegram gallery, photos & cam HD`;
}

export function buildProfileLanderParagraphs(
  seed: string,
  vars: LanderVars,
): string[] {
  const handle = atHandle(vars.handle);
  const rotated = rotateKeywords(seed);
  const chunks = chunkKeywords(rotated, 5);

  return [
    `${vars.name} (${handle}) is a ${vars.ethnicity} ${vars.bodyType} performer (${vars.liveWord}) on NaughtyXXXCams. This lander helps you compare intent phrases like ${phraseList(chunks[0])} while keeping a single trusted outbound room link.`,
    `Instead of bouncing across directories, ${handle} consolidates discovery for ${phraseList(chunks[1])} with trait-tagged context, mobile HD preview, and ${vars.language} chat readiness when ${vars.name} is online.`,
    `Readers searching ${phraseList(chunks[2])} can still evaluate ${vars.name} through verified gallery media, public show entry, and save-to-favorites — without stuffing unrelated brand names into one block.`,
    `Long-tail coverage includes ${phraseList(chunks[3])}; the profile explains how ${handle} maps to authorized Streamate access rather than anonymous roulette funnels.`,
    `For similar queries such as ${phraseList(chunks[4])}, use this permalink to return to ${vars.name} (${handle}), explore related models, and jump into live video chat when the LIVE badge is active.`,
  ];
}
