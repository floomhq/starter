---
name: find-skills
description: Helps agents discover Floom Starter skills that are already installed locally. Use when the user asks "is there a skill for this", "find a skill for this task", or when the best matching installed skill is unclear.
---

# Find Skills

This skill helps you choose from the skills already installed by @floomhq/starter. It is local-first: do not call external registries, package managers, or network search tools unless the user explicitly asks you to broaden discovery beyond the installed pack.

## When to Use This Skill

Use this skill when the user:

- Asks "find a skill for X" or "is there a skill for X"
- Describes a task that may match one of the installed Floom Starter skills
- Wants to know which local skill to load before doing the work
- Has many installed skills and needs a quick shortlist

## Local Discovery Order

1. Read the Floom activation block in the current agent instruction file if present:
   - Claude Code: .claude/CLAUDE.md or ~/.claude/CLAUDE.md
   - Codex: AGENTS.md or ~/.codex/AGENTS.md
   - Cursor: .cursor/rules/floom-skills.mdc or ~/.cursor/rules/floom-skills.mdc
   - OpenCode: .opencode/AGENTS.md or ~/.config/opencode/AGENTS.md
   - Kimi: .kimi/agents/floom-system.md or ~/.kimi/agents/floom-system.md
2. If the activation block is missing or incomplete, inspect .floom/manifest.json in the current project or ~/.floom/manifest.json for the installed skill list.
3. Match the user's task against installed skill names, descriptions, and profile groups.
4. Load the exact local skill file before using it:
   - Claude/Codex/OpenCode/Kimi: <skillsDir>/<slug>/SKILL.md
   - Cursor: <skillsDir>/<slug>.mdc

## Recommendation Format

When one skill clearly matches, load it and continue with the task.

When multiple skills may match, present a short ranked list:

- Skill name
- Why it matches this task
- Local path to load

Then ask which one to use only if the choice changes the work materially. Otherwise, pick the strongest match and proceed.

## If No Installed Skill Matches

Say that no installed Floom Starter skill clearly matches. Offer to handle the task with general capabilities, or tell the user they can install more curated skills with:

```bash
npx @floomhq/starter install --global
```

Do not install anything without the user's confirmation.
