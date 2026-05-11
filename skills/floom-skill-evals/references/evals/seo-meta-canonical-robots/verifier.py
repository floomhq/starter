#!/usr/bin/env python3
import json
import sys
from pathlib import Path


def norm(items):
    return sorted(items, key=lambda x: (x["id"], x["url"], x["details"]))


def main() -> int:
    output_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("output/result.json")
    expected_path = Path("expected.json")
    if not output_path.exists():
        print("FAIL: missing output/result.json")
        return 1
    actual = json.loads(output_path.read_text())
    expected = json.loads(expected_path.read_text())
    if "issues" not in actual or not isinstance(actual["issues"], list):
        print("FAIL: issues[] missing")
        return 1
    if norm(actual["issues"]) != norm(expected["issues"]):
        print("FAIL: issue set mismatch")
        return 1
    print("PASS")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
