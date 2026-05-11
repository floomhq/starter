# Floom Starter 65-Skill Evaluation Protocol (Publishable)

This protocol defines the minimum bar for publishing skill-performance claims on the site.

## Scope

- Pack under test: `@floomhq/starter` manifest (`65` skills).
- Primary question: pass-rate lift of `with skill` vs `baseline`.
- Output: reproducible receipts, per-skill deltas, confidence intervals, and aggregate leaderboard.

## Fixed Evaluation Contract

1. Frozen task set per skill:
   - Minimum `3` deterministic tasks per skill.
   - Each task has `task.md`, `expected.json`, `verifier.py`, `eval.json`.
2. Fixed runtime:
   - Fixed model and harness per benchmark run.
   - Fixed CLI/build versions captured in metadata.
3. Repeated trials:
   - Minimum `n=5` baseline + `n=5` with-skill per task.
4. Baseline-vs-with-skill:
   - Same prompt/task, only skill mount changes.
5. Variance and confidence:
   - Report mean, stdev, and 95% CI on pass-rate delta.
6. Reproducibility:
   - Save run artifacts and hashes in-repo.

## Directory Layout

```text
docs/evals/
  skills/<slug>/
    <task-id>/
      task.md
      expected.json
      verifier.py
      eval.json
  runs/<run-id>/
    config.json
    raw/
    receipts/
    summary.json
    summary.md
```

## Required Metadata (`config.json`)

- `run_id`
- `timestamp_utc`
- `starter_manifest_sha256`
- `model_name`
- `model_version`
- `harness`
- `runner_version`
- `trials_per_condition`
- `skills` (exact 65 slugs)

## Scoring

- Task pass: `verifier.py` returns deterministic pass.
- Skill pass-rate: passed trials / total trials.
- Skill lift: `with_skill_pass_rate - baseline_pass_rate`.
- Pack lift: weighted mean across all skill tasks.

## Publication Guardrails

Claims can be shown on site only when:

- All 65 skills have at least 3 valid tasks.
- No task uses subjective/manual scoring.
- CI reproduces summary from stored raw artifacts.
- Confidence interval and sample size are shown next to headline claims.

## Initial Execution Plan

1. Freeze the 65-skill manifest.
2. Build task corpus (3 deterministic tasks per skill).
3. Dry-run on 5 representative skills.
4. Full run on all 65 skills.
5. Publish results page and receipts index.

