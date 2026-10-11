export function parseFrontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { meta: {}, body: md };
  const meta = {};
  for (const line of m[1].split("\n")) {
    if (line.startsWith("  - ")) {
      const key = "standards";
      meta[key] = meta[key] || [];
      meta[key].push(line.slice(4).trim());
      continue;
    }
    const kv = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    const [, k, v] = kv;
    if (v === "") continue;
    meta[k] = v;
  }
  return { meta, body: m[2] };
}

export function fillTemplate(template, vars) {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{{${k}}}`).join(v ?? "");
  }
  return out;
}
