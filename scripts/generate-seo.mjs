#!/usr/bin/env node
/**
 * Build-time SEO injection — keeps crawlers on static HTML (no client-side title hacks).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seo = JSON.parse(readFileSync(join(root, "config/seo.json"), "utf8"));
const templatePath = join(root, "public/index.template.html");
const outPath = join(root, "public/index.html");

const canonical = seo.domain.replace(/\/$/, "") + "/";
const ogImage = seo.ogImage.startsWith("http")
  ? seo.ogImage
  : seo.domain.replace(/\/$/, "") + seo.ogImage;

let html = readFileSync(templatePath, "utf8");

const vars = {
  ...seo,
  canonical,
  ogImage,
  year: String(new Date().getFullYear()),
};

for (const [key, value] of Object.entries(vars)) {
  html = html.replaceAll(`{{${key}}}`, String(value));
}

writeFileSync(outPath, html, "utf8");
console.log("✓ public/index.html generated from config/seo.json");
