#!/usr/bin/env python3
"""Regenerate public/data/live-comment-pools.json from embedded spec strings."""
import json
import pathlib
import textwrap

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "data" / "live-comment-pools.json"

# Pools are maintained in this script to match the product comment spec.
# Run: python3 scripts/build_comment_pools.py

def load_lines(block: str) -> list[str]:
    return [line.strip() for line in textwrap.dedent(block).strip().splitlines() if line.strip()]

# NOTE: Full EN/ES pools are generated in-repo; extend blocks when updating copy.
EN_BLOCK = open(ROOT / "scripts" / "pool-data" / "en-lines.txt", encoding="utf-8").read()
ES_BLOCK = open(ROOT / "scripts" / "pool-data" / "es-lines.txt", encoding="utf-8").read()

def main() -> None:
    en = load_lines(EN_BLOCK)
    es = load_lines(ES_BLOCK)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps({"en": en, "es": es}, ensure_ascii=False)
    OUT.write_text(payload, encoding="utf-8")
    src_out = ROOT / "src" / "data" / "live-comment-pools.json"
    src_out.write_text(payload, encoding="utf-8")
    print(f"Wrote {len(en)} EN / {len(es)} ES -> {OUT} and {src_out}")

if __name__ == "__main__":
    main()
