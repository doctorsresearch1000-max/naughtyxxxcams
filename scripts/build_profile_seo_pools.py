#!/usr/bin/env python3
"""Validate profile SEO pools and sync FAQ JSON into src/data."""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
GAPS_FILE = ROOT / "scripts" / "pool-data" / "profile-competitive-gaps.txt"
FAQ_SOURCE = ROOT / "scripts" / "pool-data" / "profile-faq-pool.json"
FAQ_DEST = ROOT / "src" / "data" / "profile-faq-pool.json"

BANNED = re.compile(
    r"\b(permalink|metadata|json-ld|discovery hub|https protocol|sitemap|canonical slug|outbound link)\b",
    re.I,
)


def main() -> int:
    gaps = [
        line.strip()
        for line in GAPS_FILE.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    if len(gaps) != 45:
        print(f"Expected 45 competitive gaps, found {len(gaps)}", file=sys.stderr)
        return 1

    faq_entries = json.loads(FAQ_SOURCE.read_text(encoding="utf-8"))
    if not isinstance(faq_entries, list) or len(faq_entries) < 12:
        print("FAQ pool must be a JSON array with at least 12 entries", file=sys.stderr)
        return 1

    ids: set[str] = set()
    for entry in faq_entries:
        if not entry.get("id") or not entry.get("question") or not entry.get("answer"):
            print(f"Invalid FAQ entry: {entry}", file=sys.stderr)
            return 1
        if entry["id"] in ids:
            print(f"Duplicate FAQ id: {entry['id']}", file=sys.stderr)
            return 1
        ids.add(entry["id"])
        blob = f"{entry['question']} {entry['answer']}"
        if BANNED.search(blob):
            print(f"Banned jargon in FAQ {entry['id']}", file=sys.stderr)
            return 1
        if "@{handle}" not in entry["question"] and "@{handle}" not in entry["answer"]:
            print(f"FAQ {entry['id']} must include @{{handle}} token", file=sys.stderr)
            return 1

    FAQ_DEST.write_text(
        json.dumps(faq_entries, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(
        f"OK: {len(gaps)} competitive gaps, {len(faq_entries)} FAQ entries -> {FAQ_DEST.name}",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
