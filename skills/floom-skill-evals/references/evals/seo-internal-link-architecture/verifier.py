#!/usr/bin/env python3
import json
import sys
from pathlib import Path


def main() -> int:
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("output/result.json")
    exp = Path("expected.json")
    if not out.exists():
        print("FAIL: missing output/result.json")
        return 1
    actual = json.loads(out.read_text())
    expected = json.loads(exp.read_text())
    if sorted(actual.get("orphan_pages", [])) != sorted(expected["orphan_pages"]):
        print("FAIL: orphan pages mismatch")
        return 1
    if sorted(actual.get("broken_links", []), key=lambda x: (x["source"], x["target"])) != sorted(expected["broken_links"], key=lambda x: (x["source"], x["target"])):
        print("FAIL: broken links mismatch")
        return 1
    if int(actual.get("max_click_depth", -1)) != int(expected["max_click_depth"]):
        print("FAIL: max_click_depth mismatch")
        return 1
    print("PASS")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
