#!/usr/bin/env python3
"""Validate profile SEO pools (45 competitive gaps + FAQ pool file presence)."""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
GAPS_FILE = ROOT / "scripts" / "pool-data" / "profile-competitive-gaps.txt"
FAQ_TS = ROOT / "src" / "lib" / "profile" / "profileFaq.ts"


def main() -> int:
    gaps = [
        line.strip()
        for line in GAPS_FILE.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    if len(gaps) != 45:
        print(f"Expected 45 competitive gaps, found {len(gaps)}", file=sys.stderr)
        return 1

    faq_src = FAQ_TS.read_text(encoding="utf-8")
    questions = re.findall(r'"([^"]+\{handle\}[^"]*)"', faq_src)
    if len(questions) < 12:
        print(
            f"FAQ question pool looks small ({len(questions)} templates)",
            file=sys.stderr,
        )
        return 1

    print(f"OK: {len(gaps)} competitive gaps, {len(questions)} FAQ templates")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
