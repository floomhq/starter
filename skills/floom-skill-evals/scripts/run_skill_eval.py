#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import subprocess
import textwrap
import time
import shutil
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List


@dataclass
class TrialResult:
    passed: bool
    runtime_seconds: float
    verifier_exit_code: int
    run_exit_code: int
    workspace: str


def run_cmd(cmd: List[str], timeout_seconds: int | None = None) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True, timeout=timeout_seconds, check=False)


def ensure_docker() -> None:
    cp = run_cmd(["docker", "version"])
    if cp.returncode != 0:
        raise RuntimeError("Docker is not available. Install/start Docker first.")


def write_file(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def build_docker_script(task_mount: str, run_command: str, verifier_command: str) -> str:
    return textwrap.dedent(
        f"""
        set -euo pipefail
        cd /task
        mkdir -p output
        RUN_EXIT=0
        {run_command} || RUN_EXIT=$?
        VERIFY_EXIT=0
        {verifier_command} || VERIFY_EXIT=$?
        printf '{{"run_exit": %s, "verify_exit": %s}}\n' "$RUN_EXIT" "$VERIFY_EXIT" > /task/.runner-status.json
        exit 0
        """
    ).strip()


def docker_run(
    workspace: Path,
    task_dir: Path,
    script_body: str,
    timeout_minutes: int,
    pass_env: List[str],
    with_skill: bool,
    skill_path: Path | None,
) -> subprocess.CompletedProcess:
    cmd = [
        "docker",
        "run",
        "--rm",
        "-v",
        f"{workspace}:/task",
        "-w",
        "/task",
        "python:3.12-slim",
        "bash",
        "-lc",
        script_body,
    ]

    env_cmd: List[str] = ["docker", "run", "--rm"]
    for key in pass_env:
        if key in os.environ:
            env_cmd.extend(["-e", f"{key}={os.environ[key]}"])
    if with_skill and skill_path is not None:
        env_cmd.extend(["-e", "FLOOM_SKILL_PATH=/skill", "-v", f"{skill_path}:/skill:ro"])

    env_cmd.extend(cmd[3:])
    return run_cmd(env_cmd, timeout_seconds=timeout_minutes * 60)


def summarize_condition(trials: List[TrialResult]) -> Dict:
    passed = sum(1 for t in trials if t.passed)
    return {
        "passed_trials": passed,
        "total_trials": len(trials),
        "pass_rate": (passed / len(trials)) if trials else 0.0,
        "avg_runtime_seconds": (sum(t.runtime_seconds for t in trials) / len(trials)) if trials else 0.0,
        "trials": [t.__dict__ for t in trials],
    }


def command_looks_scripted(cmd: str) -> bool:
    lowered = cmd.lower()
    deny_tokens = [
        "echo ",
        "printf ",
        "cat >",
        "tee ",
        "python -c",
        "python3 -c",
        "node -e",
        "ruby -e",
        "perl -e",
    ]
    return any(tok in lowered for tok in deny_tokens)


def validate_real_eval_commands(spec: Dict, allow_scripted: bool) -> None:
    baseline_cmd = str(spec["agent_command"]["baseline"])
    with_skill_cmd = str(spec["agent_command"]["with_skill"])
    if not allow_scripted and (command_looks_scripted(baseline_cmd) or command_looks_scripted(with_skill_cmd)):
        raise RuntimeError(
            "Rejected eval: agent_command appears scripted (echo/printf/cat/heredoc or inline code). "
            "Use real agent invocation commands instead, or pass --allow-scripted for infra testing only."
        )


def main() -> int:
    parser = argparse.ArgumentParser(description="Run baseline-vs-with-skill eval task")
    parser.add_argument("--eval-dir", required=True, help="Path containing eval.json, task.md, verifier.py")
    parser.add_argument("--skill-path", help="Path to skill folder mounted for with-skill condition")
    parser.add_argument("--agent", help="Override agent id")
    parser.add_argument("--pass-env", action="append", default=[], help="Env var name to pass into container")
    parser.add_argument(
        "--allow-scripted",
        action="store_true",
        help="Allow scripted agent_command entries (for infra smoke tests only).",
    )
    args = parser.parse_args()

    ensure_docker()

    eval_dir = Path(args.eval_dir).expanduser().resolve()
    spec = json.loads((eval_dir / "eval.json").read_text(encoding="utf-8"))
    validate_real_eval_commands(spec, allow_scripted=args.allow_scripted)

    task_id = spec["id"]
    skill = spec["skill"]
    agent = args.agent or spec.get("agent", "unknown")
    model = spec.get("model", "")
    trials = int(spec.get("trials", 1))
    timeout_minutes = int(spec.get("timeout_minutes", 10))
    expected_output = spec["expected_output"]
    verifier = spec["verifier"]
    baseline_cmd = spec["agent_command"]["baseline"]
    with_skill_cmd = spec["agent_command"]["with_skill"]

    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    run_root = eval_dir / "runs" / ts
    run_root.mkdir(parents=True, exist_ok=True)

    all_results: Dict[str, List[TrialResult]] = {"baseline": [], "with_skill": []}
    skill_path = Path(args.skill_path).expanduser().resolve() if args.skill_path else None

    for condition in ["baseline", "with_skill"]:
        for idx in range(1, trials + 1):
            workspace = run_root / f"{condition}-trial-{idx}"
            shutil.copytree(
                eval_dir,
                workspace,
                ignore=shutil.ignore_patterns("runs"),
                dirs_exist_ok=True,
            )

            output_path = f"/task/{expected_output}"
            cmd_template = baseline_cmd if condition == "baseline" else with_skill_cmd
            agent_command = cmd_template.replace("{task_dir}", "/task").replace("{output_path}", output_path)

            script = build_docker_script("/task", agent_command, verifier)
            t0 = time.time()
            cp = docker_run(
                workspace=workspace,
                task_dir=eval_dir,
                script_body=script,
                timeout_minutes=timeout_minutes,
                pass_env=args.pass_env,
                with_skill=(condition == "with_skill"),
                skill_path=skill_path,
            )
            runtime = time.time() - t0

            write_file(workspace / "docker.stdout.log", cp.stdout)
            write_file(workspace / "docker.stderr.log", cp.stderr)

            status_path = workspace / ".runner-status.json"
            run_exit = 999
            verify_exit = 999
            if status_path.exists():
                status = json.loads(status_path.read_text(encoding="utf-8"))
                run_exit = int(status.get("run_exit", 999))
                verify_exit = int(status.get("verify_exit", 999))

            passed = (cp.returncode == 0) and (verify_exit == 0)
            all_results[condition].append(
                TrialResult(
                    passed=passed,
                    runtime_seconds=round(runtime, 3),
                    verifier_exit_code=verify_exit,
                    run_exit_code=run_exit,
                    workspace=str(workspace),
                )
            )

    baseline = summarize_condition(all_results["baseline"])
    with_skill = summarize_condition(all_results["with_skill"])

    lift_pp = round((with_skill["pass_rate"] - baseline["pass_rate"]) * 100, 2)
    skill_activated = bool(args.skill_path)

    if lift_pp > 0:
        summary = "Skill condition improved pass rate versus baseline."
    elif lift_pp < 0:
        summary = "Skill condition reduced pass rate versus baseline."
    else:
        summary = "No pass-rate difference between baseline and with-skill conditions."

    result = {
        "schema_version": "0.1.0",
        "task_id": task_id,
        "skill": skill,
        "agent": agent,
        "model": model,
        "timestamp_utc": ts,
        "baseline": baseline,
        "with_skill": with_skill,
        "lift_pp": lift_pp,
        "verifier": {"type": "deterministic", "command": verifier},
        "audit": {
            "skill_activated": skill_activated,
            "summary": summary,
            "scripted_commands_allowed": bool(args.allow_scripted),
        },
        "provenance": {
            "eval_dir": str(eval_dir),
            "skill_path": str(skill_path) if skill_path else "",
            "docker_image": "python:3.12-slim",
            "verifier_hash_sha256": hashlib.sha256(verifier.encode("utf-8")).hexdigest(),
            "baseline_command_hash_sha256": hashlib.sha256(baseline_cmd.encode("utf-8")).hexdigest(),
            "with_skill_command_hash_sha256": hashlib.sha256(with_skill_cmd.encode("utf-8")).hexdigest(),
        },
    }

    result_path = run_root / "result.json"
    result_path.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")

    report = textwrap.dedent(
        f"""
        # Skill Eval Receipt

        - Task: `{task_id}`
        - Skill: `{skill}`
        - Agent: `{agent}`
        - Model: `{model}`
        - Timestamp (UTC): `{ts}`

        ## Scores

        - Baseline pass rate: `{baseline['pass_rate']:.2%}` ({baseline['passed_trials']}/{baseline['total_trials']})
        - With-skill pass rate: `{with_skill['pass_rate']:.2%}` ({with_skill['passed_trials']}/{with_skill['total_trials']})
        - Lift: `{lift_pp:+.2f}pp`

        ## Audit

        - Skill activated: `{skill_activated}`
        - Summary: {summary}

        ## Artifacts

        - `result.json`
        - Trial workspaces and Docker logs under condition folders.
        """
    ).strip() + "\n"
    (run_root / "report.md").write_text(report, encoding="utf-8")

    print(str(result_path))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
