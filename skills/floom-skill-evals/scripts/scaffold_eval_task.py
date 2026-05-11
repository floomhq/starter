#!/usr/bin/env python3
import argparse
import json
from pathlib import Path


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Scaffold a Floom skill eval task")
    parser.add_argument("--skill", required=True, help="Skill slug, e.g. seo-audit")
    parser.add_argument("--task", required=True, help="Task slug, e.g. technical-homepage-audit")
    parser.add_argument("--out", required=True, help="Output directory for eval tasks")
    parser.add_argument("--agent", default="codex", help="Default agent id")
    parser.add_argument("--trials", type=int, default=3, help="Trials per condition")
    parser.add_argument("--timeout-minutes", type=int, default=10)
    args = parser.parse_args()

    task_dir = Path(args.out).expanduser().resolve() / args.task
    task_dir.mkdir(parents=True, exist_ok=True)
    (task_dir / "input").mkdir(exist_ok=True)

    task_md = """# Task

Fill in the exact instruction the agent receives.

Constraints:
- Agent must write JSON output to the path provided by `{output_path}`.
- Keep task deterministic and verifier-friendly.
"""

    expected = {
        "status": "replace-this",
        "notes": "Define exact oracle values used by verifier.py",
    }

    verifier_py = """#!/usr/bin/env python3
import json
import sys
from pathlib import Path


def main() -> int:
    expected_path = Path("expected.json")
    output_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("output/result.json")

    if not output_path.exists():
        print(f"FAIL: output missing at {output_path}")
        return 1

    expected = json.loads(expected_path.read_text(encoding=\"utf-8\"))
    actual = json.loads(output_path.read_text(encoding=\"utf-8\"))

    # Replace this with strict deterministic checks.
    passed = actual.get("status") == expected.get("status")

    if passed:
        print("PASS")
        return 0

    print("FAIL: status mismatch")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
"""

    eval_json = {
        "schema_version": "0.1.0",
        "id": f"{args.skill}.{args.task}",
        "skill": args.skill,
        "task": args.task,
        "timeout_minutes": args.timeout_minutes,
        "conditions": ["baseline", "with_skill"],
        "trials": args.trials,
        "agent": args.agent,
        "model": "",
        "expected_output": "output/result.json",
        "verifier": "python3 verifier.py output/result.json",
        "agent_command": {
            "baseline": "echo '{\"status\": \"replace-this\"}' > {output_path}",
            "with_skill": "echo '{\"status\": \"replace-this\"}' > {output_path}",
        },
    }

    write_text(task_dir / "task.md", task_md)
    write_text(task_dir / "expected.json", json.dumps(expected, indent=2) + "\n")
    write_text(task_dir / "verifier.py", verifier_py)
    write_text(task_dir / "eval.json", json.dumps(eval_json, indent=2) + "\n")

    print(f"Scaffolded eval task: {task_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
