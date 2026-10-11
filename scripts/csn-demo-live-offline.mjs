#!/usr/bin/env node
/** Demo LIVE/OFFLINE — usa el hub y publicación genérica (csn:sync-hub). */
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "csn-sync-hub.mjs");
const r = spawn("node", [script], { stdio: "inherit" });
r.on("close", (c) => process.exit(c ?? 0));
