#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";
import { applyLegacyOpsFix2 } from "../csn-os/lib/legacy-ops-fix2.mjs";
import { snapshotLegacyDescriptions } from "../csn-os/lib/legacy-ops-centralize.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const dryRun = process.argv.includes("--dry-run");

async function main() {
  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const descriptionsBefore = await snapshotLegacyDescriptions(notion);
  const result = await applyLegacyOpsFix2(notion, { dryRun });
  const descriptionsAfter = dryRun ? descriptionsBefore : await snapshotLegacyDescriptions(notion);

  const out = {
    ...result,
    descriptionsUnchanged: JSON.stringify(descriptionsBefore) === JSON.stringify(descriptionsAfter),
    specializedRowCountsUnchanged:
      result.countsBefore.hub === result.countsAfter.hub &&
      result.countsBefore.issues === result.countsAfter.issues &&
      result.countsBefore.deploy === result.countsAfter.deploy &&
      result.countsBefore.routine === result.countsAfter.routine &&
      result.countsBefore.kv === result.countsAfter.kv &&
      result.countsBefore.kpi1 === result.countsAfter.kpi1 &&
      result.countsBefore.kpi2 === result.countsAfter.kpi2,
  };

  const outJson = path.join(__dirname, "../docs/csn-legacy-ops-fix2-applied.json");
  fs.writeFileSync(outJson, JSON.stringify(out, null, 2));

  const ok =
    out.descriptionsUnchanged &&
    out.specializedRowCountsUnchanged &&
    out.verification.defaultViewPreserved;

  console.log(
    JSON.stringify(
      {
        outJson,
        dryRun,
        opsRowDelta: out.opsRowDelta,
        created: out.linked.created.length,
        descriptionsUnchanged: out.descriptionsUnchanged,
        defaultViewPreserved: out.verification.defaultViewPreserved,
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
