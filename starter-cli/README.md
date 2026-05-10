# @floomhq/starter

Install curated AI agent skills for Claude Code, Codex, Cursor, OpenCode, and Kimi — zero dependencies, one command.

```bash
npx @floomhq/starter install --profiles core,dev
```

## What it does

1. Detects your installed AI agents (Claude Code, Codex, Cursor, OpenCode, Kimi)
2. Installs skill files to each agent's local skill directory
3. Appends an activation companion block to your agent's instruction file (`CLAUDE.md`, `AGENTS.md`, etc.)
4. Writes a local manifest at `~/.floom/manifest.json`

## Commands

```bash
# Install by profile
npx @floomhq/starter install --profiles core
npx @floomhq/starter install --profiles core,dev,writing

# Install specific skills
npx @floomhq/starter install --skills pr-review,task-brief

# Install everything
npx @floomhq/starter install --all

# Interactive setup (asks your role, picks profiles)
npx @floomhq/starter init

# Show installed skills
npx @floomhq/starter list

# Remove all installed skills
npx @floomhq/starter remove --all
```

## Flags

| Flag | Description |
|------|-------------|
| `--profiles <ids>` | Comma-separated profile IDs |
| `--skills <slugs>` | Comma-separated skill slugs |
| `--all` | Install all available skills |
| `--harness <ids>` | Target specific agents: `claude,codex,cursor,opencode,kimi` |
| `--force` | Overwrite existing skills |
| `--dry-run` | Print plan without installing |

## Profiles

| ID | Description |
|----|-------------|
| `core` | Skill discovery, task framing, project onboarding |
| `dev` | Code review, tests, security, browser, repo analytics |
| `writing` | Brand voice, email drafts, presentations |
| `research` | Research briefs, citations, enterprise search |
| `marketing` | Landing pages, positioning, customer synthesis |
| `sales` | Outbound, customer context, sales analysis |
| `ops` | Meetings, SOPs, onboarding, file organization |
| `founder` | Strategy, research, customer learning, decisions |
| `data` | Spreadsheets, PDFs, financial QA |
| `design` | Visual QA, browser implementation checks |
| `video` | Transcript, silence, filler-word workflows |

## Skills installed per agent

| Agent | Skill directory | Activation file |
|-------|----------------|-----------------|
| Claude Code | `~/.claude/skills/<slug>/SKILL.md` | `~/.claude/CLAUDE.md` |
| Codex CLI | `~/.codex/skills/<slug>/SKILL.md` | `~/.codex/AGENTS.md` |
| Cursor | `~/.cursor/rules/<slug>.mdc` | `~/.cursor/rules/floom-skills.mdc` |
| OpenCode | `~/.config/opencode/skills/<slug>/SKILL.md` | `~/.config/opencode/AGENTS.md` |
| Kimi | `~/.kimi/skills/<slug>/SKILL.md` | `~/.kimi/agents/floom-system.md` |

## After install

Ask your agent: *"review the changes in this branch"* — the `pr-review` skill fires automatically.

Or: *"find a skill for this task"* — `local-find-skills` searches your installed skills.

## Zero dependencies

`@floomhq/starter` uses only Node.js built-ins (Node 18+). No install overhead.

## Part of Floom

[floom.dev](https://floom.dev) — the skill registry for AI coding agents.
