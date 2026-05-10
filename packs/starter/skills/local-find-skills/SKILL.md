---
name: local-find-skills
description: Search the locally installed Floom starter skill index and choose the smallest relevant skill set for the current task.
version: 1.0.0
---

# Local Find Skills

Use this skill when a task may benefit from a reusable local skill.

## Workflow

1. Read `~/.floom/packs/starter-index.json` when available.
2. Search by profile, keywords, skill name, and description.
3. Pick only the skills that directly match the task.
4. Load the selected `SKILL.md` files from the local agent skill root.
5. Do not preload every installed skill into context.

## Selection Rules

- Prefer specific skills over broad ones.
- Prefer one skill first, then add another only when the task needs it.
- If no skill matches, continue without forcing a skill.

