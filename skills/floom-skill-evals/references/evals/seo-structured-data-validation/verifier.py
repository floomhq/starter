#!/usr/bin/env python3
import json
import sys
from pathlib import Path


def norm(items):
    return sorted(items, key=lambda x: (x["id"], x["url"], x["details"]))


def main() -> int:
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("output/result.json")
    exp = Path("expected.json")
    if not out.exists():
        print("FAIL: missing output/result.json")
        return 1
    actual = json.loads(out.read_text())
    expected = json.loads(exp.read_text())
    if "violations" not in actual or not isinstance(actual["violations"], list):
        print("FAIL: violations[] missing")
        return 1
    if norm(actual["violations"]) != norm(expected["violations"]):
        print("FAIL: violation set mismatch")
        return 1
    print("PASS")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
