#!/usr/bin/env python3
import json
import sys
from pathlib import Path


def main() -> int:
    expected_path = Path("expected.json")
    output_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("output/result.json")

    if not output_path.exists():
        print(f"FAIL: output missing at {output_path}")
        return 1

    expected = json.loads(expected_path.read_text(encoding="utf-8"))
    actual = json.loads(output_path.read_text(encoding="utf-8"))

    # Replace this with strict deterministic checks.
    passed = actual.get("status") == expected.get("status")

    if passed:
        print("PASS")
        return 0

    print("FAIL: status mismatch")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
