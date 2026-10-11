#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";
import { applyLegacyOpsCentralization } from "../csn-os/lib/legacy-ops-centralize.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const dryRun = process.argv.includes("--dry-run");

async function main() {
  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const result = await applyLegacyOpsCentralization(notion, { dryRun });

  const outJson = path.join(__dirname, "../docs/csn-legacy-ops-centralization-applied.json");
  fs.writeFileSync(outJson, JSON.stringify(result, null, 2));

  const ok = result.legacyIntegrityOk && result.descriptionsUnchanged;
  console.log(
    JSON.stringify(
      {
        outJson,
        dryRun,
        legacyIntegrityOk: result.legacyIntegrityOk,
        descriptionsUnchanged: result.descriptionsUnchanged,
        viewKeys: Object.keys(result.viewResults),
      },
      null,
      2,
    ),
  );
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e.body?.message || e.message || e);
  process.exit(1);
});
