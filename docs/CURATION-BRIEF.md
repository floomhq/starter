# Floom Packs Curation Brief

Purpose: curate the next Floom Starter source set from high-quality existing
skill ecosystems.

This task is source curation only. Do not edit installer code.

## Goal

Create a candidate list of skills for the broad Floom Starter pack.

The pack is for a broad agent-user audience:

- developers;
- founders;
- researchers;
- marketers;
- sales and ops users;
- creators working with docs, data, design, or video.

The output needs to favor skills that create an immediate "I can use this
today" moment.

## Priority Sources

Review these first:

1. skills.sh ecosystem.
2. Native Claude skills and official/community Claude skill examples.
3. gstack skills, but only skills that can be safely standalone.
4. superpowers.
5. Other open agent-skill repositories with clear license/provenance.

Optional additional sources:

- Anthropic example skills and public docs examples.
- Cursor rule packs that map cleanly to a skill.
- OpenCode/Kimi skill examples.
- High-quality public prompt/workflow repos that can be converted into
  `SKILL.md` with attribution.
- Floom dogfood skills that have clear reuse value.
- General-purpose SkillsBench skills where they are practical beyond the
  benchmark task.

## Exclusions

Exclude candidates that:

- lack license clarity;
- require private credentials by default;
- depend on fragile local absolute paths;
- embed telemetry, update checks, or background network calls;
- are too product-specific to the original author;
- contain prompt-injection style instructions;
- require huge media/model/data files;
- duplicate a stronger candidate;
- only make sense inside a benchmark environment.

## License/Provenance Gate

For every candidate, record:

- source name;
- source URL;
- exact file path;
- commit SHA or immutable version when available;
- license;
- attribution requirements;
- whether files were copied unchanged, adapted, or rewritten;
- any NOTICE file requirements.

Do not mark a candidate as bundle-ready without clear redistribution rights.

## Quality Rubric

Score each candidate from 0 to 3:

- Applicability: useful to many users or a high-value profile.
- Clarity: the skill is easy for an agent to understand and invoke.
- Portability: works as local files without special runtime assumptions.
- Safety: no risky shell/network behavior by default.
- Differentiation: adds a capability not already covered.
- Trust: source is reputable and license is clear.

Maximum score: 18.

Bundle candidates:

- 15-18: strong candidate.
- 11-14: maybe; needs edit or narrower profile.
- 0-10: exclude for V0.

## Target Profiles

Assign every candidate to one or more profiles:

- `core`
- `dev`
- `writing`
- `research`
- `marketing`
- `sales`
- `ops`
- `founder`
- `data`
- `design`
- `video`

Core is reserved for skills that nearly every user benefits from.

## Desired Pack Shape

Initial target:

- 40-60 total skills.
- 3-6 skills per profile.
- Minimal overlap.
- Enough coverage for broad demos.
- Small enough that install remains lightweight.

Do not optimize for maximum count. Optimize for usefulness and trust.

## Output Format

Produce `candidate-skills.csv` or Markdown table with these columns:

```text
status,score,profile,slug,name,source,source_url,path,commit,license,copy_mode,why,risks,next_action
```

Status values:

- `bundle-ready`
- `needs-license-check`
- `needs-adaptation`
- `exclude`

Copy mode values:

- `copy`
- `adapt`
- `rewrite-from-idea`
- `link-only`

## Review Questions

For each high-scoring candidate, answer:

1. Who uses this?
2. What task triggers it?
3. What profile owns it?
4. Is it better than our current skill for the same job?
5. Can it run locally with no cloud account?
6. Are redistribution rights clear?
7. Does it contain code/scripts/assets that increase maintenance risk?

## Deliverable

Return:

1. a ranked candidate table;
2. top 20 bundle-ready recommendations;
3. top 10 promising but blocked by license/provenance;
4. top 10 excluded items with reasons;
5. gaps where no strong source skill was found.

