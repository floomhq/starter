---
name: floom-skill-evals
description: Use when the user asks to create, run, or review skill evaluations with baseline-vs-with-skill A/B tests, Docker-isolated task runs, deterministic verifiers, receipt generation, or claims like pass-rate lift for a skill or pack.
metadata:
  version: 0.1.0
---

# Floom Skill Evals

Run simple, deterministic skill receipts:

1. Create eval tasks for a skill.
2. Run baseline and with-skill conditions in isolated Docker workspaces.
3. Grade with deterministic verifier.
4. Save `result.json` and a markdown receipt.

## When to use

Use this skill for requests like:
- "evaluate this skill"
- "baseline vs with skill"
- "run skill receipts"
- "prove skill lift"
- "Floom Verified style run"

## Commands

### 1) Scaffold an eval task

```bash
python3 scripts/scaffold_eval_task.py \
  --skill seo-audit \
  --task technical-homepage-audit \
  --out ./skills/seo-audit/evals
```

This creates:
- `<out>/<task>/task.md`
- `<out>/<task>/input/`
- `<out>/<task>/expected.json`
- `<out>/<task>/verifier.py`
- `<out>/<task>/eval.json`

### 2) Run A/B eval

```bash
python3 scripts/run_skill_eval.py \
  --eval-dir ./skills/seo-audit/evals/technical-homepage-audit \
  --skill-path ~/.codex/skills/seo-audit \
  --agent codex
```

Outputs:
- `runs/<timestamp>/result.json`
- `runs/<timestamp>/report.md`
- condition workspaces and logs

Default policy rejects scripted output commands (`echo`, `printf`, heredoc writes) in `agent_command`.
Use `--allow-scripted` only for runner plumbing tests.

## Execution model

- `baseline`: run agent command without skill mount.
- `with_skill`: run same command with skill mounted at `/skill` and env `FLOOM_SKILL_PATH=/skill`.
- `verifier`: runs deterministic checker inside each condition workspace.
- `audit`: simple deterministic summary from pass/fail/runtime deltas.

## Required eval contract

`eval.json` must include:
- `id`
- `skill`
- `timeout_minutes`
- `trials`
- `agent`
- `agent_command.baseline`
- `agent_command.with_skill`
- `verifier`
- `expected_output`

Command placeholders supported:
- `{task_dir}` mounted as `/task`
- `{output_path}` path in workspace where agent writes result

## Notes

- This v0 runner is Docker-first and local-first.
- Host keeps credentials; container only gets mounted task workspace.
- If API keys are needed, pass scoped env explicitly with `--pass-env OPENAI_API_KEY` etc.
- Receipts include provenance hashes for verifier and both condition commands.
