#!/usr/bin/env node
/**
 * Indexing policy checks for GSC hygiene (run in CI via npm run test:seo).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const middleware = read("src/middleware.ts");
if (!middleware.includes("isLegacyRootSpamPath") || !middleware.includes("410")) {
  console.error("FAIL: middleware must return 410 for legacy root spam paths");
  process.exit(1);
}

const categoryPage = read("src/app/category/[slug]/page.tsx");
if (categoryPage.includes('target?.startsWith("/explore?")') &&
    categoryPage.includes("redirect(target)")) {
  console.error("FAIL: /category must not redirect junk slugs to /explore?cat=");
  process.exit(1);
}

const explorePage = read("src/app/explore/page.tsx");
if (!explorePage.includes("permanentRedirect(\"/explore\")")) {
  console.error("FAIL: explore must strip invalid ?cat= via redirect");
  process.exit(1);
}

const notFound = read("src/app/not-found.tsx");
if (!notFound.includes("NOT_FOUND_PAGE_METADATA")) {
  console.error("FAIL: global not-found must export explicit noindex metadata");
  process.exit(1);
}

console.log("OK: indexing policy guards passed");
