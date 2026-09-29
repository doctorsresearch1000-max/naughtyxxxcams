#!/usr/bin/env node
/**
 * CI guard: Jerkmate assets must exist, stay off the blocklist, and not look like
 * portrait phone screenshots (common accidental error-page captures).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public", "ads", "jerkmate");
const creativesTs = path.join(
  root,
  "src",
  "lib",
  "ads",
  "jerkmateGridCreatives.ts",
);
const bannerTs = path.join(
  root,
  "src",
  "lib",
  "ads",
  "jerkmateNaturalBannerCreatives.ts",
);
const policyTs = path.join(root, "src", "lib", "ads", "jerkmateCreativePolicy.ts");

const BLOCKED = new Set([
  "65e41014-5b2d-4c35-9475-b1d1d38016bd",
]);

function extractPaths(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const arrayMatch = text.match(
    /JERKMATE_(?:GRID_CREATIVE_PATHS_RAW|NATURAL_BANNER_PATHS)[^[]*\[([\s\S]*?)\]\s*as const/,
  );
  const block = arrayMatch ? arrayMatch[1] : text;
  const matches = block.matchAll(/"(\/ads\/jerkmate\/[^"]+)"/g);
  return [...matches].map((m) => m[1]);
}

function idFromPath(p) {
  return path.basename(p).replace(/\.(jpe?g|gif|webp|png)$/i, "");
}

/** Reject tall phone-style frames (error UI screenshots). */
function assertAspectOk(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.length < 12) return;

  // JPEG SOF0
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 8) {
      if (buf[i] !== 0xff) break;
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      if (marker === 0xc0 || marker === 0xc2) {
        const height = buf.readUInt16BE(i + 5);
        const width = buf.readUInt16BE(i + 7);
        if (width > 0 && height / width > 1.35) {
          throw new Error(
            `${filePath}: portrait aspect ${width}x${height} — likely a UI screenshot, not ad art`,
          );
        }
        return;
      }
      i += 2 + len;
    }
  }

  // GIF header
  if (buf.toString("ascii", 0, 3) === "GIF") {
    const width = buf.readUInt16LE(6);
    const height = buf.readUInt16LE(8);
    if (width > 0 && height / width > 1.35) {
      throw new Error(
        `${filePath}: portrait GIF ${width}x${height} — rejected`,
      );
    }
  }
}

function verifyList(label, paths) {
  const seen = new Set();
  for (const rel of paths) {
    if (seen.has(rel)) {
      throw new Error(`${label}: duplicate path ${rel}`);
    }
    seen.add(rel);

    const id = idFromPath(rel);
    if (BLOCKED.has(id)) {
      throw new Error(`${label}: blocked creative ${id}`);
    }

    const abs = path.join(root, "public", rel.replace(/^\//, ""));
    if (!fs.existsSync(abs)) {
      throw new Error(`${label}: missing file ${rel}`);
    }
    assertAspectOk(abs);
  }
}

function main() {
  if (!fs.existsSync(policyTs)) {
    throw new Error("Missing jerkmateCreativePolicy.ts");
  }

  const gridPaths = extractPaths(creativesTs);
  const bannerPaths = extractPaths(bannerTs);

  if (gridPaths.length < 4) {
    throw new Error("Expected at least 4 in-grid Jerkmate creatives");
  }

  for (const rel of gridPaths) {
    const abs = path.join(root, "public", rel.replace(/^\//, ""));
    const buf = fs.readFileSync(abs);
    const isGif = rel.toLowerCase().endsWith(".gif");
    const maxBytes = isGif ? 250_000 : 80_000;
    if (buf.length > maxBytes) {
      throw new Error(
        `${rel}: ${buf.length} bytes — exceeds in-grid limit ${maxBytes}`,
      );
    }
  }

  verifyList("grid", gridPaths);
  verifyList("banner", bannerPaths);

  const onDisk = fs
    .readdirSync(publicDir)
    .filter((f) => /\.(jpe?g|gif|webp|png)$/i.test(f));

  for (const file of onDisk) {
    const id = idFromPath(file);
    if (BLOCKED.has(id)) {
      throw new Error(`Blocked file still on disk: ${file}`);
    }
  }

  console.log(
    `verify-jerkmate-creatives: OK (${gridPaths.length} grid, ${bannerPaths.length} banner)`,
  );
}

main();
