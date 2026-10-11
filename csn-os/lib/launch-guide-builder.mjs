import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DAY_HEADINGS } from "../launch-guide/guide-context.mjs";
import { renderDay01 } from "../launch-guide/days/day-01.mjs";
import { renderDay02 } from "../launch-guide/days/day-02.mjs";
import { renderDay03 } from "../launch-guide/days/day-03.mjs";
import { renderDay04 } from "../launch-guide/days/day-04.mjs";
import { renderDay05 } from "../launch-guide/days/day-05.mjs";
import { renderDay06 } from "../launch-guide/days/day-06.mjs";
import { renderDay07 } from "../launch-guide/days/day-07.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const RENDERERS = [renderDay01, renderDay02, renderDay03, renderDay04, renderDay05, renderDay06, renderDay07];

/** Metadatos para panel Notion (sincronizador usa pageTitle). */
export const DAY_PLAN = DAY_HEADINGS.map((h) => ({
  day: h.day,
  title: h.short,
  pageTitle: `Guía 7 días — Día ${h.day} — ${h.short}`,
  tagline: h.tagline,
  outcome: h.tagline,
}));

export function buildDayMarkdown(dayConfig) {
  const renderer = RENDERERS[dayConfig.day - 1];
  if (!renderer) throw new Error(`No renderer for day ${dayConfig.day}`);
  return renderer();
}

export function buildAllDays(outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const index = [];
  for (const d of DAY_PLAN) {
    const md = buildDayMarkdown(d);
    const file = `dia-${String(d.day).padStart(2, "0")}.md`;
    fs.writeFileSync(path.join(outDir, file), md);
    index.push({ day: d.day, title: d.title, pageTitle: d.pageTitle, file });
  }
  fs.writeFileSync(
    path.join(outDir, "index.json"),
    JSON.stringify(
      {
        days: index,
        version: "pseo-v2-notion-rich",
        generatedFrom: ["csn-os/launch-guide/days/*", "scripts/csn-task-manifest-v2.json", "notion-csn-isolated-manifest.json"],
      },
      null,
      2,
    ),
  );
  return index;
}
